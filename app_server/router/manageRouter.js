const routeAdmin = require('./adminRouter');
const routeHome = require('./mainRouter');

module.exports = function(app){
    app.use('/admin/', routeAdmin);
    app.use('/', routeHome);
}