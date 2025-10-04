const express = require('express');
const { pool } = require('../scripts/setupDatabase');
const gradientAI = require('../services/gradientAI');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all documents for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, status, limit = 20, offset = 0 } = req.query;

    let query = 'SELECT * FROM documents WHERE user_id = $1';
    let params = [userId];
    let paramCount = 1;

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      documents: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Create/Draft new document
router.post('/draft', async (req, res) => {
  try {
    const { 
      userId, 
      title, 
      type, 
      description, 
      language = 'en',
      customFields = {} 
    } = req.body;

    if (!userId || !title || !type) {
      return res.status(400).json({ 
        error: 'userId, title, and type are required' 
      });
    }

    // Generate document template using AI
    let documentContent;
    
    if (description) {
      // Use AI to generate custom document based on description
      const prompt = `Generate a ${type} document template based on this description: ${description}`;
      documentContent = await gradientAI.generateResponse(prompt, {
        language,
        messageType: 'document_draft'
      });
    } else {
      // Use predefined template
      documentContent = await gradientAI.generateDocumentTemplate(type, language, customFields);
    }

    // Store document in database
    const documentId = uuidv4();
    await pool.query(
      `INSERT INTO documents (id, user_id, title, type, content, language, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'draft')`,
      [documentId, userId, title, type, documentContent, language]
    );

    res.json({
      success: true,
      documentId,
      content: documentContent,
      message: 'Document drafted successfully'
    });

  } catch (error) {
    console.error('Document drafting error:', error);
    res.status(500).json({ 
      error: 'Failed to draft document',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get specific document
router.get('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    const result = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [documentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      success: true,
      document: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Update document
router.put('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { title, content, status, type } = req.body;

    const updateFields = [];
    const params = [];
    let paramCount = 0;

    if (title) {
      paramCount++;
      updateFields.push(`title = $${paramCount}`);
      params.push(title);
    }

    if (content) {
      paramCount++;
      updateFields.push(`content = $${paramCount}`);
      params.push(content);
    }

    if (status) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      params.push(status);
    }

    if (type) {
      paramCount++;
      updateFields.push(`type = $${paramCount}`);
      params.push(type);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(documentId);

    const query = `UPDATE documents SET ${updateFields.join(', ')} WHERE id = $${paramCount}`;
    
    await pool.query(query, params);

    res.json({
      success: true,
      message: 'Document updated successfully'
    });

  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Review document with AI
router.post('/:documentId/review', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { language = 'en' } = req.body;

    // Get document content
    const docResult = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [documentId]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = docResult.rows[0];

    // Generate AI review
    const reviewPrompt = `Please review this ${document.type} document and provide feedback on:
1. Legal compliance with Indian law
2. Completeness of clauses
3. Potential improvements
4. Missing elements

Document content:
${document.content}`;

    const reviewResponse = await gradientAI.generateResponse(reviewPrompt, {
      language,
      messageType: 'document_review'
    });

    res.json({
      success: true,
      review: reviewResponse,
      documentId,
      reviewedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Document review error:', error);
    res.status(500).json({ error: 'Failed to review document' });
  }
});

// Delete document
router.delete('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    await pool.query('DELETE FROM documents WHERE id = $1', [documentId]);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Get document types
router.get('/types/available', (req, res) => {
  const documentTypes = [
    { id: 'rent_agreement', name: 'Rent Agreement', category: 'property' },
    { id: 'nda', name: 'Non-Disclosure Agreement', category: 'business' },
    { id: 'employment_contract', name: 'Employment Contract', category: 'employment' },
    { id: 'loan_agreement', name: 'Loan Agreement', category: 'finance' },
    { id: 'partnership_deed', name: 'Partnership Deed', category: 'business' },
    { id: 'sale_deed', name: 'Sale Deed', category: 'property' },
    { id: 'power_of_attorney', name: 'Power of Attorney', category: 'legal' },
    { id: 'affidavit', name: 'Affidavit', category: 'legal' },
    { id: 'will', name: 'Will/Testament', category: 'legal' },
    { id: 'divorce_petition', name: 'Divorce Petition', category: 'family' }
  ];

  res.json({
    success: true,
    documentTypes
  });
});

module.exports = router;