const express = require('express');
const User = require('../models/User');
const arduinoPort = require('../serial');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const dataPromise = new Promise((resolve, reject) => {
      arduinoPort.once('data', (data) => {
        const dataString = data.toString().trim();
        console.log('Raw data from Arduino:', dataString);
        resolve(dataString);
      });
      
      console.log('Sending password to Arduino for encryption');
      arduinoPort.write(password + '\n', (err) => {
        if (err) {
          console.error('Arduino write error:', err);
          reject('Arduino communication failed');
        }
      });
    });

    const receivedData = await dataPromise;
    
    // Split the data using the pipe character
    const parts = receivedData.split('|');
    const encryptedPassword = parts[0];
    const encryptionTime = parts.length > 1 ? parts[1] : '0';
    
    console.log('Received encrypted password:', encryptedPassword);
    console.log('Received encryption time:', encryptionTime);
    
    // Create new user with both encrypted password and timing information
    const newUser = new User({ 
      username, 
      encryptedPassword,
      encryptionTimeMicros: parseInt(encryptionTime || '0') 
    });
    
    await newUser.save();
    console.log('User saved successfully');
    
    res.status(201).json({ 
      message: 'User registered!',
      timeTaken: `${parseInt(encryptionTime || '0')}µs`
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

module.exports = router;
