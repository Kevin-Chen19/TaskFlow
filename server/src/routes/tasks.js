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
    const { title, description, project_id, assignee_id, status, priority, due_date } = req.body;

    if (!title || !project_id) {
      return res.status(400).json({
        success: false,
        message: '任务标题和项目ID为必填项'
      });
    }

    const result = await query(
      `INSERT INTO tasks (title, description, project_id, assignee_id, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, project_id, assignee_id, status || 'todo', priority || 'medium', due_date]
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
    const { title, description, assignee_id, status, priority, due_date } = req.body;

    const result = await query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           assignee_id = COALESCE($3, assignee_id),
           status = COALESCE($4, status),
           priority = COALESCE($5, priority),
           due_date = COALESCE($6, due_date),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, description, assignee_id, status, priority, due_date, id]
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
