import express from "express";
import { query } from "../config/database.js";
import { authenticateToken } from "../utils/jwtUtils.js";
import {
  checkCreateTaskPermission,
  checkEditTaskPermission
} from "../middleware/permissionMiddleware.js";

const router = express.Router();

/**
 * 计算并更新项目进度
 * @param {number} projectId - 项目ID
 */
const updateProjectProgress = async (projectId) => {
  try {
    // 获取项目下所有任务的进度平均值
    const result = await query(
      `SELECT COALESCE(AVG(progress), 0) as avg_progress, COUNT(*) as task_count
       FROM tasks 
       WHERE project_id = $1`,
      [projectId]
    );

    const avgProgress = Math.round(result.rows[0].avg_progress) || 0;
    const taskCount = parseInt(result.rows[0].task_count) || 0;

    // 更新项目进度
    await query(
      `UPDATE projects 
       SET progress = $1 
       WHERE id = $2`,
      [avgProgress, projectId]
    );

    console.log(`项目 ${projectId} 进度已更新: ${avgProgress}% (基于 ${taskCount} 个任务)`);
    return avgProgress;
  } catch (error) {
    console.error(`更新项目 ${projectId} 进度失败:`, error);
    throw error;
  }
};

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: 获取任务列表
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 *         description: 按项目筛选任务
 *     responses:
 *       200:
 *         description: 成功返回任务列表
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
 *                         $ref: '#/components/schemas/Task'
 *                     count:
 *                       type: integer
 */
router.get("/", async (req, res, next) => {
  try {
    const { project_id } = req.query;
    let queryText = "SELECT * FROM tasks";
    let params = [];

    if (project_id) {
      queryText += " WHERE project_id = $1";
      params.push(project_id);
    }

    queryText += " ORDER BY created_at DESC";

    const result = await query(queryText, params);
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: 获取单个任务
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 成功返回任务信息
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Task'
 *       404:
 *         description: 任务不存在
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query("SELECT * FROM tasks WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "任务不存在",
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: 创建任务
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - project_id
 *               - creator_id
 *             properties:
 *               title:
 *                 type: string
 *                 example: "完成前端开发"
 *               description:
 *                 type: string
 *                 example: "任务描述"
 *               project_id:
 *                 type: integer
 *                 example: 1
 *               creator_id:
 *                 type: integer
 *                 example: 1
 *               assignee_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T00:00:00Z"
 *               progress:
 *                 type: integer
 *                 example: 0
 *               priority:
 *                 type: integer
 *                 enum: [0, 1, 2, 3]
 *                 description: 0=无, 1=低, 2=中, 3=高
 *                 example: 2
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
 *                       $ref: '#/components/schemas/Task'
 *       400:
 *         description: 请求参数错误
 */
router.post("/", authenticateToken, checkCreateTaskPermission, async (req, res, next) => {
  try {
    const {
      title,
      description,
      project_id,
      creator_id,
      assignee_ids,
      due_date,
      start_date,
      progress,
      priority,
    } = req.body;

    if (!title || !project_id || !creator_id) {
      return res.status(400).json({
        success: false,
        message: "任务标题、项目ID和创建者ID为必填项",
      });
    }

    const result = await query(
      `INSERT INTO tasks (title, description, project_id, creator_id, assignee_ids, due_date, start_date, progress, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        title,
        description,
        project_id,
        creator_id,
        assignee_ids || [],
        due_date,
        start_date,
        progress || 0,
        priority || 1,
      ],
    );

    // 自动更新项目进度
    await updateProjectProgress(project_id);

    res.status(201).json({
      success: true,
      message: "任务创建成功",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: 更新任务
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 任务ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "更新后的任务标题"
 *               description:
 *                 type: string
 *                 example: "更新后的描述"
 *               assignee_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T00:00:00Z"
 *               progress:
 *                 type: integer
 *                 example: 50
 *               priority:
 *                 type: integer
 *                 enum: [0, 1, 2, 3]
 *                 example: 3
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
 *                       $ref: '#/components/schemas/Task'
 *       404:
 *         description: 任务不存在
 */
router.put("/:id", authenticateToken, checkEditTaskPermission, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      assignee_ids,
      due_date,
      start_date,
      progress,
      priority,
    } = req.body;

    // 检查用户权限级别
    const canEditFullTask = req.canEditFullTask === true;

    // 先查询当前任务的进度和项目ID
    const currentTaskResult = await query(
      "SELECT progress, project_id FROM tasks WHERE id = $1",
      [id]
    );

    if (currentTaskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "任务不存在",
      });
    }

    const currentProgress = currentTaskResult.rows[0].progress;
    const projectId = currentTaskResult.rows[0].project_id;
    let completedAtValue = null;

    // 如果进度从非100%变为100%，设置完成时间
    if (progress === 100 && currentProgress !== 100) {
      completedAtValue = new Date().toISOString();
    }
    // 如果进度从100%变为非100%，清除完成时间
    else if (progress !== 100 && currentProgress === 100) {
      completedAtValue = null;
    }

    let result;

    if (canEditFullTask) {
      // 有完整编辑权限的用户可以更新所有字段
      result = await query(
        `UPDATE tasks
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             assignee_ids = COALESCE($3, assignee_ids),
             due_date = COALESCE($4, due_date),
             start_date = COALESCE($5, start_date),
             progress = COALESCE($6, progress),
             priority = COALESCE($7, priority),
             completed_at = COALESCE($9, completed_at),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $8
         RETURNING *`,
        [
          title,
          description,
          assignee_ids,
          due_date,
          start_date,
          progress,
          priority,
          id,
          completedAtValue,
        ],
      );
    } else {
      // 只有部分权限的用户（被分配者）只能更新进度
      result = await query(
        `UPDATE tasks
         SET progress = COALESCE($1, progress),
             completed_at = COALESCE($2, completed_at),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [progress, completedAtValue, id]
      );
    }

    // 自动更新项目进度
    await updateProjectProgress(projectId);

    res.json({
      success: true,
      message: "任务更新成功",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: 删除任务
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 任务不存在
 */
router.delete("/:id", authenticateToken, checkEditTaskPermission, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 先查询任务所属的项目ID
    const taskResult = await query(
      "SELECT project_id FROM tasks WHERE id = $1",
      [id]
    );
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "任务不存在",
      });
    }
    
    const projectId = taskResult.rows[0].project_id;
    
    const result = await query("DELETE FROM tasks WHERE id = $1 RETURNING id", [
      id,
    ]);

    // 自动更新项目进度
    await updateProjectProgress(projectId);

    res.json({ success: true, message: "任务删除成功" });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks/summary/{projectId}:
 *   get:
 *     summary: 获取项目任务统计信息
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 项目ID
 *     responses:
 *       200:
 *         description: 成功返回项目统计信息
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         total_tasks:
 *                           type: integer
 *                           description: 总任务数
 *                         completed_tasks:
 *                           type: integer
 *                           description: 已完成任务数
 *                         warning_tasks:
 *                           type: integer
 *                           description: 预警任务数（3天内到期且未完成）
 *                         expired_tasks:
 *                           type: integer
 *                           description: 逾期任务数
 *                         project_hours:
 *                           type: number
 *                           description: 项目总工时
 *       404:
 *         description: 项目不存在
 */
router.get("/summary/:projectId", async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // 验证项目是否存在
    const projectResult = await query(
      "SELECT total_hours FROM projects WHERE id = $1",
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "项目不存在"
      });
    }

    const projectHours = projectResult.rows[0].total_hours || 0;

    // 获取总任务数和已完成任务数
    const taskStatsResult = await query(
      `SELECT
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN progress = 100 THEN 1 END) as completed_tasks
       FROM tasks
       WHERE project_id = $1`,
      [projectId]
    );

    // 获取预警任务数（3天内到期且未完成）
    const warningResult = await query(
      `SELECT COUNT(*) as count
       FROM tasks
       WHERE project_id = $1
         AND progress < 100
         AND due_date IS NOT NULL
         AND due_date BETWEEN NOW() AND NOW() + INTERVAL '3 days'`,
      [projectId]
    );

    // 获取逾期任务数（已过期且未完成）
    const expiredResult = await query(
      `SELECT COUNT(*) as count
       FROM tasks
       WHERE project_id = $1
         AND progress < 100
         AND due_date IS NOT NULL
         AND due_date < NOW()`,
      [projectId]
    );

    const data = {
      total_tasks: parseInt(taskStatsResult.rows[0].total_tasks) || 0,
      completed_tasks: parseInt(taskStatsResult.rows[0].completed_tasks) || 0,
      warning_tasks: parseInt(warningResult.rows[0].count) || 0,
      expired_tasks: parseInt(expiredResult.rows[0].count) || 0,
      project_hours: parseFloat(projectHours) || 0
    };

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});

export default router;
