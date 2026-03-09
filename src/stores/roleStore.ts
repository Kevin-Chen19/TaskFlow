import { reactive } from 'vue'
import { defineStore } from 'pinia'
import i18n from '@/language';
export const useRoleStore = defineStore('role', () => {
  const t = i18n.global.t
  const allRoles = reactive([
  {
    roleName: "Project Manager",
    roleMess: "Full control over project lifecycles and team allocations.",
    //任务权限
    tasksData: [
      {
        label: t('roleStore.CreateTasks'),
        value: true,
      },
      {
        label: t('roleStore.DeleteTasks'),
        value: true,
      },
      {
        label: t('roleStore.EditAllTasks'),
        value: true,
      },
      {
        label: t('roleStore.EditOwnTasks'),
        value: true,
      },
      {
        label: t('roleStore.EditProjectMilestones'),
        value: true,
      },
    ],
    //成员权限
    membersData: [
      {
        label: t('roleStore.InviteMembers'),
        value: true,
      },
      {
        label: t('roleStore.DeleteMembers'),
        value: true,
      },
      {
        label: t('roleStore.ManageRoles'),
        value: true,
      },
      {
        label: t('roleStore.ManagePositions'),
        value: true,
      },
    ],
    //协作权限(文件权限默认创建者有删除的权限,回收站同理)
    documentsData: [
      {
        label: t('roleStore.CreateDocuments'),
        value: true,
      },
      {
        label: t('roleStore.DeleteAllDocuments'),
        value: true,
      },
      {
        label: t('roleStore.Chat'),
        value: true,
      },
    ],
  },
  {
    roleName: "Participants",
    roleMess: "Standard role for team members executing tasks.",
   //任务权限
    tasksData: [
      {
        label: t('roleStore.CreateTasks'),
        value: false,
      },
      {
        label: t('roleStore.DeleteTasks'),
        value: false,
      },
      {
        label: t('roleStore.EditAllTasks'),
        value: false,
      },
      {
        label: t('roleStore.EditOwnTasks'),
        value: true,
      },
      {
        label: t('roleStore.EditProjectMilestones'),
        value: false,
      },
    ],
    //成员权限
    membersData: [
      {
        label: t('roleStore.InviteMembers'),
        value: true,
      },
      {
        label: t('roleStore.DeleteMembers'),
        value: false,
      },
      {
        label: t('roleStore.ManageRoles'),
        value: false,
      },
      {
        label: t('roleStore.ManagePositions'),
        value: false,
      },
    ],
    //协作权限(文件权限默认创建者有删除的权限,回收站同理)
    documentsData: [
      {
        label: t('roleStore.CreateDocuments'),
        value: true,
      },
      {
        label: t('roleStore.DeleteAllDocuments'),
        value: false,
      },
      {
        label: t('roleStore.Chat'),
        value: true,
      },
    ],
  },
  {
    roleName: "Viewer",
    roleMess: "External clients or internal stakeholders",
    //任务权限
    tasksData: [
      {
        label: t('roleStore.CreateTasks'),
        value: false,
      },
      {
        label: t('roleStore.DeleteTasks'),
        value: false,
      },
      {
        label: t('roleStore.EditAllTasks'),
        value: false,
      },
      {
        label: t('roleStore.EditOwnTasks'),
        value: false,
      },
      {
        label: t('roleStore.EditProjectMilestones'),
        value: false,
      },
    ],
    //成员权限
    membersData: [
      {
        label: t('roleStore.InviteMembers'),
        value: false,
      },
      {
        label: t('roleStore.DeleteMembers'),
        value: false,
      },
      {
        label: t('roleStore.ManageRoles'),
        value: false,
      },
      {
        label: t('roleStore.ManagePositions'),
        value: false,
      },
    ],
    //协作权限(文件权限默认创建者有删除的权限,回收站同理)
    documentsData: [
      {
        label: t('roleStore.CreateDocuments'),
        value: false,
      },
      {
        label: t('roleStore.DeleteAllDocuments'),
        value: false,
      },
      {
        label: t('roleStore.Chat'),
        value: false,
      },
    ],
  },
]);
const allpositions = reactive([])

return { allRoles, allpositions}
})