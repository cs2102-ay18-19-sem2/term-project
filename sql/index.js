const sql = {}

sql.query = {
    //Getinfo
    get_user_num: "SELECT COUNT(*) AS num FROM accounts",
    get_task_type: "SELECT cname FROM classifications",
    search: "SELECT * FROM tasks WHERE tasks.title LIKE $1",
    get_region_name: "SELECT rname FROM regions",
    get_task_num: "SELECT COUNT(*) AS num FROM tasks",
    get_bidder_for_task: `SELECT A.aid as bidder_id, A.username as bidder_name, B.salary as salary \
    FROM (accounts NATURAL JOIN users) as A JOIN bids B ON (A.aid = B.tasker_id) WHERE B.tid = $1 `

    //Insertion
	add_account: 'INSERT INTO accounts (aid, email, username, password) VALUES ($1, $2, $3, $4)',
  add_task: 'INSERT INTO tasks (tid, title, rname, cname, finder_id, salary, task_date, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)'
}

module.exports = sql
