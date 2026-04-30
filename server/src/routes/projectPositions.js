import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../utils/jwtUtils.js';
import { checkManagePositionsPermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// 记录活动日志的辅助函数
const logActivity = async (project_id, user_id, title, description) => {
  try {
    await query(
      `INSERT INTO activity_logs (project_id, user_id, category, title, description)
       VALUES ($1, $2, 'position', $3, $4)`,
      [project_id, user_id, title, description]
    );
  } catch (error) {
    console.error('记录活动日志失败:', error);
  }
};

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
router.post('/', authenticateToken, checkManagePositionsPermission, async (req, res, next) => {
  try {
    const { project_id, positionname, description } = req.body;
    const user_id = req.user.userId;

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

    // 记录活动日志
    await logActivity(
      project_id,
      user_id,
      '新增职位',
      `新增了职位："${positionname}"`
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
router.put('/:id', authenticateToken, checkManagePositionsPermission, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { positionname, description } = req.body;
    const user_id = req.user.userId;

    // 先获取原职位信息用于日志记录
    const oldResult = await query(
      'SELECT * FROM project_positions WHERE id = $1',
      [id]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目职位不存在'
      });
    }

    const oldPosition = oldResult.rows[0];

    const result = await query(
      'UPDATE project_positions SET positionname = COALESCE($1, positionname), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
      [positionname, description, id]
    );

    // 记录活动日志
    const newName = positionname || oldPosition.positionname;
    if (positionname && positionname !== oldPosition.positionname) {
      await logActivity(
        oldPosition.project_id,
        user_id,
        '更新职位',
        `将职位从"${oldPosition.positionname}"更名为"${positionname}"`
      );
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
router.delete('/:id', authenticateToken, checkManagePositionsPermission, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    // 先获取职位信息用于日志记录
    const oldResult = await query(
      'SELECT * FROM project_positions WHERE id = $1',
      [id]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目职位不存在'
      });
    }

    const oldPosition = oldResult.rows[0];

    const result = await query('DELETE FROM project_positions WHERE id = $1 RETURNING id', [id]);

    // 记录活动日志
    await logActivity(
      oldPosition.project_id,
      user_id,
      '删除职位',
      `删除了职位："${oldPosition.positionname}"`
    );

    res.json({ success: true, message: '项目职位删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
