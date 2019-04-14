const express = require('express');
const cors = require('cors');

const app = express();
const db = require('./api/db');

app.use(cors());
app.options('*', cors());
app.use('/api/db', db);

app.listen(5000, () => {
    console.log("Server started on port 5000");
});