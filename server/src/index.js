import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger.js';
import { query } from './config/database.js';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

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

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 TaskFlow 服务器启动成功');
  console.log(`📍 端口: ${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 地址: http://localhost:${PORT}`);
});
