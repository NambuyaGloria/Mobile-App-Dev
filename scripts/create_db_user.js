const mysql = require('mysql2/promise');

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      port: 3306,
    });

    const [verRows] = await connection.query('SELECT VERSION() AS v');
    console.log('MySQL VERSION:', verRows[0].v);
    const [whoRows] = await connection.query("SELECT CURRENT_USER() AS current_user, USER() AS mysql_user");
    console.log('CURRENT_USER / USER:', whoRows[0]);

    console.log('Connected as root — creating database and user...');

    await connection.query('CREATE DATABASE IF NOT EXISTS `glovo_db`');

    // Try to create the user (works on MySQL 5.7+ and 8+). If the user already exists this may error.
    try {
      await connection.query("CREATE USER 'glovo_user'@'localhost' IDENTIFIED BY 'GlovoUser!2025'");
    } catch (err) {
      console.error('CREATE USER error (ignored):', err);
    }

    // Grant privileges without using IDENTIFIED BY (some MySQL versions reject that syntax)
    await connection.query("GRANT ALL PRIVILEGES ON `glovo_db`.* TO 'glovo_user'@'localhost'");
    await connection.query('FLUSH PRIVILEGES');

    console.log('Database and user ready.');
    await connection.end();
  } catch (error) {
    console.error('Error creating DB/user:', error.message || error);
    process.exit(1);
  }
}

main();
