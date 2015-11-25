var port = 8080,
    securePort = 8443,
    fs = require('fs');
    superagent = require('superagent'),
    expect = require('expect.js'),
    request = require('supertest'),
    httpServer = request.agent('http://localhost:' + port);
    httpsServer = request.agent('https://localhost:' + securePort);

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var cert = fs.readFileSync('./certs/cert.pem');


describe('Server', function(){
    it('HTTP should redirect to HTTPS',function(done){
        httpServer
            .get('/')
            .expect(302)
            .end(function(err, res){
                if (err) return done(err);
                return done();
            });
    });
    it('HTTPS should respond to GET',function(done){
        httpsServer
            .get('/')
            .ca(cert)
            .expect(200)
            .expect('Location', '/login')
            .end(function(res){
                done();
            })
    });

});
describe('User', function(){
    it('should not pass login without the CSFR secret',function(done){
        httpsServer
            .post('/login')
            .send({ username: 'test', password: 'test12' })
            .expect(403)
            .end(function(err, res){
                if (err) return done(err);
                return done();
            });
    });
});