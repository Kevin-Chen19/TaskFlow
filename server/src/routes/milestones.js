import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../utils/jwtUtils.js';
import { checkMilestonePermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// 记录活动日志的辅助函数
const logActivity = async (project_id, user_id, title, description) => {
  try {
    await query(
      `INSERT INTO activity_logs (project_id, user_id, category, title, description)
       VALUES ($1, $2, 'milestone', $3, $4)`,
      [project_id, user_id, title, description]
    );
  } catch (error) {
    console.error('记录活动日志失败:', error);
  }
};

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
router.post('/', authenticateToken, checkMilestonePermission, async (req, res, next) => {
  try {
    const { project_id, content, due_date } = req.body;
    const user_id = req.user.userId;

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

    // 记录活动日志
    await logActivity(
      project_id,
      user_id,
      '添加里程碑',
      `添加了里程碑："${content}"`
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
router.put('/:id', authenticateToken, checkMilestonePermission, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, due_date } = req.body;
    const user_id = req.user.userId;

    // 先获取原里程碑信息用于日志记录
    const oldResult = await query(
      'SELECT * FROM milestones WHERE id = $1',
      [id]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '里程碑不存在'
      });
    }

    const oldMilestone = oldResult.rows[0];

    const result = await query(
      'UPDATE milestones SET content = COALESCE($1, content), due_date = COALESCE($2, due_date) WHERE id = $3 RETURNING *',
      [content, due_date, id]
    );

    // 记录活动日志
    await logActivity(
      oldMilestone.project_id,
      user_id,
      '更新里程碑',
      `更新了里程碑："${oldMilestone.content}"`
    );

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
router.delete('/:id', authenticateToken, checkMilestonePermission, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    // 先获取里程碑信息用于日志记录
    const oldResult = await query(
      'SELECT * FROM milestones WHERE id = $1',
      [id]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '里程碑不存在'
      });
    }

    const oldMilestone = oldResult.rows[0];

    const result = await query('DELETE FROM milestones WHERE id = $1 RETURNING id', [id]);

    // 记录活动日志
    await logActivity(
      oldMilestone.project_id,
      user_id,
      '删除里程碑',
      `删除了里程碑："${oldMilestone.content}"`
    );

    res.json({ success: true, message: '里程碑删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
