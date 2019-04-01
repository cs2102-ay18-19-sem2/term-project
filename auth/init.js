const sql_query = require('../sql');
const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const authMiddleware = require('./auth');
const antiMiddleware = require('./anti');

// Postgre SQL Connection
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function findUser (email, callback) {
	pool.query(sql_query.query.emailpass, [email], (err, data) => {
		if(err) {
			console.error("Cannot find user");
			return callback(null);
		}

		if(data.rows.length == 0) {
			console.error("User does not exists?");
			return callback(null)
		} else if(data.rows.length == 1) {
		  //  console.log("the user id:" + data.rows[0].aid);
			return callback(null, {
			    aid: data.rows[0].aid,
			    username: data.rows[0].username,
                email   : data.rows[0].email,
                passwordHash: data.rows[0].password
			});
		} else {
			console.error("More than one user?");
			return callback(null);
		}
	});
}

passport.serializeUser(function (user, cb) {
  cb(null, user.email);
})

passport.deserializeUser(function (email, cb) {
  findUser(email, cb);
})

function initPassport () {
  console.log("init passport");
  passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    (email, password, done) => {
      findUser(email, (err, user) => {
        if (err) {
          console.log("error?: " + err);
          return done(err);
        }

        // User not found
        if (!user) {
          console.error('User not found');
          return done(null, false);
        }

        // Always use hashed passwords and fixed time comparison
        bcrypt.compare(password, user.passwordHash, (err, isValid) => {
          if (err) {
            console.log("password not match: " + err);
            return done(err);
          }
          if (!isValid) {
            console.log("not match");
            return done(null, false);
          }
          return done(null, user);
        })
      })
    }
  ));

  passport.authMiddleware = authMiddleware;
  passport.antiMiddleware = antiMiddleware;
  passport.findUser = findUser;
}

module.exports = initPassport;