<template>
  <div class="bigBox">
    <div class="bigTitle" style="">Role & Position Management</div>
    <span class="smallText">
      Manage access levels, granular capabilities,and technical job titles
      for</span
    >
    <br />
    <span class="smallText"> team members across the organization.</span>
    <div class="Line_two bottomLine">
      <div class="changeBox">
        <div
          class="changeItem"
          @click="chooseWhich = 0"
          :class="chooseWhich == 0 ? 'chooseItem' : ''"
        >
          Permission Roles
        </div>
        <div
          class="changeItem"
          @click="chooseWhich = 1"
          :class="chooseWhich == 1 ? 'chooseItem' : ''"
        >
          Position Titles
        </div>
      </div>
      <div class="addBtn">+ Add new Role</div>
    </div>
    <div class="teamBox">
      <div class="RoleItem" v-for="(item, index) in allRoles" :key="index">
        <div class="roleTitle">{{ item.roleName }}</div>
        <div class="roleMess">{{ item.roleMess }}</div>
        <div class="switchBigBox">
          <div class="roleItem_Kind">PROJECT ACCESS</div>
          <div
            class="switchBox"
            v-for="(lowItem, index) in item.tasksData"
            :key="index"
          >
            <div>{{ lowItem.label }}</div>
            <el-switch
              v-model="lowItem.value"
              style="--el-switch-on-color: #2eb867"
            />
          </div>
          <div class="roleItem_Kind">TEAM & PEOPLE</div>
          <div
            class="switchBox"
            v-for="(lowItem, index) in item.membersData"
            :key="index"
          >
            <div>{{ lowItem.label }}</div>
            <el-switch
              v-model="lowItem.value"
              style="--el-switch-on-color: #2eb867"
            />
          </div>
          <div class="roleItem_Kind">COLLABORATION</div>
          <div
            class="switchBox"
            v-for="(lowItem, index) in item.documentsData"
            :key="index"
          >
            <div>{{ lowItem.label }}</div>
            <el-switch
              v-model="lowItem.value"
              style="--el-switch-on-color: #2eb867"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from "vue";
const chooseWhich = ref(0);
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
</script>
<style scoped lang="scss">
.changeBox {
  display: flex;
}
.bottomLine {
  margin-top: 1rem;
  border-bottom: 1px solid rgba(161, 159, 159, 0.791);
}
.changeItem {
  padding: 1rem 0;
  margin-right: 2rem;
  cursor: pointer;
}
.chooseItem {
  color: green;
  border-bottom: 2px solid green;
}
.addBtn {
  margin-bottom: 0.5rem;
  background-color: #2eb867;
  cursor: pointer;
  color: #fff;
  border-radius: 0.5rem;
  padding: 0.5rem 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 5px 5px 4px rgba(0, 0, 0, 0.1);
}
.addBtn:hover {
  background-color: #279d5cde;
}
.RoleItem {
  box-sizing: border-box;
  width: 31.5%;
  min-width: 15rem;
  height: 25rem;
  background-color: #fff;

  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}
.roleTitle {
  font-size: 1.2rem;
  font-weight: 600;
}
.roleMess {
  width: 100%;
  margin-top: 0.5rem;
  font-size: small;
  color: gray;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(200, 197, 197, 0.791);
  //设置文本不换行，超出范围省略号表示
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.switchBigBox {
  width: 100%;
  height: 80%;
  overflow: auto;
  /* 隐藏标准滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.roleItem_Kind {
  margin: 0.8rem 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: gray;
}
.switchBox {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
