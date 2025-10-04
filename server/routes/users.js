const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Try to import database, fall back to mock mode
let pool = null;
try {
  const dbModule = require('../scripts/setupDatabase');
  pool = dbModule.pool;
} catch (error) {
  console.warn('Users route: Running in mock mode without database');
}

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, language = 'en', password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ 
        error: 'Name and email are required' 
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Create new user
    const userId = uuidv4();
    await pool.query(
      'INSERT INTO users (id, name, email, language, password_hash) VALUES ($1, $2, $3, $4, $5)',
      [userId, name, email, language, passwordHash]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      user: {
        id: userId,
        name,
        email,
        language
      },
      token,
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user;
    let isNewUser = false;

    if (!pool) {
      // Mock mode - create demo user
      user = {
        id: uuidv4(),
        name: name || 'Demo User',
        email: email,
        language: 'en'
      };
      isNewUser = true;
    } else {
      // Database mode
      const userResult = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        // Create new user if doesn't exist
        if (!name) {
          return res.status(400).json({ 
            error: 'Name is required for new users' 
          });
        }

        const userId = uuidv4();
        await pool.query(
          'INSERT INTO users (id, name, email, language) VALUES ($1, $2, $3, $4)',
          [userId, name, email, 'en']
        );

        user = {
          id: userId,
          name,
          email,
          language: 'en'
        };
        isNewUser = true;
      } else {
        user = userResult.rows[0];

        // Verify password if provided
        if (password && user.password_hash) {
          const isValidPassword = await bcrypt.compare(password, user.password_hash);
          if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid password' });
          }
        }
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        language: user.language
      },
      token,
      isNewUser,
      message: isNewUser ? 'User created and logged in' : 'Login successful'
    });

  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Failed to login user' });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'SELECT id, name, email, language, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, language, email } = req.body;

    const updateFields = [];
    const params = [];
    let paramCount = 0;

    if (name) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      params.push(name);
    }

    if (language) {
      paramCount++;
      updateFields.push(`language = $${paramCount}`);
      params.push(language);
    }

    if (email) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      params.push(email);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(userId);

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount}`;
    
    await pool.query(query, params);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get chat count
    const chatResult = await pool.query(
      'SELECT COUNT(*) as chat_count FROM chats WHERE user_id = $1',
      [userId]
    );

    // Get document count
    const docResult = await pool.query(
      'SELECT COUNT(*) as doc_count FROM documents WHERE user_id = $1',
      [userId]
    );

    // Get session count
    const sessionResult = await pool.query(
      'SELECT COUNT(*) as session_count FROM chat_sessions WHERE user_id = $1',
      [userId]
    );

    // Get recent activity
    const recentActivity = await pool.query(
      `SELECT 'chat' as type, timestamp as date FROM chats WHERE user_id = $1
       UNION ALL
       SELECT 'document' as type, created_at as date FROM documents WHERE user_id = $1
       ORDER BY date DESC LIMIT 10`,
      [userId]
    );

    res.json({
      success: true,
      stats: {
        totalChats: parseInt(chatResult.rows[0].chat_count),
        totalDocuments: parseInt(docResult.rows[0].doc_count),
        totalSessions: parseInt(sessionResult.rows[0].session_count),
        recentActivity: recentActivity.rows
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Protected route example
router.get('/protected', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Protected route accessed successfully',
    user: req.user
  });
});

module.exports = router;