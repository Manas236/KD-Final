/* ============================================================
   MySQL connection pool
   ------------------------------------------------------------
   A single shared pool for the whole app. A "pool" keeps a small
   set of database connections open and hands them out as needed,
   which is far faster than opening a new connection per request.

   Credentials come from environment variables (see .env.example).
   Never hard-code the database password in this file.
   ============================================================ */
import mysql from "mysql2/promise";
import "dotenv/config"; // loads the .env file into process.env

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "kd_construction",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
