import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * /api/milestones:
 *   get:
 *     summary: 获取项目里程碑列表
 *     tags: [Milestones]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 项目ID
 *     responses:
 *       200:
 *         description: 成功返回里程碑列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       project_id:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       due_date:
 *                         type: string
 *                         format: date
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 count:
 *                   type: integer
 */
router.get('/', async (req, res, next) => {
  try {
    const { project_id } = req.query;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: '项目ID为必填项'
      });
    }

    const result = await query(
      'SELECT * FROM milestones WHERE project_id = $1 ORDER BY due_date ASC',
      [project_id]
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
 * /api/milestones:
 *   post:
 *     summary: 创建里程碑
 *     tags: [Milestones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - content
 *               - due_date
 *             properties:
 *               project_id:
 *                 type: integer
 *                 description: 项目ID
 *               content:
 *                 type: string
 *                 description: 里程碑内容
 *               due_date:
 *                 type: string
 *                 format: date
 *                 description: 截止日期
 *     responses:
 *       201:
 *         description: 创建成功
 */
router.post('/', async (req, res, next) => {
  try {
    const { project_id, content, due_date } = req.body;

    if (!project_id || !content || !due_date) {
      return res.status(400).json({
        success: false,
        message: '项目ID、内容和截止日期为必填项'
      });
    }

    const result = await query(
      'INSERT INTO milestones (project_id, content, due_date) VALUES ($1, $2, $3) RETURNING *',
      [project_id, content, due_date]
    );

    res.status(201).json({
      success: true,
      message: '里程碑创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/milestones/{id}:
 *   put:
 *     summary: 更新里程碑
 *     tags: [Milestones]
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
 *               content:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, due_date } = req.body;

    const result = await query(
      'UPDATE milestones SET content = COALESCE($1, content), due_date = COALESCE($2, due_date) WHERE id = $3 RETURNING *',
      [content, due_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '里程碑不存在'
      });
    }

    res.json({
      success: true,
      message: '里程碑更新成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/milestones/{id}:
 *   delete:
 *     summary: 删除里程碑
 *     tags: [Milestones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM milestones WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '里程碑不存在'
      });
    }

    res.json({ success: true, message: '里程碑删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
