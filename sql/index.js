const sql = {}

sql.query = {
    // Get Info
    check_if_admin: "SELECT aid FROM admins WHERE aid=$1",
    get_user_num: "SELECT COUNT(*) AS num FROM accounts",
    emailpass: 'SELECT aid, username, email, password FROM accounts WHERE email=$1',
    get_task_type: "SELECT cname FROM classifications",
    get_region: "SELECT rname FROM regions",
    get_all_date: "SELECT task_date FROM tasks",
    search: "SELECT * FROM tasks WHERE tasks.title LIKE $1",
    get_region_name: "SELECT rname FROM regions",
    get_task_num: "SELECT COUNT(*) AS num FROM tasks",
    get_bidder_for_task: `SELECT A.aid as bidder_id, A.username as bidder_name, B.salary as salary \
    FROM (accounts NATURAL JOIN users) as A JOIN bids B ON (A.aid = B.tasker_id) WHERE B.tid = $1 `,
    filter: "SELECT * FROM tasks T WHERE T.salary >= $1 AND T.salary <= $2 AND T.task_date >= $3 AND T.post_date <= $4 AND ($7 = 'true' OR T.rname = $5) AND ($8 = 'true' OR T.cname = $6)",
    admin_view_users: "SELECT * FROM users",
    get_profile: "SELECT * FROM users",
    get_detail: "SELECT * \
    FROM tasks T LEFT OUTER JOIN \
    (SELECT B.tid AS btid, MAX(B.salary) AS best_bid FROM bids B GROUP BY B.tid) AS B \
    ON T.tid = B.btid WHERE T.tid = $1",
    (SELECT B.tid AS btid, MIN(B.salary) AS best_bid FROM bids B GROUP BY B.tid) AS B ON T.tid = B.btid \
    LEFT OUTER JOIN accounts U ON U.aid = T.finder_id WHERE T.tid = $1",
    get_user_info: "SELECT * FROM users WHERE aid= (SELECT aid FROM accounts WHERE username=$1)",
    admin_view_tasks: "SELECT * FROM tasks",
    admin_view_users: "SELECT accounts.username as username, users.rname as rname, users.score as score FROM accounts NATURAL JOIN users",
    admin_get_user_details: "SELECT accounts.username as username, users.gender as gender, users.education as education, users.rname as rname, accounts.email as email, users.score as score FROM accounts NATURAL JOIN users WHERE aid = $1",
    admin_get_user_tasks: "SELECT tasks.title as title FROM users",
    get_user_info: "SELECT * FROM users WHERE aid=$1",

    // Update
    update_acc_info: 'UPDATE accounts SET username=$2 WHERE aid=$1',
    update_user_info: 'UPDATE users SET gender=$2, rname=$3, education=$4 WHERE aid=$1',
    update_pass: 'UPDATE accounts SET password=$2 WHERE aid=$1',


    //Insertion
	add_account: 'INSERT INTO accounts (aid, email, username, password)'
       + ' VALUES ($1, $2, $3, $4)',
    add_user: 'INSERT INTO users (aid, rname, score) VALUES ($1, $2, 5)',
    delete_bid: 'DELETE FROM bids WHERE tid = $1 AND tasker_id = $2',
    insert_bid: 'INSERT INTO bids (tid, tasker_id, salary) VALUES ($1, $2, $3)',
    add_task: 'INSERT INTO tasks (tid, title, rname, cname, finder_id, salary, post_date , task_date, start_time, end_time, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)'
}

module.exports = sql
