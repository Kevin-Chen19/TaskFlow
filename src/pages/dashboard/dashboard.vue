<template>
  <div class="bigBox">
    <div class="bigTitle">{{ $t("Dashboard.dashboard") }}</div>
    <div class="Line_two">
      <span class="smallText">{{ $t("Dashboard.pageTip") }}</span>
      <div class="new_task" @click="openNewProjectDialog">
        {{ $t("Dashboard.newProject") }}
      </div>
    </div>
    <div class="cards">
      <div class="cardItem">
        <CardTamp
          :topLeftImg="TimeIcon"
          :bodyContent="$t('Dashboard.totalHours')"
          footerContent="100.5h"
        ></CardTamp>
      </div>
      <div class="cardItem">
        <CardTamp
          :topLeftImg="taskIcon"
          topLeftBgc="rgba(167, 234, 167, 0.777)"
          :bodyContent="$t('Dashboard.tasksProgress')"
          footerContent="23/100"
        ></CardTamp>
      </div>
      <div class="cardItem">
        <CardTamp
          :topLeftImg="WarningIcon"
          topLeftBgc="#f5e5d3a5"
          :bodyContent="$t('Dashboard.earlyWarning')"
          footerContent="3"
        ></CardTamp>
      </div>
      <div class="cardItem">
        <CardTamp
          :topLeftImg="ExpiredIcon"
          topLeftBgc="rgba(227, 158, 158, 0.739)"
          :bodyContent="$t('Dashboard.expiredTasks')"
          footerContent="0"
        ></CardTamp>
      </div>
    </div>
    <div class="bottomBox">
      <div class="TimeLine">
        <span class="MiddleTitle">{{ $t("Dashboard.projectMilestones") }}</span>
        <div class="Line_two" style="margin-bottom: 1.5rem">
          <span style="color: #909cad">{{ $t("Dashboard.phases_key") }}</span>
          <span class="GanttSty" @click="addMilestone">{{
            $t("Dashboard.addMilEvent")
          }}</span>
        </div>
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :icon="activity.icon"
            :type="activity.type"
            :color="activity.color"
            :size="activity.size"
            :hollow="activity.hollow"
            :timestamp="getDisplayTimestamp(activity.date)"
          >
            <span
              style="font-size: larger; cursor: pointer"
              @click="editMilestone(index)"
              >{{ $t("Dashboard.phase") }}{{ index + 1 }}:
              {{ activity.content }}</span
            >
            <el-icon @click="deleteMilestone(index)" class="delete-icon"
              ><Delete
            /></el-icon>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div class="Team_Note">
        <div class="NoteBox">
          <span class="noteStyle">{{ $t("Dashboard.notes") }}</span>
          <div class="noteItemBox">
            <div class="noteItem" v-for="(item, index) in notes" :key="item.id">
              <div class="noteSelect" @click="item.ifFinish = !item.ifFinish">
                <img
                  v-if="item.ifFinish"
                  src="@/assets/icons/通过.png"
                  alt="通过图标"
                />
              </div>
              <div class="item_content">{{ item.content }}</div>
              <div class="delete">
                <el-icon @click="deleteNote(index)"><Delete /></el-icon>
              </div>
            </div>
          </div>
          <div class="addBtn" @click="addNote">
            {{ $t("Dashboard.addNote") }}
          </div>
        </div>
        <div class="NoteBox TeamBox">
          <span class="noteStyle">{{ $t("Dashboard.memberProgress") }}</span>
          <div class="noteItemBox teamBox">
            <div class="noteItem" v-for="item in users" :key="item.name">
              <div class="userPic">
                <img :src="item.pic" alt="用户头像" />
              </div>
              <div class="userInfo">
                <div class="userName">{{ item.name }}</div>
                <div class="userOthers">
                  <div class="postion">{{ item.postion }}</div>
                  <div class="progress">
                    <el-progress
                      :percentage="item.percentage"
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
    </div>
  </div>
  <el-dialog
    v-model="centerDialogVisible"
    :title="$t('Dashboard.createProject')"
    width="800"
    align-center
  >
    <NewProjectCard
      v-if="centerDialogVisible"
      ref="newProjectCardRef"
    ></NewProjectCard>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible = false" class="cancelBtn">{{
          $t("cancel")
        }}</el-button>
        <el-button type="primary" @click="handleSubmit" class="confirmBtn">
          {{ $t("Dashboard.create_project") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="noteDialogVisible"
    :title="$t('Dashboard.addNote')"
    width="600"
    align-center
  >
    <div class="line"></div>
    <div class="inputName">{{ $t("CONTENT") }}</div>
    <el-input
      v-model="noteContent"
      :placeholder="$t('pleaseEnterContent')"
      class="content-input"
      @change="submitNote"
    ></el-input>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible = false" class="cancelBtn">
          {{ $t("cancel") }}
        </el-button>
        <el-button type="primary" @click="submitNote" class="confirmBtn">
          {{ $t("Dashboard.add_note") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="TimeLineDialogVisible"
    :title="
      isEditingMilestone
        ? t('Dashboard.editMilestone')
        : t('Dashboard.addMilEvent')
    "
    width="600"
    align-center
  >
    <div class="line"></div>
    <div class="inputName">{{ $t("CONTENT") }}</div>
    <el-input
      v-model="milestoneData.content"
      :placeholder="$t('pleaseEnterContent')"
      class="content-input"
      @change="submitNote"
    ></el-input>
    <div class="inputName">{{ $t("DUELINE") }}</div>
    <div class="dateLine-input">
      <el-date-picker
        v-model="milestoneData.dueLine"
        type="date"
        :placeholder="$t('pickADay')"
        style="width: 18rem"
      />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelMilestoneDialog" class="cancelBtn">
          {{ $t("cancel") }}
        </el-button>
        <el-button type="primary" @click="saveMilestone" class="confirmBtn">
          {{ $t("save") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import CardTamp from "../../components/cardTamp.vue";
import NewProjectCard from "../../components/newProjectCard.vue";
import TimeIcon from "@/assets/icons/时间.png";
import taskIcon from "@/assets/icons/任务.png";
import ExpiredIcon from "@/assets/icons/逾期.png";
import WarningIcon from "@/assets/icons/预警.png";
import user1 from "@/assets/pics/用户头像.jpg";
import user2 from "@/assets/pics/用户2.jpg";
import user3 from "@/assets/pics/用户3.jpg";
import user4 from "@/assets/pics/用户4.jpg";
import { Check, Refresh, Delete } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/userStore";
import type { TimelineItemProps } from "element-plus";
import { ElMessage } from "element-plus";
const centerDialogVisible = ref(false);
const noteDialogVisible = ref(false);
const TimeLineDialogVisible = ref(false);
const userStore = useUserStore();
const noteContent = ref("");
const isEditingMilestone = ref(false);
const editingMilestoneIndex = ref(-1);
const { t } = useI18n();
const milestoneData = reactive({
  content: "",
  dueLine: "",
});

interface ActivityType extends Partial<TimelineItemProps> {
  content: string;
}

const activities = reactive<ActivityType[]>([
  {
    content: "Discovery & Strategy",
    date: "2026-01-15",
    size: "large",
  },
  {
    content: "UI/UX Design",
    date: "2026-01-19",
    size: "large",
  },
  {
    content: "Development",
    date: "2026-02-10",
    size: "large",
  },
  {
    content: "Testing",
    date: "2026-02-26",
    size: "large",
  },
  {
    content: "Deployment",
    date: "2026-02-29",
    size: "large",
  },
  {
    content: "Maintenance",
    date: "2026-03-10",
    size: "large",
  },
]);
const notes = reactive([
  {
    content: "Finish the task1",
    ifFinish: true,
    id: 1,
  },
  {
    content: "Finish the task2",
    ifFinish: false,
    id: 2,
  },
  {
    content: "Finish the task3",
    ifFinish: false,
    id: 3,
  },
  {
    content: "Finish the task4",
    ifFinish: false,
    id: 4,
  },
]);
const percentage = ref(70);
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
const users = [
  {
    name: "Kevin",
    postion: "Frontend Lead",
    percentage: 60,
    pic: user1,
  },
  {
    name: "Sarah Jenkins",
    postion: "Backend Lead",
    percentage: 30,
    pic: user2,
  },
  {
    name: "David Kim",
    postion: "UI Designer",
    percentage: 90,
    pic: user3,
  },
  {
    name: "Mike Ross",
    postion: "DevOps",
    percentage: 50,
    pic: user4,
  },
];
// 删除笔记
const deleteNote = (index: number) => {
  notes.splice(index, 1);
};
const newProjectCardRef = ref<InstanceType<typeof NewProjectCard> | null>(null);

const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const handleSubmit = () => {
  try {
    // 访问子组件暴露的数据
    const componentData = JSON.parse(
      JSON.stringify(newProjectCardRef.value?.projectData),
    ); // 深拷贝
    componentData.createLine = formatDate(new Date());
    componentData.createUser = userStore.user.userId;
    //设置id为时间戳加随机数
    componentData.id = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    ElMessage({
      message: t('Dashboard.CreateProjectSuccess'),
      type: "success",
    });
  } catch (error) {
    console.error("获取数据失败:", error);
    ElMessage({
      message: t('Dashboard.CreateProjectFailed'),
      type: "error",
    });
  }
  centerDialogVisible.value = false;
};
const addNote = () => {
  noteDialogVisible.value = true;
};

const openNewProjectDialog = () => {
  centerDialogVisible.value = true;
  noteContent.value = "";
};
const submitNote = () => {
  console.log(noteContent);
  notes.push({
    content: noteContent.value,
    ifFinish: false,
    //将id设置为时间戳
    id: Date.now(),
  });
  console.log(notes);
  noteContent.value = "";
  noteDialogVisible.value = false;
};

const addMilestone = () => {
  isEditingMilestone.value = false;
  editingMilestoneIndex.value = -1;
  TimeLineDialogVisible.value = true;
  // 清空表单
  milestoneData.content = "";
  milestoneData.dueLine = "";
};

// 编辑里程碑
const editMilestone = (index: number) => {
  isEditingMilestone.value = true;
  editingMilestoneIndex.value = index;
  // 填充表单
  milestoneData.content = activities[index].content;
  milestoneData.dueLine = activities[index].date;
  TimeLineDialogVisible.value = true;
};

// 删除里程碑
const deleteMilestone = (index: number) => {
  activities.splice(index, 1);
  // 重新计算显示属性
  getActivityDisplayProps();

  ElMessage({
    message: t("deleteSuccess"),
    type: "success",
  });
};

// 取消里程碑对话框
const cancelMilestoneDialog = () => {
  TimeLineDialogVisible.value = false;
  milestoneData.content = "";
  milestoneData.dueLine = "";
  isEditingMilestone.value = false;
  editingMilestoneIndex.value = -1;
};

// 计算显示的 timestamp
const getDisplayTimestamp = (date: string): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activityDate = new Date(date);
  activityDate.setHours(0, 0, 0, 0);

  const diffTime = activityDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return t("Dashboard.completedOn") + `${date}`;
  } else {
    return t("Dashboard.scheduledOn") +  `${date}`;
  }
};

// 计算活动的显示属性（color 和 icon）
const getActivityDisplayProps = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let lastCompletedIndex = -1;

  activities.forEach((activity, index) => {
    const activityDate = new Date(activity.date);
    activityDate.setHours(0, 0, 0, 0);

    if (activityDate.getTime() < today.getTime()) {
      lastCompletedIndex = index;
    }

    // 重置 color 和 icon
    activity.color = undefined;
    activity.icon = undefined;
  });

  // 为已完成的项添加完成图标
  for (let i = 0; i <= lastCompletedIndex; i++) {
    activities[i].color = "#0bbd87";
    activities[i].icon = Check;
  }

  // 为第一个未完成的项添加刷新图标
  if (lastCompletedIndex + 1 < activities.length) {
    activities[lastCompletedIndex + 1].color = "#24a4af";
    activities[lastCompletedIndex + 1].icon = Refresh;
  }
};

// 保存里程碑
const saveMilestone = () => {
  if (!milestoneData.content || !milestoneData.dueLine) {
    ElMessage({
      message: t('pleaseFillAll'),
      type: "warning",
    });
    return;
  }

  const updatedMilestone = {
    content: milestoneData.content,
    date: formatDate(milestoneData.dueLine),
    size: "large",
  };

  if (isEditingMilestone.value && editingMilestoneIndex.value !== -1) {
    // 编辑模式：更新现有里程碑
    const originalIndex = editingMilestoneIndex.value;

    // 移除旧的里程碑
    activities.splice(originalIndex, 1);

    // 找到插入位置（按日期排序）
    let insertIndex = activities.length;
    for (let i = 0; i < activities.length; i++) {
      if (new Date(updatedMilestone.date) < new Date(activities[i].date)) {
        insertIndex = i;
        break;
      }
    }

    // 在合适的位置插入
    activities.splice(insertIndex, 0, updatedMilestone);

    ElMessage({
      message: t('updatedSuccess'),
      type: "success",
    });
  } else {
    // 新增模式：添加新里程碑
    // 找到插入位置（按日期排序）
    let insertIndex = activities.length;
    for (let i = 0; i < activities.length; i++) {
      if (new Date(updatedMilestone.date) < new Date(activities[i].date)) {
        insertIndex = i;
        break;
      }
    }

    // 在合适的位置插入
    activities.splice(insertIndex, 0, updatedMilestone);

    ElMessage({
      message: t('addSuccessfully'),
      type: "success",
    });
  }

  // 重新计算显示属性
  getActivityDisplayProps();

  // 清空表单并关闭对话框
  milestoneData.content = "";
  milestoneData.dueLine = "";
  isEditingMilestone.value = false;
  editingMilestoneIndex.value = -1;
  TimeLineDialogVisible.value = false;
};

// 组件挂载时初始化显示属性
onMounted(() => {
  getActivityDisplayProps();
});
</script>
<style scoped lang="scss">
.new_task {
  padding: 0.4rem 0.7rem;
  background-color: rgb(56, 55, 55);
  color: white;
  border-radius: 0.4rem;
  font-size: 1rem;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}
.new_task:hover {
  cursor: pointer;
  background: black;
}
.cards {
  width: 100%;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
}

.bottomBox {
  box-sizing: border-box;
  margin-top: 2rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.TimeLine {
  box-sizing: border-box;
  width: 65%;
  height: 60vh;
  overflow: auto;
  /* 隐藏标准滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  padding: 10px;
  background-color: #fff;
  border-radius: 1rem;
  font-size: large;
  box-shadow: -5px 5px 10px rgba(0, 0, 0, 0.2);
}
.MiddleTitle {
  font-size: 1.5rem;
  font-weight: 600;
}
.GanttSty {
  color: #0e8ee9;
  font-weight: 500;
}
.GanttSty:hover {
  cursor: pointer;
  color: #036eba;
}
:deep(.el-timeline-item__content) {
  font-size: 1.1rem;
}
:deep(.el-timeline-item__timestamp) {
  font-size: 1rem;
}
:deep(.el-timeline-item__node--large) {
  width: 1.5rem;
  height: 1.5rem;
}

.delete-icon {
  margin-left: 0.5rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

:deep(.el-timeline-item:hover .delete-icon) {
  opacity: 1;
}
:deep(.el-timeline-item.is-start .el-timeline-item__wrapper) {
  padding-left: 3rem;
}
:deep(.el-timeline-item.is-start .el-timeline-item__tail) {
  left: 0.6rem;
}
.Team_Note {
  width: 30%;
  height: 60vh;
  box-sizing: border-box;
}
.NoteBox {
  box-sizing: border-box;
  background-color: #fff;
  width: 100%;
  padding: 1rem;
  height: 30vh;
  overflow: auto;
  /* 隐藏标准滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  border-radius: 1rem;
  box-shadow: -5px 5px 10px rgba(0, 0, 0, 0.2);
}
.TeamBox {
  margin-top: 2vh;
  height: 28vh;
}
.noteStyle {
  font-size: 1.5rem;
  font-weight: 600;
}
.noteItemBox {
  width: 100%;
  height: 15vh;
  overflow: auto;
  /* 隐藏标准滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.teamBox {
  height: 22vh;
  margin-top: 0;
}
.noteItem {
  width: 100%;
  display: flex;
  align-items: center;
  margin-top: 1rem;
  font-size: large;
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
.item_content {
  flex: 1;
  //设置文本不换行，超出范围省略号表示
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.delete {
  margin-left: 1rem;
  cursor: pointer;
}
.addBtn {
  margin-left: 15%;
  margin-top: 1rem;
  width: 70%;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: larger;
  font-weight: 600;
  border: 1px black dotted;
  border-radius: 1.5rem;
  cursor: pointer;
}
.addBtn:hover {
  background-color: rgba(95, 211, 95, 0.726);
  color: rgb(5, 186, 5);
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
// 全局输入框样式
:deep(.el-input__wrapper) {
  border-radius: 0 !important;
  background-color: #fff !important;
  box-shadow: none !important;
  border: 1px solid #ccc !important;
}

:deep(.el-input__wrapper:focus-within) {
  border: 2px solid black !important;
}
</style>
