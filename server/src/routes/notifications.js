import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: 获取通知列表
 *     tags: [Notifications]
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
 *         description: 成功返回通知列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
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

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: 创建通知
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - creator_id
 *               - description
 *             properties:
 *               project_id:
 *                 type: integer
 *               creator_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 example: "聊天"
 *               assignee_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               status:
 *                 type: array
 *                 items:
 *                   type: integer
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

/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     summary: 更新通知
 *     tags: [Notifications]
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
 *               type:
 *                 type: string
 *               assignee_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               status:
 *                 type: array
 *                 items:
 *                   type: integer
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

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: 删除通知
 *     tags: [Notifications]
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
