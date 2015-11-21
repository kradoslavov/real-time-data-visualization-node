/*
The server module that actually start the server.
It listens on the Unix socket for incoming data and emits this
data to all who listen on a WebSocket
 */

var net = require('net'),
    fs = require('fs'),
    socketPath = '/tmp/datasocket',
    config = require('./config'),
    routes = require('./routes'),
    io = require('socket.io');

function start(port, app) {

    io = io(app.listen(port, function(){
        // Get the socket info
        fs.stat(socketPath, function(err, stats) {
            // Do this else it will give an error that socket is in use
            if (!err) fs.unlinkSync(socketPath);

            if(stats.isSocket()) {
                //Create a socket server
                var unixServer = net.createServer(function (localSocket) {

                    //Handle the incoming data
                    localSocket.on('data', function (data) {
                        // data is a buffer from the socket
                        console.log(data.toString());
                        var jsonData = JSON.parse(data);
                        //Convert to KB
                        jsonData.rx = convertToKb(jsonData.rx);
                        jsonData.tx = convertToKb(jsonData.tx);
                        io.emit('data', jsonData);
                    });

                });
                //Make the server listen on the specified socket
                unixServer.listen(socketPath);
            }
        });
    }));


    // Configure the Express app
    config(app);
    //Define the routes for the app
    routes(app);

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
                error: err
            });
        });
    }

    // Production error handler with no errors shown to the user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    console.log('Your server is running on http://localhost:' + port);
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