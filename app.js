//Starting point of the application
var express = require('express'),
    app = express(),
    fs = require('fs'),
    server = require('./server');

// This is needed if the app will run on heroku
var port = process.env.PORT || 8080;

//Start the server
server.start(port, app);