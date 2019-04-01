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

const infinity = 2147483647;

var ranges = ["≤1000", "1000-2000", "2000-3000", "≥3000"];
var rangeNum = [[0, 1000], [1000, 2000], [2000, 3000], [3000, infinity]];
var dateRanges = ["last 3 days", "last one week", "last one month(30 days)"];

var gender_class = ["Female", "Male", "Others"];
var education_level = ['High School', 'College', 'Postgraduate', 'Other'];
var regions = ['Kent Ridge', 'Buona Vista', 'Bugis', 'Marina Bay', 'Orchard',
  'Jurong East', 'Changi Airport', 'Malaysia', 'Bishan', 'Holland Village', 'Yishun', 'Other'];

function initRouter(app) {
    console.log("connecting to the database: " + process.env.DATABASE_URL);

	/* GET */
    app.get('/', index);
    app.get('/signup', signup);
    app.get('/login', login);
    app.get('/tasks/search', tasks_search);
    app.get('/tasks', tasks)

    /* Protected GET */
    app.get('/post', passport.authMiddleware(), post);
    app.get('/profile', passport.authMiddleware(), profile);
    app.get('/admin_users', passport.authMiddleware(), admin_users);

    /* PROTECTED POST */
    app.post('/receive_post', passport.authMiddleware(), receive_post);
    app.post('/update_acc_info', passport.authMiddleware(), update_acc_info);
    app.post('/update_user_info', passport.authMiddleware(), update_user_info);

    /* Sign Up */
    app.post('/receive_signup', receive_signup);

    /* Login */
    app.post('/receive_login', receive_login);

    /* Logout */
    app.get('/logout', passport.authMiddleware(), logout);

}

/* Basic Info used for profile.*/
function basic(req, res, page, other) {
  var info = {
    page: page,
    user: req.user.aid,
  };
  if(other) {
    for(var fld in other) {
      info[fld] = other[fld];
    }
  }

  res.render(page, info);
}

/* User can view and update his own profile page. */
function profile(req, res, next) {
    pool.query(sql_query.query.get_user_info, [req.user.aid], (err, data) => {
        if (err) {
            console.log("cannot load profile");
        } else {
            var info = {
                acc_email: req.user.email,
                acc_username: req.user.username,
                user_info: data.rows[0],
                education_level: education_level,
                regionData: regions,
                gender_class: gender_class,
                info_msg: msg(req, 'info', 'Information updated successfully', 'Error in updating information'),
                pass_msg: msg(req, 'pass', 'Password updated successfully', 'Error in updating password'),
                auth:true,
            };
            basic(req, res, 'profile', info);
      }
    })
}

function query(req, fld) {
  return req.query[fld] ? req.query[fld] : '';
}
function msg(req, fld, pass, fail) {
  var info = query(req, fld);
  console.log("info"+info);
  return info ? (info=='pass' ? pass : fail) : '';
}

/* Admin can view all the users. */
function admin_users(req, res, next) {
    pool.query(sql_query.query.admin_view_users, (err, data) => {
        if (err) {
            console.log("Error encountered when admin trying to view all"
                + " users.");
        } else {
            basic(req, res, 'admin_users', {title: "admin_users", types: data.rows, auth: true });
      }
    })
}

function index(req, res, next) {
    pool.query(sql_query.query.get_task_type, (err, data) => {
        if(err) {
            console.log("Error encountered when reading classifications");
        } else {
            if(!req.isAuthenticated()) {
                console.log("not authenticated yet.");
            	res.render('index', { title: 'Homepage' , page: '', auth: false, types: data.rows});
            } else {
            	console.log(req.user.aid + " has logged in!");
            	basic(req, res, 'index', { title: 'Homepage', page: '', auth: true, types: data.rows});
            }
        }
    })
}

function tasks_search(req, res, next) {
    var keyword = "%" + req.query.keyword + "%";
    console.log(keyword);
    pool.query(sql_query.query.search, [keyword], (err, data) => {
        if(err) {
            console.log("Error encountered when searching");
            index(req, res, next);
        } else {
            show(req, res, data);
        }
    });
}

function tasks(req, res, next) {
    var type = isEmpty(req.query.type, "Type") ? sql_query.query.get_task_type : "VALUES ('" + req.query.type + "')";
    var region = isEmpty(req.query.region, "Region") ? sql_query.query.get_region : "VALUES ('" + req.query.region + "')";
    var date = isEmpty(req.query.date, "Date") ? getDate(new Date()) : getDate(req.query.date);
    var range = isEmpty(req.query.range, "Salary") ? [0, infinity] : rangeNum[ranges.indexOf(req.query.range)];
    console.log("tasks: " + type + "-" + region + "-" + range + "-" + date);
    pool.query(sql_query.query.search, ["%%"], (err, data) => {
        if(err) {
            console.log("Error encountered when searching");
            index(req, res, next);
        } else {
            pool.query(sql_query.query.filter, [type, region, date, range[0], range[1]], (err, data) => {
                if(err) {
                    console.log("Error encountered when filtering");
                    index(req, res, next);
                } else {
                    show(req, res, data);
                }
            });
        }
    });
}

function isEmpty(input, placeHolder) {
    return input === "" || input === placeHolder || typeof input === "undefined";
}

function getDate(choice) {
    var currentDate = new Date();
    var resultDate = currentDate;
    console.log(currentDate);
    switch (choice) {
    case dateRanges[0]:
        resultDate = new Date(resultDate.setDate(currentDate.getDate()-3));
        break;
    case dateRanges[1]:
        resultDate = new Date(resultDate.setDate(currentDate.getDate()-7));
        break;
    case dateRanges[2]:
        resultDate = new Date(resultDate.setDate(currentDate.getDate()-30));
        break;
    }
    return resultDate.getUTCFullYear() + "-" + (resultDate.getUTCMonth() + 1) + "-" + resultDate.getUTCDate();
}

function show(req, res, data1) {
    var selectedType = isEmpty(req.query.type, "Type") ? sql_query.query.get_task_type : "VALUES ('" + req.query.type + "')";
    var selectedRegion = isEmpty(req.query.region, "Region") ? sql_query.query.get_region : "VALUES ('" + req.query.region + "')";
    var selectedDate = isEmpty(req.query.date, "Date") ? getDate(new Date()) : getDate(req.query.date);
    var selectedRange = isEmpty(req.query.range, "Salary") ? [0, infinity] : rangeNum[ranges.indexOf(req.query.range)];
    console.log("show: " + selectedType + "-" + selectedRegion + "-" + selectedDate + "-" + selectedRange);
    pool.query(sql_query.query.get_task_type, (err, data2) => {
        if(err) {
            console.log("Error encountered when reading classifications");
        } else {
            pool.query(sql_query.query.get_region, (err, data3) => {
                if(err) {
                    console.log("Error encountered when reading regions");
                } else {
                    var isAuth = req.isAuthenticated();
                    var info = {
                        tasks: data1.rows,
                        type: selectedType,
                        region: selectedRegion,
                        taskDate: selectedDate,
                        range: selectedRange,
                        types: data2.rows,
                        regions: data3.rows,
                        dates: dateRanges,
                        ranges: ranges,
                        auth: isAuth
                    };
                    if (isAuth) {
                        basic(req, res, 'tasks', info);
                    } else {
                        res.render('tasks', info);
                    }
                }
            });
        }
    });
}

function login(req, res, next) {
    res.render('login', { title: 'LogIn', auth: false});
}

function signup(req, res, next) {
    pool.query(sql_query.query.get_region, (err, data) => {
        res.render('signup', { title: 'SignUp' , regionData: data.rows, auth: false});
    });
}

// POST
function update_acc_info(req, res, next) {
    var aid = req.user.aid;
    var newname = req.body.username;
    pool.query(sql_query.query.update_acc_info, [aid, newname], (err, data) => {

        if(err) {
            console.error("Error in update info");
            res.redirect('/profile?user=' + aid + "?info=fail");
        } else {
            res.redirect('/profile?user=' + aid + "?info=pass");
        }
    });
}

function update_user_info(req, res, next) {
  var aid = req.user.aid;
  var gender = req.body.gender;
  var rname  = req.body.rname;
  var education = req.body.education;
  console.log("aid:" + aid + " gender: " + gender + " rname: " + rname + " education: " + education);
  pool.query(sql_query.query.update_user_info, [aid, gender, rname, education], (err, data) => {
    console.log(err);
    if(err) {
      console.error("Error in update user info");
      res.redirect('/profile?user='+aid);
    } else {
      res.redirect('/profile?user='+aid);
}
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
            console.log(user);
            return res.redirect('/?user=' + user.aid);
        });
    })(req, res, next);
}

function logout(req, res, next){
    req.session.destroy()
    req.logout()
    res.redirect('/')
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
						    basic(req, res, 'post', { title:"Post New Task", types: data1.rows, regions:data2.rows, auth: true});
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
			var today_date = today.getUTCFullYear() + "-" + (today.getUTCMonth() + 1) + "-" + today.getUTCDate();

			if (date < today) {
				console.error("This date has already passed.");
				post(req, res, next);
			} else {
				var datestring = date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
				pool.query(sql_query.query.add_task, [tid, title, rname, cname, finder_id, salary, today_date, datestring, desc], (err, data) => {
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
