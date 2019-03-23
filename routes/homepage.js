var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('homepage', { title: 'HomePage' });
});

module.exports = router;