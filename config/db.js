const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'user_management_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database.');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Please set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME environment variables.');
    // Don't exit — let the server start, API calls will fail gracefully
  }
};

testConnection();

module.exports = pool;
