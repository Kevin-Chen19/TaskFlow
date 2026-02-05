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
const allpositions = reactive([
  {
    positionName: "Front-end Developer",
    positionMess: "Responsible for implementing visual elements that users see and interact with.Requires expertise in Vue3.",
    count: 2 
  },
   {
    positionName: "Backend Engineer",
    positionMess: "Focuses on server-side logic,definition and maintenance of the central database,and ensuring high performance and responsiveness.",
    count: 3 
  },
   {
    positionName: "QA Tester",
    positionMess: "Executes test cases to diagnose issues and bugs,verifies fixes,and ensures product quality standards are met.",
    count: 2 
  },
   {
    positionName: "UI Designer",
    positionMess: "Designs user interfaces for web and mobile applications,creating intuitive and visually appealing user experiences.",
    count: 1 
  }
])

return { allRoles, allpositions}
})