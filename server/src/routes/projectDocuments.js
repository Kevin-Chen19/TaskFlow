import express from 'express';
import { query } from '../config/database.js';
import upload from '../utils/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * @swagger
 * /api/project-documents:
 *   get:
 *     summary: 获取项目文档列表
 *     tags: [Project Documents]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: parent_folder_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: include_deleted
 *         schema:
 *           type: boolean
 *         description: 是否包含已删除的文件（回收站）
 *     responses:
 *       200:
 *         description: 成功返回项目文档列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', async (req, res, next) => {
  try {
    const { project_id, parent_folder_id, include_deleted } = req.query;
    let queryText = 'SELECT * FROM project_documents';
    const conditions = [];
    const params = [];

    // 添加已删除条件
    if (include_deleted !== 'true') {
      conditions.push('deleted_at IS NULL');
    }

    if (project_id) {
      params.push(project_id);
      conditions.push(`project_id = $${params.length}`);
    }

    if (parent_folder_id !== undefined) {
      if (parent_folder_id) {
        params.push(parent_folder_id);
        conditions.push(`parent_folder_id = $${params.length}`);
      } else {
        conditions.push('parent_folder_id IS NULL');
      }
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY id DESC';

    const result = await query(queryText, params);
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-documents/upload:
 *   post:
 *     summary: 上传文档文件
 *     tags: [Project Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - project_id
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               project_id:
 *                 type: integer
 *               parent_folder_id:
 *                 type: integer
 *               creator_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    console.log('=== 文件上传请求 ===');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);

    if (!req.file) {
      console.log('错误：没有上传文件');
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      });
    }

    const { project_id, parent_folder_id, creator_id } = req.body;
    console.log('解析的参数:', { project_id, parent_folder_id, creator_id });

    if (!project_id) {
      console.log('错误：缺少项目ID');
      return res.status(400).json({
        success: false,
        message: '项目ID为必填项'
      });
    }

    // 处理文件名编码（解决中文乱码）
    let originalName = req.file.originalname;
    console.log('原始文件名:', originalName);

    // 尝试解码可能的 Latin-1 编码
    try {
      // 测试是否是乱码（包含非可打印字符）
      const isCorrupted = originalName.split('').some(char => char.charCodeAt(0) > 127 && /[^\u4e00-\u9fa5]/.test(char));
      if (isCorrupted) {
        // 尝试用 Latin-1 重新编码再 UTF-8 解码
        const latin1Buffer = Buffer.from(originalName, 'latin1');
        const utf8String = latin1Buffer.toString('utf8');
        console.log('解码后的文件名:', utf8String);
        originalName = utf8String;
      }
    } catch (error) {
      console.log('文件名解码失败，使用原始文件名');
    }

    // 获取文件扩展名
    const fileExt = path.extname(originalName).slice(1);

    // 构建文件URL
    const fileUrl = `/uploads/${req.file.filename}`;

    console.log('准备插入数据库:', {
      project_id: parseInt(project_id),
      parent_folder_id: parent_folder_id ? parseInt(parent_folder_id) : null,
      name: originalName,
      fileUrl,
      fileExt,
      fileSize: req.file.size
    });

    const result = await query(
      'INSERT INTO project_documents (project_id, parent_folder_id, name, path, file_url, file_type, file_size, creator_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        parseInt(project_id),
        parent_folder_id ? parseInt(parent_folder_id) : null,
        originalName,
        req.file.path,
        fileUrl,
        fileExt,
        req.file.size,
        creator_id ? parseInt(creator_id) : null
      ]
    );

    console.log('数据库插入成功:', result.rows[0]);

    res.status(201).json({
      success: true,
      message: '文件上传成功',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/project-documents:
 *   post:
 *     summary: 创建文档
 *     tags: [Project Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - name
 *             properties:
 *               project_id:
 *                 type: integer
 *               parent_folder_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               creator_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', async (req, res, next) => {
  try {
    const { project_id, parent_folder_id, name, creator_id } = req.body;

    if (!project_id || !name) {
      return res.status(400).json({
        success: false,
        message: '项目ID和文档名称为必填项'
      });
    }

    const result = await query(
      'INSERT INTO project_documents (project_id, parent_folder_id, name, creator_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [project_id, parent_folder_id || null, name, creator_id]
    );

    res.status(201).json({
      success: true,
      message: '文档创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-documents/{id}:
 *   put:
 *     summary: 更新文档
 *     tags: [Project Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const result = await query(
      'UPDATE project_documents SET name = COALESCE($1, name) WHERE id = $2 AND deleted_at IS NULL RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文档不存在'
      });
    }

    res.json({
      success: true,
      message: '文档更新成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-documents/{id}:
 *   delete:
 *     summary: 软删除文档
 *     tags: [Project Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE project_documents SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文档不存在或已被删除'
      });
    }

    res.json({ success: true, message: '文档删除成功' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-documents/{id}/restore:
 *   put:
 *     summary: 恢复文档从回收站
 *     tags: [Project Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 恢复成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/:id/restore', async (req, res, next) => {
  try {
    const { id } = req.params;

    // 获取文档当前信息（包括父文件夹）
    const docResult = await query(
      'SELECT * FROM project_documents WHERE id = $1 AND deleted_at IS NOT NULL',
      [id]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文档不存在或未被删除'
      });
    }

    const doc = docResult.rows[0];
    let targetParentId = doc.parent_folder_id;

    // 如果文档有父文件夹，检查父文件夹是否在回收站中
    if (doc.parent_folder_id) {
      // 递归查找最近的未删除父文件夹
      const findNearestAvailableParent = async (folderId) => {
        const folderResult = await query(
          'SELECT parent_folder_id, deleted_at FROM project_folders WHERE id = $1',
          [folderId]
        );

        if (folderResult.rows.length === 0) {
          return null; // 文件夹不存在
        }

        const folder = folderResult.rows[0];

        // 如果当前文件夹未删除，返回该文件夹ID
        if (folder.deleted_at === null) {
          return folderId;
        }

        // 如果当前文件夹已删除且还有父文件夹，继续向上查找
        if (folder.parent_folder_id) {
          return await findNearestAvailableParent(folder.parent_folder_id);
        }

        // 已到达根级且根级文件夹也在回收站中，返回null（恢复到项目根级）
        return null;
      };

      targetParentId = await findNearestAvailableParent(doc.parent_folder_id);
    }

    // 更新文档：恢复并更新父文件夹ID（如果需要）
    const result = await query(
      'UPDATE project_documents SET deleted_at = NULL, parent_folder_id = $1 WHERE id = $2 AND deleted_at IS NOT NULL RETURNING id',
      [targetParentId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文档恢复失败'
      });
    }

    res.json({ success: true, message: '文档恢复成功' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-documents/{id}/permanent:
 *   delete:
 *     summary: 彻底删除文档（从数据库和文件系统删除）
 *     tags: [Project Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:id/permanent', async (req, res, next) => {
  try {
    const { id } = req.params;

    // 先获取文件信息，用于删除物理文件
    const docResult = await query(
      'SELECT * FROM project_documents WHERE id = $1',
      [id]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文档不存在'
      });
    }

    const file = docResult.rows[0];

    // 从数据库彻底删除
    await query('DELETE FROM project_documents WHERE id = $1', [id]);

    // 删除物理文件
    const fs = await import('fs');
    const filePath = path.join(__dirname, '../../uploads', path.basename(file.file_url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: '文档彻底删除成功' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-documents/download/:id:
 *   get:
 *     summary: 下载文档
 *     tags: [Project Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 文件下载
 */
router.get('/download/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM project_documents WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文档不存在'
      });
    }

    const file = result.rows[0];
    const filePath = path.join(__dirname, '../../uploads', path.basename(file.file_url));

    // 设置下载响应头
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // 使用流方式发送文件
    const fs = await import('fs');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('下载文件失败:', error);
    next(error);
  }
});

export default router;
