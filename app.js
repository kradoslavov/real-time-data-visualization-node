//Starting point of the application
var express = require('express'),
    app = express(),
    fs = require('fs'),
    server = require('./server');

// This is needed if the app will run on heroku
var port = process.env.PORT || 8080;
var users = {};
try {
    users = JSON.parse(fs.readFileSync('users.json', { encoding: "utf8" }));
} catch(e) {
    // users will be empty
}
//Start the server
server.start(port, app, users);