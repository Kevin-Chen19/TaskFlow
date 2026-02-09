import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * /api/project-folders:
 *   get:
 *     summary: 获取项目文件夹列表
 *     tags: [Project Folders]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: parent_folder_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功返回项目文件夹列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', async (req, res, next) => {
  try {
    const { project_id, parent_folder_id } = req.query;
    let queryText = 'SELECT * FROM project_folders WHERE deleted_at IS NULL';
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

/**
 * @swagger
 * /api/project-folders:
 *   post:
 *     summary: 创建文件夹
 *     tags: [Project Folders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - name
 *             properties:
 *               project_id:
 *                 type: integer
 *               parent_folder_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               creator_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', async (req, res, next) => {
  try {
    const { project_id, parent_folder_id, name, creator_id } = req.body;

    if (!project_id || !name) {
      return res.status(400).json({
        success: false,
        message: '项目ID和文件夹名称为必填项'
      });
    }

    const result = await query(
      'INSERT INTO project_folders (project_id, parent_folder_id, name, creator_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [project_id, parent_folder_id || null, name, creator_id]
    );

    res.status(201).json({
      success: true,
      message: '文件夹创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-folders/{id}:
 *   put:
 *     summary: 更新文件夹
 *     tags: [Project Folders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const result = await query(
      'UPDATE project_folders SET name = COALESCE($1, name) WHERE id = $2 AND deleted_at IS NULL RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文件夹不存在'
      });
    }

    res.json({
      success: true,
      message: '文件夹更新成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-folders/{id}:
 *   delete:
 *     summary: 软删除文件夹
 *     tags: [Project Folders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE project_folders SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文件夹不存在或已被删除'
      });
    }

    res.json({ success: true, message: '文件夹删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
