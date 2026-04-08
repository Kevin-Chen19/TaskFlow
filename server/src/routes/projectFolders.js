import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * /api/project-folders:
 *   get:
 *     summary: 获取项目文件夹列表
 *     tags: [Project Folders]
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
 *         description: 成功返回项目文件夹列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', async (req, res, next) => {
  try {
    const { project_id, parent_folder_id, include_deleted } = req.query;
    let queryText = 'SELECT * FROM project_folders';
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
 * /api/project-folders:
 *   post:
 *     summary: 创建文件夹
 *     tags: [Project Folders]
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
        message: '项目ID和文件夹名称为必填项'
      });
    }

    const result = await query(
      'INSERT INTO project_folders (project_id, parent_folder_id, name, creator_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [project_id, parent_folder_id || null, name, creator_id]
    );

    res.status(201).json({
      success: true,
      message: '文件夹创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-folders/{id}:
 *   put:
 *     summary: 更新文件夹
 *     tags: [Project Folders]
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
      'UPDATE project_folders SET name = COALESCE($1, name) WHERE id = $2 AND deleted_at IS NULL RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文件夹不存在'
      });
    }

    res.json({
      success: true,
      message: '文件夹更新成功',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-folders/{id}:
 *   delete:
 *     summary: 软删除文件夹
 *     tags: [Project Folders]
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
      'UPDATE project_folders SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文件夹不存在或已被删除'
      });
    }

    res.json({ success: true, message: '文件夹删除成功' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-folders/{id}/bin:
 *   put:
 *     summary: 递归移动文件夹及其所有子项到回收站
 *     tags: [Project Folders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 移动成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/:id/bin', async (req, res, next) => {
  try {
    const { id } = req.params;

    // 递归获取所有子文件夹ID
    const getAllFolderIds = async (folderId) => {
      const folderIds = [folderId];
      const children = await query(
        'SELECT id FROM project_folders WHERE parent_folder_id = $1',
        [folderId]
      );
      for (const child of children.rows) {
        const childIds = await getAllFolderIds(child.id);
        folderIds.push(...childIds);
      }
      return folderIds;
    };

    // 获取所有子文件夹ID
    const allFolderIds = await getAllFolderIds(parseInt(id));

    // 递归将所有子文件夹移入回收站
    for (const folderId of allFolderIds) {
      await query(
        'UPDATE project_folders SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
        [folderId]
      );
    }

    // 将所有子文档移入回收站
    for (const folderId of allFolderIds) {
      await query(
        'UPDATE project_documents SET deleted_at = NOW() WHERE parent_folder_id = $1 AND deleted_at IS NULL',
        [folderId]
      );
    }

    res.json({ success: true, message: '文件夹及其内容已移入回收站' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-folders/{id}/restore:
 *   put:
 *     summary: 递归恢复文件夹及其所有子项从回收站
 *     tags: [Project Folders]
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

    // 获取文件夹当前信息
    const folderResult = await query(
      'SELECT * FROM project_folders WHERE id = $1 AND deleted_at IS NOT NULL',
      [id]
    );

    if (folderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文件夹不存在或未被删除'
      });
    }

    const folder = folderResult.rows[0];
    let targetParentId = folder.parent_folder_id;

    // 如果文件夹有父文件夹，检查父文件夹是否在回收站中
    if (folder.parent_folder_id) {
      // 递归查找最近的未删除父文件夹
      const findNearestAvailableParent = async (folderId) => {
        const parentResult = await query(
          'SELECT parent_folder_id, deleted_at FROM project_folders WHERE id = $1',
          [folderId]
        );

        if (parentResult.rows.length === 0) {
          return null; // 父文件夹不存在
        }

        const parentFolder = parentResult.rows[0];

        // 如果父文件夹未删除，返回该父文件夹ID
        if (parentFolder.deleted_at === null) {
          return folderId;
        }

        // 如果父文件夹已删除且还有父文件夹，继续向上查找
        if (parentFolder.parent_folder_id) {
          return await findNearestAvailableParent(parentFolder.parent_folder_id);
        }

        // 已到达根级且根级文件夹也在回收站中，返回null（恢复到项目根级）
        return null;
      };

      targetParentId = await findNearestAvailableParent(folder.parent_folder_id);
    }

    // 递归获取所有子文件夹ID
    const getAllFolderIds = async (folderId) => {
      const folderIds = [folderId];
      const children = await query(
        'SELECT id FROM project_folders WHERE parent_folder_id = $1',
        [folderId]
      );
      for (const child of children.rows) {
        const childIds = await getAllFolderIds(child.id);
        folderIds.push(...childIds);
      }
      return folderIds;
    };

    // 获取所有子文件夹ID
    const allFolderIds = await getAllFolderIds(parseInt(id));

    // 递归将所有子文件夹从回收站恢复（不修改它们的父文件夹关系）
    for (const folderId of allFolderIds) {
      await query(
        'UPDATE project_folders SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
        [folderId]
      );
    }

    // 更新当前文件夹的父文件夹ID（如果需要）
    await query(
      'UPDATE project_folders SET deleted_at = NULL, parent_folder_id = $1 WHERE id = $2 AND deleted_at IS NOT NULL',
      [targetParentId, id]
    );

    // 将所有子文档从回收站恢复
    for (const folderId of allFolderIds) {
      await query(
        'UPDATE project_documents SET deleted_at = NULL WHERE parent_folder_id = $1 AND deleted_at IS NOT NULL',
        [folderId]
      );
    }

    res.json({ success: true, message: '文件夹及其内容已恢复' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/project-folders/{id}/permanent:
 *   delete:
 *     summary: 彻底删除文件夹（从数据库和文件系统删除，包含所有子文件和子文件夹）
 *     tags: [Project Folders]
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
    const fs = await import('fs');
    const pathModule = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = pathModule.dirname(__filename);

    // 递归获取所有子文件夹ID
    const getAllFolderIds = async (folderId) => {
      const folderIds = [folderId];
      const children = await query(
        'SELECT id FROM project_folders WHERE parent_folder_id = $1',
        [folderId]
      );
      for (const child of children.rows) {
        const childIds = await getAllFolderIds(child.id);
        folderIds.push(...childIds);
      }
      return folderIds;
    };

    // 递归获取所有子文件ID和路径
    const getAllDocumentIds = async (folderId) => {
      const docIds = [];
      // 获取当前文件夹的直接文档
      const docs = await query(
        'SELECT id, file_url FROM project_documents WHERE parent_folder_id = $1',
        [folderId]
      );
      for (const doc of docs.rows) {
        docIds.push(doc);
      }
      // 获取子文件夹的文档
      const children = await query(
        'SELECT id FROM project_folders WHERE parent_folder_id = $1',
        [folderId]
      );
      for (const child of children.rows) {
        const childDocs = await getAllDocumentIds(child.id);
        docIds.push(...childDocs);
      }
      return docIds;
    };

    // 获取所有文件夹ID
    const allFolderIds = await getAllFolderIds(parseInt(id));

    // 获取所有文档信息并删除
    for (const folderId of allFolderIds) {
      const docs = await getAllDocumentIds(folderId);
      for (const doc of docs) {
        // 删除物理文件
        const filePath = pathModule.join(__dirname, '../../uploads', pathModule.basename(doc.file_url));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        // 从数据库删除文档
        await query('DELETE FROM project_documents WHERE id = $1', [doc.id]);
      }
    }

    // 从最深层开始删除文件夹（先删子文件夹再删父文件夹）
    const sortedFolderIds = allFolderIds.sort((a, b) => {
      // 需要按照从深到浅的顺序删除
      return b - a;
    });

    for (const folderId of sortedFolderIds) {
      await query('DELETE FROM project_folders WHERE id = $1', [folderId]);
    }

    res.json({ success: true, message: '文件夹彻底删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
