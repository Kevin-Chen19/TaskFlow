<template>
  <div class="bigBox">
    <div class="bigTitle">{{ $t('team.projectTeam') }}</div>
    <div class="Line_two">
      <span class="smallText"> {{ $t('team.seeTeamHere') }}</span>
      <div class="searchBox">
        <el-input
          v-model="searchValue"
          style="width: 100%"
          :placeholder="$t('taskCard.searchByNameOr')"
          class="search-input"
          :prefix-icon="Search"
          @change="toFind"
        />
      </div>
    </div>
    <div class="teamBox">
      <div class="teamItem addItem" @click="inviteDialogVisible = true">
        <div class="addBox">
          <img src="@/assets/icons/加号.png" alt="加号" />
        </div>
        <div class="nameStyle">{{ $t('team.addNewMember') }}</div>
        <div class="positionStyle">{{ $t('team.inviteToJoin') }}</div>
        <div class="positionStyle">{{ $t('team.theProjectTeam') }}</div>
      </div>
      <div
        class="teamItem"
        v-for="item in showUsers"
        :key="item.userId"
        @click="chooseUser(item)"
      >
        <div class="picBox">
          <img :src="item.pic" alt="头像" />
        </div>
        <div class="nameStyle">{{ item.name }}</div>
        <div class="positionStyle">{{ item.postion }}</div>
        <div class="tags">
          <div
            class="tagItem"
            v-for="(value, index) in item.tags.slice(0, 3)"
            :key="index"
          >
            {{ value }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <el-drawer
    v-model="showDrawer"
    :modal="true"
    :close-on-click-modal="true"
    title="I am the title"
    :direction="direction"
    :before-close="handleClose"
    :size="drawerWidth"
  >
    <template #header="{ close, titleId, titleClass }">
      <h4 :id="titleId" :class="titleClass">{{ $t('team.memberDetails') }}</h4>
    </template>
    <div class="drawer_Box">
      <div class="drawer_picBox">
        <img :src="drawerUser.pic" alt="用户头像" />
      </div>
      <div class="drawer_Name">{{ drawerUser.name }}</div>
      <div class="drawer_Email">{{ drawerUser.email }}</div>
      <div
        class="drawer_Status"
        :class="{ drawer_Status_offline: drawerUser.status === 'offline' }"
      >
        {{ $t(drawerUser.status || '') }}
      </div>
      <div class="drawer_title">{{ $t('team.POSITION') }}</div>
      <div class="drawer_title drawer_Position">{{ drawerUser.postion }}</div>
      <div class="drawer_title">{{ $t('projects.ROLE') }}</div>
      <div class="drawer_title drawer_Position">
        <el-select
          v-model="drawerUser.role"
          :placeholder="$t('taskCard.Select')"
          style="width: 100%"
          class="drawer_select"
        >
          <el-option
            v-for="item in roleStore.allRoles"
            :key="item.roleName"
            :label="item.roleName"
            :value="item.roleName"
          />
        </el-select>
      </div>
      <div class="drawer_title">{{ $t('team.SIGNATURE') }}</div>
      <div class="drawer_Position">
        {{ drawerUser.signature }}
      </div>
      <div class="drawer_title">{{ $t('team.SKILLS') }}</div>
      <div class="tagsBox">
        <div class="tagsItem" v-for="(value, index) in drawerUser.tags" :key="index">
          {{ value }}
        </div>
      </div>
    </div>
    <template #footer>
      <div class="chatBtn">{{ $t('team.Chat') }}</div>
      <div class="chatBtn saveBtn">{{ $t('save') }}</div>
    </template>
  </el-drawer>
  <el-dialog
    v-model="inviteDialogVisible"
    :title="$t('team.InviteMembers')"
    width="700"
    align-center
  >
    <div class="line"></div>
    <div class="inputName">{{ $t('team.EMAILADRESS') }}</div>
    <el-input
      v-model="inviteData.emailContent"
      :placeholder="$t('pleaseEnterContent')"
    ></el-input>
    <div style="width: 100%; display: flex; justify-content: space-between">
      <div>
        <div class="inputName">{{ $t('team.ROLEASSIGNMENT') }}</div>
        <el-select
          v-model="inviteData.roleContent"
          :placeholder="$t('taskCard.Select')"
          style="width: 18rem"
        >
          <template #label="{ label, value }">
            <span
              >{{ label }}</span
            >
          </template>
          <el-option
            v-for="item in roles"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div>
        <div class="inputName">{{ $t('team.POSITION') }}</div>
        <el-select
          v-model="inviteData.positionContent"
          :placeholder="$t('taskCard.Select')"
          style="width: 18rem"
        >
          <template #label="{ label, value }">
            <span
              >{{ label }}</span
            >
          </template>
          <el-option
            v-for="item in positions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="inviteDialogVisible = false" class="cancelBtn">
          {{ $t('cancel') }}
        </el-button>
        <el-button type="primary" @click="submitInvite" class="confirmBtn">
          {{ $t('team.SendInvites') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import { useUserStore, type UserItem } from "@/stores/userStore";
import { ref, computed, onMounted, onUnmounted, reactive } from "vue";
import { useRoleStore } from "@/stores/roleStore";
const roleStore = useRoleStore();
const userStore = useUserStore();
const searchValue = ref("");
const showDrawer = ref(false);
const inviteDialogVisible = ref(false);
const windowWidth = ref(window.innerWidth);
const drawerUser = reactive<Partial<UserItem>>({});
const showUsers = reactive<UserItem[]>([]);
const direction = ref("rtl");

const handleClose = () => {
  showDrawer.value = false;
};
const inviteData = reactive({
  emailContent: "",
  roleContent:"",
  positionContent:""
})
const roles = [
  {
    label:"viewer",
    value:"viewer"
  },
  {
    label:"contributor",
    value:"contributor"
  },
   {
    label:"manager",
    value:"manager"
  }
]
const positions = [
  {
    label:"Front-end Lead",
    value:"Front-end Lead"
  },
  {
    label:"Backend Lead",
    value:"Backend Lead"
  },
   {
    label:"UI Designer",
    value:"UI Designer"
  },
   {
    label:"DevOps",
    value:"DevOps"
  }
]
// 根据屏幕宽度计算抽屉宽度
const drawerWidth = computed(() => {
  if (windowWidth.value < 768) {
    return "20rem"; // 移动端
  } else if (windowWidth.value < 1500) {
    return "20rem"; // 平板
  } else {
    return "20%"; // 桌面
  }
});
const roleOptions = [
  {
    value: "admin",
    label: "admin",
  },
  {
    value: "manager",
    label: "manager",
  },
  {
    value: "contributor",
    label: "contributor",
  },
  {
    value: "viewer",
    label: "viewer",
  },
];
const chooseUser = (user: UserItem) => {
  drawerUser.name = user.name;
  drawerUser.pic = user.pic;
  drawerUser.postion = user.postion;
  drawerUser.userId = user.userId;
  drawerUser.tags = user.tags;
  drawerUser.signature = user.signature;
  drawerUser.email = user.email;
  drawerUser.status = user.status;
  drawerUser.role = user.role;
  showDrawer.value = true;
};
// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};
const toFind = () => {
  if (searchValue.value === "") {
    showUsers.splice(0, showUsers.length, ...userStore.usersTable);
  } else {
    let newTable = [];
    for (let item of userStore.usersTable) {
      if (
        item.name.toLowerCase().includes(searchValue.value.toLowerCase()) ||
        item.postion.toLowerCase().includes(searchValue.value.toLowerCase())
      ) {
        newTable.push(item);
      }
    }
    // 将newTable赋值给showTable
    showUsers.splice(0, showUsers.length, ...newTable);
  }
};
const submitInvite = () => {
  inviteDialogVisible.value = false;
}
onMounted(() => {
  window.addEventListener("resize", handleResize);
  showUsers.push(...userStore.usersTable);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>
<style scoped lang="scss">
.searchInput {
  width: 20rem;
}
:deep(.search-input .el-input__wrapper) {
  background-color: #fff;
  border: none;
  border-radius: 0;
}
:deep(.search-input .el-input__wrapper:focus-within) {
  box-shadow: none;
  border: 2px solid black;
}
.teamItem {
  width: 23%;
  min-width: 15rem;
  height: 15rem;
  background-color: #fff;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1);
}
.teamItem:hover {
  border: 2px solid #175e82;
}
.addItem {
  background-color: transparent;
  border: 2px dotted #75adc8;
}
.addItem:hover {
  border: 2px dotted #035e8b;
}
.addBox {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 1px solid gray;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #fff;
  img {
    width: 50%;
  }
}
.picBox {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  img {
    width: 100%;
  }
}
.nameStyle {
  margin-top: 0.5rem;
  font-size: 1.2rem;
  font-weight: 500;
}
.positionStyle {
  font-size: 1rem;
  color: gray;
}
.tags {
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.tagItem {
  padding: 0.2rem 0.8rem;
  background-color: aliceblue;
  border-radius: 0.5rem;
  color: gray;
}
.drawer_Box {
  width: 100%;
  height: 100%;
  min-height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.drawer_picBox {
  margin-top: 2rem;
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  img {
    width: 100%;
  }
}
.drawer_Name {
  margin-top: 1rem;
  font-size: 1.5rem;
  font-weight: 500;
}
.drawer_Email {
  font-size: 1rem;
  color: gray;
}
.drawer_Status {
  margin-top: 0.5rem;
  font-size: 1rem;
  padding: 0.2rem 1.5rem;
  background-color: rgba(33, 230, 33, 0.79);
  border-radius: 0.7rem;
  color: rgb(16, 123, 16);
}
.drawer_Status_offline {
  background-color: rgba(246, 104, 104, 0.79);
  color: rgb(201, 4, 4);
}
.drawer_title {
  width: 90%;
  margin-top: 1rem;
  font-size: 1rem;
  color: gray;
  font-weight: 500;
}
.drawer_Position {
  margin-top: 0.5rem;
  box-sizing: border-box;
  background-color: #f7f8f9;
  color: #717885;
  padding: 0.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 90%;
  border: 1px solid rgb(206, 202, 202);
}
.tagsBox {
  margin-top: 1rem;
  width: 90%;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.tagsItem {
  padding: 0.2rem 0.8rem;
  background-color: #f7f8f9;
  border-radius: 0.5rem;
  color: #717885;
}
.chatBtn {
  width: 90%;
  box-sizing: border-box;
  margin-left: 5%;
  display: flex;
  justify-content: center;
  background-color: #175e82;
  color: #fff;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 5px 5px 10px rgb(0, 0, 0, 0.2);
  cursor: pointer;
}
.chatBtn:hover {
  background-color: #04537b;
}
.saveBtn {
  margin-top: 1rem;
  background-color: rgba(56, 240, 56, 0.79);
  color: rgb(16, 123, 16);
}
.saveBtn:hover {
  background-color: rgba(22, 234, 22, 0.79);
}
:deep(.drawer_select .el-select__wrapper) {
  background-color: transparent;
  box-shadow: none;
}
:deep(.el-input__wrapper) {
  box-sizing: border-box;
  height: 2rem !important;
  border-radius: 0 !important;
  padding: 0.2rem 0.5rem !important;
  background-color: #fff !important;
  border: 1px solid #ccc;
  box-shadow: none;
}
:deep(.el-input__inner) {
  font-weight: 500;
  font-size: 1rem;
}
.cancelBtn {
  height: 2.5rem;
  border: none;
  font-weight: 600;
  font-size: larger;
  margin-right: 2rem;
  padding: 0 1.5rem;
}
.cancelBtn:hover {
  background-color: #b5b7b8a9;
  color: white;
}
.confirmBtn {
  height: 2.5rem;
  background-color: #175e82;
  color: white;
  font-weight: 600;
  font-size: larger;
  margin-right: 2rem;
  border-radius: 0.5rem;
  padding: 0 1.5rem;
}
.confirmBtn:hover{
    background-color: #3bade7;
}
</style>
