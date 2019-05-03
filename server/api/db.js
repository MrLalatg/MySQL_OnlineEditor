const express = require('express');
const router = express.Router();
const sql = require('mysql');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

let authTables;
//Get specific table
router.get('/:table', (req, res) => {
    if (!authTables.includes(req.params.table)) {
        res.sendStatus(403);
    }
    const connection = createConnection();
    connection.connect();

    connection.query(`SELECT *, 'row' as type FROM ${req.params.table}`, (err, rows) => {
        res.send(JSON.stringify(rows));
    });
});

//Get all tables
router.get('/', (req, res) => {
    const connection = createConnection();
    connection.connect();
    //1 as vis
    connection.query("SELECT *, 'table' as type FROM information_schema.tables where TABLE_SCHEMA = 'for_tests'", (err, rows, columns) => {
        authTables = rows.map(item => item.TABLE_NAME);
        res.send(JSON.stringify(rows));
    });
});

//Create table
router.post('/', async (req, res) => {
    const connection = createConnection();
    connection.connect();

    let sql = req.body.cols.reduce((acc, item) =>
            item.type !== 'REFERENCE' ? `${acc} , ${item.colName} ${item.type}` : acc
        , `id INT AUTO_INCREMENT NOT NULL, key_name VARCHAR(255) GENERATED ALWAYS AS (${req.body.keyname}) VIRTUAL`);

    sql = `CREATE TABLE IF NOT EXISTS ${req.body.tableName}(${sql}, PRIMARY KEY(id))`;

    await promiseQuery(sql, connection);

    req.body.cols.filter(col => col.type === 'REFERENCE').forEach(col => setupManyToMany(req.body.tableName, col.colName));

    authTables.push(req.body.tableName);
    connection.query(`SELECT * FROM information_schema.tables WHERE TABLE_NAME='${req.body.tableName}'`, (err, rows) => {
        res.send(JSON.stringify(rows));
    });
});

//Delete specific table
router.delete('/:table', (req, res) => {
    if (!authTables.includes(req.params.table)) {
        res.send("Table doesn't exists");
    }
    const connection = createConnection();
    connection.connect();
    connection.query(`DROP TABLE ${req.params.table}`);
    res.sendStatus(200);
});

//Set specific table
router.post('/:table', (req, res) => {
    if (!authTables.includes(req.params.table)) {
        res.sendStatus(403);
    }
    const connection = createConnection();
    connection.connect();
    // const toWrite = Object.keys(req.body).filter(key => key !== "id" && key !== "key_name").map(key => `${key}='${req.body[key]}'`).join(',');
    const toWrite = `${req.body.prop}='${req.body.value}'`;
    connection.query(`UPDATE ${req.params.table} SET ${toWrite} WHERE id=${req.body.rowId}`);
    res.sendStatus(201);
});

//Insert new row into a specific table
router.post('/insert/:table', async (req, res) => {
    if (!authTables.includes(req.params.table)) {
        res.sendStatus(403);
    }
    const connection = createConnection();
    connection.connect();

    let columns = Object.keys(req.body.cols).map((item) => item).join(", ");
    let rows = Object.values(req.body.cols).map(item => `'${item}'`).join(", ");
    let colValues = `(${columns}) VALUES (${rows})`;
    await promiseQuery(`INSERT INTO ${req.params.table}${colValues}`, connection);

    let newRow = (await promiseQuery(`SELECT *, '${req.params.table}' as 'table' FROM ${req.params.table} ORDER BY id DESC LIMIT 1`, connection))[0];

    req.body.refs.forEach(async ref => {
        let tableName = (await promiseQuery(`SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_NAME IN ('${req.params.table}_${ref.key}', '${ref.key}_${req.params.table}') LIMIT 1`, connection))[0].TABLE_NAME;
        await promiseQuery(`INSERT INTO ${tableName} (${req.params.table}_id, ${ref.key}_id) VALUES (${newRow.id}, ${ref.id})`, connection);
    });

    res.send(JSON.stringify(newRow));
});

//Delete specific row from specific table
router.delete('/row/:table', (req, res) => {
    if (!authTables.includes(req.params.table)) {
        res.sendStatus(403);
    }
    const connection = createConnection();
    connection.connect();

    connection.query(`DELETE FROM ${req.params.table} WHERE id=${req.body.id}`, err => {
        res.sendStatus(200);
    })
});

//Get list of columns of a specific table
router.get('/cols/:table', async (req, res) => {
    if (!authTables.includes(req.params.table)) {
        res.sendStatus(403);
    }
    const connection = createConnection();
    connection.connect();

    let responseData = {columns: [], autocompleteData: []};

    responseData.columns = await promiseQuery(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='${req.params.table}'`, connection);

    let tables = await getRefTables(req.params.table, connection);

    responseData.autocompleteData = await Promise.all(tables.map(async tbl => {
        return {
            key: tbl,
            data: await promiseQuery(`SELECT id, key_name FROM ${tbl}`, connection)
        }
    }));

    res.send(JSON.stringify(responseData));
});

//-------------------------------\\
//RELATIONSHIPS
//-------------------------------\\

function setupManyToMany(mainTable, subTable){
    const connection = createConnection();

    connection.connect();

    let sql = `CREATE TABLE IF NOT EXISTS ${`${mainTable}_${subTable}` }(
                  ${mainTable}_id INT(11) DEFAULT NULL,
                  ${subTable}_id INT(11) DEFAULT NULL,
                  FOREIGN KEY (${mainTable}_id) REFERENCES ${mainTable} (id),
                  FOREIGN KEY (${subTable}_id) REFERENCES ${subTable} (id)
    )`;

    console.log(sql);

    connection.query(sql);
}

router.get('/relp/:table/:rowId', async (req, res) => {
    if (!authTables.includes(req.params.table)) {
        res.sendStatus(403);
    }
    const connection = createConnection();

    connection.connect();

    let tables = await getRefTables(req.params.table, connection);

    let responseData = await Promise.all(tables.map(async tbl => {
        let cross = await getCrossTableName(req.params.table, tbl, connection);
        return {name: tbl,
                data: await promiseQuery(`SELECT t.*, 'row' as type FROM ${cross} LEFT JOIN ${tbl} t ON t.id=${tbl}_id WHERE ${req.params.table}_id=${req.params.rowId}`, connection)}
    }));

    res.send(JSON.stringify(responseData));
});

async function getRefTables(tableName, connection) {
    let tables = await promiseQuery(`SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_NAME='${tableName}'`, connection);
    tables = tables.map(ref => ref.TABLE_NAME.split('_')[0] === tableName ? ref.TABLE_NAME.split('_')[1] : ref.TABLE_NAME.split('_')[0]);
    return tables;
}

async function getCrossTableName(tableName, subName, connection){
    let cross = (await promiseQuery(`SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_NAME IN ('${tableName}_${subName}', '${subName}_${tableName}') LIMIT 1`, connection))[0].TABLE_NAME;
    return cross;
}

function promiseQuery(sql, connection) {
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, rows) => {
            console.log("SQL in Promise: ", sql);
           if(err){
               reject(err);
           } else {
               resolve(rows);
           }
        });
    });
}

function createConnection() {
    return sql.createConnection({
        host: "localhost",
        port: "3306",
        user: "root",
        password: "1334216ZAza",
        database: "for_tests"
    });
}

module.exports = router;