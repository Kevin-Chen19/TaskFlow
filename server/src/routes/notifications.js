import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [project_invite, document_upload, task_assigned, comment_mention, info]
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         sender_id:
 *           type: integer
 *         receiver_id:
 *           type: integer
 *         project_id:
 *           type: integer
 *         document_id:
 *           type: integer
 *         task_id:
 *           type: integer
 *         data:
 *           type: object
 *         is_read:
 *           type: boolean
 *         read_at:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: 获取通知列表
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: receiver_id
 *         schema:
 *           type: integer
 *         description: 接收者ID
 *       - in: query
 *         name: is_read
 *         schema:
 *           type: boolean
 *         description: 是否已读
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 通知类型
 *     responses:
 *       200:
 *         description: 成功返回通知列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', async (req, res, next) => {
  try {
    const { receiver_id, is_read, type } = req.query;
    let queryText = 'SELECT n.*, u.fullname as sender_name, u.avatar_url as sender_avatar FROM notifications n LEFT JOIN users u ON n.sender_id = u.id';
    let params = [];
    let conditions = [];

    if (receiver_id) {
      conditions.push(` n.receiver_id = $${conditions.length + 1}`);
      params.push(receiver_id);
    }
    if (is_read !== undefined) {
      conditions.push(` n.is_read = $${conditions.length + 1}`);
      params.push(is_read);
    }
    if (type) {
      conditions.push(` n.type = $${conditions.length + 1}`);
      params.push(type);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE' + conditions.join(' AND');
    }

    queryText += ' ORDER BY n.created_at DESC';

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
 * /api/notifications/unread-count:
 *   get:
 *     summary: 获取未读通知数量
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: receiver_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功返回未读数量
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/unread-count', async (req, res, next) => {
  try {
    const { receiver_id } = req.query;
    
    if (!receiver_id) {
      return res.status(400).json({
        success: false,
        message: 'receiver_id is required'
      });
    }

    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE receiver_id = $1 AND is_read = false',
      [receiver_id]
    );

    res.json({
      success: true,
      data: { count: parseInt(result.rows[0].count) }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: 创建通知并推送
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiver_id
 *               - title
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [project_invite, document_upload, task_assigned, comment_mention, info]
 *                 default: info
 *               title:
 *                 type: string
 *                 description: 通知标题
 *               message:
 *                 type: string
 *                 description: 通知内容
 *               sender_id:
 *                 type: integer
 *                 description: 发送者ID
 *               receiver_id:
 *                 type: integer
 *                 description: 接收者ID
 *               project_id:
 *                 type: integer
 *               document_id:
 *                 type: integer
 *               task_id:
 *                 type: integer
 *               data:
 *                 type: object
 *                 description: 额外数据
 *     responses:
 *       201:
 *         description: 创建成功并推送
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', async (req, res, next) => {
  try {
    const { type, title, message, sender_id, receiver_id, project_id, document_id, task_id, data } = req.body;

    if (!receiver_id || !title || !message) {
      return res.status(400).json({
        success: false,
        message: '接收者ID、标题和内容为必填项'
      });
    }

    // 创建通知
    const result = await query(
      'INSERT INTO notifications (type, title, message, sender_id, receiver_id, project_id, document_id, task_id, data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [type || 'info', title, message, sender_id || null, receiver_id, project_id || null, document_id || null, task_id || null, data || {}]
    );

    const notification = result.rows[0];
    
    // 获取发送者信息
    let senderInfo = null;
    if (sender_id) {
      const senderResult = await query(
        'SELECT id, fullname, avatar_url FROM users WHERE id = $1',
        [sender_id]
      );
      senderInfo = senderResult.rows[0];
    }
    
    const notificationWithSender = {
      ...notification,
      sender_name: senderInfo?.fullname || null,
      sender_avatar: senderInfo?.avatar_url || null
    };

    // 通过Socket.io推送通知
    const io = req.app.get('io');
    const redis = req.app.get('redis');
    
    // 检查接收者是否在线
    const socketId = await redis.get(`user_online:${receiver_id}`);
    
    if (socketId) {
      // 如果在线，实时推送
      io.to(`user:${receiver_id}`).emit('notification:new', notificationWithSender);
      console.log(`📢 Notification pushed to user ${receiver_id}`);
    }

    res.status(201).json({
      success: true,
      message: '通知创建成功',
      data: notificationWithSender
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: 标记通知为已读
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 标记成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '通知不存在'
      });
    }

    res.json({
      success: true,
      message: '通知已标记为已读',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   put:
 *     summary: 标记所有通知为已读
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiver_id:
 *                 type: integer
 *                 description: 接收者ID
 *     responses:
 *       200:
 *         description: 标记成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/mark-all-read', async (req, res, next) => {
  try {
    const { receiver_id } = req.body;

    if (!receiver_id) {
      return res.status(400).json({
        success: false,
        message: 'receiver_id is required'
      });
    }

    await query(
      'UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE receiver_id = $1 AND is_read = false',
      [receiver_id]
    );

    res.json({
      success: true,
      message: '所有通知已标记为已读'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: 删除通知
 *     tags: [Notifications]
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
    const result = await query('DELETE FROM notifications WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '通知不存在'
      });
    }

    res.json({ success: true, message: '通知删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
