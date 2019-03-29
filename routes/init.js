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
    app.get('/tasks', tasks);
		app.get('/post', post);

    /* POST */
    app.post('/receive_signup', receive_signup);
    app.post('/search', search)
		app.post('/receive_post', receive_post);
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

function post(req, res, next) {
    pool.query(sql_query.query.get_task_type, (err, data1) => {
        if(err) {
            console.log("Error encountered when reading classifications");
        } else {
          pool.query(sql_query.query.get_region_name, (err, data2) => {
						if (err){
							console.log("Error encountered when reading regions");
						} else {
							res.render('post', { title:"Post New Task", types: data1.rows, regions:data2.rows });
						}
					})
        }
    })
}

function receive_post(req, res, next) {
	//add new task into the database
	var tid;
	pool.query(sql_query.query.get_task_num, (err, data) => {
		if(err){
			console.log("cannot read task number");
			res.redirect('/');
		} else {
			tid = parseInt(data.rows[0].num, 10) + 1;
			var title = req.body.title;
			var rname = req.body.region;
			var cname = req.body.type;
			var finder_id = 1; //to be updated with the user id from the session
			var salary = parseInt(req.body.salary);
			var desc = req.body.desc;
			var date = new Date(req.body.date);

			var today = new Date()

			if (date < today) {
				console.error("This date has already passed.");
				post(req, res, next);
			} else {
				var datestring = date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
				pool.query(sql_query.query.add_task, [tid, title, rname, cname, finder_id, salary, datestring, desc], (err, data) => {
					if(err) {
						console.error("Cannot add the task");
						res.redirect('/');
					} else {
						res.redirect('/');
					}
				});
			}
		}
	})

}

module.exports = initRouter;
