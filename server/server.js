import 'dotenv/config';
import app from './src/app.js';
import { PORT } from './src/utils/constants.js';
import pool from './src/config/db.js';

async function startServer() {
  const serverPort = PORT || 5000;

  app.listen(serverPort, async () => {
    console.log('====================================================');
    console.log(`🏨 Grand Horizon Hotel Management System (HMS)`);
    console.log(`🚀 REST API listening on http://localhost:${serverPort}`);
    console.log(`📋 Zero-ORM Architecture: Exclusively powered by MySQL Stored Procedures`);
    console.log('====================================================');

    try {
      const conn = await pool.getConnection();
      console.log(`[Database] MySQL Connection established successfully on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
      conn.release();
    } catch (err) {
      console.warn(`[Database Notice] MySQL is not currently reachable (${err.message}).`);
      console.warn(`[Database Instructions] To connect live data, execute scripts in /database/ in MySQL Workbench and set DB credentials in server/.env.`);
    }
  });
}

startServer();