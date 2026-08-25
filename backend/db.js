require("dotenv").config();

const { Pool } = require("pg");

console.log("=================================");
console.log("DATABASE CHECK");
console.log("DATABASE_URL exists:",
    !!process.env.DATABASE_URL
);

if (process.env.DATABASE_URL) {
    try {
        const url = new URL(process.env.DATABASE_URL);

        console.log("Database host:", url.hostname);
        console.log("Database name:", url.pathname);
        console.log("Database SSL:", url.searchParams.get("sslmode"));
    } catch (error) {
        console.error("DATABASE_URL format is invalid");
    }
} else {
    console.error("DATABASE_URL NOT FOUND");
}

console.log("=================================");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false
    },

    max: 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000
});

pool.on("connect", () => {
    console.log("PostgreSQL client connected");
});

pool.on("error", (err) => {
    console.error("PostgreSQL pool error:", err);
});

module.exports = pool;