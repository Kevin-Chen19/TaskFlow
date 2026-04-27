-- 重新创建 tasks 表
-- 注意：执行此脚本会删除现有 tasks 表及数据，请确保已备份重要数据

-- 1. 先删除依赖 tasks 表的外键约束（如果有）
-- 例如：notifications 表中的 task_id 外键
ALTER TABLE IF EXISTS notifications 
DROP CONSTRAINT IF EXISTS notifications_task_id_fkey;

-- 2. 删除旧的 tasks 表
DROP TABLE IF EXISTS tasks CASCADE;

-- 3. 创建新的 tasks 表
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,           -- 任务标题
  description TEXT,                       -- 任务描述
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,  -- 所属项目
  creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,    -- 创建者
  assignee_ids INTEGER[],                 -- 执行人ID数组
  due_date TIMESTAMP,                     -- 截止日期
  start_date TIMESTAMP,                   -- 开始日期
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 更新时间
  completed_at TIMESTAMP,                 -- 完成时间（进度100%时自动设置）
  progress INTEGER DEFAULT 0,             -- 进度 0-100
  priority INTEGER DEFAULT 0              -- 优先级 0=无, 1=低, 2=中, 3=高
);

-- 4. 创建索引
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_progress ON tasks(progress);

-- 5. 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. 恢复外键约束（如果需要）
-- ALTER TABLE notifications
-- ADD CONSTRAINT notifications_task_id_fkey 
-- FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- 7. 插入示例数据（可选）
INSERT INTO tasks (title, description, project_id, creator_id, assignee_ids, priority, progress, due_date) VALUES
  ('设计数据库结构', '设计PostgreSQL数据库表结构', 1, 1, ARRAY[1], 2, 100, '2024-01-15 23:59:59'),
  ('开发RESTful API', '实现后端接口', 1, 1, ARRAY[1, 2], 2, 80, '2024-01-20 23:59:59'),
  ('前端页面开发', '使用Vue3开发前端页面', 1, 1, ARRAY[2], 1, 60, '2024-01-25 23:59:59'),
  ('编写测试用例', '单元测试和集成测试', 1, 2, ARRAY[1], 1, 30, '2024-01-30 23:59:59');

-- 更新已完成的任务设置 completed_at
UPDATE tasks 
SET completed_at = updated_at
WHERE progress = 100 AND completed_at IS NULL;

-- 验证表结构
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;
