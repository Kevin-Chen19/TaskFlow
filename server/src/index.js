import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger.js';
import { query } from './config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import './utils/createUploadsDir.js';
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import authRoutes from './routes/auth.js';
import projectMembersRoutes from './routes/projectMembers.js';
import notificationsRoutes from './routes/notifications.js';
import notesRoutes from './routes/notes.js';
import projectRolesRoutes from './routes/projectRoles.js';
import projectPositionsRoutes from './routes/projectPositions.js';
import projectFoldersRoutes from './routes/projectFolders.js';
import projectDocumentsRoutes from './routes/projectDocuments.js';
import milestonesRoutes from './routes/milestones.js';
import { verifyToken } from './utils/jwtUtils.js';
import { createClient } from 'redis';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Redis客户端
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
  console.log('📦 Redis connected successfully');
})();

// Socket.io 配置
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 静态文件服务 - 提供上传的文件访问
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 健康检查
app.get('/health', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({
      status: 'OK',
      message: 'TaskFlow 服务器运行正常',
      timestamp: result.rows[0].now,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: '数据库连接失败',
      error: error.message
    });
  }
});

// Swagger API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TaskFlow API 文档',
}));

// API 路由
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/project-members', projectMembersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/project-roles', projectRolesRoutes);
app.use('/api/project-positions', projectPositionsRoutes);
app.use('/api/project-folders', projectFoldersRoutes);
app.use('/api/project-documents', projectDocumentsRoutes);
app.use('/api/milestones', milestonesRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `路径 ${req.method} ${req.url} 不存在`
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('❌ 服务器错误:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 将 io 和 redis 挂载到 app，方便在路由中使用
app.set('io', io);
app.set('redis', redisClient);

// Socket.io 中间件 - 身份验证
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // 验证JWT token
    const decoded = verifyToken(token);
    socket.userId = decoded.userId;
    socket.user = decoded;

    // 将用户标记为在线
    await redisClient.setEx(`user_online:${decoded.userId}`, 300, socket.id);

    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.userId} (Socket ID: ${socket.id})`);

  // 加入用户房间
  socket.join(`user:${socket.userId}`);

  // 获取用户项目列表并加入项目房间
  socket.on('join:projects', async () => {
    try {
      const result = await query(
        'SELECT project_id FROM project_members WHERE user_id = $1',
        [socket.userId]
      );

      result.rows.forEach(row => {
        socket.join(`project:${row.project_id}`);
        console.log(`📂 User ${socket.userId} joined project room: ${row.project_id}`);
      });
    } catch (error) {
      console.error('Error joining project rooms:', error);
    }
  });

  // 加入指定项目房间
  socket.on('join:project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`📂 User ${socket.userId} joined project room: ${projectId}`);
  });

  // 离开项目房间
  socket.on('leave:project', (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`📂 User ${socket.userId} left project room: ${projectId}`);
  });

  // 标记通知为已读
  socket.on('notification:mark-read', async (notificationId) => {
    try {
      await query(
        'UPDATE notifications SET is_read = true WHERE id = $1',
        [notificationId]
      );

      socket.emit('notification:read-success', { notificationId });
    } catch (error) {
      socket.emit('notification:error', { message: 'Failed to mark notification as read' });
    }
  });

  // 心跳保活
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // 断开连接处理
  socket.on('disconnect', async () => {
    console.log(`🔌 User disconnected: ${socket.userId} (Socket ID: ${socket.id})`);
    await redisClient.del(`user_online:${socket.userId}`);
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log('🚀 TaskFlow 服务器启动成功');
  console.log(`📍 端口: ${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 HTTP 地址: http://localhost:${PORT}`);
  console.log(`⚡ WebSocket 地址: ws://localhost:${PORT}`);
  console.log(`📚 API 文档: http://localhost:${PORT}/api-docs`);
});
