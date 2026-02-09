import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// 获取项目文档列表
router.get('/', async (req, res, next) => {
  try {
    const { project_id, parent_folder_id } = req.query;
    let queryText = 'SELECT * FROM project_documents WHERE deleted_at IS NULL';
    let params = [];

    if (project_id) {
      queryText += ' AND project_id = $1';
      params.push(project_id);
    }

    if (parent_folder_id !== undefined) {
      queryText += ` AND parent_folder_id ${parent_folder_id ? '= $2' : 'IS NULL'}`;
      if (parent_folder_id) params.push(parent_folder_id);
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

// 创建文档
router.post('/', async (req, res, next) => {
  try {
    const { project_id, parent_folder_id, name, creator_id } = req.body;

    if (!project_id || !name) {
      return res.status(400).json({
        success: false,
        message: '项目ID和文档名称为必填项'
      });
    }

    const result = await query(
      'INSERT INTO project_documents (project_id, parent_folder_id, name, creator_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [project_id, parent_folder_id || null, name, creator_id]
    );

    res.status(201).json({
      success: true,
      message: '文档创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 更新文档
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const result = await query(
      'UPDATE project_documents SET name = COALESCE($1, name) WHERE id = $2 AND deleted_at IS NULL RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文档不存在'
      });
    }

    res.json({
      success: true,
      message: '文档更新成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 软删除文档
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE project_documents SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文档不存在或已被删除'
      });
    }

    res.json({ success: true, message: '文档删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
