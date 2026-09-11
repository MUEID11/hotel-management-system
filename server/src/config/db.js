import 'dotenv/config';
import mysql from 'mysql2/promise';

// Central mysql2 connection pool. The application only ever calls stored
// procedures through this pool; no raw SQL statements live in this codebase.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  timezone: '+00:00'
});

export async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL (${process.env.DB_NAME || 'hotel_management'}) on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    connection.release();
    return true;
  } catch (error) {
    console.warn(`[Database Notice] Unable to connect to MySQL: ${error.message}`);
    console.warn(`[Database Setup] Please ensure MySQL Server is running and you executed the SQL files in /database/ via MySQL Workbench.`);
    return false;
  }
}

export default pool;