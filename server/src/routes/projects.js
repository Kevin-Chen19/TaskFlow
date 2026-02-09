import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: 获取所有项目
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: 成功返回项目列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *                     count:
 *                       type: integer
 */
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

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: 获取单个项目
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 项目ID
 *     responses:
 *       200:
 *         description: 成功返回项目信息
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Project'
 *       404:
 *         description: 项目不存在
 */
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

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: 创建项目
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - owner_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "新项目"
 *               description:
 *                 type: string
 *                 example: "项目描述"
 *               owner_id:
 *                 type: integer
 *                 example: 1
 *               assignee_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               progress:
 *                 type: integer
 *                 example: 0
 *               total_hours:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Project'
 *       400:
 *         description: 请求参数错误
 */
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

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: 更新项目
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 项目ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "更新后的项目名称"
 *               description:
 *                 type: string
 *                 example: "更新后的描述"
 *               assignee_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               progress:
 *                 type: integer
 *                 example: 50
 *               total_hours:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Project'
 *       404:
 *         description: 项目不存在
 */
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

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: 删除项目
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 项目ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 项目不存在
 */
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
