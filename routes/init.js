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

function initRouter(app) {
    console.log("connecting to the database: " + process.env.DATABASE_URL);

	/* GET */
    app.get('/', index);
    app.get('/index', index);
    app.get('/login', login);
    app.get('/signup', signup);
    app.get('/tasks/search', tasks_search);
    app.get('/tasks', tasks)

    /* POST */
    app.post('/receive_signup', receive_signup);
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

function tasks_search(req, res, next) {
    var keyword = "%" + req.query.keyword + "%";
    console.log(keyword);
    pool.query(sql_query.query.search, [keyword], (err, data) => {
        if(err) {
            console.log("Error encountered when searching");
            index(req, res, next);
        } else {
            show(res, data);
        }
    });
}

function tasks(req, res, next) {
    var type = req.query.type === "" ? sql_query.query.get_task_type : req.query.type;
    var region = req.query.region === "" ? sql_query.query.get_region : req.query.region;
    var range = req.query.range === "" ? [0, infinity] : rangeNum[ranges.indexOf(req.query.range)];
    var typePlaceholder = req.query.type === "" ? "Type" : req.query.type;
    var regionPlaceholder = req.query.region === "" ? "Region" : req.query.region;
    var rangePlaceholder = req.query.range === "" ? "Salary" : req.query.range;
    console.log(type + "-" + region + "-" + range);
    pool.query(sql_query.query.search, ["%%"], (err, data) => {
        if(err) {
            console.log("Error encountered when searching");
            index(req, res, next);
        } else {
            pool.query(sql_query.query.filter, [type, region, range[0], range[1]], (err, data) => {
                if(err) {
                    console.log("Error encountered when filtering");
                    index(req, res, next);
                } else {
                    show(res, data, typePlaceholder, regionPlaceholder, rangePlaceholder);
                }
            });
        }
    });
}

function show(res, data1, selectedType, selectedRegion, selectedRange) {
    pool.query(sql_query.query.get_task_type, (err, data2) => {
        if(err) {
            console.log("Error encountered when reading classifications");
        } else {
            pool.query(sql_query.query.get_region, (err, data3) => {
                if(err) {
                    console.log("Error encountered when reading regions");
                } else {
                    res.render('tasks', { title: "Search Results", 
                        tasks: data1.rows, type: selectedType, region: selectedRegion, range: selectedRange,
                        types: data2.rows, regions: data3.rows, ranges: ranges });
                }
            });
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

module.exports = initRouter;