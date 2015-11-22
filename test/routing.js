var port = 8080,
    superagent = require('superagent'),
    expect = require('expect.js'),
    request = require('supertest'),
    server = request.agent('http://localhost:' + port);


describe('server', function(){
    it('should respond to GET',function(done){
        superagent
            .get('http://localhost:'+port)
            .end(function(res){
                expect(res.status).to.equal(200);
                done();
            })
    })
});
describe('Valid user', function(){
    it('should be able to pass 1st login',function(done){
        server
            .post('/login')
            .send({ username: 'test', password: 'test12' })
            .expect(302)
            .expect('Location', '/otp-login')
            .end(function(err, res){
                if (err) return done(err);
                return done();
            });
    })
});
describe('Invalid user', function(){
    it('should not pass login',function(done){
        server
            .post('/login')
            .send({ username: 'test', password: 'test' })
            .expect(302)
            .expect('Location', '/login')
            .end(function(err, res){
                if (err) return done(err);
                return done();
            });
    });
});

