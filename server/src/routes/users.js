import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 获取所有用户
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 成功返回用户列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     count:
 *                       type: integer
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, phone, fullname, email, avatar_url, skills, mooto FROM users ORDER BY id DESC'
    );
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: 获取单个用户
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
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
 *       404:
 *         description: 用户不存在
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id, phone, fullname, email, avatar_url, skills, mooto FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
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
 * /api/users:
 *   post:
 *     summary: 创建用户
 *     tags: [Users]
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
 *         description: 创建成功
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
 *         description: 请求参数错误或用户已存在
 */
router.post('/', async (req, res, next) => {
  try {
    const { phone, fullname, email, password, avatar_url, skills, mooto } = req.body;

    // 验证必填字段
    if (!phone || !fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '手机号、姓名、邮箱和密码为必填项'
      });
    }

    // 检查手机号是否已存在
    const existingPhone = await query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existingPhone.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该手机号已被注册'
      });
    }

    // 检查邮箱是否已存在
    const existingEmail = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    const result = await query(
      'INSERT INTO users (phone, fullname, email, password, avatar_url, skills, mooto) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, phone, fullname, email, avatar_url, skills, mooto',
      [phone, fullname, email, password, avatar_url, skills, mooto || 'I am a mooto']
    );

    res.status(201).json({
      success: true,
      message: '用户创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: 更新用户
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: 用户不存在
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { phone, fullname, email, avatar_url, skills, mooto } = req.body;

    const result = await query(
      'UPDATE users SET phone = COALESCE($1, phone), fullname = COALESCE($2, fullname), email = COALESCE($3, email), avatar_url = COALESCE($4, avatar_url), skills = COALESCE($5, skills), mooto = COALESCE($6, mooto) WHERE id = $7 RETURNING id, phone, fullname, email, avatar_url, skills, mooto',
      [phone, fullname, email, avatar_url, skills, mooto, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '用户更新成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: 删除用户
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 用户不存在
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
