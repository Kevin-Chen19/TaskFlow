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
    const { owner_id } = req.query;
    let queryText = 'SELECT * FROM projects';
    let params = [];

    if (owner_id) {
      queryText += ' WHERE owner_id = $1 ORDER BY created_at DESC';
      params.push(owner_id);
    } else {
      queryText += ' ORDER BY created_at DESC';
    }

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
// 默认角色配置
const defaultRoles = [
  {
    rolename: '项目创建者',
    description: '拥有项目所有权限',
    settings: {
      create_tasks: true,
      delete_tasks: true,
      edit_all_tasks: true,
      edit_own_tasks: true,
      edit_timeline: true,
      invite_members: true,
      delete_members: true,
      manage_roles: true,
      manage_positions: true,
      create_documents: true,
      delete_documents: true
    }
  },
  {
    rolename: '项目经理',
    description: '可以管理项目任务与成员',
    settings: {
      create_tasks: true,
      delete_tasks: true,
      edit_all_tasks: true,
      edit_own_tasks: true,
      edit_timeline: true,
      invite_members: true,
      delete_members: true,
      manage_roles: true,
      manage_positions: true,
      create_documents: true,
      delete_documents: false
    }
  },
  {
    rolename: '参与者',
    description: '可以参与项目任务，但权限受限',
    settings: {
      create_tasks: true,
      delete_tasks: false,
      edit_all_tasks: false,
      edit_own_tasks: true,
      edit_timeline: false,
      invite_members: false,
      delete_members: false,
      manage_roles: false,
      manage_positions: false,
      create_documents: true,
      delete_documents: false
    }
  },
  {
    rolename: '观察者',
    description: '只能查看项目内容，无法参与编辑',
    settings: {
      create_tasks: false,
      delete_tasks: false,
      edit_all_tasks: false,
      edit_own_tasks: false,
      edit_timeline: false,
      invite_members: false,
      delete_members: false,
      manage_roles: false,
      manage_positions: false,
      create_documents: false,
      delete_documents: false
    }
  }
];

// 默认职位配置
const defaultPositions = [
  {
    positionname: '项目经理',
    description: '负责项目整体规划和管理'
  },
  {
    positionname: '前端开发',
    description: '负责用户界面和交互开发'
  },
  {
    positionname: '后端开发',
    description: '负责服务器端逻辑和数据库管理'
  },
  {
    positionname: 'UI/UX设计师',
    description: '负责用户界面和用户体验设计'
  },
  {
    positionname: '测试工程师',
    description: '通过测试确保软件质量'
  },
  {
    positionname: '运维工程师',
    description: '负责部署和基础设施运营'
  }
];

router.post('/', async (req, res, next) => {
  try {
    const { name, description, owner_id, assignee_ids, progress, total_hours } = req.body;

    if (!name || !owner_id) {
      return res.status(400).json({
        success: false,
        message: '项目名称和负责人为必填项'
      });
    }

    // 创建项目
    const result = await query(
      `INSERT INTO projects (name, description, owner_id, assignee_ids, progress, total_hours)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, owner_id, assignee_ids || [], progress || 0, total_hours || 0]
    );

    const projectId = result.rows[0].id;

    // 创建默认角色，并记录创建者角色的ID
    let creatorRoleId = null;
    for (const role of defaultRoles) {
      const roleResult = await query(
        `INSERT INTO project_roles (project_id, rolename, description, settings)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [projectId, role.rolename, role.description, role.settings]
      );
      // 记录"项目创建者"角色的ID
      if (role.rolename === '项目创建者') {
        creatorRoleId = roleResult.rows[0].id;
      }
    }

    // 创建默认职位
    for (const position of defaultPositions) {
      await query(
        `INSERT INTO project_positions (project_id, positionname, description)
         VALUES ($1, $2, $3)`,
        [projectId, position.positionname, position.description]
      );
    }

    // 将项目创建者添加到 project_members 表
    // 创建者默认使用"项目创建者"角色和"项目经理"职位
    await query(
      `INSERT INTO project_members (project_id, user_id, role, position, is_active)
       VALUES ($1, $2, $3, $4, $5)`,
      [projectId, owner_id, '项目创建者', '项目经理', true]
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

/**
 * @swagger
 * /api/projects/user/{userId}/joined:
 *   get:
 *     summary: 获取用户加入的项目
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 成功返回加入的项目列表
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
router.get('/user/:userId/joined', async (req, res, next) => {
  try {
    const { userId } = req.params;
    // 使用 PostgreSQL 的数组包含操作符 @= 检查 assignee_ids 是否包含 userId
    const result = await query(
      `SELECT * FROM projects
       WHERE $1 = ANY(assignee_ids) AND owner_id != $1
       ORDER BY created_at DESC`,
      [userId]
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

export default router;
