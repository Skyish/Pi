/**
 * Created by cristianorosario on 19/01/15.
 */
var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {

    res.render('about/about', {authenticated:req.isAuthenticated()?true:false});
});

module.exports = router;