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
	const connection = createConnection();
	connection.connect();
	connection.query(`SELECT *, 1 as isRow FROM ${req.params.table}`, (err, rows, columns) => {
		res.send(JSON.stringify({rows, columns}));
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

//Create table
router.post('/', (req, res) => {
	const connection = createConnection();
	connection.connect();
	connection.query(`CREATE TABLE IF NOT EXISTS ${req.body.tableName}(${req.body.cols.reduce((acc, item) => 
		`${acc} , ${item.colName} ${item.type}`
	, `id INT AUTO_INCREMENT NOT NULL, key_name VARCHAR(255) GENERATED ALWAYS AS (${req.body.keyname}) VIRTUAL`)}, PRIMARY KEY(id))`, (err) => {
	});
	connection.query(`SELECT * FROM information_schema.tables WHERE TABLE_NAME='${req.body.tableName}'`, (err, rows) => {
		res.send(JSON.stringify(rows));
	});
});

//Delete specific table
router.delete('/:table', (req, res) => {
	if(!authTables.includes(req.params.table)){
		res.send("Table doesn't exists");
	}
	const connection = createConnection();
	connection.connect();
	connection.query(`DROP TABLE ${req.params.table}`);
	res.sendStatus(200);
});

//Set specific table
router.post('/:table', (req, res) => {
	if(!authTables.includes(req.params.table)){
		res.sendStatus(403);
	}
	const connection = createConnection();
	connection.connect();
	// const toWrite = Object.keys(req.body).filter(key => key !== "id" && key !== "key_name").map(key => `${key}='${req.body[key]}'`).join(',');
	const toWrite = `${req.body.prop}='${req.body.value}'`;
	connection.query(`UPDATE ${req.params.table} SET ${toWrite} WHERE id=${req.body.rowId}`);
	res.sendStatus(201);
});

router.post('/insert/:table', (req, res) =>{
	if(!authTables.includes(req.params.table)){
		res.sendStatus(403);
	}
	console.log(req.body);
	const connection = createConnection();
	connection.connect();

	let columns = Object.keys(req.body).map((item) => item ).join(", ");
	let rows = Object.values(req.body).map(item => `'${item}'`).join(", ");
	let colValues = `(${columns}) VALUES (${rows})`;
	connection.query(`INSERT INTO ${req.params.table}${colValues}`, (err) => {
		res.sendStatus(201);
	});
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