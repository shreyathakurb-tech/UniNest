require("dotenv").config();
const { Pool } = require("pg");

console.log(
    "DATABASE HOST:",
    process.env.DATABASE_URL
        ? new URL(process.env.DATABASE_URL).hostname
        : "DATABASE_URL NOT FOUND"
);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err);
});

pool.query('SELECT NOW()')
    .then(() => console.log('PostgreSQL Connected'))
    .catch(err => console.error('Database connection error:', err));

module.exports = pool;