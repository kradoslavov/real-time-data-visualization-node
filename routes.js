/*
 General routing definition.
 Params:    app - The Express app

 */
module.exports = function(app) {

    // Main home route, showing the home template, where the graph is rendered
    app.get('/', function(req, res){
        res.render('home');
    });

}