const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL.includes('digitalocean') 
    ? { rejectUnauthorized: false } 
    : false
});

const setupDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Setting up VakeelGPT database...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        language VARCHAR(10) DEFAULT 'en',
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create chats table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        language VARCHAR(10) DEFAULT 'en',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_id UUID,
        message_type VARCHAR(50) DEFAULT 'general'
      );
    `);
    
    // Create documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        language VARCHAR(10) DEFAULT 'en',
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create chat_sessions table for better organization
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_chats_timestamp ON chats(timestamp DESC);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);');
    
    console.log('✅ Database setup completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - chats');
    console.log('   - documents');
    console.log('   - chat_sessions');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('🎉 Database setup script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase, pool };