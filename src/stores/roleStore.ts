import { reactive } from 'vue'
import { defineStore } from 'pinia'
import {
  getProjectRoles,
  createProjectRole,
  updateProjectRole,
  deleteProjectRole
} from '@/api';

export interface PermissionSwitch {
  label: string;
  value: boolean;
}

export interface RoleItem {
  id?: number;
  roleName: string;
  roleMess: string;
  tasksData: PermissionSwitch[];
  membersData: PermissionSwitch[];
  documentsData: PermissionSwitch[];
}

// 将后端 settings 数据转换为前端 RoleItem 格式（不使用翻译）
const transformBackendRole = (backendRole: any): RoleItem => {
  const settings = backendRole.settings || {};

  return {
    id: backendRole.id,
    roleName: backendRole.rolename || '',
    roleMess: backendRole.description || '',
    tasksData: [
      { label: 'CreateTasks', value: settings.create_tasks || false },
      { label: 'DeleteTasks', value: settings.delete_tasks || false },
      { label: 'EditAllTasks', value: settings.edit_all_tasks || false },
      { label: 'EditOwnTasks', value: settings.edit_own_tasks || false },
      { label: 'EditProjectMilestones', value: settings.edit_timeline || false },
    ],
    membersData: [
      { label: 'InviteMembers', value: settings.invite_members || false },
      { label: 'DeleteMembers', value: settings.delete_members || false },
      { label: 'ManageRoles', value: settings.manage_roles || false },
      { label: 'ManagePositions', value: settings.manage_positions || false },
    ],
    documentsData: [
      { label: 'CreateDocuments', value: settings.create_documents || false },
      { label: 'DeleteAllDocuments', value: settings.delete_documents || false },
      { label: 'Chat', value: settings.chat || false },
    ],
  };
};

// 将前端 RoleItem 转换为后端 settings 格式
const transformRoleToSettings = (role: RoleItem) => {
  return {
    create_tasks: role.tasksData[0]?.value || false,
    delete_tasks: role.tasksData[1]?.value || false,
    edit_all_tasks: role.tasksData[2]?.value || false,
    edit_own_tasks: role.tasksData[3]?.value || false,
    edit_timeline: role.tasksData[4]?.value || false,
    invite_members: role.membersData[0]?.value || false,
    delete_members: role.membersData[1]?.value || false,
    manage_roles: role.membersData[2]?.value || false,
    manage_positions: role.membersData[3]?.value || false,
    create_documents: role.documentsData[0]?.value || false,
    delete_documents: role.documentsData[1]?.value || false,
    chat: role.documentsData[2]?.value || false,
  };
};

export const useRoleStore = defineStore('role', () => {
  const allRoles = reactive<RoleItem[]>([]);
  const allpositions = reactive<any[]>([]);

  // 加载项目角色列表
  const loadRoles = async (projectId: number) => {
    try {
      const res: any = await getProjectRoles({ project_id: projectId });
      if (res.success && res.data) {
        allRoles.splice(0, allRoles.length, ...res.data.map((item: any) => transformBackendRole(item)));
        console.log('项目角色数据加载完成:', allRoles);
      }
    } catch (error) {
      console.error('加载角色数据失败:', error);
    }
  };

  // 创建角色
  const createRole = async (projectId: number, role: RoleItem) => {
    try {
      const settings = transformRoleToSettings(role);
      const res: any = await createProjectRole({
        project_id: projectId,
        rolename: role.roleName,
        description: role.roleMess,
        settings
      });
      if (res.success && res.data) {
        const newRole = transformBackendRole(res.data);
        allRoles.unshift(newRole);
        return { success: true, data: newRole };
      }
      return { success: false, message: '创建角色失败' };
    } catch (error) {
      console.error('创建角色失败:', error);
      return { success: false, message: '创建角色失败' };
    }
  };

  // 更新角色
  const updateRole = async (roleId: number, role: RoleItem) => {
    try {
      const settings = transformRoleToSettings(role);
      const res: any = await updateProjectRole(roleId, {
        rolename: role.roleName,
        description: role.roleMess,
        settings
      });
      if (res.success && res.data) {
        const index = allRoles.findIndex(r => r.id === roleId);
        if (index !== -1) {
          const updatedRole = transformBackendRole(res.data);
          allRoles[index] = updatedRole;
          return { success: true, data: updatedRole };
        }
        return { success: true };
      }
      return { success: false, message: '更新角色失败' };
    } catch (error) {
      console.error('更新角色失败:', error);
      return { success: false, message: '更新角色失败' };
    }
  };

  // 仅更新角色权限设置（不修改角色名称和描述）
  const updateRoleSettings = async (roleId: number, role: RoleItem) => {
    try {
      const settings = transformRoleToSettings(role);
      const res: any = await updateProjectRole(roleId, {
        settings
      });
      if (res.success && res.data) {
        const index = allRoles.findIndex(r => r.id === roleId);
        if (index !== -1) {
          const currentRole = allRoles[index];
          if (currentRole) {
            // 只更新权限设置部分
            allRoles[index] = {
              ...currentRole,
              ...transformBackendRole({ ...res.data, rolename: currentRole.roleName, description: currentRole.roleMess })
            };
          }
          return { success: true };
        }
        return { success: true };
      }
      return { success: false, message: '更新权限设置失败' };
    } catch (error) {
      console.error('更新权限设置失败:', error);
      return { success: false, message: '更新权限设置失败' };
    }
  };

  // 删除角色
  const deleteRole = async (roleId: number) => {
    try {
      const res: any = await deleteProjectRole(roleId);
      if (res.success) {
        const index = allRoles.findIndex(r => r.id === roleId);
        if (index !== -1) {
          allRoles.splice(index, 1);
        }
        return { success: true };
      }
      return { success: false, message: '删除角色失败' };
    } catch (error) {
      console.error('删除角色失败:', error);
      return { success: false, message: '删除角色失败' };
    }
  };

  return {
    allRoles,
    allpositions,
    loadRoles,
    createRole,
    updateRole,
    updateRoleSettings,
    deleteRole
  };
})