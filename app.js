var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//require the routes files
var routes = require('./routes/index');
//var users = require('./routes/users');
var queixinhas = require('./routes/queixinhas/index');
var about = require('./routes/about/about');
var register = require('./routes/register/register');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({ secret: 'ThyZ is a big secret!: cat', resave: false, saveUninitialized: true }));
app.use(require('passport').initialize());
app.use(require('passport').session());

app.use(function(req, res, next) {
    var reqUrl = req.url;
    res.locals.isActive = function(url) {
        return reqUrl == url;
    };
    next();
});

var auth = require('./auth')(app);

//use the routes files
app.use('/', routes);
//app.use('/users', users);
app.use('/queixinhas', queixinhas);
app.use('/about', about);
app.use('/register', register);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
