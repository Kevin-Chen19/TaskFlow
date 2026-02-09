import express from 'express';
import { query } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';
import { generateToken, authenticateToken } from '../utils/jwtUtils.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - fullname
 *               - email
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "13800138001"
 *               fullname:
 *                 type: string
 *                 example: "张三"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "password123"
 *               avatar_url:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "Node.js"]
 *               mooto:
 *                 type: string
 *                 example: "I am a mooto"
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: 请求参数错误
 *       409:
 *         description: 用户已存在
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
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "13800138001"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *       401:
 *         description: 凭证无效
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
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功返回用户信息
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授权
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
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: 修改密码
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 format: password
 *                 example: "oldpassword"
 *               new_password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: 修改成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: 旧密码错误或未授权
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
