import express from 'express';
import { query } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';
import { generateToken, authenticateToken } from '../utils/jwtUtils.js';
import { sendVerificationCode, generateCode } from '../utils/smsService.js';
import { setCode, verifyCode } from '../utils/verifyCodeStore.js';

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

    // 如果 avatar_url 存在且是相对路径，拼接完整 URL
    const userData = result.rows[0];
    if (userData.avatar_url && !userData.avatar_url.startsWith('http')) {
      userData.avatar_url = `${req.protocol}://${req.get('host')}${userData.avatar_url}`;
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userData
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

    // 如果 avatar_url 存在且是相对路径，拼接完整 URL
    if (userWithoutPassword.avatar_url && !userWithoutPassword.avatar_url.startsWith('http')) {
      userWithoutPassword.avatar_url = `${req.protocol}://${req.get('host')}${userWithoutPassword.avatar_url}`;
    }

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

    // 如果 avatar_url 存在且是相对路径，拼接完整 URL
    const userData = result.rows[0];
    if (userData.avatar_url && !userData.avatar_url.startsWith('http')) {
      userData.avatar_url = `${req.protocol}://${req.get('host')}${userData.avatar_url}`;
    }

    res.json({
      success: true,
      data: userData
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
      message: '密码修改成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/send-code:
 *   post:
 *     summary: 发送短信验证码
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - type
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "13800138001"
 *               type:
 *                 type: string
 *                 enum: [login, register, reset]
 *                 example: "login"
 *     responses:
 *       200:
 *         description: 发送成功
 *       400:
 *         description: 参数错误
 *       429:
 *         description: 发送过于频繁
 */
router.post('/send-code', async (req, res, next) => {
  try {
    const { phone, type } = req.body;
    console.log('[send-code] Request received:', { phone, type });

    // 验证参数
    if (!phone || !type) {
      console.log('[send-code] Missing parameters');
      return res.status(400).json({
        success: false,
        message: '手机号和类型是必填项'
      });
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      console.log('[send-code] Invalid phone format:', phone);
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    // 验证类型
    if (!['login', 'register', 'reset'].includes(type)) {
      console.log('[send-code] Invalid type:', type);
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be login, register, or reset'
      });
    }

    // 检查手机号是否已注册（注册时需要未注册，登录时需要已注册）
    console.log('[send-code] Checking user existence...');
    const existingUser = await query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );
    console.log('[send-code] User exists:', existingUser.rows.length > 0);

    if (type === 'register' && existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: '手机号已注册'
      });
    }

    if ((type === 'login' || type === 'reset') && existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '手机号未注册'
      });
    }

    // 生成验证码
    console.log('[send-code] Generating code...');
    const code = generateCode();
    console.log('[send-code] Code generated:', code);

    // 存储验证码
    console.log('[send-code] Storing code...');
    setCode(phone, code, type);
    console.log('[send-code] Code stored');

    // 发送验证码（如果配置了阿里云，否则直接返回验证码用于测试）
    if (process.env.ALIBABA_CLOUD_ACCESS_KEY_ID) {
      console.log('[send-code] Sending SMS...');
      const smsResult = await sendVerificationCode(phone, code);
      if (!smsResult.success) {
        console.error('[send-code] SMS failed:', smsResult.message);
        return res.status(500).json({
          success: false,
          message: smsResult.message
        });
      }
    } else {
      // 测试环境，直接返回验证码
      console.log(`[TEST] Verification code for ${phone}: ${code}`);
    }

    res.json({
      success: true,
      message: '验证码发送成功',
      // 测试环境下返回验证码
      ...(process.env.NODE_ENV === 'development' && !process.env.ALIBABA_CLOUD_ACCESS_KEY_ID && { code })
    });
  } catch (error) {
    console.error('[send-code] Error:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login-with-code:
 *   post:
 *     summary: 验证码登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "13800138001"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 登录成功
 *       400:
 *         description: 参数错误或验证码无效
 */
router.post('/login-with-code', async (req, res, next) => {
  try {
    const { phone, code } = req.body;

    // 验证参数
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: '手机号和验证码是必填项'
      });
    }

    // 验证验证码
    if (!verifyCode(phone, code, 'login')) {
      return res.status(400).json({
        success: false,
        message: '验证码错误或已过期'
      });
    }

    // 查找用户
    const result = await query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const user = result.rows[0];

    // 移除密码
    const { password: _, ...userWithoutPassword } = user;

    // 如果 avatar_url 存在且是相对路径，拼接完整 URL
    if (userWithoutPassword.avatar_url && !userWithoutPassword.avatar_url.startsWith('http')) {
      userWithoutPassword.avatar_url = `${req.protocol}://${req.get('host')}${userWithoutPassword.avatar_url}`;
    }

    // 生成 JWT token
    const token = generateToken(userWithoutPassword);

    res.json({
      success: true,
      message: '登录成功',
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
 * /api/auth/register-with-code:
 *   post:
 *     summary: 验证码注册
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *               - fullname
 *               - email
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "13800138001"
 *               code:
 *                 type: string
 *                 example: "123456"
 *               fullname:
 *                 type: string
 *                 example: "张三"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: 注册成功
 *       400:
 *         description: 参数错误或验证码无效
 */
router.post('/register-with-code', async (req, res, next) => {
  try {
    const { phone, code, fullname, email, password } = req.body;

    // 验证参数
    if (!phone || !code || !fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '所有字段都是必填项'
      });
    }

    // 验证验证码
    if (!verifyCode(phone, code, 'register')) {
      return res.status(400).json({
        success: false,
        message: '验证码错误或已过期'
      });
    }

    // 检查手机号是否已注册
    const existingPhone = await query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existingPhone.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: '手机号已注册'
      });
    }

    // 检查邮箱是否已注册
    const existingEmail = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: '邮箱已注册'
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '邮箱格式不正确'
      });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码必须至少6个字符'
      });
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 插入用户
    const result = await query(
      'INSERT INTO users (phone, fullname, email, password, mooto) VALUES ($1, $2, $3, $4, $5) RETURNING id, phone, fullname, email, avatar_url, skills, mooto',
      [phone, fullname, email, hashedPassword, 'I am a mooto']
    );

    const userData = result.rows[0];

    res.status(201).json({
      success: true,
      message: '用户注册成功',
      data: userData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: 重置密码（通过验证码）
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *               - newPassword
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "13800138001"
 *               code:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: 密码重置成功
 *       400:
 *         description: 参数错误或验证码无效
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const { phone, code, newPassword } = req.body;

    // 验证参数
    if (!phone || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '手机号、验证码和新密码是必填项'
      });
    }

    // 验证密码长度
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码必须至少6个字符'
      });
    }

    // 验证验证码
    if (!verifyCode(phone, code, 'reset')) {
      return res.status(400).json({
        success: false,
        message: '验证码错误或已过期'
      });
    }

    // 查找用户
    const userResult = await query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 加密新密码
    const hashedPassword = await hashPassword(newPassword);

    // 更新密码
    await query(
      'UPDATE users SET password = $1 WHERE phone = $2',
      [hashedPassword, phone]
    );

    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
