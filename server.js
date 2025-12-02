const express = require('express');
const mongoose = require('mongoose');
const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');

const app = express();
app.use(express.json());
app.use(express.static('public')); 
app.use('/api', registerRoute);
app.use('/api', loginRoute);

// Default route to check if the server is running
app.get('/', (req, res) => {
    res.send('Welcome to the Secure Password API! ');
});
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/secure_password_db')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

app.listen(3000, () => console.log('Server running on port 3000'));
