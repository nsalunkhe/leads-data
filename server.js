require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const connectDB = require('./config/db'); // Import the MongoDB connection from db.js
const mongoose = require('mongoose');

app.use(bodyParser.json());

const token = process.env.TOKEN;
const secret = process.env.APP_SECRET;
const received_updates = [];

app.set('port', process.env.PORT || 5000);

app.get('/', function (req, res) {
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

// Connect to MongoDB using the imported connectDB function
connectDB();

app.get('/facebook', function (req, res) {
  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == token
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.post('/facebook', async function (req, res) {
  console.log('Facebook request body:', req.body);
 
  if (req.query['hub.verify_token'] !== token) {
    console.log('Warning - Verify Token does not match');
    res.sendStatus(403); // Forbidden status code
    return;
  }

  // You can check the secret if needed
  if (req.headers['x-hub-signature'] !== secret) {
    console.log('Warning - request header X-Hub-Signature not valid');
    res.sendStatus(401);
    return;
  }

  console.log('Request header X-Hub-Signature validated');

  try {
    // Save the entire request body to MongoDB
    const connection = mongoose.connection; // Use the existing connection
    const collection = connection.collection('facebook_responses');
    const result = await collection.insertOne(req.body);
    console.log('Response saved to MongoDB:', result);

    received_updates.unshift(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error saving response to MongoDB:', error);
    res.sendStatus(500); // Internal server error
  }
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
