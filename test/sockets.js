var io = require('socket.io-client'),
    expect = require('expect.js'),
    port = 8080,
    securePort = 8443;

var socketURL = 'https://localhost:' + securePort;

describe('Time series data', function() {
    var socket;

    beforeEach(function(done) {
        // Setup
        socket = io.connect(socketURL, {
            'reconnection delay' : 0
            , 'reopen delay' : 0
            , 'force new connection' : true
        });
        socket.on('connect', function() {
            done();
        });
    });

    afterEach(function(done) {
        // Cleanup
        if(socket.connected) {
            socket.disconnect();
        } else {
            // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
            console.log('no connection to break...');
        }
        done();
    });

    it('should be available to client', function(done){

        socket.on('data', function(data) {
            var number = data.rx;
            expect(number).to.be.a('number');
            done();
        });

    });

    it('should be continuous', function(done){
        this.timeout(3000);
        var packets = 0;
        var checkResult = function() {
            expect(packets).to.be.above(1);
            done();
        }

        socket.on('data', function(data) {
            packets++;
            setTimeout(checkResult, 1500)
        });
    });
});