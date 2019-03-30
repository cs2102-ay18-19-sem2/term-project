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
    app.get('/login', login);
    app.get('/signup', signup);
    app.get('/tasks', tasks)
    app.get('/admin_users', admin_users);
    app.get('/profile', profile);

    /* POST */
    app.post('/update_info', update_info);
    app.post('/receive_signup', receive_signup);
    app.post('/search', search)
}

/* Basic Info used for profile. */
function basic(req, res, page, other) {
  var info = {
    page: page,
    rname: req.body.rname,
    gender : req.body.gender,
  };
  if(other) {
    for(var fld in other) {
      info[fld] = other[fld];
    }
  }
  res.render(page, info);
}

function query(req, fld) {
  return req.query[fld] ? req.query[fld] : '';
}
function msg(req, fld, pass, fail) {
  var info = query(req, fld);
  return info ? (info=='pass' ? pass : fail) : '';
}

/* User can view and update his own profile page. */
function profile(req, res, next) {
  basic(req, res, 'profile', { info_msg: msg(req, 'info', 'Information updated'
        + ' successfully', 'Error in updating information'),
    pass_msg: msg(req, 'pass', 'Password updated successfully', 'Error in updating password'), auth: true });

}

/* Admin can view all the users. */
function admin_users(req, res, next) {
    pool.query(sql_query.query.admin_view_users, (err, data) => {
        if (err) {
            console.log("Error encountered when admin trying to view all"
                + " users.");
        } else {
            res.render('admin_users', {title: "admin_users", types: data.rows });
      }
    })
}

function index(req, res, next) {
    pool.query(sql_query.query.get_task_type, (err, data) => {
        if(err) {
            console.log("Error encountered when reading classifications");
        } else {
            res.render('index', { title: "HomePage", types: data.rows });
        }
    })
}

function search(req, res, next) {
    var keyword = "%" + req.body.keyword + "%";
    console.log(keyword);
    pool.query(sql_query.query.search, [keyword], (err, data) => {
        if(err) {
            console.log("Error encountered when searching");
            index(req, res, next);
        } else {
            res.render('tasks', { title: "Search Results", tasks: data.rows });
        }
    });
}

function tasks(req, res, next) {
    pool.query(sql_query.query.search, [keyword], (err, data) => {
        if(err) {
            console.log("Error encountered when searching");
            console.log(err);
            index(req, res, next);
        } else {
            console.log("returned");
            res.render('tasks', { title: "Search Results", tasks: data.rows });
        }
    });
}

function login(req, res, next) {
    res.render('login', { title: 'LogIn' });
}

function signup(req, res, next) {
    res.render('signup', { title: 'SignUp' });
}

// POST
function update_info(req, res, next) {
  var aid = req.body.rname;
  var rname  = req.body.rname;
  var gender = req.body.gender;
  pool.query(sql_query.query.update_info, [aid, rname, gender], (err, data) => {
    console.log("---aid: " + aid +" ---rname: " + rname + " ---gender: " + gender);
    if(err) {
      console.error("Error in update info");
      res.redirect('/profile');
    } else {
      res.redirect('/profile');
}
});
}

function receive_signup(req, res, next) {
    //add sign up information into the database
    var aid;
    pool.query(sql_query.query.get_user_num, (err, data) => {
        if(err){
            console.log("cannot read the number");
            res.redirect('/login');
        }else{
            aid = parseInt(data.rows[0].num, 10) + 1;
            var email = req.body.email;
            var username = req.body.username;
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
                                	console.error("Cannot add the user");
                                	res.redirect('/');
                                } else {
                                	res.redirect('/login');
                                }
                            });
            }
        }
    });

}

module.exports = initRouter;