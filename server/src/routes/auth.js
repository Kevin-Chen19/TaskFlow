import express from 'express';
import { query } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';
import { generateToken, authenticateToken } from '../utils/jwtUtils.js';

const router = express.Router();

/**
 * User registration
 * POST /api/auth/register
 */
router.post('/register', async (req, res, next) => {
  try {
    const { phone, fullname, email, password, avatar_url, skills, mooto } = req.body;

    // Validate required fields
    if (!phone || !fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone, fullname, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if phone already exists
    const existingPhone = await query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existingPhone.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    // Check if email already exists
    const existingEmail = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user
    const result = await query(
      'INSERT INTO users (phone, fullname, email, password, avatar_url, skills, mooto) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, phone, fullname, email, avatar_url, skills, mooto',
      [phone, fullname, email, hashedPassword, avatar_url, skills, mooto || 'I am a mooto']
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * User login
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { phone, email, password } = req.body;

    // Validate required fields
    if (!password || (!phone && !email)) {
      return res.status(400).json({
        success: false,
        message: 'Password and either phone or email are required'
      });
    }

    // Find user by phone or email
    let queryText = 'SELECT * FROM users WHERE ';
    let queryParams = [];

    if (phone) {
      queryText += 'phone = $1';
      queryParams.push(phone);
    } else {
      queryText += 'email = $1';
      queryParams.push(email);
    }

    const result = await query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const token = generateToken(userWithoutPassword);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        ...userWithoutPassword,
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get current user info
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      'SELECT id, phone, fullname, email, avatar_url, skills, mooto FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Change password
 * POST /api/auth/change-password
 */
router.post('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    // Validate required fields
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password length
    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const userId = req.user.userId;

    // Get user
    const result = await query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await comparePassword(current_password, result.rows[0].password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(new_password);

    // Update password
    await query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
