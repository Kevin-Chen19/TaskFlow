import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// 获取项目角色列表
router.get('/', async (req, res, next) => {
  try {
    const { project_id } = req.query;
    let queryText = 'SELECT * FROM project_roles';
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

// 创建项目角色
router.post('/', async (req, res, next) => {
  try {
    const { project_id, rolename, description, settings } = req.body;

    if (!project_id || !rolename) {
      return res.status(400).json({
        success: false,
        message: '项目ID和角色名称为必填项'
      });
    }

    const result = await query(
      'INSERT INTO project_roles (project_id, rolename, description, settings) VALUES ($1, $2, $3, $4) RETURNING *',
      [project_id, rolename, description, settings || {}]
    );

    res.status(201).json({
      success: true,
      message: '项目角色创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 更新项目角色
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rolename, description, settings } = req.body;

    const result = await query(
      'UPDATE project_roles SET rolename = COALESCE($1, rolename), description = COALESCE($2, description), settings = COALESCE($3, settings) WHERE id = $4 RETURNING *',
      [rolename, description, settings, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目角色不存在'
      });
    }

    res.json({
      success: true,
      message: '项目角色更新成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 删除项目角色
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM project_roles WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目角色不存在'
      });
    }

    res.json({ success: true, message: '项目角色删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
