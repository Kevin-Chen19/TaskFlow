import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// 获取所有团队
router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM teams ORDER BY created_at DESC');
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    next(error);
  }
});

// 获取单个团队
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM teams WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '团队不存在'
      });
    }

    // 获取团队成员
    const membersResult = await query(
      'SELECT user_id, role FROM team_members WHERE team_id = $1',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        members: membersResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

// 创建团队
router.post('/', async (req, res, next) => {
  try {
    const { name, description, owner_id } = req.body;

    if (!name || !owner_id) {
      return res.status(400).json({
        success: false,
        message: '团队名称和负责人为必填项'
      });
    }

    const result = await query(
      'INSERT INTO teams (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, owner_id]
    );

    // 将创建者添加为团队管理员
    await query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [result.rows[0].id, owner_id, 'admin']
    );

    res.status(201).json({
      success: true,
      message: '团队创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 添加团队成员
router.post('/:id/members', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id, role } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: '用户ID为必填项'
      });
    }

    const result = await query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [id, user_id, role || 'member']
    );

    res.status(201).json({
      success: true,
      message: '成员添加成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 移除团队成员
router.delete('/:id/members/:userId', async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const result = await query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '团队成员不存在'
      });
    }

    res.json({ success: true, message: '成员移除成功' });
  } catch (error) {
    next(error);
  }
});

// 删除团队
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM teams WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '团队不存在'
      });
    }

    res.json({ success: true, message: '团队删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
