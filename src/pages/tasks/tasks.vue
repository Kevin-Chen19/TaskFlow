<template>
  <div class="bigBox">
    <div class="bigTitle">Tasks</div>
    <div class="Line_two">
      <span class="smallText">View and manage project tasks.</span>
      <div style="display: flex; gap: 1rem">
        <div
          v-if="ifAll"
          class="new_task myBtn"
          @click="filterTasks('AssigneeName', userStore.user.userId, false)"
        >
          My Tasks
        </div>
        <div
          v-if="!ifAll"
          class="new_task allBtn"
          @click="filterTasks('AssigneeName', 'all', false)"
        >
          All Tasks
        </div>
        <div class="new_task" @click="openNewTaskDialog">+ Add New Task</div>
      </div>
    </div>
    <div class="filterBox">
      <span style="margin-right: 1rem">Filter by:</span>
      <el-select
        v-model="filterLabel"
        placeholder="Select Filter"
        style="width: 10rem"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <span style="margin: 0 1rem" v-if="filterLabel !== ''">Value:</span>
      <el-select
        v-if="filterLabel === 'Assignee' || filterLabel === 'Creator'"
        v-model="MembersValue"
        multiple
        collapse-tags
        placeholder="Select Member"
        style="width: 10rem"
      >
        <el-option
          v-for="item in userStore.usersTable"
          :key="item.userId"
          :label="item.name"
          :value="item.userId"
        />
      </el-select>
      <el-select
        v-if="filterLabel === 'Priority'"
        v-model="PriorityValue"
        multiple
        collapse-tags
        placeholder="Select Priority"
        style="width: 10rem"
      >
        <el-option
          v-for="item in PriorityOptions"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
      <el-input
        v-if="filterLabel === 'TaskName'"
        v-model="TaskNameValue"
        placeholder="Task Name"
        style="width: 20rem"
      ></el-input>
      <el-slider
        v-if="filterLabel === 'Progress'"
        v-model="ProgressValue"
        range
        :marks="marks"
        style="width: 20rem"
      />
      <div v-if="filterLabel === 'TimeLine'">
        <el-date-picker
          v-model="TimeLineValue"
          type="daterange"
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
        />
      </div>
      <div class="searchBtn" v-if="filterLabel !== ''" @click="filterTasks('filterSelect','',true)">Search</div>
      <div class="searchBtn" v-if="filterLabel !== ''" @click="resetTableData" style="background-color: #04ab04;">Reset</div>
    </div>
    <div class="tableBox">
      <el-table
        :data="showTasks"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column label="TASK NAME" width="310">
          <template #default="scope">
            <div class="rowName">{{ scope.row.taskName }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="priority"
          label="PRIORITY"
          sortable="custom"
          width="180"
        >
          <template #default="scope">
            <div class="rowPriority" :class="tagStyles(scope.row.priority)">
              {{ scope.row.priority }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="CREATOR" width="200">
          <template #default="scope">
            <div>{{ findUser(scope.row.createUser) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="ASSIGNEE" width="200">
          <template #default="scope">
            <div v-for="item in scope.row.assignee.slice(0, 2)">
              {{ findUser(item) }}
            </div>
            <div v-if="scope.row.assignee.length > 2">...</div>
          </template>
        </el-table-column>
        <el-table-column label="TIMELINE" width="230">
          <template #default="scope">
            <div>{{ scope.row.createLine }}——{{ scope.row.dueLine }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="PROGRESS"
          prop="progress"
          sortable="custom"
          width="230"
        >
          <template #default="scope">
            <el-progress
              :color="customColorMethod"
              :percentage="scope.row.percentage"
            />
          </template>
        </el-table-column>
        <el-table-column label="Operations">
          <template #default="scope">
            <div class="delBtn" @click="handleDelete(scope.row.id)">Delete</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="tableBottom">
      <div style="color: gray">
        Showing
        <span style="color: black"
          >1-{{ tasks.length >= 9 ? 9 : tasks.length }}</span
        >
        of <span style="color: black">{{ tasks.length }}</span> tasks
      </div>
      <div>
        <el-pagination
          background
          layout="prev, pager, next"
          :page-count="total"
          :current-page="pageNumber"
          @current-change="handlePageChange"
        />
      </div>
    </div>
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
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import TaskCard from "@/components/taskCard.vue";
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const centerDialogVisible = ref(false);
const ifAll = ref(true);
const total = ref(1);
const pageNumber = ref(1);
const filterLabel = ref("");
const TaskNameValue = ref("");
const MembersValue = ref([]);
const PriorityValue = ref([]);
const ProgressValue = ref([50, 100]);
const TimeLineValue = ref("");
const taskCardRef = ref<InstanceType<typeof TaskCard> | null>(null);
const customColor = ref("#409eff");
import type { CSSProperties } from "vue";
interface Mark {
  style: CSSProperties;
  label: string;
}
type Marks = Record<number, Mark | string>;
const marks = reactive<Marks>({
  0: "0",
  50: {
    style: {
      color: "#1989FA",
    },
    label: "50%",
  },
  100: "100%",
});
const PriorityOptions = ["Critical", "High", "Medium", "Low", "Negligible"];
const options = [
  {
    value: "Creator",
    label: "Creator",
  },
  {
    value: "TaskName",
    label: "TaskName",
  },
  {
    value: "Priority",
    label: "Priority",
  },
  {
    value: "Assignee",
    label: "Assignee",
  },
  {
    value: "TimeLine",
    label: "TimeLine",
  },
  {
    value: "Progress",
    label: "Progress",
  },
];
const customColorMethod = (percentage: number) => {
  if (percentage < 30) {
    return "#909399";
  }
  if (percentage < 70) {
    return "#e6a23c";
  }
  return "#67c23a";
};
const tagStyles = (tag: string) => {
  if (tag === "Critical") {
    return "CriticalStyle";
  } else if (tag === "High") {
    return "HighStyle";
  } else if (tag === "Medium") {
    return "MediumStyle";
  } else if (tag === "Low") {
    return "LowStyle";
  } else {
    return "NegligibleStyle";
  }
};
const allTasks = reactive<Task>([
  {
    id: "2026010316121",
    taskName: "登录页前端开发1",
    description: "按照UI设计稿完成登录页的前端开发与功能的实现",
    priority: "High",
    createLine: "2026-01-03",
    dueLine: "2026-01-04",
    createUser: "202601051",
    assignee: ["202601051"],
    percentage: 70,
  },
  {
    id: "2026010316122",
    taskName: "登录页UI设计2",
    description: "按照需求文档完成登录页的UI设计",
    priority: "Critical",
    createLine: "2026-01-01",
    dueLine: "2026-01-02",
    createUser: "202601051",
    assignee: ["202601054", "202601055"],
    percentage: 50,
  },
  {
    id: "2026010316123",
    taskName: "登录页服务端开发3",
    description: "按照UI设计稿完成登录页的服务端开发与功能的实现",
    priority: "Medium",
    createLine: "2026-01-04",
    dueLine: "2026-01-05",
    createUser: "202601051",
    assignee: ["202601053"],
    percentage: 40,
  },
  {
    id: "2026010316124",
    taskName: "登录页UI设计4",
    description: "按照需求文档完成登录页的UI设计",
    priority: "Low",
    createLine: "2026-01-01",
    dueLine: "2026-01-02",
    createUser: "202601051",
    assignee: ["202601053"],
    percentage: 20,
  },
  {
    id: "2026010316125",
    taskName: "登录页UI设计5",
    description: "按照需求文档完成登录页的UI设计",
    priority: "Negligible",
    createLine: "2026-01-01",
    dueLine: "2026-01-02",
    createUser: "202601051",
    assignee: ["202601053", "202601054", "202601053"],
    percentage: 100,
  },
  {
    id: "2026010316126",
    taskName: "登录页前端开发6",
    description: "按照UI设计稿完成登录页的前端开发与功能的实现",
    priority: "High",
    createLine: "2026-01-03",
    dueLine: "2026-01-04",
    createUser: "202601051",
    assignee: ["202601051"],
    percentage: 70,
  },
  {
    id: "2026010316127",
    taskName: "登录页UI设计7",
    description: "按照需求文档完成登录页的UI设计",
    priority: "Critical",
    createLine: "2026-01-01",
    dueLine: "2026-01-02",
    createUser: "202601051",
    assignee: ["202601054", "202601055"],
    percentage: 50,
  },
  {
    id: "2026010316128",
    taskName: "登录页服务端开发8",
    description: "按照UI设计稿完成登录页的服务端开发与功能的实现",
    priority: "Medium",
    createLine: "2026-01-04",
    dueLine: "2026-01-05",
    createUser: "202601051",
    assignee: ["202601053"],
    percentage: 40,
  },
  {
    id: "2026010316129",
    taskName: "登录页UI设计9",
    description: "按照需求文档完成登录页的UI设计",
    priority: "Low",
    createLine: "2026-01-01",
    dueLine: "2026-01-02",
    createUser: "202601051",
    assignee: ["202601053"],
    percentage: 20,
  },
  {
    id: "2026010316131",
    taskName: "登录页UI设计10",
    description: "按照需求文档完成登录页的UI设计",
    priority: "Negligible",
    createLine: "2026-01-01",
    dueLine: "2026-01-02",
    createUser: "202601051",
    assignee: ["202601053", "202601054", "202601053"],
    percentage: 100,
  },
  {
    id: "2026010316132",
    taskName: "登录页前端开发11",
    description: "按照UI设计稿完成登录页的前端开发与功能的实现",
    priority: "High",
    createLine: "2026-01-03",
    dueLine: "2026-01-04",
    createUser: "202601051",
    assignee: ["202601051"],
    percentage: 70,
  },
  {
    id: "2026010316133",
    taskName: "登录页UI设计12",
    description: "按照需求文档完成登录页的UI设计",
    priority: "Critical",
    createLine: "2026-01-01",
    dueLine: "2026-01-02",
    createUser: "202601051",
    assignee: ["202601054", "202601055"],
    percentage: 50,
  },
  {
    id: "2026010316134",
    taskName: "登录页服务端开发13",
    description: "按照UI设计稿完成登录页的服务端开发与功能的实现",
    priority: "Medium",
    createLine: "2026-01-04",
    dueLine: "2026-01-05",
    createUser: "202601051",
    assignee: ["202601053"],
    percentage: 40,
  },
  {
    id: "2026010316135",
    taskName: "登录页UI设计14",
    description: "按照需求文档完成登录页的UI设计",
    priority: "Low",
    createLine: "2026-01-01",
    dueLine: "2026-01-02",
    createUser: "202601051",
    assignee: ["202601053"],
    percentage: 20,
  },
  {
    id: "2026010316136",
    taskName: "登录页UI设计15",
    description: "按照需求文档完成登录页的UI设计",
    priority: "Negligible",
    createLine: "2026-01-01",
    dueLine: "2026-01-02",
    createUser: "202601051",
    assignee: ["202601053", "202601054", "202601053"],
    percentage: 100,
  },
]);
const showTasks = reactive([]);
const tasks = reactive([]);
interface Task {
  id: string;
  taskName: string;
  description: string;
  priority: string;
  createLine: string;
  dueLine: string;
  createUser: string;
  assignee: string[];
  percentage: number;
}
const findUser = (userId: string) => {
  return userStore.usersTable.find((user) => user.userId === userId)?.name;
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const openNewTaskDialog = () => {
  centerDialogVisible.value = true;
  noteContent.value = "";
};
const handleSubmit = () => {
  try {
    // 访问子组件暴露的数据
    const componentData = JSON.parse(
      JSON.stringify(taskCardRef.value?.formData),
    ); // 深拷贝
    componentData.createLine = formatDate(new Date());
    componentData.dueLine = formatDate(new Date(componentData.dueLine));
    componentData.createUser = userStore.user.userId;
    //设置id为时间戳加随机数
    componentData.id = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    allTasks.push(componentData);
    tasks.push(componentData);
    ElMessage({
      message: "Add Task Success",
      type: "success",
    });
  } catch (error) {
    console.error("获取数据失败:", error);
    ElMessage({
      message: "Add Task Failed",
      type: "error",
    });
  }
  centerDialogVisible.value = false;
};
onMounted(() => {
  showTasks.push(...allTasks.slice(0, 9));
  tasks.push(...allTasks);
  total.value = Math.ceil(tasks.length / 9);
});
const handlePageChange = (page: number) => {
  pageNumber.value = page;
  showTasks.splice(0, showTasks.length);
  showTasks.push(...tasks.slice((page - 1) * 9, page * 9));
};
const filterTasks = (label: string, labelValue: string, ifSort: boolean) => {
  if (!ifSort) {
    ifAll.value = !ifAll.value;
  }
  if (label === "AssigneeName") {
    if (labelValue === "all") {
      tasks.splice(0, tasks.length);
      tasks.push(...allTasks);
      showTasks.splice(0, showTasks.length);
      showTasks.push(...tasks.slice(0, 9));
    } else {
      tasks.splice(0, tasks.length);
      tasks.push(
        ...allTasks.filter((task) => task.assignee.includes(labelValue)),
      );
      showTasks.splice(0, showTasks.length);
      showTasks.push(...tasks.slice(0, 9));
    }
  }else if (label === "filterSelect"){
    //按创建人筛选
    if(filterLabel.value === "Creator"){
      if(MembersValue.value.length === 0){
        resetTableData();
      }else{
        tasks.splice(0, tasks.length);
        tasks.push(...allTasks.filter((task) => MembersValue.value.includes(task.createUser)));
        reshowTableData();
      }
    }else if (filterLabel.value === "Assignee"){  //按指派人筛选
      if(MembersValue.value.length === 0){
        resetTableData();
      }else{
        tasks.splice(0, tasks.length);
        tasks.push(...allTasks.filter((task) => 
          task.assignee.some(assignee => MembersValue.value.includes(assignee))
        ));
        reshowTableData();
      }
    } else if (filterLabel.value === "TaskName"){ //按任务名称筛选
      if(TaskNameValue.value === ""){
        resetTableData();
      }else{
        tasks.splice(0, tasks.length);
        tasks.push(...allTasks.filter((task) => task.taskName.includes(TaskNameValue.value)));
        reshowTableData();
      }
    } else if (filterLabel.value === "Priority"){ //按任务优先级筛选
      if(PriorityValue.value.length === 0){
        resetTableData();
      }else{
        tasks.splice(0, tasks.length);
        tasks.push(...allTasks.filter((task) => 
          PriorityValue.value.includes(task.priority)
        ));
        reshowTableData();
      }
    } else if (filterLabel.value === "TimeLine"){
      if(TimeLineValue.value.length <= 1) {
        resetTableData();
      }else{
        tasks.splice(0, tasks.length);
        tasks.push(...allTasks.filter((task) => 
          task.dueLine >= formatDate(new Date(TimeLineValue.value[0])) && task.dueLine <= formatDate(new Date(TimeLineValue.value[1]))
        ));
        reshowTableData();
      } 
    } else if (filterLabel.value === "Progress"){
      tasks.splice(0, tasks.length);
      tasks.push(...allTasks.filter((task) => 
        task.percentage >= ProgressValue.value[0] && task.percentage <= ProgressValue.value[1]
      ));
      reshowTableData();
    }
  }
  total.value = Math.ceil(tasks.length / 9);
  pageNumber.value = 1;
};
//重置表格数据
const resetTableData = () => {
  tasks.splice(0, tasks.length);
  tasks.push(...allTasks);
  showTasks.splice(0, showTasks.length);
  showTasks.push(...tasks.slice(0, 9));
  total.value = Math.ceil(tasks.length / 9);
  pageNumber.value = 1;
}
//重新显示表格数据
const reshowTableData = () =>{
  showTasks.splice(0, showTasks.length);
  showTasks.push(...tasks.slice(0, 9));
}
// 删除任务
const handleDelete = (id: string) => {
  const index = allTasks.findIndex((task) => task.id === id);
  if (index !== -1) {
    allTasks.splice(index, 1);
  }
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
  }
  total.value = Math.ceil(tasks.length / 9);
  showTasks.splice(0, showTasks.length);
  showTasks.push(...tasks.slice(0, 9));
};
// 排序变化事件
const handleSortChange = ({
  prop,
  order,
}: {
  prop: string;
  order: string | null;
}) => {
  if (order == null) {
    if (!ifAll.value) {
      filterTasks("AssigneeName", userStore.user.userId, true);
    } else {
      if(filterLabel.value === ""){
        filterTasks("AssigneeName", "all", true);
      }
    }
  } else {
    if (prop === "priority") {
      const priorityOrder = ["Critical", "High", "Medium", "Low", "Negligible"];
      tasks.sort((a: Task, b: Task) => {
        const aIndex = priorityOrder.indexOf(a.priority);
        const bIndex = priorityOrder.indexOf(b.priority);
        if (order === "ascending") {
          return aIndex - bIndex;
        } else {
          return bIndex - aIndex;
        }
      });
    } else if (prop === "progress") {
      tasks.sort((a: Task, b: Task) => {
        if (order === "ascending") {
          return a.percentage - b.percentage;
        } else {
          return b.percentage - a.percentage;
        }
      });
    }
    showTasks.splice(0, showTasks.length, ...tasks.slice(0, 9));
  }
  pageNumber.value = 1;
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
  box-sizing: border-box;
  overflow: hidden;
  margin-top: 1rem;
  width: 100%;
  height: fit-content;
  max-height: 50rem;
  background-color: #fff;
  border-radius: 1rem 1rem 0 0;
  border: 1px solid #c2c2c4;
}
:deep(.el-table thead) {
  height: 4rem;
}
:deep(.el-table th.el-table__cell) {
  background-color: #f4f4f5;
}
:deep(.el-table__body) {
  color: black;
}
:deep(.el-table__cell) {
  padding: 1rem 0;
}
:deep(.el-input__wrapper) {
  border-radius: 0px !important;
  background-color: #fff !important;
  box-shadow: none !important;
  border: 1px solid #ccc;
  height: 2rem !important;
}
.tableBottom {
  box-sizing: border-box;
  width: 100%;
  height: 4rem;
  background-color: #fff;
  border-radius: 0 0 1rem 1rem;
  border: 1px solid #c2c2c4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}
.rowName {
  font-size: 1rem;
}
.delBtn {
  width: fit-content;
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  background-color: #f6babac6;
  color: red;
  cursor: pointer;
}
.rowPriority {
  box-sizing: border-box;
  font-size: 1rem;
  width: fit-content;
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  color: white;
}
.CriticalStyle {
  background-color: #e40606b4;
}
.HighStyle {
  background-color: #f7b8b8;
  color: red;
}
.MediumStyle {
  background-color: #ede25f;
  color: #666;
}
.LowStyle {
  background-color: rgba(161, 217, 133, 0.782);
  color: green;
}
.NegligibleStyle {
  background-color: #d7d8da;
  color: #666;
}
.filterBox {
  box-sizing: border-box;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  width: 100%;
  height: 5rem;
  background-color: #fff;
  border-radius: 1rem;
  padding: 1rem;
  color: gray;
}
.searchBtn {
  margin-left: 1rem;
  padding: 0.3rem 0.5rem;
  background-color: #40a0ffcc;
  color: #fff;
  border-radius: 0.5rem;
  cursor: pointer;
}
.searchBtn:hover {
  background-color: #40a0ff;
}
</style>
