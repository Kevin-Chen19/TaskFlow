import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// 获取笔记列表
router.get('/', async (req, res, next) => {
  try {
    const { project_id, creator_id } = req.query;
    let queryText = 'SELECT * FROM notes';
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

    queryText += ' ORDER BY id DESC';

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

// 创建笔记
router.post('/', async (req, res, next) => {
  try {
    const { project_id, creator_id, description, status } = req.body;

    if (!project_id || !description) {
      return res.status(400).json({
        success: false,
        message: '项目ID和描述为必填项'
      });
    }

    const result = await query(
      'INSERT INTO notes (project_id, creator_id, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [project_id, creator_id, description, status || false]
    );

    res.status(201).json({
      success: true,
      message: '笔记创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 更新笔记
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, status } = req.body;

    const result = await query(
      'UPDATE notes SET description = COALESCE($1, description), status = COALESCE($2, status) WHERE id = $3 RETURNING *',
      [description, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '笔记不存在'
      });
    }

    res.json({
      success: true,
      message: '笔记更新成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 删除笔记
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM notes WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '笔记不存在'
      });
    }

    res.json({ success: true, message: '笔记删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
