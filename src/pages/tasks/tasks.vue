<template>
  <div class="bigBox">
    <div class="bigTitle">{{ $t('taskPage.Tasks') }}</div>
    <div class="Line_two">
      <span class="smallText">{{ $t('taskPage.viewAndManage') }}</span>
      <div style="display: flex; gap: 1rem">
        <div
          v-if="ifAll"
          class="new_task myBtn"
          @click="filterTasks('AssigneeName', userStore.user.userId, false)"
        >
          {{ $t('taskPage.myTasks') }}
        </div>
        <div
          v-if="!ifAll"
          class="new_task allBtn"
          @click="filterTasks('AssigneeName', 'all', false)"
        >
          {{ $t('taskPage.allTasks') }}
        </div>
        <div class="new_task" @click="openNewTaskDialog">+ {{ $t('taskPage.addNewTask') }}</div>
      </div>
    </div>
    <div class="filterBox">
      <span style="margin-right: 1rem">{{ $t('taskPage.filterBy') }}:</span>
      <el-select
        v-model="filterLabel"
        :placeholder="$t('taskPage.selectFilter')"
        style="width: 10rem"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <span style="margin: 0 1rem" v-if="filterLabel !== ''">{{ $t('taskPage.Value') }}:</span>
      <el-select
        v-if="filterLabel === 'Assignee' || filterLabel === 'Creator'"
        v-model="MembersValue"
        multiple
        collapse-tags
        :placeholder="$t('taskPage.selectMember')"
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
        :placeholder="$t('taskPage.selectPriority')"
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
        :placeholder="$t('taskPage.taskName')"
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
      <div class="searchBtn" v-if="filterLabel !== ''" @click="filterTasks('filterSelect','',true)">{{ $t('taskPage.Search') }}</div>
      <div class="searchBtn" v-if="filterLabel !== ''" @click="resetTableData" style="background-color: #04ab04;">{{ $t('taskPage.Reset') }}</div>
    </div>
    <div class="tableBox">
      <el-table
        :data="showTasks"
        style="width: 100%"
        @sort-change="handleSortChange"
        @row-click="showMessages"
      >
        <el-table-column :label="$t('taskPage.TASKNAME')" width="310">
          <template #default="scope">
            <div class="rowName">{{ scope.row.title }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="priority"
          :label="$t('taskPage.PRIORITY')"
          sortable="custom"
          width="200"
        >
          <template #default="scope">
            <div class="rowPriority" :class="tagStyles(scope.row.priority)">
              {{ showPriority(scope.row.priority) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('taskPage.CREATOR')" width="220">
          <template #default="scope">
            <div>{{ findUser(scope.row.creator_id) }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('taskPage.ASSIGNEE')" width="220">
          <template #default="scope">
            <div v-for="item in scope.row.assignee_ids.slice(0, 2)">
              {{ findUser(item) }}
            </div>
            <div v-if="scope.row.assignee_ids.length > 2">...</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('taskPage.TIMELINE')" width="250">
          <template #default="scope">
            <div>{{ getData(scope.row.start_date) }}——{{ getData(scope.row.due_date) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('taskPage.PROGRESS')"
          prop="progress"
          sortable="custom"
          width="311"
        >
          <template #default="scope">
            <el-progress
              :color="customColorMethod"
              :percentage="scope.row.progress"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="tableBottom">
      <div style="color: gray">
        {{$t('taskPage.Showing')}}
        <span style="color: black"
          >1-{{ tasks.length >= 9 ? 9 : tasks.length }}</span
        >
        {{$t('taskPage.of')}} <span style="color: black">{{ tasks.length }}</span> {{$t('taskPage.tasks')}}
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
    :title="otherStore.ifEditTask ? $t('taskPage.editTask') : $t('taskPage.addNewTask')"
    width="800"
    align-center
  >
    <TaskCard v-if="centerDialogVisible" ref="taskCardRef" :task="MessageTask"></TaskCard>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible = false" class="cancelBtn"
          >{{ $t('cancel') }}</el-button
        >
        <el-button v-if="!otherStore.ifEditTask" type="primary" @click="handleSubmit" class="confirmBtn">
          {{ $t('taskPage.creatTask') }}
        </el-button>
        <el-button v-if="otherStore.ifEditTask" type="primary" @click="submitEdit" class="confirmBtn">
          {{ $t('taskPage.saveChanges') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="MessageDialogVisible"
    :title="$t('taskPage.addNewTask')"
    width="800"
    align-center
  >
  <template #header>
    <div class="topTitle">{{ $t('taskPage.createdOn') }} {{ getData(MessageTask.created_at) }}</div>
    <div class="taskName">{{ MessageTask.title }}</div>
    <div style="width: 100%; height: 1px; background: #f3f4f4;"></div>
  </template>
  <div class="contentBox">
    <div class="contentBoxLeft">
      <div class="tipTitle">{{ $t('taskPage.Description') }}</div>
      <div class="descriptionBox">{{ MessageTask.description }}</div>
        <div class="progressBox">
    <div class="topLine">
      <div>
        <div style="color:black;">{{ $t('taskPage.taskProgress') }}</div>
        <div v-if="ifCreator">{{ $t('taskPage.dragToUpdate') }}</div>
      </div>
      <div class="NumberStyle" :style="{ color:customColorMethod(MessageTask.percentage) }">{{MessageTask.progress}}%</div>
    </div>
    <el-progress
      v-if="!ifAssignee && !ifCreator"
      :color="customColorMethod"
      :percentage="MessageTask.progress"
      :show-text="false"
    />
    <el-slider v-if="ifAssignee || ifCreator" v-model="MessageTask.progress" />
    <div class="bottomTip">
      <div>{{ $t('taskPage.notStarted') }}</div>
      <div>{{ $t('taskPage.Completed') }}</div>
    </div>
  </div>
    </div>
    <div class="contentBoxRight">
      <div class="smallTip">{{ $t('taskPage.CREATOR') }}</div>
      <div class="creatorBox">
        <div class="picBox">
          <img :src="findUserPic(MessageTask.creator_id)" alt="用户头像">
        </div>
        <div class="nameStyle">{{ findUser(MessageTask.creator_id) }}</div>
      </div>
      <div class="smallTip">{{ $t('taskPage.ASSIGNEE') }}</div>
      <div class="assigneeBox">
        <div class="creatorBox assigneeItem" v-for="item in MessageTask.assignee_ids">
          <div class="picBox">
            <img :src="findUserPic(item)" alt="用户头像"></img>
          </div>
          <div class="nameStyle">{{ findUser(item) }}</div>
        </div>
      </div>
      <div class="smallTip">{{ $t('taskPage.PRIORITY') }}</div>
      <div class="priorityBox" :class="tagStyles( MessageTask.priority )">{{ showPriority(MessageTask.priority) }}</div>
      <div class="smallTip">{{ $t('taskPage.TIME') }}</div>
      <div class="timeBox">
        <div class="timePicBox">
          <img src="@/assets/icons/日历.png" alt="日历图标">
        </div>
        <div class="timeItem">
          <div style="color: #898989; font-size: 0.8rem;">{{ $t('taskPage.dueDate') }}</div>
          <div>{{ getData(MessageTask.due_date) }}</div>
        </div>
      </div>
    </div>
  </div>

  <template #footer>
    <div class="footerBox">
      <div v-if="ifCreator" class="editBtn" @click="EditMessage">{{ $t('Edit') }}</div>
      <div v-if="ifAssignee || ifCreator" class="saveBtn" @click="SaveMessage">{{ $t('save') }}</div>
      <div v-if="ifCreator" class="closeBtn" @click="handleDelete">{{ $t('Delete') }}</div>
      <div v-if="!ifAssignee && !ifCreator" class="editBtn" @click="MessageDialogVisible = false">{{ $t('Close') }}</div>
    </div>
  </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import TaskCard from "@/components/taskCard.vue";
import { useUserStore } from "@/stores/userStore";
import { useOtherStore } from "@/stores/otherStore";
import { useI18n } from "vue-i18n";
import { getTasks } from "@/api"
const { t } = useI18n();
const userStore = useUserStore();
const otherStore = useOtherStore();
const centerDialogVisible = ref(false);
const ifAll = ref(true);
const MessageDialogVisible = ref(false);
const total = ref(1);
const pageNumber = ref(1);
const filterLabel = ref("");
const TaskNameValue = ref("");
const MembersValue = ref<string[]>([]);
const PriorityValue = ref<string[]>([]);
const ProgressValue = ref<[number, number]>([50, 100]);
const TimeLineValue = ref<Date[] | "">("");
const MessageTask = reactive({
  id: "",
  title: "",
  description: "",
  priority: 0,
  created_at: "",
  due_date: "",
  creator_id: 0,
  assignee_ids: [] as number[],
  progress: 0
});
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
    label: t('taskPage.Creator'),
  },
  {
    value: "TaskName",
    label: t('taskPage.taskName'),
  },
  {
    value: "Priority",
    label: t('taskPage.Priority'),
  },
  {
    value: "Assignee",
    label: t('taskPage.Assignee'),
  },
  {
    value: "TimeLine",
    label:  t('taskPage.TimeLine'),
  },
  {
    value: "Progress",
    label: t('taskPage.Progress'),
  },
];
//判断是否是任务创建者
const ifCreator = computed(() => {
  return MessageTask.creator_id === userStore.user.userId;
})
//判断是否是任务负责人
const ifAssignee = computed(() => {
  return MessageTask.assignee_ids.includes(userStore.user.userId);
})
const customColorMethod = (percentage: number) => {
  if (percentage < 30) {
    return "#909399";
  }
  if (percentage < 70) {
    return "#e6a23c";
  }
  return "#67c23a";
};
const tagStyles = (tag: number) => {
  if (tag === 3) {
    return "CriticalStyle";
  } else if (tag === 2) {
    return "HighStyle";
  } else if (tag === 1) {
    return "MediumStyle";
  } else if (tag === 0) {
    return "LowStyle";
  }
};
const allTasks = reactive<Task[]>([
  {
    id: "2026010316121",
    taskName: "登录页前端开发1",
    description: "按照UI设计稿完成登录页的前端开发与功能的实现",
    priority: "High",
    createLine: "2026-01-03",
    dueLine: "2026-01-04",
    createUser: "202601053",
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
    createUser: "202601053",
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
const showTasks = reactive<Task[]>([]);
const tasks = reactive<Task[]>([]);
interface Task {
  id: number;
  title: string;
  description: string;
  priority: number;
  created_at: string;
  due_date: string;
  creator_id: string;
  assignee: number[];
  percentage: number;
}
const findUser = (userId: number) => {
  return userStore.usersTable.find((user) => user.userId === userId)?.name;
};
const findUserPic = (userId: number) => {
    return userStore.usersTable.find((user) => user.userId === userId)?.pic;
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const openNewTaskDialog = () => {
  // 使用 $patch 安全更新
  otherStore.$patch({ ifEditTask: false });
  centerDialogVisible.value = true;
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
      message: t('addSuccessfully'),
      type: "success",
    });
  } catch (error) {
    console.error("获取数据失败:", error);
    ElMessage({
      message: t('addFailed'),
      type: "error",
    });
  }
  centerDialogVisible.value = false;
};
const submitEdit = () => {
    try {
    // 访问子组件暴露的数据
    const componentData = JSON.parse(
      JSON.stringify(taskCardRef.value?.formData),
    ); // 深拷贝
    componentData.dueLine = formatDate(new Date(componentData.dueLine));
    componentData.createUser = userStore.user.userId;
     const index = allTasks.findIndex((task) => task.id === MessageTask.id);
    allTasks[index] = { ...componentData };
    //刷新数据
    resetTableData();
      ElMessage({
        message: t('updatedSuccess'),
        type: "success",
      });
  } catch (error) {
    console.error("获取数据失败:", error);
    ElMessage({
      message: t('updateFailed'),
      type: "error",
    });
  }
  centerDialogVisible.value = false;
}
//获取项目的全部任务
const getAllTasks = async() => {
  try{
    const res = await getTasks({
  project_id: otherStore.currentProjectId
});
    if(res.success){
      allTasks.splice(0, allTasks.length, ...res.data);
    }
  }catch(e){
    console.log('获取任务失败', e);
  }
}
const getData = (dataLine: string) => {
  return dataLine.split('T')[0]
}
const showPriority = (priority: number) => {
  switch(priority){
    case 0:
      return 'Low';
    case 1:
      return 'Medium';
    case 2:
      return 'High';
    case 3:
      return 'Critical';
    default:
      return '';
  }
}
onMounted(() => {
  //获取项目的全部任务
  getAllTasks().then(() => {
  console.log(allTasks);
  showTasks.push(...allTasks.slice(0, 9));
  tasks.push(...allTasks);
  total.value = Math.ceil(tasks.length / 9);
  })

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
      if(Array.isArray(TimeLineValue.value) && TimeLineValue.value.length >= 2) {
        tasks.splice(0, tasks.length);
        tasks.push(...allTasks.filter((task) =>
          task.dueLine >= formatDate(new Date(TimeLineValue.value[0]!)) && task.dueLine <= formatDate(new Date(TimeLineValue.value[1]!))
        ));
        reshowTableData();
      } else {
        resetTableData();
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
const handleDelete = () => {
    ElMessageBox.confirm(
    t('taskPage.areYouDeleteTask'),
    t('Warning'),
    {
      confirmButtonText: t('OK'),
      cancelButtonText: t('cancel'),
      type: 'warning',
    }
  )
    .then(() => {
      const index = allTasks.findIndex((task) => task.id === MessageTask.id);
      if (index !== -1) {
        allTasks.splice(index, 1);
      }
      const taskIndex = tasks.findIndex((task) => task.id === MessageTask.id);
      if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
      }
      total.value = Math.ceil(tasks.length / 9);
      reshowTableData();
      MessageDialogVisible.value = false;
      ElMessage({
        type: 'success',
        message: t('deleteSuccess'),
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: t('deleteCanceled'),
      })
    })
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
const showMessages = (task: Task) => {
  // 将数据赋值给 MessageTask 响应式对象
  Object.assign(MessageTask, task);
  // 打开对话框
  MessageDialogVisible.value = true;
}
const EditMessage = () => {
  // 使用 $patch 安全更新
  otherStore.$patch({ ifEditTask: true });
  MessageDialogVisible.value = false;
  centerDialogVisible.value = true;
}
const SaveMessage = () => {
  //修改AllTasks中的数据
  const index = allTasks.findIndex((task) => task.id === MessageTask.id);
  //使用深拷贝的方式修改
  allTasks[index] = { ...MessageTask };
  //刷新数据
  resetTableData();
  MessageDialogVisible.value = false;
}
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
.topTitle{
  color: #898989;
  font-size: 0.8rem;
}
.taskName{
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
}
.contentBox{
  box-sizing: border-box;
  width: 100%;
  height: 28rem;
  overflow: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  display: flex;
  padding: 1rem;
  color:black;
  border-bottom: 1px solid #f3f4f4;
}
.contentBoxLeft{
  box-sizing: border-box;
  width: 70%;
}
.tipTitle{
  font-size: 1rem;
}
.descriptionBox{
  margin-top: 1rem;
  box-sizing: border-box;
  padding: 1rem;
  width: 100%;
  height: 15rem;
  overflow: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  background-color: #ecededa0;
  border-radius: 1rem;
  color:#666;
}
.contentBoxRight{
  box-sizing: border-box;
  padding: 0 1rem;
  flex: 1;
  height: 25rem;
}
.smallTip{
  font-size: 1rem;
  color:#898989;
  margin-bottom: 0.5rem;
}
.creatorBox{
  display: flex;
  width: 100%;
  height: 3rem;
  align-items: center;
  .picBox{
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: 1px solid #c2c2c4;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    img{
      width: 100%;
    }
  }
}
.nameStyle{
  margin-left: 1rem;
}
.assigneeBox{
  width: 100%;
  max-height: 7.5rem;
  margin-bottom: 1rem;
  overflow: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  .assigneeItem{
    box-sizing: border-box;
    margin: 0.5rem 0;
    background-color: #f6f8f8b8;
    padding: 0.5rem;
    border-radius: 0.5rem;
  }
}
.priorityBox{
  padding: 0.2rem 0.5rem;
  width: fit-content;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
.timeBox{
  display: flex;
  align-items: center;
  width: 100%;
  .timePicBox{
    width: 2.5rem;
    height: 2.5rem;
    background-color: #ecededa0;
    border-radius: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    img{
      width: 50%;
    }
  }
  .timeItem{
    margin-left: 1rem;
  }
}
.progressBox{
  box-sizing: border-box;
  margin-top: 1rem;
  width: 100%;
  color:#898989;
}
.topLine{
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.NumberStyle{
  font-size: 1.8rem;
}
.bottomTip{
  width: 100%;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
}
.footerBox{
  padding-top: 1rem;
  box-sizing: border-box;
  border-top: 1px solid #f3f4f4;
  width: 100%;
  height: 3rem;
  display: flex;
  justify-content: end;
  align-items: center;
  background-color: #f9fafb;
}
.editBtn{
  padding: 0.5rem 1.5rem;
  margin-right: 1rem;
  border: 1px solid #1e3a8a;
  background-color: #fff;
  color: #1e3a8a;
  border-radius: 0.5rem;
  cursor: pointer;
}
.editBtn:hover{
  background-color: #f3f4f4;
}
.saveBtn{
  padding: 0.5rem 1.5rem;
  margin-right: 1rem;
  background-color: #1e3a8a;
  color: #ffffff;
  border-radius: 0.5rem;
  cursor: pointer;
}
.saveBtn:hover{
  background-color: #5674c6;
}
.closeBtn{
   padding: 0.5rem 1.5rem;
  margin-right: 1rem;
  background-color: rgb(231, 43, 43);
  color: #ffffff;
  border-radius: 0.5rem;
  cursor: pointer;
}
.closeBtn:hover{
  background-color: red;
}
</style>
