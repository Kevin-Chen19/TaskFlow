# TaskFlow 服务端

基于 Express + PostgreSQL 的项目管理协作平台后端服务。

## 技术栈

- **Node.js** - JavaScript 运行环境
- **Express** - Web 框架
- **PostgreSQL** - 关系型数据库
- **pg** - PostgreSQL 客户端

## 项目结构

```
server/
├── src/
│   ├── config/
│   │   └── database.js              # 数据库配置
│   ├── routes/
│   │   ├── users.js                 # 用户路由
│   │   ├── projects.js              # 项目路由
│   │   ├── tasks.js                # 任务路由
│   │   ├── teams.js                # 团队路由
│   │   ├── projectMembers.js        # 项目成员路由
│   │   ├── notifications.js         # 通知路由
│   │   ├── notes.js                # 笔记路由
│   │   ├── projectRoles.js         # 项目角色路由
│   │   ├── projectPositions.js      # 项目职位路由
│   │   ├── projectFolders.js        # 项目文件夹路由
│   │   └── projectDocuments.js     # 项目文档路由
│   └── index.js                    # 应用入口
├── db/
│   └── init.sql                    # 数据库初始化脚本
├── .env.example                   # 环境变量示例
├── .gitignore                     # Git 忽略文件
└── package.json                   # 依赖配置
```

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置数据库

确保已安装 PostgreSQL，然后创建数据库（UTF-8 编码）：

```bash
psql -U postgres -c "DROP DATABASE IF EXISTS taskflow;"
psql -U postgres -c "CREATE DATABASE taskflow ENCODING 'UTF8' TEMPLATE template0;"
```

执行初始化脚本：

```bash
psql -U postgres -d taskflow -f db/init.sql
```

或使用 PostgreSQL 管理工具（如 pgAdmin）执行 `db/init.sql` 文件。

### 3. 配置环境变量

复制 `.env.example` 文件为 `.env`，并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow
DB_USER=postgres
DB_PASSWORD=your_password

# JWT 配置（生产环境请务必修改）
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

### 4. 启动服务

开发模式（带热重载）：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

### 5. 测试服务

访问健康检查接口：

```bash
curl http://localhost:3000/health
```

## API 接口

### 认证接口

- `POST /api/auth/register` - 用户注册（密码自动加密）
  - Request Body: `{ phone, fullname, email, password, avatar_url?, skills?, mooto? }`
- `POST /api/auth/login` - 用户登录（返回 JWT Token）
  - Request Body: `{ phone?, email?, password }` (phone 或 email 至少一个)
  - Response: `{ success, data: { user..., token } }`
- `GET /api/auth/me` - 获取当前用户信息（需认证）
  - Headers: `Authorization: Bearer <token>`
- `POST /api/auth/change-password` - 修改密码（需认证）
  - Headers: `Authorization: Bearer <token>`
  - Request Body: `{ current_password, new_password }`

**示例：**
```bash
# 注册用户
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138003",
    "fullname": "王五",
    "email": "wangwu@example.com",
    "password": "mypassword123",
    "skills": ["JavaScript", "Node.js", "PostgreSQL"]
  }'

# 用户登录（返回 Token）
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wangwu@example.com",
    "password": "mypassword123"
  }'

# 获取当前用户信息
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 修改密码
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "oldpassword",
    "new_password": "newpassword123"
  }'
```

### 受保护的接口

所有需要认证的接口都需要在请求头中添加：
```
Authorization: Bearer <your_jwt_token>
```

认证中间件已集成到路由中，自动验证 Token 并在 `req.user` 中附加用户信息：
```javascript
req.user = {
  userId: 123,
  email: "user@example.com",
  phone: "13800138001"
}
```

### 用户接口

- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 获取单个用户
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 项目接口

- `GET /api/projects` - 获取所有项目
- `GET /api/projects/:id` - 获取单个项目
- `POST /api/projects` - 创建项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 任务接口

- `GET /api/tasks?project_id=1` - 获取任务列表（支持按项目筛选）
- `GET /api/tasks/:id` - 获取单个任务
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

### 团队接口

- `GET /api/teams` - 获取所有团队
- `GET /api/teams/:id` - 获取单个团队
- `POST /api/teams` - 创建团队
- `POST /api/teams/:id/members` - 添加团队成员
- `DELETE /api/teams/:id/members/:userId` - 移除团队成员
- `DELETE /api/teams/:id` - 删除团队

### 项目成员接口

- `GET /api/project-members/project/:projectId` - 获取项目的所有成员
- `POST /api/project-members` - 添加项目成员
- `PUT /api/project-members/:id` - 更新项目成员
- `DELETE /api/project-members/:id` - 删除项目成员

### 通知接口

- `GET /api/notifications?project_id=1&creator_id=1` - 获取通知列表（支持筛选）
- `POST /api/notifications` - 创建通知
- `PUT /api/notifications/:id` - 更新通知
- `DELETE /api/notifications/:id` - 删除通知

### 笔记接口

- `GET /api/notes?project_id=1&creator_id=1` - 获取笔记列表（支持筛选）
- `POST /api/notes` - 创建笔记
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记

### 项目角色接口

- `GET /api/project-roles?project_id=1` - 获取项目角色列表（支持筛选）
- `POST /api/project-roles` - 创建项目角色
- `PUT /api/project-roles/:id` - 更新项目角色
- `DELETE /api/project-roles/:id` - 删除项目角色

### 项目职位接口

- `GET /api/project-positions?project_id=1` - 获取项目职位列表（支持筛选）
- `POST /api/project-positions` - 创建项目职位
- `PUT /api/project-positions/:id` - 更新项目职位
- `DELETE /api/project-positions/:id` - 删除项目职位

### 项目文件夹接口

- `GET /api/project-folders?project_id=1&parent_folder_id=1` - 获取项目文件夹列表（支持筛选）
- `POST /api/project-folders` - 创建文件夹
- `PUT /api/project-folders/:id` - 更新文件夹
- `DELETE /api/project-folders/:id` - 软删除文件夹

### 项目文档接口

- `GET /api/project-documents?project_id=1&parent_folder_id=1` - 获取项目文档列表（支持筛选）
- `POST /api/project-documents` - 创建文档
- `PUT /api/project-documents/:id` - 更新文档
- `DELETE /api/project-documents/:id` - 软删除文档

## 数据库表结构

### users - 用户表
- id: 用户ID
- phone: 手机号（唯一）
- fullname: 姓名
- email: 邮箱（唯一）
- password: 密码
- avatar_url: 头像URL
- skills: 技能数组（VARCHAR[]）
- mooto: 个人简介

### projects - 项目表
- id: 项目ID
- name: 项目名称
- description: 项目描述
- owner_id: 负责人ID
- progress: 进度（0-100）
- assignee_ids: 指派人员ID数组（INTEGER[]）
- created_at: 创建时间
- total_hours: 总工时

### tasks - 任务表
- id: 任务ID
- title: 任务标题
- description: 任务描述
- project_id: 所属项目ID
- creator_id: 创建者ID
- assignee_ids: 指派人员ID数组（INTEGER[]）
- due_date: 截止日期
- created_at: 创建时间
- start_date: 开始日期
- progress: 进度（0-100）
- priority: 优先级（0:low, 1:medium, 2:high, 3:urgent）

### project_members - 项目成员表
- id: 成员ID
- project_id: 项目ID
- user_id: 用户ID
- role: 角色
- position: 职位
- is_active: 是否激活

### notifications - 通知表
- id: 通知ID
- project_id: 项目ID
- creator_id: 创建者ID
- description: 通知内容
- type: 通知类型（默认 'chat'）
- assignee_ids: 接收者ID数组（INTEGER[]）
- status: 状态数组（BOOLEAN[]）
- created_at: 创建时间

### notes - 笔记表
- id: 笔记ID
- project_id: 项目ID
- creator_id: 创建者ID
- description: 笔记内容
- status: 状态（完成/未完成）

### project_roles - 项目角色表
- id: 角色ID
- project_id: 项目ID
- rolename: 角色名称
- description: 角色描述
- settings: 权限设置（JSONB）

### project_positions - 项目职位表
- id: 职位ID
- project_id: 项目ID
- positionname: 职位名称
- description: 职位描述

### project_folders - 项目文件夹表
- id: 文件夹ID
- project_id: 项目ID
- parent_folder_id: 父文件夹ID（支持树形结构）
- name: 文件夹名称
- path: 路径
- creator_id: 创建者ID
- created_at: 创建时间
- deleted_at: 删除时间（软删除）

### project_documents - 项目文档表
- id: 文档ID
- project_id: 项目ID
- parent_folder_id: 所属文件夹ID
- name: 文档名称
- path: 路径
- creator_id: 创建者ID
- created_at: 创建时间
- deleted_at: 删除时间（软删除）

## 开发说明

### 使用 JWT 认证中间件

在需要认证的路由中使用 `authenticateToken` 中间件：

```javascript
import { authenticateToken } from '../utils/jwtUtils.js';

// 保护单个路由
router.get('/protected', authenticateToken, async (req, res, next) => {
  // req.user 包含: { userId, email, phone }
  const userId = req.user.userId;
  // ... 业务逻辑
});

// 保护多个路由
router.use(authenticateToken); // 此路由下所有接口都需要认证
```

### 代码规范

### 代码规范

- 使用 ES6+ 语法
- 使用 async/await 处理异步操作
- 统一错误处理中间件
- RESTful API 设计规范

### 添加新功能

1. 在 `src/routes/` 下创建新的路由文件
2. 在 `src/index.js` 中引入并挂载路由
3. 使用 `query` 方法执行数据库操作
4. 返回统一的 JSON 响应格式

### 数据库连接

数据库连接池配置在 `src/config/database.js` 中，已处理：
- 连接池管理
- 连接错误处理
- 查询性能日志

## 后续扩展建议

- [x] 密码加密（bcrypt）
-   ✅ 密码使用 bcrypt 哈希存储
    ✅ Salt rounds: 10
    ✅ 响应中不返回密码
    ✅ 邮箱格式验证
    ✅ 密码长度验证（最少6位）
    ✅ 手机号/邮箱唯一性检查
- [ ] 用户认证与授权（JWT）
-   注意事项
    ✅ 生产环境必须修改 JWT_SECRET
    ✅ Token 默认有效期为 7 天
    ✅ 登录接口返回用户信息和 token
    ✅ 受保护接口返回 401 当 token 无效/过期
    ✅ req.user 包含 { userId, email, phone } 信息
- [ ] 文件上传（multer）
- [ ] API 文档（Swagger）
- [ ] 单元测试（Jest）
- [ ] 日志系统（Winston）
- [ ] 缓存机制（Redis）
- [ ] 邮件通知（Nodemailer）
- [ ] WebSocket 实时通信（Socket.io）
- [ ] 数据库备份策略
