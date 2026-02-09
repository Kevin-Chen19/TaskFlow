import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// 获取通知列表
router.get('/', async (req, res, next) => {
  try {
    const { project_id, creator_id } = req.query;
    let queryText = 'SELECT * FROM notifications';
    let params = [];

    if (project_id || creator_id) {
      queryText += ' WHERE';
      const conditions = [];
      if (project_id) {
        conditions.push(' project_id = $1');
        params.push(project_id);
      }
      if (creator_id) {
        conditions.push(` creator_id = $${params.length + 1}`);
        params.push(creator_id);
      }
      queryText += conditions.join(' AND');
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    next(error);
  }
});

// 创建通知
router.post('/', async (req, res, next) => {
  try {
    const { project_id, creator_id, description, type, assignee_ids, status } = req.body;

    if (!project_id || !creator_id || !description) {
      return res.status(400).json({
        success: false,
        message: '项目ID、创建者ID和描述为必填项'
      });
    }

    const result = await query(
      'INSERT INTO notifications (project_id, creator_id, description, type, assignee_ids, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [project_id, creator_id, description, type || '聊天', assignee_ids || [], status || []]
    );

    res.status(201).json({
      success: true,
      message: '通知创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 更新通知
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, type, assignee_ids, status } = req.body;

    const result = await query(
      'UPDATE notifications SET description = COALESCE($1, description), type = COALESCE($2, type), assignee_ids = COALESCE($3, assignee_ids), status = COALESCE($4, status) WHERE id = $5 RETURNING *',
      [description, type, assignee_ids, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '通知不存在'
      });
    }

    res.json({
      success: true,
      message: '通知更新成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 删除通知
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM notifications WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '通知不存在'
      });
    }

    res.json({ success: true, message: '通知删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
