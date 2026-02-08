import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// 获取所有用户
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, username, email, avatar, created_at FROM users ORDER BY created_at DESC'
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
      'SELECT id, username, email, avatar, created_at FROM users WHERE id = $1',
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
    const { username, email, password } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码为必填项'
      });
    }

    // 检查邮箱是否已存在
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    const result = await query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, avatar, created_at',
      [username, email, password] // 注意：实际项目中应该对密码进行哈希加密
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
    const { username, email, avatar } = req.body;

    const result = await query(
      'UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), avatar = COALESCE($3, avatar) WHERE id = $4 RETURNING id, username, email, avatar, updated_at',
      [username, email, avatar, id]
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
