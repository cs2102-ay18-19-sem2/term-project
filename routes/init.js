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
    app.get('/signup', signup);
    app.get('/login', login);

    /* Protected GET */
    app.get('/profile', passport.authMiddleware(), profile);

    /* Sign Up */
    app.post('/receive_signup', receive_signup);

    /* Login*/
    app.post('/receive_login', receive_login);

    /*Logout*/
    app.get('/logout', passport.authMiddleware(), logout);

}

function basic(req, res, page, other) {
	var info = {
		page: page,
		user: req.user.username
	};
	if(other) {
		for(var fld in other) {
			info[fld] = other[fld];
		}
	}
	res.render(page, info);
}

function index(req, res, next) {
    if(!req.isAuthenticated()) {
        console.log("not authenticated yet.");
	    res.render('index', { title: 'HomePage' , page: '', auth: false });
	} else {
	    console.log(req.user.username + " has logged in!");
	    basic(req, res, 'index', { page: '', auth: true });
	}
}

function login(req, res, next) {
    res.render('login', { title: 'LogIn', auth: false});
}

function signup(req, res, next) {
    pool.query(sql_query.query.get_regions, (err, data) => {
        res.render('signup', { title: 'SignUp' , regionData: data.rows, auth: false});
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
            aid = parseInt(data.rows[0].num, 10);
            var email = req.body.email;
            var username = req.body.username;
            var region = req.body.region;
            var password = req.body.password;
            var password_confirm = req.body.password_confirm;

            if (password.localeCompare(password_confirm) != 0) {
                //if the password and the confirmed password not match
                //reload the sign up page
                console.error("passwords not match");
                signup(req, res, next);
            } else {
                password = bcrypt.hashSync(password, salt);
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

function receive_login(req, res, next){
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.redirect('/login');
        }

        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/?user=' + user.username);
        });
    })(req, res, next);
}

function profile(req, res, next){
    res.render('profile', {user: req.user.username, auth: true});
}

function logout(req, res, next){
    req.session.destroy()
    req.logout()
    res.redirect('/')
}

module.exports = initRouter;