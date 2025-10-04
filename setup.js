#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 VakeelGPT v2.0 Setup Script')
console.log('==============================\n')

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

const runCommand = (command, description) => {
  try {
    log(`🔄 ${description}...`, 'blue')
    execSync(command, { stdio: 'inherit' })
    log(`✅ ${description} completed`, 'green')
    return true
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red')
    return false
  }
}

// Check if .env file exists
const checkEnvironment = () => {
  const envPath = path.join(process.cwd(), '.env')
  const envExamplePath = path.join(process.cwd(), '.env.example')
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      log('📋 Creating .env file from .env.example...', 'yellow')
      fs.copyFileSync(envExamplePath, envPath)
      log('⚠️  Please update .env file with your actual configuration', 'yellow')
      log('   - Database URL (DigitalOcean Managed DB)', 'yellow')
      log('   - Gradient AI API Key', 'yellow')
      log('   - JWT Secret', 'yellow')
      return false
    } else {
      log('❌ No .env.example file found', 'red')
      return false
    }
  }
  return true
}

// Main setup function
const setup = async () => {
  try {
    log('Starting VakeelGPT setup...', 'blue')
    
    // Step 1: Check Node.js version
    log('\n📋 Checking Node.js version...', 'blue')
    const nodeVersion = process.version
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
    
    if (majorVersion < 18) {
      log(`❌ Node.js ${nodeVersion} detected. VakeelGPT requires Node.js 18+`, 'red')
      log('Please upgrade Node.js: https://nodejs.org/', 'yellow')
      process.exit(1)
    }
    log(`✅ Node.js ${nodeVersion} is compatible`, 'green')
    
    // Step 2: Install dependencies
    log('\n📦 Installing dependencies...', 'blue')
    if (!runCommand('npm install', 'Installing npm packages')) {
      log('❌ Failed to install dependencies', 'red')
      process.exit(1)
    }
    
    // Step 3: Check environment
    log('\n🔧 Setting up environment...', 'blue')
    const envReady = checkEnvironment()
    
    if (!envReady) {
      log('\n⚠️  Environment setup required:', 'yellow')
      log('1. Update .env file with your configuration', 'yellow')
      log('2. Set up DigitalOcean Managed PostgreSQL database', 'yellow')
      log('3. Get Gradient AI API key from DigitalOcean', 'yellow')
      log('4. Run "npm run setup-db" after database configuration', 'yellow')
      log('\n📖 See README.md for detailed setup instructions', 'blue')
      return
    }
    
    // Step 4: Setup database (if env is ready)
    log('\n🗄️  Setting up database...', 'blue')
    if (!runCommand('npm run setup-db', 'Database initialization')) {
      log('⚠️  Database setup failed. Please check your database configuration', 'yellow')
      log('Make sure your DATABASE_URL in .env is correct', 'yellow')
    }
    
    // Step 5: Build project
    log('\n🔨 Building project...', 'blue')
    if (!runCommand('npm run build', 'Building production assets')) {
      log('⚠️  Build failed, but you can still run in development mode', 'yellow')
    }
    
    // Success message
    log('\n🎉 VakeelGPT setup completed!', 'green')
    log('\n📋 Next steps:', 'blue')
    log('1. Update .env with your actual configuration (if not done)', 'blue')
    log('2. Run "npm run dev" for development', 'blue')
    log('3. Run "npm start" for production', 'blue')
    log('\n🌐 Development URLs:', 'blue')
    log('   Frontend: http://localhost:3000', 'blue')
    log('   Backend API: http://localhost:3001', 'blue')
    log('\n📖 See README.md for deployment instructions', 'blue')
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run setup
setup()