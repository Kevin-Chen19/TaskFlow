# 里程碑功能使用说明

## 功能概述

项目里程碑功能已实现基于方案五（轻量级里程碑表）的完整开发，包括前后端完整的 CRUD 功能。

## 数据库设置

### 1. 创建里程碑表

执行以下 SQL 脚本创建数据库表：

```bash
# 在 PostgreSQL 数据库中执行
psql -U your_username -d your_database -f server/db/add_milestones_table.sql
```

或者手动执行 SQL：

```sql
CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON milestones(due_date);

-- 自动更新时间戳的触发器
CREATE OR REPLACE FUNCTION update_milestone_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_milestones_updated_at ON milestones;
CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_milestone_timestamp();
```

## 后端设置

### 1. 路由已自动注册

里程碑路由已在 `server/src/index.js` 中注册：

```javascript
import milestonesRoutes from './routes/milestones.js';
app.use('/api/milestones', milestonesRoutes);
```

### 2. API 接口说明

所有接口路径前缀：`/api/milestones`

#### 获取里程碑列表
- **路径**: `GET /api/milestones`
- **参数**: `project_id` (必需) - 项目ID
- **返回**: 里程碑数组，按截止日期升序排列

#### 创建里程碑
- **路径**: `POST /api/milestones`
- **请求体**:
  ```json
  {
    "project_id": 1,
    "content": "里程碑内容",
    "due_date": "2026-01-15"
  }
  ```

#### 更新里程碑
- **路径**: `PUT /api/milestones/:id`
- **参数**: `id` - 里程碑ID
- **请求体**:
  ```json
  {
    "content": "更新后的内容",
    "due_date": "2026-01-20"
  }
  ```

#### 删除里程碑
- **路径**: `DELETE /api/milestones/:id`
- **参数**: `id` - 里程碑ID

## 前端使用

### 1. API 调用（已在 `src/api/index.ts` 中定义）

```typescript
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '@/api';

// 获取里程碑列表
const milestones = await getMilestones({ project_id: 1 });

// 创建里程碑
const newMilestone = await createMilestone({
  project_id: 1,
  content: "新里程碑",
  due_date: "2026-01-15"
});

// 更新里程碑
const updated = await updateMilestone(1, {
  content: "更新内容",
  due_date: "2026-01-20"
});

// 删除里程碑
await deleteMilestone(1);
```

### 2. Dashboard 页面已集成

在 `src/pages/dashboard/dashboard.vue` 中已完整集成：

- **页面加载时自动获取**当前项目的里程碑列表
- **新增里程碑**: 点击"添加里程碑事件"按钮
- **编辑里程碑**: 点击里程碑内容文字
- **删除里程碑**: 鼠标悬停在里程碑上时显示删除图标

### 3. 视觉展示

里程碑以时间线形式展示，根据日期自动排序：

- ✅ **绿色勾选图标**: 已完成的里程碑（日期在今天之前）
- 🔄 **蓝色刷新图标**: 当前进行的里程碑（第一个未完成的里程碑）
- ⚪ **灰色圆点**: 未来的里程碑

## 测试步骤

1. **启动后端服务**
   ```bash
   cd server
   npm start
   ```

2. **执行数据库脚本**
   ```bash
   psql -U your_username -d taskflow -f db/add_milestones_table.sql
   ```

3. **启动前端服务**
   ```bash
   npm run dev
   ```

4. **测试功能**
   - 打开 Dashboard 页面
   - 点击"添加里程碑事件"创建新里程碑
   - 填写内容和截止日期
   - 保存后查看时间线更新
   - 点击里程碑内容进行编辑
   - 悬停显示删除图标进行删除

## 数据结构说明

### 数据库表字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | SERIAL | 主键，自增 |
| project_id | INTEGER | 关联的项目ID |
| content | TEXT | 里程碑内容描述 |
| due_date | DATE | 截止日期 |
| created_at | TIMESTAMP | 创建时间（自动生成） |
| updated_at | TIMESTAMP | 更新时间（自动更新） |

### 前端数据结构

```typescript
interface ActivityType {
  id?: number;        // 里程碑ID（从后端获取）
  content: string;    // 里程碑内容
  date: string;       // 日期 (YYYY-MM-DD 格式)
  color?: string;     // 显示颜色（动态计算）
  icon?: any;        // 显示图标（动态计算）
  type?: string;      // 时间线类型
  size?: string;      // 大小
  hollow?: boolean;   // 是否空心
  timestamp?: string; // 显示的时间戳文本
}
```

## 注意事项

1. **项目ID**: 所有操作都需要提供 `project_id`，默认使用 `otherStore.currentProjectId`
2. **日期格式**: 前端使用 `YYYY-MM-DD` 格式，后端使用 PostgreSQL DATE 类型
3. **排序**: 里程碑列表按 `due_date` 升序排列
4. **级联删除**: 删除项目时会自动删除关联的所有里程碑（ON DELETE CASCADE）
5. **时间戳**: `updated_at` 字段会自动更新，无需手动设置

## 未来扩展建议

如需增强功能，可以考虑：

1. 添加里程碑状态字段（如 `status: 'pending' | 'in_progress' | 'completed'`）
2. 添加负责人字段（`assignee_id` 关联 users 表）
3. 添加里程碑完成度（`progress` 0-100）
4. 添加里程碑附件或备注
5. 添加里程碑提醒通知功能
