const mysql = require('mysql2');
const config = require('./environment');

const pool = mysql.createPool({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// Test connection
promisePool.query('SELECT 1')
    .then(() => {
        console.log('MySQL Database Connected Successfully');
    })
    .catch((err) => {
        console.error('Database connection failed: ', err);
    });

module.exports = promisePool;
