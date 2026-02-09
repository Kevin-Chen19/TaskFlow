//Swagger 配置和规范定义
import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description: '项目管理协作平台后端 API 文档',
      contact: {
        name: 'API Support',
        email: 'support@taskflow.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            phone: { type: 'string' },
            fullname: { type: 'string' },
            email: { type: 'string' },
            avatar_url: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            mooto: { type: 'string' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            owner_id: { type: 'integer' },
            progress: { type: 'integer' },
            assignee_ids: { type: 'array', items: { type: 'integer' } },
            created_at: { type: 'string', format: 'date-time' },
            total_hours: { type: 'integer' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            project_id: { type: 'integer' },
            creator_id: { type: 'integer' },
            assignee_ids: { type: 'array', items: { type: 'integer' } },
            due_date: { type: 'string', format: 'date-time' },
            start_date: { type: 'string', format: 'date-time' },
            progress: { type: 'integer' },
            priority: { type: 'integer', enum: [0, 1, 2, 3] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            count: { type: 'integer' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: '认证相关接口' },
      { name: 'Users', description: '用户管理接口' },
      { name: 'Projects', description: '项目管理接口' },
      { name: 'Tasks', description: '任务管理接口' },
      { name: 'Notifications', description: '通知管理接口' },
      { name: 'Notes', description: '笔记管理接口' },
      { name: 'Project Members', description: '项目成员管理接口' },
      { name: 'Project Roles', description: '项目角色管理接口' },
      { name: 'Project Positions', description: '项目职位管理接口' },
      { name: 'Project Folders', description: '项目文件夹管理接口' },
      { name: 'Project Documents', description: '项目文档管理接口' },
    ],
  },
  apis: [join(__dirname, './routes/*.js')],
};

const specs = swaggerJsdoc(options);

export default specs;
