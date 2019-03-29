const sql = {}

sql.query = {
    //Getinfo
    get_user_num: "SELECT COUNT(*) AS num FROM accounts",
    get_task_type: "SELECT cname FROM classifications",
    search: "SELECT * FROM tasks WHERE tasks.title LIKE $1",

    //Insertion
	add_account: 'INSERT INTO accounts (aid, email, username, password) VALUES ($1, $2, $3, $4)'
}

module.exports = sql
