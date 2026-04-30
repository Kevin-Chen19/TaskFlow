import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 权限常量
export const PERMISSIONS = {
  EDIT_MILESTONES: 'canEditMilestones',
  CREATE_TASKS: 'canCreateTasks',
  EDIT_ALL_TASKS: 'canEditAllTasks',
  INVITE_MEMBERS: 'canInviteMembers',
  DELETE_MEMBERS: 'canDeleteMembers',
  MANAGE_ROLES: 'canManageRoles',
  MANAGE_POSITIONS: 'canManagePositions',
  CREATE_DOCUMENTS: 'canCreateDocuments',
  DELETE_DOCUMENTS: 'canDeleteDocuments',
} as const;

export const usePermissionStore = defineStore('permission', () => {
  // State
  const userPermissions = ref<Record<string, boolean> | null>(null);
  const isProjectOwner = ref(false);
  const currentProjectId = ref<number | null>(null);
  const loading = ref(false);

  // Getters
  const canEditMilestones = computed(() => {
    return isProjectOwner.value || userPermissions.value?.canEditMilestones === true;
  });

  const canCreateTasks = computed(() => {
    return isProjectOwner.value || userPermissions.value?.canCreateTasks === true;
  });

  const canEditAllTasks = computed(() => {
    return isProjectOwner.value || userPermissions.value?.canEditAllTasks === true;
  });

  const canInviteMembers = computed(() => {
    return isProjectOwner.value || userPermissions.value?.canInviteMembers === true;
  });

  const canDeleteMembers = computed(() => {
    return isProjectOwner.value || userPermissions.value?.canDeleteMembers === true;
  });

  const canManageRoles = computed(() => {
    return isProjectOwner.value || userPermissions.value?.canManageRoles === true;
  });

  const canManagePositions = computed(() => {
    return isProjectOwner.value || userPermissions.value?.canManagePositions === true;
  });

  const canCreateDocuments = computed(() => {
    return isProjectOwner.value || userPermissions.value?.canCreateDocuments === true;
  });

  const canDeleteDocuments = computed(() => {
    return isProjectOwner.value || userPermissions.value?.canDeleteDocuments === true;
  });

  // Actions
  const loadPermissions = async (projectId: number, forceRefresh: boolean = false) => {
    if (!projectId) return;
    
    // 如果已经加载过相同项目的权限且不需要强制刷新，直接返回
    if (!forceRefresh && currentProjectId.value === projectId && userPermissions.value !== null) {
      return;
    }

    loading.value = true;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/project-members/permissions/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        userPermissions.value = result.data.permissions || {};
        isProjectOwner.value = result.data.isOwner || false;
        currentProjectId.value = projectId;
      }
    } catch (error) {
      console.error('加载权限失败:', error);
      userPermissions.value = null;
      isProjectOwner.value = false;
    } finally {
      loading.value = false;
    }
  };

  // 刷新当前项目的权限（用于权限变更后）
  const refreshPermissions = async () => {
    if (currentProjectId.value) {
      await loadPermissions(currentProjectId.value, true);
    }
  };

  const clearPermissions = () => {
    userPermissions.value = null;
    isProjectOwner.value = false;
    currentProjectId.value = null;
  };

  return {
    // State
    userPermissions,
    isProjectOwner,
    currentProjectId,
    loading,
    // Getters
    canEditMilestones,
    canCreateTasks,
    canEditAllTasks,
    canInviteMembers,
    canDeleteMembers,
    canManageRoles,
    canManagePositions,
    canCreateDocuments,
    canDeleteDocuments,
    // Actions
    loadPermissions,
    refreshPermissions,
    clearPermissions,
  };
});
