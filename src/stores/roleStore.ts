import { reactive } from 'vue'
import { defineStore } from 'pinia'

export const useRoleStore = defineStore('role', () => {
  const allRoles = reactive([
  {
    roleName: "Project Manager",
    roleMess: "Full control over project lifecycles and team allocations.",
    //任务权限
    tasksData: [
      {
        label: "Create Tasks",
        value: false,
      },
      {
        label: "Delete Tasks",
        value: false,
      },
      {
        label: "Edit All Tasks",
        value: false,
      },
      {
        label: "Edit Own Tasks",
        value: false,
      },
      {
        label: "Edit Time Line",
        value: false,
      },
    ],
    //成员权限
    membersData: [
      {
        label: "Invite Members",
        value: false,
      },
      {
        label: "Delete Members",
        value: false,
      },
      {
        label: "Manage Roles",
        value: false,
      },
      {
        label: "Manage Positions",
        value: false,
      },
    ],
    //协作权限(文件权限默认创建者有删除的权限,回收站同理)
    documentsData: [
      {
        label: "Create Documents",
        value: false,
      },
      {
        label: "Delete All Documents",
        value: false,
      },
      {
        label: "Chat",
        value: false,
      },
    ],
  },
  {
    roleName: "Contributor",
    roleMess: "Standard role for team members executing tasks.",
    //任务权限
    tasksData: [
      {
        label: "Create Tasks",
        value: false,
      },
      {
        label: "Delete Tasks",
        value: false,
      },
      {
        label: "Edit All Tasks",
        value: false,
      },
      {
        label: "Edit Own Tasks",
        value: false,
      },
      {
        label: "Edit Time Line",
        value: false,
      },
    ],
    //成员权限
    membersData: [
      {
        label: "Invite Members",
        value: false,
      },
      {
        label: "Delete Members",
        value: false,
      },
      {
        label: "Manage Roles",
        value: false,
      },
      {
        label: "Manage Positions",
        value: false,
      },
    ],
    //协作权限(文件权限默认创建者有删除的权限,回收站同理)
    documentsData: [
      {
        label: "Create Documents",
        value: false,
      },
      {
        label: "Delete All Documents",
        value: false,
      },
      {
        label: "Chat",
        value: false,
      },
    ],
  },
  {
    roleName: "viewer",
    roleMess: "External clients or internal stakeholders",
    //任务权限
    tasksData: [
      {
        label: "Create Tasks",
        value: false,
      },
      {
        label: "Delete Tasks",
        value: false,
      },
      {
        label: "Edit All Tasks",
        value: false,
      },
      {
        label: "Edit Own Tasks",
        value: false,
      },
      {
        label: "Edit Time Line",
        value: false,
      },
    ],
    //成员权限
    membersData: [
      {
        label: "Invite Members",
        value: false,
      },
      {
        label: "Delete Members",
        value: false,
      },
      {
        label: "Manage Roles",
        value: false,
      },
      {
        label: "Manage Positions",
        value: false,
      },
    ],
    //协作权限(文件权限默认创建者有删除的权限,回收站同理)
    documentsData: [
      {
        label: "Create Documents",
        value: false,
      },
      {
        label: "Delete All Documents",
        value: false,
      },
      {
        label: "Chat",
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