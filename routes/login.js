const express = require('express');
const User = require('../models/User');
const arduinoPort = require('../serial');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    console.log('Found user:', username);
    console.log('Stored encrypted password:', user.encryptedPassword);

    // Get encrypted password from Arduino
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
    const encryptedInput = parts[0];
    const encryptionTime = parts.length > 1 ? parts[1] : '0';
    
    console.log('Received encrypted input:', encryptedInput);
    console.log('Received encryption time:', encryptionTime);
    console.log('Stored encrypted password:', user.encryptedPassword);
    
    if (encryptedInput !== user.encryptedPassword) {
      return res.status(401).json({ 
        error: 'Invalid password',
        debug: {
          expected: user.encryptedPassword,
          received: encryptedInput
        }
      });
    }
    
    // Include timing information in response
    res.status(200).json({ 
      message: 'Login successful!',
      timeTaken: `${parseInt(encryptionTime || '0')}µs`,
      storedTime: `${user.encryptionTimeMicros}µs`
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

module.exports = router;
