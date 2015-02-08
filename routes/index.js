var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {heading: 'home', authenticated: req.isAuthenticated() ? true : false});
});

module.exports = router;