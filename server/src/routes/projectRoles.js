import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * /api/project-roles:
 *   get:
 *     summary: 获取项目角色列表
 *     tags: [Project Roles]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功返回项目角色列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
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

/**
 * @swagger
 * /api/project-roles:
 *   post:
 *     summary: 创建项目角色
 *     tags: [Project Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - rolename
 *             properties:
 *               project_id:
 *                 type: integer
 *               rolename:
 *                 type: string
 *               description:
 *                 type: string
 *               settings:
 *                 type: object
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

/**
 * @swagger
 * /api/project-roles/{id}:
 *   put:
 *     summary: 更新项目角色
 *     tags: [Project Roles]
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
 *               rolename:
 *                 type: string
 *               description:
 *                 type: string
 *               settings:
 *                 type: object
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

/**
 * @swagger
 * /api/project-roles/{id}:
 *   delete:
 *     summary: 删除项目角色
 *     tags: [Project Roles]
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
