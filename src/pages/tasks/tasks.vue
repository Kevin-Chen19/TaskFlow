<template>
  <div class="bigBox">
    <div class="bigTitle">Tasks</div>
    <div class="Line_two">
      <span class="smallText">View and manage project tasks.</span>
      <div style="display: flex; gap: 1rem">
        <div v-if="ifAll" class="new_task myBtn">My Tasks</div>
        <div v-if="!ifAll" class="new_task allBtn">All Tasks</div>
        <div class="new_task filterBtn">Filter</div>
        <div class="new_task" @click="openNewTaskDialog">+ Add New Task</div>
      </div>
    </div>
    <div class="tableBox">
      <el-table :data="allTasks" style="width: 100%">
        <el-table-column label="TASK NAME" width="180">
          <template #default="scope">
            <div>{{ scope.row.taskName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="PRIORITY" width="180">
          <template #default="scope">
            <div>{{ scope.row.priority }}</div>
          </template>
        </el-table-column>
        <el-table-column label="CREATOR" width="180">
          <template #default="scope">
            <div>Kevin</div>
          </template>
        </el-table-column>
        <el-table-column label="ASSIGNEE" width="180">
         <template #default="scope">
            <div>Jone</div>
            <div>Bob</div>
            <div>...</div>
          </template>
        </el-table-column>
        <el-table-column label="TIMELINE" width="230">
           <template #default="scope">
            <div>{{ scope.row.createLine }}——{{ scope.row.dueLine }}</div>
          </template>
        </el-table-column>
        <el-table-column label="PROGRESS" width="230">
          <el-progress :color="customColorMethod" :percentage="70" />
        </el-table-column>
        <el-table-column label="Operations">
          <template #default="scope">
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="tableBottom"></div>
  </div>
  <el-dialog
    v-model="centerDialogVisible"
    title="Add New Task"
    width="800"
    align-center
  >
    <TaskCard v-if="centerDialogVisible" ref="taskCardRef"></TaskCard>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible = false" class="cancelBtn"
          >Cancel</el-button
        >
        <el-button type="primary" @click="handleSubmit" class="confirmBtn">
          Creat Task
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const centerDialogVisible = ref(false);
const ifAll = ref(true);
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
const allTasks = reactive<Task>([
  {
  taskName: "登录页前端开发",
  description: "按照UI设计稿完成登录页的前端开发与功能的实现",
  priority: "High",
  createLine: "2026-01-03",
  dueLine: "2026-01-04",
  createUser:1,
  assignee:Number[1,2]
  },
  {
  taskName: "登录页UI设计",
  description: "按照需求文档完成登录页的UI设计",
  priority: "High",
  createLine: "2026-01-01",
  dueLine: "2026-01-02",
  createUser:1,
  assignee:Number[3]
  }
]);
const showTasks = reactive([]);
interface Task {
  taskName: string;
  description: string;
  priority: string;
  createLine: string;
  dueLine: string;
  createUser:number;
  assignee:number[];
}
interface User {
  date: string
  name: string
  address: string
}

const handleEdit = (index: number, row: User) => {
  console.log(index, row)
}
const handleDelete = (index: number, row: User) => {
  console.log(index, row)
}
const tableData: User[] = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
]
const openNewTaskDialog = () => {
  centerDialogVisible.value = true;
  noteContent.value = '';
}
const handleSubmit = () => {
  try {
    // 访问子组件暴露的数据
    const componentData = taskCardRef.value?.formData;
    componentData.createLine = Date.now();
    componentData.createUser = userStore.user.userId;
    console.log("获取到的数据:", componentData);
    console.log("选中的用户:", taskCardRef.value?.chooseUser);
  } catch (error) {
    console.error("获取数据失败:", error);
  }
  centerDialogVisible.value = false;
};
</script>
<style scoped lang="scss">
.new_task {
  padding: 0.4rem 0.7rem;
  background-color: rgb(56, 55, 55);
  color: white;
  border-radius: 0.4rem;
  font-size: 1rem;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.2);
}
.new_task:hover {
  cursor: pointer;
  background: black;
}
.myBtn {
  background-color: rgb(4, 171, 4);
}
.myBtn:hover {
  background-color: green;
}
.allBtn {
  background-color: rgba(250, 165, 6, 0.676);
}
.allBtn:hover {
  background-color: rgb(254, 166, 3);
}
.filterBtn {
  background-color: #f0f0f0;
  color: black;
}
.filterBtn:hover {
  background-color: #fff;
}
.cancelBtn {
  height: 3rem;
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
  height: 3rem;
  background-color: black;
  color: white;
  font-weight: 600;
  font-size: larger;
  margin-right: 2rem;
  border-radius: 0.5rem;
  padding: 0 1.5rem;
}
.tableBox {
  margin-top: 3rem;
  width: 100%;
  height: 45rem;
  background-color: #fff;
  border-radius: 1rem 1rem 0 0;
}
.tableBottom {
  width: 100%;
  height: 4rem;
  background-color: #fff;
  border-radius: 0 0 1rem 1rem;
  border-top: 1px solid black;
}
</style>
