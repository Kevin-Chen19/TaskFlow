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

      let projectId = req.body?.project_id || req.params?.projectId || req.query?.project_id;
      
      // 如果没有 project_id，但有ID参数，则尝试从各个表中查询 project_id
      if (!projectId && req.params?.id) {
        const id = req.params.id;
        
        // 尝试从 tasks 表查询
        const taskResult = await query(
          'SELECT project_id, creator_id FROM tasks WHERE id = $1',
          [id]
        );
        if (taskResult.rows.length > 0) {
          projectId = taskResult.rows[0].project_id;
          req.taskCreatorId = taskResult.rows[0].creator_id;
        } else {
          // 尝试从 project_roles 表查询
          const roleResult = await query(
            'SELECT project_id FROM project_roles WHERE id = $1',
            [id]
          );
          if (roleResult.rows.length > 0) {
            projectId = roleResult.rows[0].project_id;
          } else {
            // 尝试从 project_positions 表查询
            const positionResult = await query(
              'SELECT project_id FROM project_positions WHERE id = $1',
              [id]
            );
            if (positionResult.rows.length > 0) {
              projectId = positionResult.rows[0].project_id;
            } else {
              // 尝试从 milestones 表查询
              const milestoneResult = await query(
                'SELECT project_id FROM milestones WHERE id = $1',
                [id]
              );
              if (milestoneResult.rows.length > 0) {
                projectId = milestoneResult.rows[0].project_id;
              }
            }
          }
        }
      }
      
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

/**
 * 检查创建任务权限
 */
export const checkCreateTaskPermission = createPermissionMiddleware(
  'canCreateTasks',
  '您没有权限创建任务'
);

/**
 * 检查编辑任务权限（包括编辑所有任务、任务创建者或被分配者）
 * 规则：
 * 1. 有 canEditAllTasks 权限的可以编辑任何任务
 * 2. 任务创建者默认可以编辑自己的任务
 * 3. 被分配任务的用户可以更新任务进度
 * 4. 删除任务权限与编辑任务权限相同（仅创建者和有编辑所有任务权限的用户）
 */
export const checkEditTaskPermission = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    let projectId = req.body?.project_id || req.params?.projectId || req.query?.project_id;
    let taskCreatorId = null;
    let assigneeIds = [];
    
    // 如果没有 project_id，但有任务ID，则从数据库查询任务信息
    if (!projectId && req.params?.id) {
      const taskResult = await query(
        'SELECT project_id, creator_id, assignee_ids FROM tasks WHERE id = $1',
        [req.params.id]
      );
      if (taskResult.rows.length > 0) {
        projectId = taskResult.rows[0].project_id;
        taskCreatorId = taskResult.rows[0].creator_id;
        assigneeIds = taskResult.rows[0].assignee_ids || [];
      }
    }
    
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

    // 检查是否有编辑所有任务的权限
    if (hasPermission(permissions, 'canEditAllTasks')) {
      req.userPermissions = permissions;
      req.canEditFullTask = true;
      return next();
    }

    // 任务创建者默认拥有完整编辑权限
    if (taskCreatorId === userId) {
      req.userPermissions = permissions;
      req.canEditFullTask = true;
      return next();
    }

    // 被分配任务的用户可以更新进度（但只能更新进度字段）
    if (assigneeIds.includes(userId)) {
      req.userPermissions = permissions;
      req.canEditFullTask = false; // 标记为只能更新进度
      return next();
    }

    return res.status(403).json({
      success: false,
      message: '您没有权限编辑此任务'
    });
    
  } catch (error) {
    console.error('权限检查失败:', error);
    return res.status(500).json({
      success: false,
      message: '权限检查失败',
      error: error.message
    })
  }
};

/**
 * 检查删除任务权限
 * 删除任务权限：只有任务创建者和有编辑所有任务权限的用户可以删除
 */
export const checkDeleteTaskPermission = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    let projectId = req.body?.project_id || req.params?.projectId || req.query?.project_id;
    let taskCreatorId = null;
    
    // 如果没有 project_id，但有任务ID，则从数据库查询任务信息
    if (!projectId && req.params?.id) {
      const taskResult = await query(
        'SELECT project_id, creator_id FROM tasks WHERE id = $1',
        [req.params.id]
      );
      if (taskResult.rows.length > 0) {
        projectId = taskResult.rows[0].project_id;
        taskCreatorId = taskResult.rows[0].creator_id;
      }
    }
    
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

    // 检查是否有编辑所有任务的权限
    if (hasPermission(permissions, 'canEditAllTasks')) {
      req.userPermissions = permissions;
      return next();
    }

    // 任务创建者可以删除自己的任务
    if (taskCreatorId === userId) {
      req.userPermissions = permissions;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: '您没有权限删除此任务'
    });
    
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
 * 检查邀请成员权限
 */
export const checkInviteMemberPermission = createPermissionMiddleware(
  'canInviteMembers',
  '您没有权限邀请成员加入项目'
);

/**
 * 检查删除成员权限
 */
export const checkDeleteMemberPermission = createPermissionMiddleware(
  'canDeleteMembers',
  '您没有权限删除项目成员'
);

/**
 * 检查管理角色权限
 */
export const checkManageRolesPermission = createPermissionMiddleware(
  'canManageRoles',
  '您没有权限管理项目角色'
);

/**
 * 检查管理职位权限
 */
export const checkManagePositionsPermission = createPermissionMiddleware(
  'canManagePositions',
  '您没有权限管理项目职位'
);
