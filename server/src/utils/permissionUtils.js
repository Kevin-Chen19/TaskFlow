/**
 * 权限工具函数
 * 用于检查用户在项目中的权限
 */
import { query } from '../config/database.js';

/**
 * 检查用户是否是项目创建者
 * @param {number} projectId - 项目ID
 * @param {number} userId - 用户ID
 * @returns {Promise<boolean>}
 */
export const isProjectOwner = async (projectId, userId) => {
  const result = await query(
    'SELECT owner_id FROM projects WHERE id = $1',
    [projectId]
  );
  return result.rows[0]?.owner_id === userId;
};

/**
 * 获取用户在项目中的角色权限
 * @param {number} projectId - 项目ID
 * @param {number} userId - 用户ID
 * @returns {Promise<Object|null>} 返回权限设置对象，如果不是项目成员则返回null
 */
export const getUserPermissions = async (projectId, userId) => {
  // 1. 检查是否是项目创建者
  const isOwner = await isProjectOwner(projectId, userId);
  if (isOwner) {
    // 项目创建者拥有所有权限
    return {
      isOwner: true,
      canEditMilestones: true,
      canCreateTasks: true,
      canDeleteTasks: true,
      canEditAllTasks: true,
      canEditOwnTasks: true,
      canInviteMembers: true,
      canDeleteMembers: true,
      canManageRoles: true,
      canManagePositions: true,
      canCreateDocuments: true,
      canDeleteDocuments: true,
    };
  }

  // 2. 获取用户的角色权限
  const result = await query(
    `SELECT pm.role, pr.settings 
     FROM project_members pm
     LEFT JOIN project_roles pr ON pm.role = pr.rolename AND pr.project_id = pm.project_id
     WHERE pm.project_id = $1 AND pm.user_id = $2 AND pm.is_active = true`,
    [projectId, userId]
  );

  if (result.rows.length === 0) {
    return null; // 不是项目成员
  }

  let settings = result.rows[0]?.settings || {};
  
  // 如果 settings 是字符串，解析为 JSON
  if (typeof settings === 'string') {
    try {
      settings = JSON.parse(settings);
    } catch (e) {
      console.error('解析权限设置失败:', e);
      settings = {};
    }
  }
  
  // 解析权限设置
  return {
    isOwner: false,
    canEditMilestones: settings.edit_timeline === true,
    canCreateTasks: settings.create_tasks === true,
    canDeleteTasks: settings.delete_tasks === true,
    canEditAllTasks: settings.edit_all_tasks === true,
    canEditOwnTasks: settings.edit_own_tasks === true,
    canInviteMembers: settings.invite_members === true,
    canDeleteMembers: settings.delete_members === true,
    canManageRoles: settings.manage_roles === true,
    canManagePositions: settings.manage_positions === true,
    canCreateDocuments: settings.create_documents === true,
    canDeleteDocuments: settings.delete_documents === true,
  };
};

/**
 * 检查用户是否有特定权限
 * @param {Object} permissions - 权限对象
 * @param {string} permissionKey - 权限键名
 * @returns {boolean}
 */
export const hasPermission = (permissions, permissionKey) => {
  if (!permissions) return false;
  if (permissions.isOwner) return true; // 项目创建者拥有所有权限
  return permissions[permissionKey] === true;
};
