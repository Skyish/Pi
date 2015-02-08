/**
 * Created by cristianorosario on 14/01/15.
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require('./db');
var md5 = require('MD5');

module.exports = function (app) {

    passport.serializeUser(function (user, done) {
        done(null, user.username);
    });

    passport.deserializeUser(function (user, done) {
        db.User.getUsername(user, function (err, oUser) {
            if (err)
                return done(err);
            oUser.isAuthenticated = true;
            return done(null, oUser);
        });
    });

    passport.use(new LocalStrategy(
        function (username, password, done) {
            db.User.getUsername(username, function (err, oUser) {
                if (err)
                    return done(err);
                if (!oUser)
                    return done(null, false, {message: 'Incorrect username.'});
                if (md5(password) != oUser.password)
                    return done(null, false, {message: 'Incorrect username or password.'});
                return done(null, {
                    username: oUser.username,
                    role: oUser.role
                });

            });
        }
    ));

    app.get('/login', function (req, res) {
        res.render('login/login', {heading: 'login', authenticated: false});
    });

    app.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: false
    }));

    app.get('/logout', function (req, res) {
        req.logOut();
        res.redirect('/');
    });
};
