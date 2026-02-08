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
│   │   └── database.js       # 数据库配置
│   ├── routes/
│   │   ├── users.js           # 用户路由
│   │   ├── projects.js        # 项目路由
│   │   ├── tasks.js           # 任务路由
│   │   └── teams.js           # 团队路由
│   └── index.js               # 应用入口
├── db/
│   └── init.sql               # 数据库初始化脚本
├── .env.example               # 环境变量示例
├── .gitignore                 # Git 忽略文件
└── package.json               # 依赖配置
```

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置数据库

确保已安装 PostgreSQL，然后创建数据库：

```bash
createdb taskflowtest
```

执行初始化脚本：

```bash
psql -U postgres -d taskflow -f db/init.sql
```

或使用 PostgreSQL 管理工具（如 pgAdmin）执行 `db/init.sql` 文件。

### 3. 配置环境变量

复制 `.env.example` 文件为 `.env`，并修改数据库配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow
DB_USER=postgres
DB_PASSWORD=your_password
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
- `GET /api/teams/:id` - 获取单个团队（含成员）
- `POST /api/teams` - 创建团队
- `POST /api/teams/:id/members` - 添加团队成员
- `DELETE /api/teams/:id/members/:userId` - 移除团队成员
- `DELETE /api/teams/:id` - 删除团队

## 数据库表结构

### users - 用户表
- id: 用户ID
- username: 用户名
- email: 邮箱
- password: 密码
- avatar: 头像URL
- created_at: 创建时间
- updated_at: 更新时间

### projects - 项目表
- id: 项目ID
- name: 项目名称
- description: 项目描述
- owner_id: 负责人ID
- status: 项目状态
- color: 项目颜色
- created_at: 创建时间
- updated_at: 更新时间

### tasks - 任务表
- id: 任务ID
- title: 任务标题
- description: 任务描述
- project_id: 所属项目ID
- assignee_id: 指派人员ID
- status: 任务状态
- priority: 优先级
- due_date: 截止日期
- created_at: 创建时间
- updated_at: 更新时间

### teams - 团队表
- id: 团队ID
- name: 团队名称
- description: 团队描述
- owner_id: 负责人ID
- created_at: 创建时间
- updated_at: 更新时间

### team_members - 团队成员表
- id: 成员ID
- team_id: 团队ID
- user_id: 用户ID
- role: 角色
- joined_at: 加入时间

### notifications - 通知表
- id: 通知ID
- user_id: 用户ID
- title: 通知标题
- content: 通知内容
- type: 通知类型
- is_read: 是否已读
- created_at: 创建时间

### comments - 评论表
- id: 评论ID
- task_id: 任务ID
- user_id: 用户ID
- content: 评论内容
- created_at: 创建时间
- updated_at: 更新时间

## 开发说明

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

- [ ] 用户认证与授权（JWT）
- [ ] 密码加密（bcrypt）
- [ ] 文件上传（multer）
- [ ] API 文档（Swagger）
- [ ] 单元测试（Jest）
- [ ] 日志系统（Winston）
- [ ] 缓存机制（Redis）
- [ ] 邮件通知（Nodemailer）
