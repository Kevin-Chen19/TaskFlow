<template>
  <div class="line"></div>
  <div class="formBox">
    <el-input
      v-model="formData.title"
      class="custom-input"
      :placeholder="$t('taskCard.TaskName')"
    />
    <div class="inputName">{{ $t('taskCard.DISCRIPTION') }}</div>
    <el-input
      v-model="formData.description"
      style="width: 100%"
      :rows="5"
      type="textarea"
      resize="none"
      :placeholder="$t('taskCard.addDetails')"
      class="description-input"
    />
    <div style="width: 100%; display: flex; justify-content: space-between">
      <div>
        <div class="inputName">{{ $t('taskCard.PRIORITYLEVEL') }}</div>
        <el-select
          v-model="formData.priority"
          :placeholder="$t('taskCard.Select')"
          style="width: 18rem"
        >
          <template #label="{ label, value }">
            <span
              :style="{
                color: prioritys.find((item) => item.value === value)?.color,
              }"
              >{{ label }}</span
            >
          </template>
          <el-option
            v-for="item in prioritys"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div>
      <div class="inputName">{{ $t('taskCard.DUELINE') }}</div>
        <el-date-picker
          v-model="formData.due_date"
          type="date"
          :placeholder="$t('taskCard.PickADay')"
          style="width: 18rem"
          class="dateLine-input"
        />
      </div>
    </div>
    <div class="inputName">{{ $t('taskPage.ASSIGNEE') }}</div>
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
            v-if="formData.assignee_ids.includes(item.userId)"
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
              <div class="progress">
                <el-progress
                  :percentage="item.progress"
                  :color="customColorMethod"
                  stroke-width="13"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, watch } from "vue";
import { Search } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/userStore";
import { useOtherStore } from "@/stores/otherStore";

interface Task {
  id: number;
  taskName: string;
  description: string;
  priority: number;
  created_at: string;
  due_date: string;
  creator_id: number;
  assignee_ids: number[];
  progress: number;
}

const props = defineProps<{
  task?: Task;
}>();
interface UserItem {
  name: string;
  postion: string;
  percentage: number;
  pic: string;
  userId: string;
}

interface FormData {
  id: string;
  title: string;
  description: string;
  priority:number;
  created_at: string;
  start_date?: string;
  due_date: string;
  creator_id: number;
  assignee_ids: number[];
  progress: number;
}

const userStore = useUserStore();
const otherStore = useOtherStore();
const searchValue = ref("");
const showTable = reactive<UserItem[]>([]);
const formData = reactive<FormData>({
  id: "",
  title: "",
  description: "",
  priority: 1,
  created_at: "",
  due_date: "",
  creator_id: "",
  assignee_ids: [],
  progress: 0,
});
//监听 props.task 变化,同步到 formData
watch(() => props.task, (newTask) => {
  if (newTask && otherStore.$state.ifEditTask) {
    Object.assign(formData, newTask);
  }
}, { immediate: true });

//初始组价时将userStore.usersTable赋值给showTable
onMounted(() => {
  showTable.push(...userStore.usersTable);
});
onUnmounted(() => {
  //退出时清空表单全部数据
  showTable.splice(0, showTable.length);
  formData.title = "";
  formData.description = "";
  formData.priority = 0;
  formData.created_at = "";
  formData.due_date = "";
  formData.progress = 0;
  formData.assignee_ids = [];
  console.log("清空了");
});
// 暴露方法和数据给父组件
defineExpose({
  formData,
});
const prioritys = [
  {
    value: 3,
    label: "Critical",
    color: "rgb(215, 4, 4)",
  },
  {
    value: 2,
    label: "High",
    color: "rgba(235, 54, 54, 0.722)",
  },
  {
    value: 1,
    label: "Medium",
    color: "orange",
  },
  {
    value: 0,
    label: "Low",
    color: "rgb(48, 219, 48)",
  },
];
const customColor = ref("#409eff");
const customColorMethod = (percentage: number) => {
  if (percentage < 30) {
    return "#909399";
  }
  if (percentage < 70) {
    return "#e6a23c";
  }
  return "#67c23a";
};
const changeGot = (userId: string) => {
  const index = formData.assignee_ids.indexOf(userId);
  if (index === -1) {
    formData.assignee_ids.push(userId);
  } else {
    formData.assignee_ids.splice(index, 1);
  }
};

// 优先级文本转换为数字
const priorityValueMap: Record<string, number> = {
  'Critical': 3,
  'High': 2,
  'Medium': 1,
  'Low': 0
};

// 数字转换为优先级文本
const priorityTextMap: Record<number, string> = {
  3: 'Critical',
  2: 'High',
  1: 'Medium',
  0: 'Low'
};
//根据名字或职位搜索
const toFind = () => {
  console.log(searchValue.value);
  if (searchValue.value === "") {
    showTable.splice(0, showTable.length, ...userStore.usersTable);
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
