import express from "express";
import { query } from "../config/database.js";

const router = express.Router();

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
router.post("/", async (req, res, next) => {
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
router.put("/:id", async (req, res, next) => {
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

    const result = await query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           assignee_ids = COALESCE($3, assignee_ids),
           due_date = COALESCE($4, due_date),
           start_date = COALESCE($5, start_date),
           progress = COALESCE($6, progress),
           priority = COALESCE($7, priority)
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
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "任务不存在",
      });
    }

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
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM tasks WHERE id = $1 RETURNING id", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "任务不存在",
      });
    }

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
