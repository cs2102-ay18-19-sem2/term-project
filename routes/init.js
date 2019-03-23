const sql_query = require('../sql/query.sql');
const passport = require('passport');
const bcrypt = require('bcrypt')

// Postgre SQL Connection
const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const round = 10;
const salt  = bcrypt.genSaltSync(round);

function initRouter(app) {
	/* GET */
	app.get('/', homepage);
    app.get('/login', login);
    app.get('/signup', signup);
    app.post('/signupreq', receiveSignup);
}

function homepage(req, res, next) {
	res.render('homepage', { title: 'HomePage' });
}

function login(req, res, next) {
    res.render('login', { title: 'LogIn' });
}

function signup(req, res, next) {
    res.render('signup', { title: 'SignUp' });
}

function receiveSignup(req, res, next) {
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.subject;
    var in_query = 'INSERT INTO student_info VALUES';
    in_query = in_query + "('" + "1" + email + "','" + username + "','" + password + "')";

    pool.query(in_query, (err, data) => {
    		res.redirect('/')
    	});
}

module.exports = initRouter;