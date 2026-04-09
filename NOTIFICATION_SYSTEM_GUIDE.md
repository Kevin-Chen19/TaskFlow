# TaskFlow 通知系统使用指南

## 概述

TaskFlow 通知系统基于 Socket.io 实现，提供实时消息推送功能。当用户在线时，可以立即收到通知；离线时，通知会保存在数据库中，用户登录后可查看。

## 功能特性

✅ **实时推送**：用户在线时秒级收到通知  
✅ **离线存储**：未读通知保存在数据库中  
✅ **多种类型**：支持项目邀请、文档上传、任务分配等多种通知类型  
✅ **已读状态**：支持标记通知为已读/未读  
✅ **浏览器通知**：支持浏览器桌面通知（需用户授权）  

---

## 一、Socket.io 集成（第一阶段）

### 1.1 后端集成

**文件**：`server/src/index.js`

Socket.io 已集成到 Express 服务器中，主要特性：

- **身份验证**：使用 JWT token 进行连接认证
- **房间管理**：支持按用户和项目分组
- **在线状态**：使用 Redis 存储用户在线状态
- **自动重连**：客户端自动重连机制

**连接地址**：
- HTTP: `http://localhost:3000`
- WebSocket: `ws://localhost:3000`

### 1.2 前端集成

**文件**：`src/services/socketService.ts`

前端 Socket.io 服务封装，提供以下方法：

```typescript
// 连接到服务器
socketService.connect();

// 加入项目房间
socketService.joinProject(projectId);

// 离开项目房间
socketService.leaveProject(projectId);

// 标记通知为已读
socketService.markAsRead(notificationId);

// 断开连接
socketService.disconnect();
```

**自动连接**：应用启动时会自动连接 Socket.io（见 `main.ts`）

---

## 二、通知系统（第二阶段）

### 2.1 数据库结构

**表名**：`notifications`

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  document_id INTEGER REFERENCES project_documents(id) ON DELETE CASCADE,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**字段说明**：
- `type`: 通知类型（project_invite, document_upload, task_assigned, comment_mention, info）
- `sender_id`: 发送者ID
- `receiver_id`: 接收者ID（明确一对一）
- `project_id/document_id/task_id`: 关联资源ID
- `data`: 额外数据，JSON格式
- `is_read`: 是否已读

### 2.2 API 接口

#### 获取通知列表
```http
GET /api/notifications?receiver_id=123&is_read=false
```

#### 获取未读数量
```http
GET /api/notifications/unread-count?receiver_id=123
```

#### 创建通知
```http
POST /api/notifications
Content-Type: application/json

{
  "type": "document_upload",
  "title": "新文档上传",
  "message": "张三上传了文档: 需求文档.docx",
  "sender_id": 1,
  "receiver_id": 2,
  "project_id": 1,
  "document_id": 10,
  "data": {
    "fileSize": "2.5MB"
  }
}
```

#### 标记为已读
```http
PUT /api/notifications/{id}/read
```

#### 标记所有为已读
```http
PUT /api/notifications/mark-all-read
Content-Type: application/json

{
  "receiver_id": 123
}
```

### 2.3 前端 Store

**文件**：`src/stores/notificationStore.ts`

```typescript
// 获取通知列表
await notificationStore.fetchNotifications(receiverId, isRead);

// 获取未读数量
await notificationStore.fetchUnreadCount(receiverId);

// 创建通知
await notificationStore.createNotification({
  type: 'document_upload',
  title: '新文档上传',
  message: '张三上传了文档',
  sender_id: 1,
  receiver_id: 2,
  project_id: 1,
  data: {}
});

// 标记为已读
await notificationStore.markAsRead(notificationId);

// 标记所有为已读
await notificationStore.markAllAsRead(receiverId);

// 计算属性：未读数量
notificationStore.unreadCount
```

### 2.4 通知组件

#### NotificationCard 组件

**文件**：`src/components/notificationsCard.vue`

单个通知卡片，显示通知详情和操作按钮。

#### NotificationCenter 组件

**文件**：`src/components/NotificationCenter.vue`

完整的通知中心，包含：
- 通知列表
- 筛选标签（全部/未读/邀请/文档/任务）
- 标记全部已读
- 未读数量徽章

### 2.5 通知类型图标

每种通知类型对应不同的图标和背景色：

| 类型 | 图标 | 背景色 |
|------|------|--------|
| comment_mention | 💬 | #eff6ff |
| document_upload | 📄 | #faf5ff |
| task_assigned | ✅ | #fff7ed |
| project_invite | 📨 | #fef3c7 |

---

## 三、使用示例

### 3.1 文档上传时发送通知

**场景**：用户上传文档后，通知项目所有成员

```typescript
import { useNotificationStore } from '@/stores/notificationStore';
import { useUserStore } from '@/stores/userStore';

// 上传成功后发送通知
const sendDocumentUploadNotification = async (uploadedFiles) => {
  const notificationStore = useNotificationStore();
  const userStore = useUserStore();
  const projectId = currentProjectId;
  
  // 获取项目成员
  const membersResponse = await fetch(`/api/project-members?project_id=${projectId}`);
  const membersResult = await membersResponse.json();
  const members = membersResult.data || [];
  
  // 为每个成员发送通知（除了上传者自己）
  for (const member of members) {
    if (member.user_id === userStore.user?.id) continue;
    
    const fileNames = uploadedFiles.map(f => f.name).join(', ');
    
    await notificationStore.createNotification({
      type: 'document_upload',
      title: '新文档上传',
      message: `${userStore.user?.fullname} 上传了文档: ${fileNames}`,
      sender_id: userStore.user?.id,
      receiver_id: member.user_id,
      project_id: projectId,
      data: {
        uploadedFiles: uploadedFiles,
        folderId: currentFolderId
      }
    });
  }
};
```

### 3.2 在 Vue 组件中使用通知中心

```vue
<template>
  <div>
    <!-- 顶部铃铛图标 -->
    <el-badge :value="unreadCount" :max="99">
      <el-icon @click="showNotificationCenter = true">
        <Bell />
      </el-icon>
    </el-badge>

    <!-- 通知中心弹窗 -->
    <el-drawer
      v-model="showNotificationCenter"
      title="通知中心"
      direction="rtl"
      size="500px"
    >
      <NotificationCenter />
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';
import NotificationCenter from '@/components/NotificationCenter.vue';

const notificationStore = useNotificationStore();
const showNotificationCenter = ref(false);

const unreadCount = computed(() => notificationStore.unreadCount);

// 在组件挂载时获取通知
onMounted(() => {
  notificationStore.fetchNotifications(userId);
});
</script>
```

### 3.3 监听实时通知

通知系统已自动处理实时推送，当有新通知时：

1. **添加到列表**：通知会自动添加到 `notificationStore.notifications` 数组开头
2. **更新未读数量**：`notificationStore.unreadCount` 自动更新
3. **显示消息**：使用 ElMessage 显示通知内容
4. **浏览器通知**：如果用户授权，显示桌面通知

### 3.4 请求浏览器通知权限

应用在启动时会自动请求通知权限：

```typescript
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
```

用户授权后，新通知会显示桌面通知。

---

## 四、事件监听

### Socket.io 客户端事件

#### 监听新通知
```typescript
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
});
```

#### 监听已读确认
```typescript
socket.on('notification:read-success', ({ notificationId }) => {
  console.log('Notification marked as read:', notificationId);
});
```

#### 监听错误
```typescript
socket.on('notification:error', ({ message }) => {
  console.error('Notification error:', message);
});
```

### Socket.io 服务器事件

#### 加入项目房间
```typescript
socket.emit('join:project', projectId);
```

#### 离开项目房间
```typescript
socket.emit('leave:project', projectId);
```

#### 标记通知为已读
```typescript
socket.emit('notification:mark-read', notificationId);
```

#### 心跳保活
```typescript
socket.emit('ping'); // 服务器会回复 'pong'
```

---

## 五、测试方法

### 5.1 测试实时通知

1. **打开两个浏览器窗口**，分别登录不同用户
2. **用户A** 上传文档到项目
3. **用户B** 应该立即收到通知

### 5.2 测试离线通知

1. **用户B** 退出登录或关闭浏览器
2. **用户A** 上传文档
3. **用户B** 重新登录，应该能看到未读通知

### 5.3 测试已读状态

1. 用户收到通知后，点击通知或"标记为已读"
2. 未读数量应该减少
3. 刷新页面后，通知应显示为已读状态

---

## 六、优化建议

### 6.1 性能优化

- **分页加载**：通知列表添加分页，避免一次性加载过多数据
- **懒加载**：滚动到底部时加载更多通知
- **Web Worker**：将通知处理放在 Web Worker 中，避免阻塞主线程

### 6.2 功能扩展

- **通知设置**：允许用户设置接收哪些类型的通知
- **免打扰**：支持设置免打扰时间段
- **邮件提醒**：离线通知发送邮件提醒（可选）
- **移动端推送**：集成移动端推送服务

### 6.3 用户体验

- **声音提醒**：添加通知音效
- **动画效果**：添加通知出现/消失的动画
- **分类筛选**：支持按项目、类型、时间筛选通知

---

## 七、故障排查

### 7.1 无法连接 Socket.io

**问题**：控制台显示 "Authentication error: No token provided"

**解决**：
1. 检查是否已登录
2. 检查 localStorage 中是否有 token
3. 检查服务器地址配置是否正确

### 7.2 通知未实时推送

**问题**：通知保存在数据库，但在线用户未收到实时推送

**解决**：
1. 检查 Socket.io 是否连接成功
2. 检查 Redis 是否正常运行
3. 检查用户是否加入了正确的房间

### 7.3 浏览器通知不显示

**问题**：未显示桌面通知

**解决**：
1. 检查浏览器是否授予通知权限
2. 检查浏览器是否允许网站发送通知
3. 确认代码中已调用 `requestNotificationPermission()`

---

## 八、相关文件

### 后端文件
- `server/src/index.js` - Socket.io 服务器配置
- `server/src/routes/notifications.js` - 通知 API
- `server/db/init.sql` - 数据库表结构

### 前端文件
- `src/services/socketService.ts` - Socket.io 客户端服务
- `src/stores/notificationStore.ts` - 通知状态管理
- `src/components/NotificationCenter.vue` - 通知中心组件
- `src/components/notificationsCard.vue` - 通知卡片组件
- `src/main.ts` - Socket.io 初始化

### 语言文件
- `src/language/lang/zh.ts` - 中文翻译
- `src/language/lang/en.ts` - 英文翻译

---

## 九、总结

通知系统已实现以下功能：

✅ **Socket.io 集成**：前后端实时通信  
✅ **通知 CRUD**：创建、读取、更新、删除通知  
✅ **实时推送**：在线用户秒级收到通知  
✅ **离线存储**：通知保存在数据库中  
✅ **已读状态**：支持标记已读/未读  
✅ **未读数量**：实时显示未读通知数量  
✅ **通知中心**：完整的 UI 界面  
✅ **浏览器通知**：桌面通知支持  
✅ **实际应用**：文档上传时自动发送通知  

后续可以基于这个基础添加更多类型的通知和优化用户体验。
