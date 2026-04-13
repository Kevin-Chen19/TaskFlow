import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * /api/project-members:
 *   get:
 *     summary: 获取项目成员列表（支持查询参数）
 *     tags: [Project Members]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 *         description: 项目ID
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 成功返回项目成员列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', async (req, res, next) => {
  try {
    const { project_id, user_id } = req.query;

    let queryText = 'SELECT pm.*, u.fullname, u.email, u.avatar_url FROM project_members pm LEFT JOIN users u ON pm.user_id = u.id WHERE 1=1';
    let params = [];
    let paramIndex = 1;

    if (project_id) {
      queryText += ` AND pm.project_id = $${paramIndex}`;
      params.push(project_id);
      paramIndex++;
    }

    if (user_id) {
      queryText += ` AND pm.user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    queryText += ' ORDER BY pm.id';

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

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

    // 首先获取项目信息，获取 owner_id
    const projectResult = await query(
      'SELECT owner_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    const ownerId = projectResult.rows[0].owner_id;

    // 获取项目成员信息
    const membersResult = await query(
      'SELECT pm.*, u.fullname, u.email, u.avatar_url FROM project_members pm LEFT JOIN users u ON pm.user_id = u.id WHERE pm.project_id = $1 ORDER BY pm.id',
      [projectId]
    );

    // 检查 owner_id 是否已经在成员列表中
    const hasOwner = membersResult.rows.some((member) => member.user_id === ownerId);

    let allMembers = [...membersResult.rows];

    // 如果 owner 不在成员列表中，添加 owner 到成员列表
    if (ownerId && !hasOwner) {
      // 获取 owner 的用户信息
      const ownerResult = await query(
        'SELECT id as user_id, fullname, email, avatar_url FROM users WHERE id = $1',
        [ownerId]
      );

      if (ownerResult.rows.length > 0) {
        const ownerMember = {
          id: 0, // 临时ID
          project_id: parseInt(projectId),
          user_id: ownerId,
          role: 'owner',
          position: '项目负责人',
          is_active: true,
          fullname: ownerResult.rows[0].fullname,
          email: ownerResult.rows[0].email,
          avatar_url: ownerResult.rows[0].avatar_url
        };
        // 将 owner 添加到列表开头
        allMembers.unshift(ownerMember);
      }
    }

    res.json({
      success: true,
      data: allMembers,
      count: allMembers.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/projects/{projectId}/invite:
 *   post:
 *     summary: 通过邮箱邀请用户加入项目
 *     tags: [Project Members]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: 被邀请用户的邮箱
 *               role:
 *                 type: string
 *                 description: 角色 (viewer, contributor, manager)
 *               position:
 *                 type: string
 *                 description: 职位
 *     responses:
 *       200:
 *         description: 邀请发送成功
 *       404:
 *         description: 用户不存在
 *       400:
 *         description: 参数错误
 */
router.post('/:projectId/invite', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { email, role, position } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '邮箱地址为必填项'
      });
    }

    // 查找用户
    const userResult = await query(
      'SELECT id, fullname, avatar_url FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该邮箱对应的用户'
      });
    }

    const invitedUser = userResult.rows[0];

    // 获取项目信息
    const projectResult = await query(
      'SELECT id, name, owner_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    const project = projectResult.rows[0];

    // 不能邀请自己
    const senderId = req.body.sender_id || null;
    if (invitedUser.id === senderId) {
      return res.status(400).json({
        success: false,
        message: '不能邀请自己'
      });
    }

    // 检查是否已经是项目成员
    const existingMember = await query(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, invitedUser.id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该用户已是项目成员'
      });
    }

    // 创建项目邀请通知
    const notificationResult = await query(
      `INSERT INTO notifications (type, title, message, sender_id, receiver_id, project_id, data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        'project_invite',
        `项目邀请：${project.name}`,
        `您被邀请加入项目"${project.name}"，担任${role || '成员'}`,
        senderId,
        invitedUser.id,
        projectId,
        JSON.stringify({ role: role || 'member', position: position || '' })
      ]
    );

    const notification = notificationResult.rows[0];

    // 通过 Socket.io 推送通知
    const io = req.app.get('io');
    const redis = req.app.get('redis');

    const socketId = await redis.get(`user_online:${invitedUser.id}`);
    console.log(`🔍 检查用户 ${invitedUser.id} 的在线状态，socketId: ${socketId}`);

    if (socketId) {
      io.to(`user:${invitedUser.id}`).emit('notification:new', {
        ...notification,
        sender_name: req.body.sender_name || '系统',
        sender_avatar: req.body.sender_avatar || null
      });
      console.log(`📢 项目邀请通知推送给用户 ${invitedUser.id}`);
    } else {
      console.log(`⚠️ 用户 ${invitedUser.id} 当前不在线，通知已存入数据库`);
    }

    res.status(201).json({
      success: true,
      message: '邀请已发送',
      data: {
        user_id: invitedUser.id,
        user_name: invitedUser.fullname,
        notification_id: notification.id
      }
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

    // 检查用户是否已经是项目成员
    const existingMember = await query(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [project_id, user_id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: '您已经是该项目的成员'
      });
    }

    const result = await query(
      'INSERT INTO project_members (project_id, user_id, role, position, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [project_id, user_id, role || 'member', position, is_active || false]
    );

    // 同时更新 projects 表的 assignee_ids 字段
    const projectResult = await query(
      'SELECT assignee_ids FROM projects WHERE id = $1',
      [project_id]
    );

    if (projectResult.rows.length > 0) {
      let assigneeIds = projectResult.rows[0].assignee_ids || [];
      // 确保是数组格式
      if (!Array.isArray(assigneeIds)) {
        assigneeIds = [];
      }
      // 添加新成员ID（如果不存在）
      if (!assigneeIds.includes(user_id)) {
        assigneeIds.push(user_id);
        await query(
          'UPDATE projects SET assignee_ids = $1 WHERE id = $2',
          [assigneeIds, project_id]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: '项目成员添加成功',
      data: result.rows[0]
    });
  } catch (error) {
    // 处理唯一约束冲突
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: '您已经是该项目的成员'
      });
    }
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

    // 先获取成员信息，用于后续更新 projects 表
    const memberResult = await query(
      'SELECT project_id, user_id FROM project_members WHERE id = $1',
      [id]
    );

    const result = await query('DELETE FROM project_members WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目成员不存在'
      });
    }

    // 同步更新 projects 表的 assignee_ids 字段
    if (memberResult.rows.length > 0) {
      const { project_id, user_id } = memberResult.rows[0];
      const projectResult = await query(
        'SELECT assignee_ids FROM projects WHERE id = $1',
        [project_id]
      );

      if (projectResult.rows.length > 0) {
        let assigneeIds = projectResult.rows[0].assignee_ids || [];
        if (Array.isArray(assigneeIds) && assigneeIds.includes(user_id)) {
          assigneeIds = assigneeIds.filter(uid => uid !== user_id);
          await query(
            'UPDATE projects SET assignee_ids = $1 WHERE id = $2',
            [assigneeIds, project_id]
          );
        }
      }
    }

    res.json({ success: true, message: '项目成员删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
