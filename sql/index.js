const sql = {}

sql.query = {
    //Getinfo
    get_user_num: "SELECT COUNT(*) AS num FROM accounts",

    //Insertion
	add_account: 'INSERT INTO accounts (aid, email, username, password) VALUES ($1, $2, $3, $4)'
}

module.exports = sql
