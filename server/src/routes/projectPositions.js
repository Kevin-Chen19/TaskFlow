import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// 获取项目职位列表
router.get('/', async (req, res, next) => {
  try {
    const { project_id } = req.query;
    let queryText = 'SELECT * FROM project_positions';
    let params = [];

    if (project_id) {
      queryText += ' WHERE project_id = $1';
      params.push(project_id);
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

// 创建项目职位
router.post('/', async (req, res, next) => {
  try {
    const { project_id, positionname, description } = req.body;

    if (!project_id || !positionname) {
      return res.status(400).json({
        success: false,
        message: '项目ID和职位名称为必填项'
      });
    }

    const result = await query(
      'INSERT INTO project_positions (project_id, positionname, description) VALUES ($1, $2, $3) RETURNING *',
      [project_id, positionname, description]
    );

    res.status(201).json({
      success: true,
      message: '项目职位创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 更新项目职位
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { positionname, description } = req.body;

    const result = await query(
      'UPDATE project_positions SET positionname = COALESCE($1, positionname), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
      [positionname, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目职位不存在'
      });
    }

    res.json({
      success: true,
      message: '项目职位更新成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 删除项目职位
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM project_positions WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目职位不存在'
      });
    }

    res.json({ success: true, message: '项目职位删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
