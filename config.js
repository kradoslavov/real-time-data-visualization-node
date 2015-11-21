// This file handles the configuration of the app.
// It is required by app.js

var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');


module.exports = function(app){

    // Set .html as the default template extension
    app.set('view engine', 'html');

    // Initialize the ejs template engine
    app.engine('html', require('ejs').renderFile);

    // Tell express where it can find the templates
    app.set('views', __dirname + '/views');

    //Use this middleware to populate the cookie header in the req.cookies
    app.use(cookieParser());

    // Use this to get the request body parsed as json in the req.body
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // Make the files in the public folder visible
    app.use(express.static(__dirname + '/public'));
};