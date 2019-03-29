const sql = {}

sql.query = {
    //Getinfo
    get_user_num: "SELECT COUNT(*) AS num FROM accounts",
    get_task_type: "SELECT cname FROM classifications",
    get_region: "SELECT rname FROM regions",
    get_all_date: "SELECT task_date FROM tasks",
    search: "SELECT * FROM tasks WHERE tasks.title LIKE $1",
    get_region_name: "SELECT rname FROM regions",
    get_task_num: "SELECT COUNT(*) AS num FROM tasks",
    get_bidder_for_task: `SELECT A.aid as bidder_id, A.username as bidder_name, B.salary as salary \
    FROM (accounts NATURAL JOIN users) as A JOIN bids B ON (A.aid = B.tasker_id) WHERE B.tid = $1 `,
    filter: "SELECT * FROM tasks T WHERE T.cname IN ($1) AND T.rname IN ($2) AND T.task_date >= $3 AND T.salary >= $4 AND T.salary <= $5",

    //Insertion
	add_account: 'INSERT INTO accounts (aid, email, username, password) VALUES ($1, $2, $3, $4)',
  add_task: 'INSERT INTO tasks (tid, title, rname, cname, finder_id, salary, post_date , task_date, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)'
}

module.exports = sql
