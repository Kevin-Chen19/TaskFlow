import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: 获取笔记列表
 *     tags: [Notes]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: creator_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功返回笔记列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
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

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: 创建笔记
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - description
 *             properties:
 *               project_id:
 *                 type: integer
 *               creator_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               status:
 *                 type: boolean
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

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: 更新笔记
 *     tags: [Notes]
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
 *               description:
 *                 type: string
 *               status:
 *                 type: boolean
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

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: 删除笔记
 *     tags: [Notes]
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
