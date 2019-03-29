const sql = {}

sql.query = {
    //Getinfo
    get_user_num: "SELECT COUNT(*) AS num FROM accounts",
    get_regions: "SELECT rname AS region_name FROM regions",

    //Insertion
	add_account: 'INSERT INTO accounts (aid, email, username, password) VALUES ($1, $2, $3, $4)',
	add_user: 'INSERT INTO users (aid, rname, score) VALUES ($1, $2, 5)'
}

module.exports = sql
