import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../utils/jwtUtils.js';
import XLSX from 'xlsx';

const router = express.Router();

// 获取项目活动日志
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { project_id, category, search, page = 1, limit = 20 } = req.query;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: '项目ID不能为空'
      });
    }

    // 构建查询条件
    let whereClause = 'WHERE al.project_id = $1';
    const params = [project_id];
    let paramIndex = 2;

    if (category) {
      whereClause += ` AND al.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (al.title ILIKE $${paramIndex} OR al.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM activity_logs al ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // 查询数据
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    
    const result = await query(
      `SELECT 
        al.id,
        al.project_id,
        al.user_id,
        al.category,
        al.title,
        al.description,
        al.created_at,
        u.fullname as performer_name,
        u.avatar_url as performer_avatar
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      dataParams
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取活动日志失败:', error);
    res.status(500).json({
      success: false,
      message: '获取活动日志失败',
      error: error.message
    });
  }
});

// 创建活动日志
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { project_id, user_id, category, title, description } = req.body;

    if (!project_id || !category || !title) {
      return res.status(400).json({
        success: false,
        message: '项目ID、分类和标题不能为空'
      });
    }

    const result = await query(
      `INSERT INTO activity_logs (project_id, user_id, category, title, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [project_id, user_id || null, category, title, description || null]
    );

    res.status(201).json({
      success: true,
      message: '活动日志创建成功',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('创建活动日志失败:', error);
    res.status(500).json({
      success: false,
      message: '创建活动日志失败',
      error: error.message
    });
  }
});

// 导出活动日志为Excel
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const { project_id, search } = req.query;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: '项目ID不能为空'
      });
    }

    // 构建查询条件
    let whereClause = 'WHERE al.project_id = $1';
    const params = [project_id];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (al.title ILIKE $${paramIndex} OR al.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // 查询所有数据（不分页）
    const result = await query(
      `SELECT 
        al.id,
        al.project_id,
        al.user_id,
        al.category,
        al.title,
        al.description,
        al.created_at,
        u.fullname as performer_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC`,
      params
    );

    // 分类名称映射
    const categoryMap = {
      member: '成员',
      role: '角色',
      permission: '权限',
      status: '状态',
      milestone: '里程碑',
      position: '职位',
      file: '文件操作'
    };

    // 准备Excel数据
    const excelData = result.rows.map(item => ({
      'ID': item.id,
      '活动标题': item.title,
      '活动描述': item.description || '',
      '分类': categoryMap[item.category] || item.category,
      '执行者': item.performer_name || 'System',
      '时间': new Date(item.created_at).toLocaleString('zh-CN')
    }));

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // 设置列宽
    ws['!cols'] = [
      { wch: 8 },   // ID
      { wch: 30 },  // 活动标题
      { wch: 50 },  // 活动描述
      { wch: 12 },  // 分类
      { wch: 15 },  // 执行者
      { wch: 20 }   // 时间
    ];

    XLSX.utils.book_append_sheet(wb, ws, '活动日志');

    // 生成Excel文件
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=activity_logs_${project_id}_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);
  } catch (error) {
    console.error('导出活动日志失败:', error);
    res.status(500).json({
      success: false,
      message: '导出活动日志失败',
      error: error.message
    });
  }
});

export default router;
