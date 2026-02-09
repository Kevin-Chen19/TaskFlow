import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// 获取所有任务
router.get('/', async (req, res, next) => {
  try {
    const { project_id } = req.query;
    let queryText = 'SELECT * FROM tasks';
    let params = [];

    if (project_id) {
      queryText += ' WHERE project_id = $1';
      params.push(project_id);
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

// 获取单个任务
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// 创建任务
router.post('/', async (req, res, next) => {
  try {
    const { title, description, project_id, creator_id, assignee_ids, due_date, start_date, progress, priority } = req.body;

    if (!title || !project_id || !creator_id) {
      return res.status(400).json({
        success: false,
        message: '任务标题、项目ID和创建者ID为必填项'
      });
    }

    const result = await query(
      `INSERT INTO tasks (title, description, project_id, creator_id, assignee_ids, due_date, start_date, progress, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, project_id, creator_id, assignee_ids || [], due_date, start_date, progress || 0, priority || 1]
    );

    res.status(201).json({
      success: true,
      message: '任务创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 更新任务
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, assignee_ids, due_date, start_date, progress, priority } = req.body;

    const result = await query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           assignee_ids = COALESCE($3, assignee_ids),
           due_date = COALESCE($4, due_date),
           start_date = COALESCE($5, start_date),
           progress = COALESCE($6, progress),
           priority = COALESCE($7, priority),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, description, assignee_ids, due_date, start_date, progress, priority, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }

    res.json({
      success: true,
      message: '任务更新成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 删除任务
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      });
    }

    res.json({ success: true, message: '任务删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
