import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// 获取所有用户
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

// 获取单个用户
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

// 创建用户
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

// 更新用户
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

// 删除用户
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
