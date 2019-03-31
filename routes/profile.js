var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  console.log("i am here");
  res.render('profile', { title: 'Profile'});
});

module.exports = router;
