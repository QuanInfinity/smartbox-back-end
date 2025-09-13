const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function updatePasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'smartlock'
  });

  const users = [
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'tech_a@example.com', password: 'tech123' },
    { email: 'tech_b@example.com', password: 'tech123' },
    { email: 'customer_a@example.com', password: 'customer123' },
    { email: 'customer_b@example.com', password: 'customer123' },
    { email: 'customer_c@example.com', password: 'customer123' },
    { email: 'customer_d@example.com', password: 'customer123' }
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await connection.execute(
      'UPDATE user SET password = ? WHERE email = ?',
      [hashedPassword, user.email]
    );
    console.log(`Updated password for ${user.email}`);
  }

  await connection.end();
  console.log('All passwords updated!');
}

updatePasswords().catch(console.error);