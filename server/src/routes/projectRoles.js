import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../utils/jwtUtils.js';

const router = express.Router();

// 记录活动日志的辅助函数
const logActivity = async (project_id, user_id, title, description) => {
  try {
    await query(
      `INSERT INTO activity_logs (project_id, user_id, category, title, description)
       VALUES ($1, $2, 'role', $3, $4)`,
      [project_id, user_id, title, description]
    );
  } catch (error) {
    console.error('记录活动日志失败:', error);
  }
};

// 权限名称映射
const permissionNames = {
  // 项目权限
  'CreateTasks': '创建任务',
  'DeleteTasks': '删除任务',
  'EditAllTasks': '编辑所有任务',
  'EditOwnTasks': '编辑自己的任务',
  'EditProjectMilestones': '编辑项目里程碑',
  // 成员权限
  'InviteMembers': '邀请成员',
  'DeleteMembers': '删除成员',
  'ManageRoles': '管理角色',
  'ManagePositions': '管理职位',
  // 文档权限
  'CreateDocuments': '创建文档',
  'DeleteAllDocuments': '删除所有文档',
  'Chat': '聊天'
};

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
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { project_id, rolename, description, settings } = req.body;
    const user_id = req.user.userId;

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

    // 记录活动日志
    await logActivity(
      project_id,
      user_id,
      '新增权限角色',
      `新增了权限角色："${rolename}"`
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
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rolename, description, settings } = req.body;
    const user_id = req.user.userId;

    // 先获取原角色信息用于对比权限变更
    const oldResult = await query(
      'SELECT * FROM project_roles WHERE id = $1',
      [id]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目角色不存在'
      });
    }

    const oldRole = oldResult.rows[0];

    const result = await query(
      'UPDATE project_roles SET rolename = COALESCE($1, rolename), description = COALESCE($2, description), settings = COALESCE($3, settings) WHERE id = $4 RETURNING *',
      [rolename, description, settings, id]
    );

    // 如果有权限设置变更，记录详细的权限变更日志
    if (settings && oldRole.settings) {
      const oldSettings = oldRole.settings;
      const changedPermissions = [];
      
      // 对比所有权限设置
      for (const [key, newValue] of Object.entries(settings)) {
        const oldValue = oldSettings[key];
        if (oldValue !== newValue) {
          const permissionName = permissionNames[key] || key;
          if (newValue === true) {
            changedPermissions.push(`开启了"${permissionName}"权限`);
          } else if (newValue === false) {
            changedPermissions.push(`关闭了"${permissionName}"权限`);
          }
        }
      }
      
      // 记录权限变更日志
      if (changedPermissions.length > 0) {
        await logActivity(
          oldRole.project_id,
          user_id,
          '更新权限角色',
          `更新了"${oldRole.rolename}"角色：${changedPermissions.join('，')}`
        );
      }
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
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    // 先获取角色信息用于日志记录
    const oldResult = await query(
      'SELECT * FROM project_roles WHERE id = $1',
      [id]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目角色不存在'
      });
    }

    const oldRole = oldResult.rows[0];

    const result = await query('DELETE FROM project_roles WHERE id = $1 RETURNING id', [id]);

    // 记录活动日志
    await logActivity(
      oldRole.project_id,
      user_id,
      '删除权限角色',
      `删除了权限角色："${oldRole.rolename}"`
    );

    res.json({ success: true, message: '项目角色删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
