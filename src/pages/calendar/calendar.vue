<template>
  <div class="bigBox_Calendar">
    <div class="calendar-container">
      <!-- 头部导航 -->
      <div class="calendar-header">
        <div class="header-left">
          <button class="nav-btn" @click="previousMonth">
            <span class="arrow">‹</span>
          </button>
          <div class="current-month">{{ formatMonth(currentMonth) }}</div>
          <button class="nav-btn" @click="nextMonth">
            <span class="arrow">›</span>
          </button>
          <button class="today-btn" @click="goToToday">{{ $t('calendar.Today') }}</button>
        </div>
        <div class="header-right">
          <!-- 筛选按钮 -->
            <el-popover
                ref="languagePopoverRef"
                trigger="click"
                width="250px"
              >
                <template #reference>
                  <button class="filter-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 12.46 14 19 22 3"></polygon>
                  </svg>
                  {{ $t('calendar.Filters') }}
                </button>
                </template>
                 <template #default>
                  <div class="filter-panel">
                    <div class="filter-section">
                      <label>负责人</label>
                      <el-select
                        v-model="filters.assignee"
                        placeholder="全部"
                        clearable
                        multiple
                        collapse-tags
                        collapse-tags-tooltip
                        class="filter-select"
                      >
                        <el-option
                          v-for="user in allUsers"
                          :key="user.userId"
                          :label="user.name"
                          :value="user.userId"
                        />
                      </el-select>
                    </div>

                    <div class="filter-section">
                      <label>创建者</label>
                      <el-select
                        v-model="filters.creator"
                        placeholder="全部"
                        clearable
                        multiple
                        collapse-tags
                        collapse-tags-tooltip
                        class="filter-select"
                      >
                        <el-option
                          v-for="user in allUsers"
                          :key="user.userId"
                          :label="user.name"
                          :value="user.userId"
                        />
                      </el-select>
                    </div>
                    <div class="filter-section">
                      <label>优先级</label>
                      <el-select
                        v-model="filters.priority"
                        placeholder="全部"
                        clearable
                        multiple
                        collapse-tags
                        collapse-tags-tooltip
                        class="filter-select"
                      >
                        <el-option label="Critical" value="Critical"></el-option>
                        <el-option label="High" value="High"></el-option>
                        <el-option label="Medium" value="Medium"></el-option>
                        <el-option label="Low" value="Low"></el-option>
                        <el-option label="Negligible" value="Negligible"></el-option>
                      </el-select>
                    </div>
                    <div style="width: 100%;
                      display: flex;
                      justify-content: end;
                      margin-top: 1rem;
                      padding-top: 1rem;
                      border-top: 1px solid #e2e8f0;">
                      <div @click="clearFilters" style="width: fit-content;
                        padding: 0.5rem;
                        border: 1px solid #e2e8f0;
                        background: #f8fafc;
                        border-radius: 0.25rem;
                        cursor: pointer;
                        font-size: 0.875rem;">
                        恢复默认
                      </div>
                    </div>
                  </div>
                 </template>
                </el-popover>
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color in-progress" :class="filters.status.includes('InProgress') ? 'in-progress_selected' : ''" @click="selectStaus('InProgress')"></div>
              <span>In Progress</span>
            </div>
            <div class="legend-item">
              <div class="legend-color completed" :class="filters.status.includes('Completed') ? 'completed_selected' : ''" @click="selectStaus('Completed')"></div>
              <span>Completed</span>
            </div>
            <div class="legend-item">
              <div class="legend-color overdue" :class="filters.status.includes('Overdue') ? 'overdue_selected' : ''" @click="selectStaus('Overdue')"></div>
              <span>Overdue</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 日历网格 -->
      <div class="calendar-grid-container">
        <div class="week-header">
          <div v-for="(day, index) in weekDays" :key="index" class="day-header">
            {{ day }}
          </div>
        </div>

        <div class="calendar-body">
          <div
            v-for="(week, weekIndex) in calendarWeeks"
            :key="weekIndex"
            class="week-row"
            :style="{ minHeight: `${getWeekHeight(week)}px` }"
          >
            <!-- 背景网格单元格 -->
            <div class="week-bg-grid">
              <div
                v-for="(day, dayIndex) in week"
                :key="dayIndex"
                class="day-cell"
                :class="{
                  today: isSameDay(day, new Date()),
                  'other-month': day.getMonth() !== currentMonth.getMonth(),
                }"
              >
                <span class="day-number">{{ day.getDate() }}</span>
              </div>
            </div>

            <!-- 任务图层 -->
            <div class="task-layer">
              <div
                v-for="task in getTasksForWeek(week)"
                :key="`${task.id}-${weekIndex}`"
                class="task-bar"
                :class="getTaskClass(task)"
                :style="getTaskStyle(task, week)"
                @click="handleTaskClick(task)"
              >
                <div class="task-content">
                  <AlertCircle
                    v-if="task.status === 'Overdue'"
                    :size="14"
                    class="task-icon"
                  />
                  <CheckCircle
                    v-else-if="task.status === 'Completed'"
                    :size="14"
                    class="task-icon"
                  />
                  <div
                    v-if="
                      task.assignees.length > 0 &&
                      task.status !== 'Overdue' &&
                      task.status !== 'Completed'
                    "
                    class="user-avatar"
                  >
                    {{ getUserInitials(task.assignees[0]) }}
                  </div>
                  <span class="task-title">{{ task.taskName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <el-dialog
    v-model="MessageDialogVisible"
    title="Add New Task"
    width="800"
    align-center
  >
  <template #header>
    <div class="topTitle">Created on {{ MessageTask.createLine }}</div>
    <div class="taskName">{{ MessageTask.taskName }}</div>
    <div style="width: 100%; height: 1px; background: #f3f4f4;"></div>
  </template>
  <div class="contentBox">
    <div class="contentBoxLeft">
      <div class="tipTitle">Description</div>
      <div class="descriptionBox">{{ MessageTask.description }}</div>
        <div class="progressBox">
    <div class="topLine">
      <div>
        <div style="color:black;">Task Progress</div>
        <div v-if="ifCreator">Drag to update completion status</div>
      </div>
      <div class="NumberStyle" :style="{ color:customColorMethod(MessageTask.percentage) }">{{MessageTask.percentage}}%</div>
    </div>
    <el-progress
      v-if="!ifAssignee && !ifCreator"
      :color="customColorMethod"
      :percentage="MessageTask.percentage"
      :show-text="false"
    />
    <el-slider v-if="ifAssignee || ifCreator" v-model="MessageTask.percentage" />
    <div class="bottomTip">
      <div>Not Started</div>
      <div>Completed</div>
    </div>
  </div>
    </div>
    <div class="contentBoxRight">
      <div class="smallTip">CREATOR</div>
      <div class="creatorBox">
        <div class="picBox">
          <img :src="findUserPic(MessageTask.createUser)" alt="用户头像">
        </div>
        <div class="nameStyle">{{ findUser(MessageTask.createUser) }}</div>
      </div>
      <div class="smallTip">ASSIGNEE</div>
      <div class="assigneeBox">
        <div class="creatorBox assigneeItem" v-for="item in MessageTask.assignee">
          <div class="picBox">
            <img :src="findUserPic(item)" alt="用户头像"></img>
          </div>
          <div class="nameStyle">{{ findUser(item) }}</div>
        </div>
      </div>
      <div class="smallTip">PRIORITY</div>
      <div class="priorityBox" :class="tagStyles( MessageTask.priority )">{{ MessageTask.priority }}</div>
      <div class="smallTip">TIMEFRAME</div>
      <div class="timeBox">
        <div class="timePicBox">
          <img src="@/assets/icons/日历.png" alt="日历图标">
        </div>
        <div class="timeItem">
          <div style="color: #898989; font-size: 0.8rem;">Due Date</div>
          <div>{{ MessageTask.dueLine }}</div>
        </div>
      </div>
    </div>
  </div>

  <template #footer>
    <div class="footerBox">
      <div v-if="ifCreator" class="editBtn" @click="EditMessage">Edit</div>
      <div v-if="ifAssignee || ifCreator" class="saveBtn" @click="SaveMessage">Save</div>
      <div v-if="ifCreator" class="closeBtn" @click="handleDelete">Delete</div>
      <div v-if="!ifAssignee && !ifCreator" class="editBtn" @click="MessageDialogVisible = false">Close</div>
    </div>
  </template>
  </el-dialog>
  <el-dialog
    v-model="centerDialogVisible"
    :title="otherStore.ifEditTask ? 'Edit Task' : 'Add New Task'"
    width="800"
    align-center
  >
    <TaskCard v-if="centerDialogVisible" ref="taskCardRef" :task="MessageTask"></TaskCard>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible = false" class="cancelBtn"
          >Cancel</el-button
        >
        <el-button v-if="!otherStore.ifEditTask" type="primary" @click="handleSubmit" class="confirmBtn">
          Creat Task
        </el-button>
        <el-button v-if="otherStore.ifEditTask" type="primary" @click="submitEdit" class="confirmBtn">
          Save Changes
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useTasksStore, type Task } from "@/stores/tasksStore";
import { AlertCircle, CheckCircle } from "lucide-vue-next";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/stores/userStore";
import { useOtherStore } from "@/stores/otherStore";
import { ElSelect, ElOption } from "element-plus";
import TaskCard from "@/components/TaskCard.vue";
const userStore = useUserStore();
const otherStore = useOtherStore();
const tasksStore = useTasksStore();
const currentMonth = ref(new Date());
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MessageDialogVisible = ref(false);
const centerDialogVisible = ref(false);
const taskCardRef = ref<InstanceType<typeof TaskCard> | null>(null);
const MessageTask = reactive({
  id: "",
  taskName: "",
  description: "",
  priority: "",
  createLine: "",
  dueLine: "",
  createUser: "",
  assignee: [] as string[],
  percentage: 0
});
// 筛选条件
const filters = ref({
  assignee: [] as string[],
  creator: [] as string[],
  status: [] as string[],
  priority: [] as string[],
});
// 所有用户列表
const allUsers = computed(() => {
  return userStore.usersTable;
});

//判断是否是任务创建者
const ifCreator = computed(() => {
  return MessageTask.createUser === userStore.user.userId;
})
//判断是否是任务负责人
const ifAssignee = computed(() => {
  return MessageTask.assignee.includes(userStore.user.userId);
})
const EditMessage = () => {
  // 使用 $patch 安全更新
  otherStore.$patch({ ifEditTask: true });
  MessageDialogVisible.value = false;
  centerDialogVisible.value = true;
}
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
const submitEdit = () => {
    try {
    // 访问子组件暴露的数据
    const componentData = JSON.parse(
      JSON.stringify(taskCardRef.value?.formData),
    ); // 深拷贝
    componentData.dueLine = formatDate(new Date(componentData.dueLine));
    componentData.createUser = userStore.user.userId;
     const index = tasksStore.allTasks.findIndex((task) => task.id === MessageTask.id);
    tasksStore.allTasks[index] = { ...componentData };
    ElMessage({
      message: "Edit Task Success",
      type: "success",
    });
  } catch (error) {
    console.error("获取数据失败:", error);
    ElMessage({
      message: "Edit Task Failed",
      type: "error",
    });
  }
  centerDialogVisible.value = false;
}
// 删除任务
const handleDelete = () => {
    ElMessageBox.confirm(
    'Are you sure to delete this task?',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {
      const index = tasksStore.allTasks.findIndex((task) => task.id === MessageTask.id);
      if (index !== -1) {
        tasksStore.allTasks.splice(index, 1);
      }
      MessageDialogVisible.value = false;
      ElMessage({
        type: 'success',
        message: 'Delete completed',
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Delete canceled',
      })
    })
};
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
const findUserPic = (userId: string) => {
    return userStore.usersTable.find((user) => user.userId === userId)?.pic;
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



// 判断两个日期是否相同
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// 获取日历网格（按周分组）
const getCalendarGrid = (year: number, month: number): Date[][] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  // 获取上个月的最后几天
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const calendar: Date[] = [];

  // 填充上个月的日期
  for (let i = startDay - 1; i >= 0; i--) {
    calendar.push(new Date(year, month - 1, prevMonthLastDay - i));
  }

  // 填充当前月的日期
  for (let i = 1; i <= totalDays; i++) {
    calendar.push(new Date(year, month, i));
  }

  // 填充下个月的日期，确保是7的倍数
  while (calendar.length % 7 !== 0) {
    calendar.push(
      new Date(year, month + 1, calendar.length - startDay - totalDays + 1),
    );
  }

  // 按周分组
  const weeks: Date[][] = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }

  return weeks;
};

// 计算日历周
const calendarWeeks = computed(() => {
  return getCalendarGrid(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth(),
  );
});

// 格式化月份显示
const formatMonth = (date: Date): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

// 前一个月
const previousMonth = () => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentMonth.value = newDate;
};

// 后一个月
const nextMonth = () => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentMonth.value = newDate;
};

// 回到今天
const goToToday = () => {
  currentMonth.value = new Date();
};

// 转换任务数据格式
const getNormalizedTasks = computed(() => {
  return tasksStore.allTasks.map((task) => ({
    ...task,
    startDate: new Date(task.createLine),
    endDate: new Date(task.dueLine),
    status: getTaskStatus(task),
    assignees: task.assignee,
  }));
});
const selectStaus = (status: string) => {
  if(filters.value.status.includes(status)){
    filters.value.status = filters.value.status.filter(s => s !== status);
  }else{
    filters.value.status.push(status);
  }
}
// 根据筛选条件过滤任务
const getFilteredTasks = computed(() => {
  let tasks = getNormalizedTasks.value;

  if (filters.value.assignee.length > 0) {
    tasks = tasks.filter((task) =>
      task.assignee.some((a: string) => filters.value.assignee.includes(a))
    );
  }

  if (filters.value.creator.length > 0) {
    tasks = tasks.filter((task) => filters.value.creator.includes(task.createUser));
  }

  if (filters.value.status.length > 0) {
    tasks = tasks.filter((task) => filters.value.status.includes(task.status));
  }

  if (filters.value.priority.length > 0) {
    tasks = tasks.filter((task) => filters.value.priority.includes(task.priority));
  }

  return tasks;
});

// 根据百分比和截止日期确定任务状态
const getTaskStatus = (task: Task): string => {
  if (task.percentage === 100) return "Completed";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.dueLine);
  dueDate.setHours(0, 0, 0, 0);
  if (dueDate < today && task.percentage < 100) return "Overdue";
  return "InProgress";
};

// 获取用户名首字母
const getUserInitials = (userId: string): string => {
  return userStore.getUserNameById(userId).slice(0,2);
};

// 获取某周的任务
const getTasksForWeek = (week: Date[]) => {
  const weekStart = new Date(week[0]);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(week[6]);
  weekEnd.setHours(0, 0, 0, 0);

  const tasksInWeek = getFilteredTasks.value.filter((task) => {
    const tStart = new Date(task.startDate);
    tStart.setHours(0, 0, 0, 0);
    const tEnd = new Date(task.endDate);
    tEnd.setHours(0, 0, 0, 0);
    return tEnd >= weekStart && tStart <= weekEnd;
  });

  // 按开始时间和持续时间排序
  tasksInWeek.sort((a, b) => {
    const aStart = new Date(a.startDate);
    aStart.setHours(0, 0, 0, 0);
    const bStart = new Date(b.startDate);
    bStart.setHours(0, 0, 0, 0);

    if (aStart.getTime() !== bStart.getTime()) {
      return aStart.getTime() - bStart.getTime();
    }

    const aEnd = new Date(a.endDate);
    aEnd.setHours(0, 0, 0, 0);
    const bEnd = new Date(b.endDate);
    bEnd.setHours(0, 0, 0, 0);

    const durA = aEnd.getTime() - aStart.getTime();
    const durB = bEnd.getTime() - bStart.getTime();
    return durB - durA;
  });

  // 分配车道，避免重叠
  return assignLanes(tasksInWeek, weekStart, weekEnd);
};

// 为任务分配车道
const assignLanes = (tasks: any[], weekStart: Date, weekEnd: Date) => {
  const lanes: any[][] = [];
  const taskLaneMap = new Map<string, number>();

  tasks.forEach((task) => {
    let laneIndex = 0;
    while (true) {
      const lane = lanes[laneIndex] || [];

      const hasOverlap = lane.some((existingTask) => {
        const t1Start = new Date(existingTask.startDate);
        t1Start.setHours(0, 0, 0, 0);
        const t1End = new Date(existingTask.endDate);
        t1End.setHours(0, 0, 0, 0);

        const t2Start = new Date(task.startDate);
        t2Start.setHours(0, 0, 0, 0);
        const t2End = new Date(task.endDate);
        t2End.setHours(0, 0, 0, 0);

        const s1 = t1Start < weekStart ? weekStart : t1Start;
        const e1 = t1End > weekEnd ? weekEnd : t1End;
        const s2 = t2Start < weekStart ? weekStart : t2Start;
        const e2 = t2End > weekEnd ? weekEnd : t2End;

        return s1 <= e2 && s2 <= e1;
      });

      if (!hasOverlap) {
        if (!lanes[laneIndex]) lanes[laneIndex] = [];
        lanes[laneIndex].push(task);
        taskLaneMap.set(task.id, laneIndex);
        break;
      }
      laneIndex++;
    }
  });

  return tasks.map((task) => ({
    ...task,
    laneIndex: taskLaneMap.get(task.id) || 0,
  }));
};

// 计算周高度
const getWeekHeight = (week: Date[]): number => {
  const tasks = getTasksForWeek(week);
  const lanes = new Set(tasks.map((t) => t.laneIndex));
  const tasksHeight = lanes.size * 32;
  const minHeight = 140;
  return Math.max(minHeight, 32 + tasksHeight + 10);
};

// 获取任务样式类
const getTaskClass = (task: any): string => {
  switch (task.status) {
    case "InProgress":
      return "task-in-progress";
    case "Completed":
      return "task-completed";
    case "Overdue":
      return "task-overdue";
    default:
      return "task-default";
  }
};

// 获取任务位置样式
const getTaskStyle = (task: any, week: Date[]) => {
  const weekStart = new Date(week[0]);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(week[6]);
  weekEnd.setHours(0, 0, 0, 0);

  const taskStart = new Date(task.startDate);
  taskStart.setHours(0, 0, 0, 0);
  const taskEnd = new Date(task.endDate);
  taskEnd.setHours(0, 0, 0, 0);

  // 如果任务开始在周之前，使用周开始
  const adjustedStart = taskStart < weekStart ? weekStart : taskStart;
  // 如果任务结束在周之后，使用周结束
  const adjustedEnd = taskEnd > weekEnd ? weekEnd : taskEnd;

  const offsetDays = Math.floor(
    (adjustedStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24),
  );
  const durationDays =
    Math.floor(
      (adjustedEnd.getTime() - adjustedStart.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;

  const validOffset = Math.max(0, offsetDays);
  const validDuration = Math.min(7 - validOffset, durationDays);

  const left = `${(validOffset / 7) * 100}%`;
  const width = `${(validDuration / 7) * 100}%`;
  const top = task.laneIndex * 32;

  return {
    left: `calc(${left} + 0px)`,
    width: `calc(${width} - 25px)`,
    top: `${top}px`,
  };
};

// 处理任务点击
const handleTaskClick = (task: any) => {
  Object.assign(MessageTask, task);
  // 打开对话框
  MessageDialogVisible.value = true;
};
// 清空筛选
const clearFilters = () => {
  filters.value = {
    assignee: [],
    creator: [],
    priority: [],
    status: ['InProgress', 'Completed', 'Overdue']
  };
    //默认只展示本人的任务
  filters.value.assignee.push(userStore.user.userId);
};

onMounted(() => {
  //默认展示全部任务
  filters.value.status.push('InProgress');
  filters.value.status.push('Completed');
  filters.value.status.push('Overdue');
  //默认只展示本人的任务
  filters.value.assignee.push(userStore.user.userId);
});
</script>

<style scoped lang="scss">
.bigBox_Calendar {
  width: 98%;
  height: 98%;
  overflow: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.calendar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }
}

.arrow {
  font-size: 1.25rem;
  color: #64748b;
}

.current-month {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  min-width: 10rem;
  text-align: center;
}

.today-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;

    &:hover {
      background: #f8fafc;
    }

    svg {
      color: #64748b;
    }
  }
  .filter-panel {
    width: 100%;
    margin-top: 0.5rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    padding: 1rem;
    min-width: 280px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .filter-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #475569;
    }

    .filter-select {
      width: 100%;
    }
  }

  .legend {
    display: flex;
    gap: 1rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #64748b;
  }

  .legend-color {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 0.25rem;
    cursor: pointer;
    &.in-progress {
      background: #dbeafe;
      border: 2px solid #3b82f6;
    }
    &.in-progress_selected {
      background: #3b82f6;
    }

    &.completed {
      background: #dcfce7;
      border: 2px solid #10b981;
    }
    &.completed_selected {
      background: #10b981;
    }

    &.overdue {
      background: #fee2e2;
      border: 2px solid #ef4444;
    }
    &.overdue_selected {
      background: #ef4444;
    }
  }
}

.calendar-grid-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.week-header {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.day-header {
  flex: 1;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  border-right: 1px solid #e2e8f0;
}

.calendar-body {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  display: flex;
  flex-direction: column;
}

.week-row {
  position: relative;
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
  min-width: 100%;
}

.week-bg-grid {
  position: absolute;
  inset: 0;
  display: flex;
  height: 100%;
  pointer-events: none;
}

.day-cell {
  flex: 1;
  padding: 0.5rem;
  border-right: 1px solid #f1f5f9;
  position: relative;

  &.other-month {
    background: rgba(248 250 252 / 0.5);
  }

  &.today .day-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    background: #3b82f6;
    color: white;
    border-radius: 9999px;
    font-weight: 600;
    box-shadow: 0 1px 2px 0 rgb(59 130 246 / 0.4);
  }
}

.day-number {
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
}

.task-layer {
  position: absolute;
  inset: 0;
  top: 2rem;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 0.125rem;
  pointer-events: none;
}

.task-bar {
  position: absolute;
  height: 1.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  cursor: pointer;
  pointer-events: auto;
  transition: filter 0.15s;
  box-shadow: 0 1px 1px 0 rgb(0 0 0 / 0.05);
  border-left-width: 4px;
  border-left-style: solid;

  &:hover {
    filter: brightness(0.95);
  }

  &.task-in-progress {
    background: rgba(59 130 246 / 0.1);
    color: #1d4ed8;
    border-left-color: #3b82f6;
  }

  &.task-completed {
    background: rgba(16 185 129 / 0.1);
    color: #059669;
    border-left-color: #10b981;
  }

  &.task-overdue {
    background: #ef4444;
    color: white;
    border-left-color: transparent;
    box-shadow: 0 4px 6px -1px rgb(239 68 68 / 0.2);
  }

  &.task-default {
    background: #f3f4f6;
    color: #374151;
    border-left-color: #d1d5db;
  }
}

.task-content {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  width: 100%;
  overflow: hidden;
}

.task-icon {
  flex-shrink: 0;
}

.task-overdue .task-icon {
  color: white;
}

.task-completed .task-icon {
  color: #10b981;
}

.user-avatar {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  font-weight: 700;
  color: #3b82f6;
  box-shadow: 0 1px 1px 0 rgb(0 0 0 / 0.05);
  border: 1px solid rgb(239 246 255);
  flex-shrink: 0;
}

.task-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
