/*
The server module that actually start the server.
It listens on the Unix socket for incoming data and emits this
data to all who listen on a WebSocket
*/

var net = require('net'),
    https = require('https'),
    http = require('http'),
    fs = require('fs'),
    socketPath = 'datasocket',
    config = require('./config'),
    routes = require('./routes'),
    io = require('socket.io');

var passport = require('passport');

function start(port, app, users, securePort) {

    //Create the HTTPS server
    var httpsServer = https.createServer({
        key: fs.readFileSync('./certs/key.pem'),
        cert: fs.readFileSync('./certs/cert.pem')
    }, app);

    //Create the HTTP server to catch requests and redirect them to HTTPS
    var httpServer = http.createServer(app);

    //Startup callback for our server. It creates the connection to the Unix socket
    //and receives the data and it sends it via websocket to the client/s
    function onStartUp() {

        //Create a socket server
        var unixServer = net.createServer(function (localSocket) {

            //Handle the incoming data
            localSocket.on('data', function (data) {
                // data is a buffer from the socket
                //console.log(data.toString());
                var jsonData = {rx: 0, tx: 0 };
                try {
                    jsonData = JSON.parse(data);
                    jsonData.rx = parseFloat(jsonData.rx);
                    jsonData.rx = parseFloat(jsonData.rx);
                } catch(e) {
                    console.error(e.toString());
                }
                io.emit('data', jsonData);
            });

        });
        //Make the server listen on the specified socket
        if (fs.existsSync(socketPath)) {
            fs.unlinkSync(socketPath);
        }
        unixServer.listen(socketPath);

        //Startup the data stub that generates the data
        var exec = require('child_process').exec;
        var child = exec('./bin/netspeed-deb.sh eth0',
            function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });

    };

    //Start the servers to listen on the spcified ports
    httpServer.listen(port);
    io = io(httpsServer.listen(securePort, onStartUp));

    // Configure the Express app
    config(app, passport, users);

    //Define the routes for the app
    routes(app, passport, users, securePort);

    /// catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // Error handlers
    // Development error handler with errors
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err,
                user: req.user
            });
        });
    }

    // Production error handler with no errors shown to the user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {},
            user: req.user
        });
    });

    console.log('Server is running on http://localhost:' + port);
}


// Convert a given input string to KB
// Input can be of the form: 1.43MB, 600B, 240KB
function convertToKb(input) {
    if(input.indexOf('KB')>0) {
        input = parseFloat(input);
    }else if(input.indexOf('MB')>0) {
        input = parseFloat(input) * 1024;
    }else if(input.indexOf('GB')>0) {
        input = parseFloat(input) * 1024 * 1024;
    } else {
        input = parseFloat(input) / 1024;
    }

    return input;
}

exports.start = start;