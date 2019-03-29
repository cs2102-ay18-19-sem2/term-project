const sql_query = require('../sql');
const passport = require('passport');
const bcrypt = require('bcrypt')

// Postgre SQL Connection
const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

const round = 10;
const salt  = bcrypt.genSaltSync(round);

function initRouter(app) {
    console.log("connecting to the database: " + process.env.DATABASE_URL);

	/* GET */
    app.get('/', index);
    app.get('/index', index);
    app.get('/signup', signup);
    app.get('/login', login);

    /* POST */
    app.post('/receive_signup', receive_signup);

    /* LOGIN */

}

function index(req, res, next) {
	res.render('index', { title: 'HomePage' });
}

function login(req, res, next) {
    res.render('login', { title: 'LogIn' });
}

function signup(req, res, next) {
    pool.query(sql_query.query.get_regions, (err, data) => {
        res.render('signup', { title: 'SignUp' , regionData: data.rows});
    });
}

function receive_signup(req, res, next) {
    //add sign up information into the database
    var aid;
    pool.query(sql_query.query.get_user_num, (err, data) => {
        if(err){
            console.log("cannot read the number");
            res.redirect('/');
        }else{
            aid = parseInt(data.rows[0].num, 10) + 1;
            var email = req.body.email;
            var username = req.body.username;
            var region = req.body.region;
            console.log(region);
            var password = req.body.password;
            var password_confirm = req.body.password_confirm;

            if (password.localeCompare(password_confirm) != 0) {
                //if the password and the confirmed password not match
                //reload the sign up page
                console.error("passwords not match");
                signup(req, res, next);
            } else {
                pool.query(sql_query.query.add_account, [aid, email, username, password], (err, data) => {
                    if(err) {
                        console.error("Cannot add the account");
                        res.redirect('/');
                    } else {
                        pool.query(sql_query.query.add_user, [aid, region], (err, data) => {
                            if(err) {
                                console.error("Cannot add the user");
                                res.redirect('/');
                            } else {
                                res.redirect('/login');
                            }
                        });
                    }
                });
            }
        }
    });

}

module.exports = initRouter;