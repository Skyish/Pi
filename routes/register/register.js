/**
 * Created by cristianorosario on 25/01/15.
 */
var express = require('express');
var router = express.Router();
var db = require('./../../db');

router.get('/', function (req, res) {
    res.render('register/register', {authenticated: req.isAuthenticated() ? true : false});
});

router.post('/', function (req, res) {
    if (req.body.password != req.body.secondPassword) {
        ////todo flash implementation
        //res.flash('warning', 'Não foi possivel criar o utilizador, tente novamente.');
        res.redirect('/register');
    }
    else {
        db.User.createNew(new db.User(
            req.body.username,
            req.body.password,
            req.body.email
        ), function (err, iUserId) {
            if (err)
                return res.render('error', {error: {message: err}});
            res.redirect('/');
        });
    }
});

router.get('/retrievePassword', function (req, res) {
    res.render('register/retrievePassword', {authenticated: true, emailVerified: false});
});

router.post('/retrievePassword', function (req, res) {
    if (req.body.email) {
        return db.User.verifyEmail(req.body.email, function (err, oResponse) {
            if (err)
                return res.render('error', {error: {message: err}});
            if (oResponse)
                return res.render('register/retrievePassword', {authenticated: true, emailVerified: true, user_id: oResponse.id});
            //todo flash implementation
            //res.flash('warning', "Email incorrecto, tente novamente.");
            return res.render('register/retrievePassword', {authenticated: true, emailVerified: false});
        });
    }
    if (req.body.password && req.body.password === req.body.secondPassword) {
        console.log(req.body);
        return db.User.changePassword(req.body.password, req.body.id, function(err,oResponse){
            if(err)
                return res.render('error');
            //todo flash!
            //res.flash();
            res.redirect('/login');
        });
    }
    return res.redirect('/register/retrievePassword');
});

module.exports = router;