require("dotenv").config();
const { Pool } = require("pg");

console.log(
    "DATABASE HOST:",
    process.env.DATABASE_URL
        ? new URL(process.env.DATABASE_URL).hostname
        : "DATABASE_URL NOT FOUND"
);

const { Pool } = require("pg");
require("dotenv").config();

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
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000
});

pool.on("error", (err) => {
    console.error("PostgreSQL pool error:", err);
});

module.exports = pool;
