-- 添加文件上传相关字段到 project_documents 表
-- 如果字段已存在，则忽略错误

ALTER TABLE project_documents 
ALTER COLUMN name TYPE VARCHAR(255),
ALTER COLUMN path TYPE TEXT,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS file_size BIGINT;
