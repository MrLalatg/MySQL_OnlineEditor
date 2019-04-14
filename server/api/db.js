const express = require('express');
const router = express.Router();
const sql = require('mysql');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

let authTables;
//Get specific table
router.get('/:table', (req, res) => {
	if(!authTables.includes(req.params.table)){
		res.sendStatus(403);
	}
	console.log(authTables);
	const connection = createConnection();
	connection.connect();
	connection.query(`SELECT * FROM ${req.params.table}`, (err, rows, columns) => {
		res.send(JSON.stringify(rows));
	});
});

//Get all tables
router.get('/', (req, res) => {
	const connection = createConnection();
	connection.connect();
	//1 as vis
	connection.query("SELECT *, 1 as tbl FROM information_schema.tables where TABLE_SCHEMA = 'for_tests'", (err, rows, columns) => {
		authTables = rows.map(item => item.TABLE_NAME);
		res.send(JSON.stringify(rows));
	});
});

router.post('/', (req, res) => {
	const connection = createConnection();
	connection.connect();
	connection.query("CREATE ")
});

//Set specific table
router.post('/:table', (req, res) => {
	if(!authTables.includes(req.params.table)){
		res.sendStatus(403);
	}
	const connection = createConnection();
	connection.connect();
	const toWrite = Object.keys(req.body).filter(key => key !== "id" && key !== "key_name").map(key => `${key}='${req.body[key]}'`).join(',');
	connection.query(`UPDATE ${req.params.table} SET ${toWrite} WHERE id=${req.body.id}`);
	res.sendStatus(201);
});


function createConnection(){
	return sql.createConnection({
		host: "localhost",
		port: "3306",
		user: "root",
		password: "1334216ZAza",
		database: "for_tests"
	});
}

module.exports = router;