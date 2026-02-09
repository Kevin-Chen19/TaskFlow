import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// 获取所有项目
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM projects ORDER BY created_at DESC'
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

// 获取单个项目
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM projects WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 创建项目
router.post('/', async (req, res, next) => {
  try {
    const { name, description, owner_id, assignee_ids, progress, total_hours } = req.body;

    if (!name || !owner_id) {
      return res.status(400).json({
        success: false,
        message: '项目名称和负责人为必填项'
      });
    }

    const result = await query(
      `INSERT INTO projects (name, description, owner_id, assignee_ids, progress, total_hours)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, owner_id, assignee_ids || [], progress || 0, total_hours || 0]
    );

    res.status(201).json({
      success: true,
      message: '项目创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 更新项目
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, assignee_ids, progress, total_hours } = req.body;

    const result = await query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           assignee_ids = COALESCE($3, assignee_ids),
           progress = COALESCE($4, progress),
           total_hours = COALESCE($5, total_hours),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, description, assignee_ids, progress, total_hours, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    res.json({
      success: true,
      message: '项目更新成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 删除项目
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM projects WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    res.json({ success: true, message: '项目删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
