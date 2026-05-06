<template>
  <div class="line"></div>
  <div class="formBox">
    <el-input
      v-model="projectData.projectName"
      class="custom-input"
      :placeholder="$t('newPeojectCard.ProjectName')"
    />
    <div class="inputName">{{ $t('newPeojectCard.ProjectGoal') }} / {{ $t('newPeojectCard.Description') }}</div>
    <el-input
      v-model="projectData.description"
      style="width: 100%"
      :rows="5"
      type="textarea"
      resize="none"
      :placeholder="$t('newPeojectCard.Brieflydescribe')"
      class="description-input"
    />
    <!-- 只有当用户有项目时才显示邀请成员部分 -->
    <template v-if="otherStore.hasProject">
      <div class="inputName">{{ $t('newPeojectCard.InviteTeamMembers') }}</div>
      <el-input
        v-model="searchValue"
        style="width: 100%"
        :placeholder="$t('taskCard.searchByNameOr')"
        class="search-input"
        :prefix-icon="Search"
        @change="toFind"
      />
      <div class="teamTable">
        <div class="team_item" v-for="item in showTable" :key="item.userId">
          <div class="noteSelect" @click="changeGot(item.userId)">
            <img
              v-if="projectData.assignee.includes(item.userId)"
              src="@/assets/icons/通过.png"
              alt="通过图标"
            />
          </div>
          <div class="noteItem">
            <div class="userPic">
              <img :src="item.pic" alt="用户头像" />
            </div>
            <div class="userInfo">
              <div class="userName">{{ item.name }}</div>
              <div class="userOthers">
                <div class="postion">{{ item.postion }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, watch } from "vue";
import { Search } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/userStore";
import { useOtherStore } from "@/stores/otherStore";

interface Project {
  id: string;
  projectName: string;
  description: string;
  createLine: string;
  createUser: string;
  assignee: string[];
}

interface UserItem {
  name: string;
  postion: string;
  percentage: number;
  pic: string;
  userId: string;
}

interface projectData {
  projectName: string;
  description: string;
  createLine: string;
  createUser: string;
  assignee: string[];
}

const userStore = useUserStore();
const otherStore = useOtherStore();
const searchValue = ref("");
const showTable = reactive<UserItem[]>([]);
const projectData = reactive<projectData>({
  projectName: "",
  description: "",
  createLine: "",
  createUser: "",
  assignee: []
});

//初始组件时过滤掉当前用户，将userStore.usersTable赋值给showTable
onMounted(() => {
  // 等待 userStore 初始化完成
  const initShowTable = () => {
    const currentUserId = userStore.user?.userId;
    console.log('当前用户ID:', currentUserId, '类型:', typeof currentUserId);
    console.log('所有用户:', userStore.usersTable);
    
    if (!currentUserId) {
      console.warn('当前用户ID未获取到，无法过滤');
      showTable.push(...userStore.usersTable);
      return;
    }
    
    const filteredUsers = userStore.usersTable.filter(user => {
      // 统一转换为数字进行比较
      const userIdNum = Number(user.userId);
      const currentUserIdNum = Number(currentUserId);
      const isCurrentUser = userIdNum === currentUserIdNum;
      console.log(`用户 ${user.name} (ID: ${user.userId}, 类型: ${typeof user.userId}) - 是当前用户: ${isCurrentUser}`);
      return !isCurrentUser;
    });
    
    console.log('过滤后的用户:', filteredUsers);
    showTable.splice(0, showTable.length, ...filteredUsers);
  };
  
  // 如果 userId 已经存在，直接执行
  if (userStore.user?.userId) {
    initShowTable();
  } else {
    // 否则等待一段时间再尝试
    const checkInterval = setInterval(() => {
      if (userStore.user?.userId) {
        clearInterval(checkInterval);
        initShowTable();
      }
    }, 100);
    
    // 最多等待 3 秒
    setTimeout(() => {
      clearInterval(checkInterval);
      if (showTable.length === 0) {
        initShowTable();
      }
    }, 3000);
  }
});
onUnmounted(() => {
  //退出时清空表单全部数据
  showTable.splice(0, showTable.length);
  projectData.projectName = "";
  projectData.description = "";
  projectData.createLine = "";
  projectData.assignee = [];
  console.log("清空了");
});
// 发送项目邀请通知
const sendProjectInvites = async (projectId: string, projectName: string) => {
  const token = localStorage.getItem('token');
  const currentUser = userStore.user;
  
  // 获取被选中的用户ID列表
  const selectedUserIds = projectData.assignee;
  
  if (selectedUserIds.length === 0) {
    console.log('没有选择任何成员邀请');
    return;
  }
  
  console.log('发送项目邀请给:', selectedUserIds);
  
  // 为每个选中的用户发送邀请通知
  for (const userId of selectedUserIds) {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'project_invite',
          title: `项目邀请：${projectName}`,
          message: `您被邀请加入新项目"${projectName}"`,
          sender_id: currentUser?.userId,
          receiver_id: parseInt(userId),
          project_id: parseInt(projectId),
          data: JSON.stringify({ 
            role: 'member', 
            position: '',
            sender_name: currentUser?.fullname || currentUser?.name || '系统',
            sender_avatar: currentUser?.avatar_url || ''
          })
        })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log(`已向用户 ${userId} 发送项目邀请通知`);
      } else {
        console.error(`向用户 ${userId} 发送邀请失败:`, result.message);
      }
    } catch (error) {
      console.error(`发送邀请给用户 ${userId} 时出错:`, error);
    }
  }
};

// 暴露方法和数据给父组件
defineExpose({
  projectData,
  sendProjectInvites
});
const changeGot = (userId: string) => {
  const index = projectData.assignee.indexOf(userId);
  if (index === -1) {
    projectData.assignee.push(userId);
  } else {
    projectData.assignee.splice(index, 1);
  }
};
const toFind = () => {
  console.log('搜索值:', searchValue.value);
  const currentUserId = Number(userStore.user?.userId);
  console.log('当前用户ID:', currentUserId);
  
  if (searchValue.value === "") {
    const filteredUsers = userStore.usersTable.filter(user => Number(user.userId) !== currentUserId);
    console.log('清空搜索，过滤后用户:', filteredUsers);
    showTable.splice(0, showTable.length, ...filteredUsers);
  } else {
    let newTable = [];
    for (let item of userStore.usersTable) {
      // 过滤掉当前用户，并按名称或职位搜索
      const isCurrentUser = Number(item.userId) === currentUserId;
      const matchesSearch = item.name.toLowerCase().includes(searchValue.value.toLowerCase()) ||
        item.postion.toLowerCase().includes(searchValue.value.toLowerCase());
      
      if (!isCurrentUser && matchesSearch) {
        newTable.push(item);
      }
    }
    console.log('搜索过滤后用户:', newTable);
    // 将newTable赋值给showTable
    showTable.splice(0, showTable.length, ...newTable);
  }
};

</script>
<style scoped lang="scss">
.formBox {
  width: 90%;
  margin: 0 auto;
}

// 只修改带 custom-input 类的 el-input
:deep(.custom-input .el-input__wrapper) {
  border-radius: 0;
  padding: 1rem 0;
  background-color: #fff;
  border: none;
  border-bottom: 2px solid #ccc;
  box-shadow: none;
}

:deep(.custom-input .el-input__inner) {
  font-weight: 500;
  font-size: 2rem;
}

// 使用 :focus 伪类
:deep(.custom-input .el-input__wrapper:focus-within) {
  border-bottom: 2px solid black;
}
:deep(.custom-input .el-input__input:focus-within) {
  color: black;
}
:deep(.description-input .el-textarea__inner) {
  font-size: medium;
}
:deep(.description-input .el-textarea__inner:focus-within) {
  color: black;
  box-shadow: none;
}
:deep(.description-input .el-textarea__inner:focus-within) {
  border: 2px solid black;
}
:deep(.el-select__wrapper) {
  height: 3rem;
  font-size: 1rem;
}
:deep(.el-select__wrapper:focus-within) {
  border: 2px solid black;
  box-shadow: none;
}
:deep(.dateLine-input .el-input__wrapper) {
  background-color: #fff;
  border: none;
  border-radius: 0;
  height: 3rem;
  font-size: 1rem;
}
:deep(.dateLine-input .el-input__wrapper:focus-within) {
  box-shadow: none;
  border: 2px solid black;
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
.teamTable {
  box-sizing: border-box;
  margin-top: 1rem;
  width: 100%;
  height: 20rem;
  overflow: auto;
  /* 隐藏标准滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  border: 2px solid #ebeef5;
  padding: 0 1rem;
}
.team_item {
  box-sizing: border-box;
  width: 100%;
  padding: 1rem 0;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}
.noteSelect {
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid black;
  border-radius: 0.5rem;
  margin-right: 1rem;
  cursor: pointer;
  overflow: hidden;
  img {
    width: 100%;
  }
}
.team_item {
  width: 100%;
}
.noteItem {
  width: 100%;
  display: flex;
  align-items: center;
  margin-top: 1rem;
  font-size: large;
}
.userPic {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  margin-right: 1rem;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  img {
    width: 100%;
  }
}
.userInfo {
  width: 100%;
}
.userName {
  font-size: larger;
  font-weight: 600;
}
.userOthers {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: end;
}
.postion {
  font-size: medium;
  color: #909cad;
}
.progress {
  width: 10rem;
  height: 1rem;
  margin-right: 0.1rem;
}
</style>
