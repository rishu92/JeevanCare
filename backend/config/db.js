import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  let connection;

  try {
    connection = await pool.getConnection();
    console.log("MySQL connected successfully.");
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

testConnection();

export default pool;
