/**
 * Created by cristianorosario on 14/01/15.
 */
var express = require('express');
var router = express.Router();
var db = require('./../../db');

router.get('/:page', function (req, res) {
    if (req.isAuthenticated()) {
        var page = req.params.page;
        db.Queixinha.getAll(page, req.user.id, function (err, aQueixinhas) {
            if (err)
                return res.render('error', {error: {message: err}});
            res.render('queixinhas/queixinhas', {
                heading: 'queixinhas',
                authenticated: true,
                queixinhas: aQueixinhas,
                page: page,
                total: aQueixinhas[0] ? aQueixinhas[0].total : 0,
                closed: false
            });
        });
    }
    else {
        db.Queixinha.getSome(0, function (err, aQueixinhas) {
            if (err)
                return res.render('error', {error: {message: err}});
            res.render('queixinhas/queixinhas', {
                heading: 'queixinhas',
                authenticated: false,
                queixinhas: aQueixinhas,
                page: 0,
                total: 1,
                closed: false
            })
        });
    }
});

router.get('/create/new', function (req, res) {
    if (req.isAuthenticated()) {
        res.render('queixinhas/create', {
            heading: 'queixinhas',
            authenticated: true
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/closed/:page/', function (req, res) {
    if (req.isAuthenticated()) {
        var page = req.params.page;
        db.Queixinha.getAllClosed(page, req.user.id, function (err, aQueixinhas) {
            if (err)
                return res.render('error', {error: {message: err}});
            res.render('queixinhas/queixinhas', {
                heading: 'closed',
                authenticated: true,
                queixinhas: aQueixinhas,
                page: page,
                total: aQueixinhas[0] ? aQueixinhas[0].total : 0,
                closed: true
            });
        });
    }
    else {
        res.redirect('/login');
    }
});

router.get('/followed/:page', function (req, res) {
    if (req.isAuthenticated()) {
        var page = req.params.page;
        return db.Queixinha.getFollowedQueixinhas(page, req.user.id, function (err, aQueixinhas) {
            if (err)
                return res.render('error', {error: {message: err}});
            console.log(aQueixinhas);
            return res.render('queixinhas/queixinhasFollow', {
                heading: 'followed',
                authenticated: true,
                queixinhas: aQueixinhas,
                page: page,
                total: aQueixinhas[0] ? aQueixinhas[0].total : 0,
                closed: true
            });
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/create/new', function (req, res) {
    if (req.isAuthenticated()) {
        db.Queixinha.createQueixinha(new db.Queixinha(req.body.tittle, req.body.queixinha, req.user.id),
            function (err, iId) {
                if (err)
                    return res.render('error', {error: {message: err}});
                res.redirect('/queixinhas/' + iId + '/0');
            });
    }
    else
        res.redirect('/login');
});

router.get('/:id/:pag', function (req, res) {
    if (req.isAuthenticated()) {
        var id = req.params.id;
        var page = req.params.pag;
        db.Queixinha.getQueixinha(id, req.user.id, function (err, oQueixinha) {
            if (err)
                return res.render('error', {error: {message: err}});
            db.Queixinha.getComments(id, page, function (err, oComments) {
                if (err)
                    return res.render('error', {error: {message: err}});
                res.render('queixinhas/queixinhaComments', {
                    heading: 'queixinhas',
                    authenticated: true,
                    elem: oQueixinha,
                    comments: oComments,
                    page: page,
                    totalComments: oComments[0] ? oComments[0].total_comments : 0,
                    user: req.user
                });
            });
        });
    }
    else
        res.redirect('/login');
});

router.post('/like', function (req, res) {
    if (req.isAuthenticated()) {
        if (req.body.like)
            db.Queixinha.like(req.body.like, req.user.id, function (err, oResult) {
                if (err)
                    return res.render('error', {error: {message: err}});
                res.redirect('/queixinhas/0');
                //res.send()
            });
        else if (req.body.dislike)
            db.Queixinha.dislike(req.body.dislike, req.user.id, function (err, oResult) {
                if (err)
                    return res.render('error', {error: {message: err}});
                res.redirect('/queixinhas/0');
            });
    }
    else
        res.redirect('/login');
});

router.post('/edit', function (req, res) {
    if (req.isAuthenticated()) {
        return db.Queixinha.getQueixinha(req.body.id, req.user.id, function (err, oResult) {
            if (err)
                return res.render('error', {error: {message: err}});
            if (oResult) {
                if (oResult.author == req.user.id)
                    return res.render('queixinhas/edit', {
                        authenticated: true, heading: 'queixinhas', queixinha: oResult
                    });
            }
            return res.redirect('/queixinhas/0');
        });
    }
    res.redirect('/login');
});

router.get('/close/comment/:id', function (req, res) {
    if (req.isAuthenticated()) {
        return db.Queixinha.getQueixinha(req.params.id, req.user.id, function (err, oResult) {
            if (err)
                return res.render('error', {error: {message: err}});
            if (oResult.author == req.user.id || req.user.role == 'admin') {
                res.render('queixinhas/delete', {
                    heading: 'queixinhas', authenticated: true, queixinha: oResult
                });
            }
            else {
                res.redirect('/queixinhas/' + req.params.id + '/0')
            }
        });

    } else {
        res.redirect('/login');
    }
});

router.post('/close/comment', function (req, res) {
    if (req.isAuthenticated()) {
        return db.Queixinha.close(req.body.id, req.user.id, req.body.last_comment, function (err, oResult) {
            if (err)
                return res.render('error', {error: {message: err}});
            res.redirect('/queixinhas/' + req.body.id + '/0');
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/edit/save', function (req, res) {
    if (req.isAuthenticated()) {
        return db.Queixinha.edit(new db.Queixinha(req.body.tittle, req.body.queixinha, null, req.body.id), function (err, oResult) {
            if (err)
                return res.render('error', {error: {message: err}});
            return res.redirect('/queixinhas/0');
        });
    }
    res.redirect('/login');
});

router.post('/comment', function (req, res) {
    if (req.isAuthenticated()) {
        return db.Queixinha.createComment(new db.Queixinha(null, req.body.comment, req.user.id, req.body.id), function (err, oResult) {
            if (err)
                return res.render('error', {error: {message: err}});
            return res.redirect('/queixinhas/' + req.body.id + '/0');
        });
    }
    res.redirect('/login');
});

router.post('/follow', function (req, res) {
    if (req.isAuthenticated()) {
        return db.Queixinha.follow(req.body.id, req.user.id, function (err, oResult) {
            if (err)
                return res.render('error', {error: {message: err}});
            return res.redirect('/queixinhas/0');
        });
    }
    //todo why redirects with http status don't work properly?
    res.redirect('/login');
});

module.exports = router;