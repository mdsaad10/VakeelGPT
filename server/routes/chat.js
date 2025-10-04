const express = require('express');
const gradientAI = require('../services/gradientAI');
const { v4: uuidv4 } = require('uuid');

// Try to import database, fall back to mock mode
let pool = null;
try {
  const dbModule = require('../scripts/setupDatabase');
  pool = dbModule.pool;
} catch (error) {
  console.warn('Chat route: Running in mock mode without database');
}

const router = express.Router();

// In-memory storage for mock mode
const mockData = {
  chats: [],
  sessions: []
};

// Get chat history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT c.*, cs.title as session_title 
       FROM chats c 
       LEFT JOIN chat_sessions cs ON c.session_id = cs.id 
       WHERE c.user_id = $1 
       ORDER BY c.timestamp DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      success: true,
      chats: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Get chat sessions for a user
router.get('/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT cs.*, COUNT(c.id) as message_count
       FROM chat_sessions cs
       LEFT JOIN chats c ON cs.id = c.session_id
       WHERE cs.user_id = $1
       GROUP BY cs.id
       ORDER BY cs.updated_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      sessions: result.rows
    });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// Create new chat session
router.post('/sessions', async (req, res) => {
  try {
    const { userId, title } = req.body;
    const sessionId = uuidv4();

    await pool.query(
      'INSERT INTO chat_sessions (id, user_id, title) VALUES ($1, $2, $3)',
      [sessionId, userId, title || 'New Conversation']
    );

    res.json({
      success: true,
      sessionId,
      message: 'Chat session created successfully'
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Main chat endpoint
router.post('/', async (req, res) => {
  try {
    const { 
      message, 
      userId, 
      language = 'en', 
      messageType = 'general',
      sessionId 
    } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ 
        error: 'Message and userId are required' 
      });
    }

    let userHistory = [];

    if (pool) {
      // Database mode - get user's recent chat history for context
      const historyResult = await pool.query(
        'SELECT message, response FROM chats WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 5',
        [userId]
      );
      userHistory = historyResult.rows;
    } else {
      // Mock mode - get from memory
      userHistory = mockData.chats
        .filter(chat => chat.user_id === userId)
        .slice(-5)
        .map(chat => ({ message: chat.message, response: chat.response }));
    }

    // Generate AI response
    const aiResponse = await gradientAI.generateResponse(message, {
      language,
      messageType,
      userHistory
    });

    // Determine or create session ID
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = uuidv4();
      
      if (pool) {
        await pool.query(
          'INSERT INTO chat_sessions (id, user_id, title) VALUES ($1, $2, $3)',
          [currentSessionId, userId, message.substring(0, 50) + '...']
        );
      } else {
        // Mock mode
        mockData.sessions.push({
          id: currentSessionId,
          user_id: userId,
          title: message.substring(0, 50) + '...',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    // Store chat
    const chatId = uuidv4();
    const chatData = {
      id: chatId,
      user_id: userId,
      message,
      response: aiResponse,
      language,
      message_type: messageType,
      session_id: currentSessionId,
      timestamp: new Date().toISOString()
    };

    if (pool) {
      await pool.query(
        `INSERT INTO chats (id, user_id, message, response, language, message_type, session_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [chatId, userId, message, aiResponse, language, messageType, currentSessionId]
      );

      // Update session timestamp
      await pool.query(
        'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [currentSessionId]
      );
    } else {
      // Mock mode
      mockData.chats.push(chatData);
      
      // Update session timestamp
      const session = mockData.sessions.find(s => s.id === currentSessionId);
      if (session) {
        session.updated_at = new Date().toISOString();
      }
    }

    res.json({
      success: true,
      response: aiResponse,
      chatId,
      sessionId: currentSessionId,
      language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete chat session
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    await pool.query('DELETE FROM chats WHERE session_id = $1', [sessionId]);
    await pool.query('DELETE FROM chat_sessions WHERE id = $1', [sessionId]);

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

// Get specific chat by ID
router.get('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    const result = await pool.query(
      'SELECT * FROM chats WHERE id = $1',
      [chatId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({
      success: true,
      chat: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

module.exports = router;