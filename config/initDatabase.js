const pool = require('./database');
require('dotenv').config();

async function initDatabase() {
  try {
    // Create database if it doesn't exist
    const connection = await pool.getConnection();
    
    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'glovo_db'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'glovo_db'}`);
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Database tables created successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

module.exports = initDatabase;



