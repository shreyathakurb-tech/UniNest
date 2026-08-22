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
    }
});

module.exports = pool;