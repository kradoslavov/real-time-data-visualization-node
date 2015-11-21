// This file handles the configuration of the app.
// It is required by app.js

var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('client-sessions'),
    flash = require('express-flash');

var base32 = require('thirty-two');
var LocalStrategy = require('passport-local').Strategy,
    TotpStrategy = require('passport-totp').Strategy;

module.exports = function(app, passport, users){

    passport.use(new LocalStrategy(
        function(username, password, done) {
            var isValid = checkValidUser(username, password);
            if(isValid) {
                return done(null, users[username]);
            } else {
                return done(null, false, {message : 'Wrong user or password'});
            }
        }
    ));

    passport.use(new TotpStrategy(
            function(user, done) {
                var key = user.key;
                if(!key) {
                    return done(new Error('No key'));
                } else {
                    return done(null, base32.decode(key), 30); //30 = valid key period
                }
            })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        for(var u in users) {
            if(users[u].id === id) {
                done(null, users[u]);
                return;
            }
        }

        done(new Error("Not found"));
    });

    // Set .html as the default template extension
    app.set('view engine', 'html');

    // Initialize the ejs template engine
    app.engine('html', require('ejs').renderFile);

    // Tell express where it can find the templates
    app.set('views', __dirname + '/views');

    //Use this middleware to populate the cookie header in the req.cookies
    app.use(cookieParser());

    app.use(session({
        cookieName: 'session',
        secret: 'TimeSeriesDataVisualizationSecret',
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    // Use this to pass session messages
    app.use(flash());
    // Use this to get the request body parsed as json in the req.body
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // Make the files in the public folder visible
    app.use(express.static(__dirname + '/public'));

    function checkValidUser(username, password) {
        var user = users[username];
        if(!user) return false;

        return user.password === password;
    }
};