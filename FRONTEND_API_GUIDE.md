# 前后端联调指南

## 项目结构

```
src/
├── api/               # API 接口封装
│   └── index.ts       # 所有 API 接口
├── stores/            # Pinia 状态管理
│   ├── loginStore.ts   # 登录状态管理
│   └── ...
├── types/             # TypeScript 类型定义
│   └── user.ts        # 用户、项目、任务等类型
├── utils/             # 工具函数
│   └── request.ts     # axios 请求封装
└── pages/             # 页面组件
    ├── login/          # 登录页面
    └── projects/       # 项目页面
```

## 启动说明

### 1. 启动后端服务

```bash
cd server
npm run dev
```

后端服务将在 `http://localhost:3000` 运行

### 2. 启动前端服务

```bash
npm run dev
```

前端服务将在 `http://localhost:5173` 运行

## API 接口说明

### 认证接口

- `register()` - 用户注册
- `login()` - 用户登录
- `getCurrentUser()` - 获取当前用户信息
- `changePassword()` - 修改密码

### 用户接口

- `getUsers()` - 获取所有用户
- `getUserById(id)` - 获取单个用户
- `createUser(data)` - 创建用户
- `updateUser(id, data)` - 更新用户
- `deleteUser(id)` - 删除用户

### 项目接口

- `getProjects()` - 获取所有项目
- `getProjectById(id)` - 获取单个项目
- `createProject(data)` - 创建项目
- `updateProject(id, data)` - 更新项目
- `deleteProject(id)` - 删除项目

### 任务接口

- `getTasks(params)` - 获取任务列表
- `getTaskById(id)` - 获取单个任务
- `createTask(data)` - 创建任务
- `updateTask(id, data)` - 更新任务
- `deleteTask(id)` - 删除任务

### 其他接口

通知、笔记、项目成员、项目角色、项目职位、项目文件夹、项目文档等接口详见 `src/api/index.ts`

## 使用示例

### 1. 登录

```typescript
import { useLoginStore } from '@/stores/loginStore'

const loginStore = useLoginStore()

await loginStore.login({
  phone: '13800138000',
  password: 'password123'
})

// 登录成功后，token 会自动保存到 localStorage
```

### 2. 获取项目列表

```typescript
import { getProjects } from '@/api'

const res = await getProjects()
if (res.success) {
  console.log(res.data) // 项目列表
}
```

### 3. 创建项目

```typescript
import { createProject } from '@/api'

await createProject({
  name: '新项目',
  description: '项目描述',
  owner_id: 1,
  assignee_ids: [1, 2],
  total_hours: 100
})
```

### 4. 使用 Token 认证

请求拦截器会自动从 localStorage 获取 token 并添加到请求头：

```typescript
// request.ts 中已自动处理
config.headers.Authorization = `Bearer ${token}`
```

## 请求拦截器

所有请求都会经过以下处理：

1. 自动添加 JWT Token（从 localStorage 获取）
2. 统一错误处理
3. 401 错误自动跳转登录页
4. 成功响应自动解包（返回 res.data）

## 响应拦截器

```typescript
// 成功响应格式
{
  success: true,
  message: '操作成功',
  data: { ... },
  count: 10
}

// 错误响应会自动显示 ElMessage 提示
```

## 登录页面功能

登录页面已集成后端 API：

1. **注册**：填写手机号、姓名、邮箱、密码
2. **登录**：使用手机号或邮箱 + 密码登录
3. **自动保存登录状态**：token 和用户信息保存到 localStorage
4. **自动跳转**：登录成功后跳转到 dashboard

## 项目列表页面

访问 `http://localhost:5173/project-list` 查看：

- 项目卡片展示
- 创建新项目
- 编辑项目
- 删除项目
- 项目进度展示

## 开发注意事项

1. **CORS**：后端已配置 CORS，允许前端跨域访问
2. **Token 存储**：token 存储在 localStorage 中，刷新页面后自动恢复
3. **401 处理**：token 过期或无效时自动跳转登录页
4. **错误提示**：所有错误都会显示 ElMessage 提示

## API 文档

访问 Swagger API 文档：`http://localhost:3000/api-docs`

## 测试账号

1. 首先需要通过注册接口创建账号
2. 或直接使用 API 测试工具（如 Postman）调用 `/api/auth/register`
3. 注册成功后使用手机号/邮箱 + 密码登录

## 扩展其他页面

参考 `project-list.vue` 的实现方式，在其他页面中使用 API：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTasks } from '@/api'

const tasks = ref([])

onMounted(async () => {
  const res = await getTasks({ project_id: 1 })
  if (res.success) {
    tasks.value = res.data
  }
})
</script>
```
