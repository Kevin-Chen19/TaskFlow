-- 为 tasks 表添加完成时间字段
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- 为已完成的任务（progress = 100）设置默认完成时间为更新时间或创建时间
UPDATE tasks 
SET completed_at = COALESCE(updated_at, created_at)
WHERE progress = 100 AND completed_at IS NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at);
