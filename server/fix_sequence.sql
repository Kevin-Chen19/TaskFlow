-- 修复 project_members 表的自增序列
-- 找到当前最大 id
SELECT MAX(id) FROM project_members;

-- 重置序列（将序列设置为最大 id + 1）
SELECT setval('project_members_id_seq', (SELECT MAX(id) FROM project_members) + 1);

-- 验证修复结果
SELECT currval('project_members_id_seq');
