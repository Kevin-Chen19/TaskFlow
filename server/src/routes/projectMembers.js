import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * /api/project-members/project/{projectId}:
 *   get:
 *     summary: 获取项目的所有成员
 *     tags: [Project Members]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功返回项目成员列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const result = await query(
      'SELECT pm.*, u.fullname, u.email, u.avatar_url FROM project_members pm LEFT JOIN users u ON pm.user_id = u.id WHERE pm.project_id = $1 ORDER BY pm.id',
      [projectId]
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
 * /api/project-members:
 *   post:
 *     summary: 添加项目成员
 *     tags: [Project Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - user_id
 *             properties:
 *               project_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               role:
 *                 type: string
 *                 example: "member"
 *               position:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: 添加成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', async (req, res, next) => {
  try {
    const { project_id, user_id, role, position, is_active } = req.body;

    if (!project_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: '项目ID和用户ID为必填项'
      });
    }

    const result = await query(
      'INSERT INTO project_members (project_id, user_id, role, position, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [project_id, user_id, role || 'member', position, is_active || false]
    );

    res.status(201).json({
      success: true,
      message: '项目成员添加成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-members/{id}:
 *   put:
 *     summary: 更新项目成员
 *     tags: [Project Members]
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
 *               role:
 *                 type: string
 *               position:
 *                 type: string
 *               is_active:
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
    const { role, position, is_active } = req.body;

    const result = await query(
      'UPDATE project_members SET role = COALESCE($1, role), position = COALESCE($2, position), is_active = COALESCE($3, is_active) WHERE id = $4 RETURNING *',
      [role, position, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目成员不存在'
      });
    }

    res.json({
      success: true,
      message: '项目成员更新成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-members/{id}:
 *   delete:
 *     summary: 删除项目成员
 *     tags: [Project Members]
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
    const result = await query('DELETE FROM project_members WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目成员不存在'
      });
    }

    res.json({ success: true, message: '项目成员删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
