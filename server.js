var bodyParser = require('body-parser');
var express = require('express');
var app = express();

app.use(bodyParser.json());

var token = process.env.TOKEN || 'token';
var secret = process.env.APP_SECRET || 'secret';
var received_updates = [];

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

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

app.post('/facebook', function (req, res) {
  console.log('Facebook request body:', req.body);

  // You can check the secret if needed
  if (req.headers['x-hub-signature'] !== secret) {
    console.log('Warning - request header X-Hub-Signature not valid');
    res.sendStatus(401);
    return;
  }

  console.log('Request header X-Hub-Signature validated');
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
