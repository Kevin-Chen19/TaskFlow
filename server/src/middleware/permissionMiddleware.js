/**
 * 权限检查中间件
 */
import { query } from '../config/database.js';
import { getUserPermissions, hasPermission } from '../utils/permissionUtils.js';

/**
 * 检查里程碑编辑权限
 * 需要的权限：canEditMilestones 或者是项目创建者
 */
export const checkMilestonePermission = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    // 从请求中获取 project_id
    let projectId = req.body?.project_id || req.params?.projectId || req.query?.project_id;
    
    // 如果没有 project_id，但有里程碑ID，则从数据库查询 project_id
    if (!projectId && req.params?.id) {
      const milestoneResult = await query(
        'SELECT project_id FROM milestones WHERE id = $1',
        [req.params.id]
      );
      if (milestoneResult.rows.length > 0) {
        projectId = milestoneResult.rows[0].project_id;
      }
    }
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: '项目ID不能为空'
      });
    }

    // 获取用户权限
    const permissions = await getUserPermissions(parseInt(projectId), userId);
    
    if (!permissions) {
      return res.status(403).json({
        success: false,
        message: '您不是该项目的成员'
      });
    }

    // 检查是否有编辑里程碑的权限
    if (!hasPermission(permissions, 'canEditMilestones')) {
      return res.status(403).json({
        success: false,
        message: '您没有权限编辑项目里程碑'
      });
    }

    // 将权限信息附加到请求对象，供后续使用
    req.userPermissions = permissions;
    next();
    
  } catch (error) {
    console.error('权限检查失败:', error);
    return res.status(500).json({
      success: false,
      message: '权限检查失败',
      error: error.message
    });
  }
};

/**
 * 通用的权限检查中间件工厂
 * @param {string} permissionKey - 权限键名
 * @param {string} errorMessage - 错误提示信息
 */
export const createPermissionMiddleware = (permissionKey, errorMessage = '没有权限执行此操作') => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未登录'
        });
      }

      const projectId = req.body?.project_id || req.params?.projectId || req.query?.project_id;
      
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: '项目ID不能为空'
        });
      }

      const permissions = await getUserPermissions(parseInt(projectId), userId);
      
      if (!permissions) {
        return res.status(403).json({
          success: false,
          message: '您不是该项目的成员'
        });
      }

      if (!hasPermission(permissions, permissionKey)) {
        return res.status(403).json({
          success: false,
          message: errorMessage
        });
      }

      req.userPermissions = permissions;
      next();
      
    } catch (error) {
      console.error('权限检查失败:', error);
      return res.status(500).json({
        success: false,
        message: '权限检查失败',
        error: error.message
      });
    }
  };
};
