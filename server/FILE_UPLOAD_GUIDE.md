# 文件上传功能说明

## 功能概述

已成功实现文件上传功能，允许用户将文件上传到项目文件夹中。

## 后端实现

### 新增文件

1. **`src/utils/upload.js`** - 文件上传工具
   - 使用 multer 处理文件上传
   - 支持多种文件类型（图片、PDF、Office 文档等）
   - 自动生成唯一文件名
   - 文件大小限制：50MB

2. **`src/routes/projectDocuments.js`** - 新增上传路由
   - `POST /api/project-documents/upload` - 文件上传接口
   - 接收 multipart/form-data 格式的文件
   - 将文件信息保存到数据库

3. **`src/index.js`** - 静态文件服务
   - 提供 `/uploads` 路径访问上传的文件
   - 自动创建 uploads 文件夹

### 数据库更新

在 `project_documents` 表中添加了以下字段：
- `file_url` (TEXT) - 文件访问 URL
- `file_type` (VARCHAR(50)) - 文件类型/扩展名
- `file_size` (BIGINT) - 文件大小（字节）

### 支持的文件类型

- 图片：JPEG, JPG, PNG, GIF, WebP
- 文档：PDF, Word, Excel, PowerPoint, TXT
- 压缩包：ZIP

## 前端实现

### 更新的文件

1. **`src/stores/fileStore.ts`**
   - `uploadFile()` 方法现在调用真实的上传接口
   - 上传成功后更新本地文件列表
   - 显示正确的文件信息和 URL

2. **`src/api/index.ts`**
   - `uploadProjectDocument()` 函数使用 FormData
   - 自动设置正确的 Content-Type

### 使用方式

```typescript
// 在组件中使用
const uploadFile = async () => {
  const result = await fileStore.uploadFile(
    projectId,      // 项目ID
    file,          // File 对象
    parentId        // 父文件夹ID（可选）
  )
  
  if (result.success) {
    ElMessage.success('上传成功')
  }
}
```

## API 接口

### 上传文件

**请求**
```
POST /api/project-documents/upload
Content-Type: multipart/form-data

Body:
- file: <文件>
- project_id: <项目ID>
- parent_folder_id: <父文件夹ID>（可选）
- creator_id: <创建者ID>
```

**响应**
```json
{
  "success": true,
  "message": "文件上传成功",
  "data": {
    "id": 1,
    "name": "document.pdf",
    "file_url": "/uploads/1234567890-123456789.pdf",
    "file_type": "pdf",
    "file_size": 1234567,
    "project_id": 1,
    "parent_folder_id": null,
    "creator_id": 5,
    "created_at": "2026-03-12T10:30:00.000Z"
  }
}
```

## 访问上传的文件

文件上传后，可以通过以下 URL 访问：
```
http://localhost:3000/uploads/<文件名>
```

## 设置说明

### 1. 安装依赖

```bash
cd server
npm install multer
```

### 2. 更新数据库

如果数据库表结构没有更新，运行：

```bash
psql -U postgres -d taskflow -f db/migration.sql
```

或手动执行 SQL：

```sql
ALTER TABLE project_documents
ALTER COLUMN name TYPE VARCHAR(255),
ALTER COLUMN path TYPE TEXT,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS file_size BIGINT;
```

### 3. 启动服务器

```bash
cd server
npm start
```

服务器会自动创建 `uploads` 文件夹。

## 注意事项

1. **文件大小限制**：默认为 50MB，可在 `upload.js` 中修改
2. **文件类型**：可按需在 `fileFilter` 中添加更多类型
3. **文件名**：自动生成唯一文件名，避免冲突
4. **数据库**：确保 `project_documents` 表已添加新字段
5. **路径**：上传的文件保存在 `server/uploads/` 目录

## 故障排查

### 文件上传失败

1. 检查 `uploads` 文件夹是否存在且有写权限
2. 确认数据库表结构已更新
3. 查看服务器日志获取详细错误信息

### 文件无法访问

1. 确认静态文件服务已配置
2. 检查文件 URL 是否正确
3. 确认文件已成功上传到 uploads 文件夹

## 测试

使用 curl 测试文件上传：

```bash
curl -X POST http://localhost:3000/api/project-documents/upload \
  -F "file=@test.txt" \
  -F "project_id=1" \
  -F "creator_id=5"
```
