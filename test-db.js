require('dotenv').config();
const { Pool } = require('pg');

console.log('🔄 Testing database connection...');
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('⏰ Current time:', result.rows[0].now);
    
    client.release();
    await pool.end();
    
    console.log('🎉 Database test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();