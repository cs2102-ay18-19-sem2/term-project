const sql = {}

sql.query = {
    // Get Info
    get_user_num: "SELECT COUNT(*) AS num FROM accounts",
    get_task_type: "SELECT cname FROM classifications",
    search: "SELECT * FROM tasks WHERE tasks.title LIKE $1",
    admin_view_users: "SELECT * FROM users",
    get_profile: "SELECT * FROM users",

    // Update
    update_info: 'UPDATE users SET rname=$2, gender=$3 WHERE aid=$1',
    update_pass: 'UPDATE username_password SET password=$2 WHERE username=$1',

    // Insertion
	  add_account: 'INSERT INTO accounts (aid, email, username, password)'
       + ' VALUES ($1, $2, $3, $4)'
}

module.exports = sql
