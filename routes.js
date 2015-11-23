var crypto = require('crypto'),
    base32 = require('thirty-two'),
    sprintf = require('sprintf'),
    fs = require('fs');

// Middleware to check if user is loggedIn
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}

function ensureTOTP(req, res, next) {
    if (req.session.method == 'totp') { return next(); }
    res.redirect('/otp-login')
}
/*
 General routing definition.
 Params:    app - The Express app
            passport - The authentication middleware
            users - the list of all users - this should be done in a DB
 */
module.exports = function(app, passport, users) {

    // Main home route, showing the home template, where the graph is rendered
    app.get('/', isLoggedIn, ensureTOTP, function(req, res){
        res.render('home', {
            user: req.user
        });
    });

    // Login route rendering the Login page, if already logged in, show the home page
    app.get('/login', function(req, res){
        if(req.isAuthenticated()) {
            res.redirect('/');
        } else {
            res.render('login', {error: req.flash('error') });
        }
    });

    // Logout route
    app.get('/logout', function(req, res){
        req.session.method = '';
        req.logout();
        res.redirect('/login');
    });

    /*
     Login handling - first layer - username/password, using the passport LocalStrategy
     If user logs in successfuly with username/password, he is sent to the second layer
     of authentication - TOTP using Google's algorithm. If user account does not have
     a secret key already, generate one, store it and show the TOTP login page.
     */
    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
        function(req, res) {

            if(!req.user.key) {

                var secret = base32.encode(crypto.randomBytes(16));
                //Discard equal signs (part of base32,
                //not required by Google Authenticator)
                //Base32 encoding is required by Google Authenticator.
                //Other applications
                //may place other restrictions on the shared key format.
                secret = secret.toString().replace(/=/g, '');
                req.user.key = secret;

                try {
                    fs.writeFileSync('users.json', JSON.stringify(users), {
                        encoding: "utf8"
                    });
                } catch (e) {
                    console.log(e);
                }

            }
            res.redirect('/otp-login');
        }
    );

    /*
     Render the TOTP page, but also check if the current user has a secret key, else this is an error.
     */
    app.get('/otp-login', isLoggedIn, function(req, res) {
        if(!req.user.key) {
            console.log("No key set for user, revert to basic login");
            res.redirect('/login');
        }
        // Build the URL for the QR code to be shown to the user if he has not added this account
        // to Google Authenticator app.
        var qrData = sprintf('otpauth://totp/%s?secret=%s',
            req.user.username, req.user.key);
        var url = "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" +
            qrData;

        res.render('otp-login', {
            user: req.user,
            qrUrl: url
        });
    });

    // Handle the TOTP login, using the passport TotpStrategy
    app.post('/otp-login', isLoggedIn, passport.authenticate('totp', { failureRedirect: '/login' }),
    function(req, res) {
        req.session.method = 'totp';
        res.redirect('/');
    });

    app.get('/data', isLoggedIn, ensureTOTP, function(req, res){
        res.render('data', {
            user: req.user
        });
    });
}