const mysql = require('mysql2');

// Create a connection pool to manage connections efficiently
const pool = mysql.createPool({
    host: 'localhost',
    user: 'indebel_user',
    password: 'indebel_pass',
    database: 'indebel_site',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Promisify for Node.js async/await usage
const promisePool = pool.promise();

module.exports = promisePool;
