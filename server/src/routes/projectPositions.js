import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * /api/project-positions:
 *   get:
 *     summary: 获取项目职位列表
 *     tags: [Project Positions]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功返回项目职位列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
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

/**
 * @swagger
 * /api/project-positions:
 *   post:
 *     summary: 创建项目职位
 *     tags: [Project Positions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - positionname
 *             properties:
 *               project_id:
 *                 type: integer
 *               positionname:
 *                 type: string
 *               description:
 *                 type: string
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

/**
 * @swagger
 * /api/project-positions/{id}:
 *   put:
 *     summary: 更新项目职位
 *     tags: [Project Positions]
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
 *               positionname:
 *                 type: string
 *               description:
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

/**
 * @swagger
 * /api/project-positions/{id}:
 *   delete:
 *     summary: 删除项目职位
 *     tags: [Project Positions]
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
