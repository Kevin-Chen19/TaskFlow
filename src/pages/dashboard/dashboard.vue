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
          :footerContent="`${projectStats.total_hours}h`"
        ></CardTamp>
      </div>
      <div class="cardItem">
        <CardTamp
          :topLeftImg="taskIcon"
          topLeftBgc="rgba(167, 234, 167, 0.777)"
          :bodyContent="$t('Dashboard.tasksProgress')"
          :footerContent="`${projectStats.completed_tasks}/${projectStats.total_tasks}`"
        ></CardTamp>
      </div>
      <div class="cardItem">
        <CardTamp
          :topLeftImg="WarningIcon"
          topLeftBgc="#f5e5d3a5"
          :bodyContent="$t('Dashboard.earlyWarning')"
          :footerContent="String(projectStats.warning_tasks)"
        ></CardTamp>
      </div>
      <div class="cardItem">
        <CardTamp
          :topLeftImg="ExpiredIcon"
          topLeftBgc="rgba(227, 158, 158, 0.739)"
          :bodyContent="$t('Dashboard.expiredTasks')"
          :footerContent="String(projectStats.expired_tasks)"
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
            :timestamp="formatMilestoneDate(activity.date)"
          >
            <span
              style="font-size: larger; cursor: pointer"
              @click="editMilestone(index)"
              >{{ $t("Dashboard.phase") }}{{ index + 1 }}:
              {{ activity.content }}</span
            >
            <el-icon @click="handleDeleteMilestone(index)" class="delete-icon"
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
              <div
                class="noteSelect"
                @click="
                  changeNoteStatus(item.id, index);
                  item.status = !item.status;
                "
              >
                <img
                  v-if="item.status"
                  src="@/assets/icons/通过.png"
                  alt="通过图标"
                />
              </div>
              <div class="item_content">{{ item.description }}</div>
              <div class="delete">
                <el-icon @click="deleteNotes(item.id, index)"
                  ><Delete
                /></el-icon>
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
            <div
              class="noteItem"
              v-for="item in userStore.usersTable"
              :key="item.name"
            >
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
    :title="$t('Dashboard.addNewNote')"
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
        <el-button @click="noteDialogVisible = false" class="cancelBtn">
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
import { useOtherStore } from "@/stores/otherStore";
import { Check, Refresh, Delete } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/userStore";
import type { TimelineItemProps } from "element-plus";
import { ElMessage } from "element-plus";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getProjectStats,
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from "@/api";
const otherStore = useOtherStore();
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

// 项目统计数据
const projectStats = reactive({
  total_hours: 0,
  total_tasks: 0,
  completed_tasks: 0,
  warning_tasks: 0,
  expired_tasks: 0,
});

interface ActivityType {
  id?: number;
  content: string;
  date: string;
  color?: string;
  icon?: any;
  type?: string;
  size?: string;
  hollow?: boolean;
  timestamp?: string;
}

const activities = reactive<ActivityType[]>([]);
const notes = reactive<any[]>([]);
const customColorMethod = (percentage: number) => {
  if (percentage < 30) {
    return "#909399";
  }
  if (percentage < 70) {
    return "#e6a23c";
  }
  return "#67c23a";
};
// 删除笔记
const deleteNotes = async (id: number, index: number) => {
  try {
    const res = await deleteNote(id);
    if (res.success) {
      notes.splice(index, 1);
      //不需要发送不必要请求
      //getNotes();
    }
  } catch (e) {
    console.error("删除笔记失败:", e);
  }
};
const newProjectCardRef = ref<InstanceType<typeof NewProjectCard> | null>(null);

const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 格式化里程碑日期显示
const formatMilestoneDate = (date: string): string => {
  const formattedDate = formatDate(date);
  const milestoneDate = new Date(date);
  const today = new Date();
  // 设置当天时间为0点进行日期比较
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(milestoneDate);
  compareDate.setHours(0, 0, 0, 0);
  
  if (compareDate < today) {
    return `已完成于：${formattedDate}`;
  } else {
    return `计划于：${formattedDate}`;
  }
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
      message: t("Dashboard.CreateProjectSuccess"),
      type: "success",
    });
  } catch (error) {
    console.error("获取数据失败:", error);
    ElMessage({
      message: t("Dashboard.CreateProjectFailed"),
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
const submitNote = async () => {
  console.log(noteContent);
  try {
    const res = await createNote({
      project_id: otherStore.currentProjectId,
      creator_id: userStore.user.userId,
      description: noteContent.value,
      status: false,
    });
    //重新获取笔记列表
    getNote();
  } catch (e) {
    console.log("创建笔记失败", e);
  } finally {
    console.log(notes);
    noteContent.value = "";
    noteDialogVisible.value = false;
  }
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
  if (!activities[index]) return;
  isEditingMilestone.value = true;
  editingMilestoneIndex.value = index;
  // 填充表单
  milestoneData.content = activities[index].content || "";
  milestoneData.dueLine = activities[index].date || "";
  TimeLineDialogVisible.value = true;
};

// 删除里程碑
const handleDeleteMilestone = async (index: number) => {
  const milestone = activities[index];
  if (!milestone || !milestone.id) {
    // 如果没有 id，从本地数组删除（用于未保存的临时数据）
    activities.splice(index, 1);
    getActivityDisplayProps();
    ElMessage({
      message: t("deleteSuccess"),
      type: "success",
    });
    return;
  }

  try {
    const res = await deleteMilestone(milestone.id);
    if (res.success) {
      activities.splice(index, 1);
      getActivityDisplayProps();
      ElMessage({
        message: t("deleteSuccess"),
        type: "success",
      });
    }
  } catch (error) {
    console.error("删除里程碑失败:", error);
    ElMessage({
      message: t("deleteFailed"),
      type: "error",
    });
  }
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
    return t("Dashboard.scheduledOn") + `${date}`;
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
    if (!activities[i]) continue;
    (activities[i] as any).color = "#0bbd87";
    (activities[i] as any).icon = Check;
  }

  // 为第一个未完成的项添加刷新图标
  const nextIndex = lastCompletedIndex + 1;
  if (nextIndex < activities.length && activities[nextIndex]) {
    (activities[nextIndex] as any).color = "#24a4af";
    (activities[nextIndex] as any).icon = Refresh;
  }
};

// 保存里程碑
const saveMilestone = async () => {
  if (!milestoneData.content || !milestoneData.dueLine) {
    ElMessage({
      message: t("pleaseFillAll"),
      type: "warning",
    });
    return;
  }

  const formattedDate = formatDate(milestoneData.dueLine);

  if (isEditingMilestone.value && editingMilestoneIndex.value !== -1) {
    // 编辑模式：更新现有里程碑
    const milestone = activities[editingMilestoneIndex.value];
    if (milestone && milestone.id) {
      // 有 id，调用后端 API 更新
      try {
        const res = await updateMilestone(milestone.id, {
          content: milestoneData.content,
          due_date: formattedDate,
        });
        if (res.success) {
          milestone.content = milestoneData.content;
          milestone.date = formattedDate;
          // 重新排序
          activities.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );
          // 重新计算显示属性
          getActivityDisplayProps();
          ElMessage({
            message: t("updatedSuccess"),
            type: "success",
          });
        }
      } catch (error) {
        console.error("更新里程碑失败:", error);
        ElMessage({
          message: t("updateFailed"),
          type: "error",
        });
        return;
      }
    }
  } else {
    // 新增模式：创建新里程碑
    try {
      const res = await createMilestone({
        project_id: otherStore.currentProjectId,
        content: milestoneData.content,
        due_date: formattedDate,
      });
      if (res.success && res.data) {
        // 添加新里程碑到数组
        const newMilestone = {
          id: res.data.id,
          content: milestoneData.content,
          date: formattedDate,
          size: "large",
        };
        activities.push(newMilestone);
        // 按日期排序
        activities.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        // 重新计算显示属性
        getActivityDisplayProps();
        ElMessage({
          message: t("addSuccessfully"),
          type: "success",
        });
      }
    } catch (error) {
      console.error("创建里程碑失败:", error);
      ElMessage({
        message: t("addFailed"),
        type: "error",
      });
      return;
    }
  }

  // 清空表单并关闭对话框
  milestoneData.content = "";
  milestoneData.dueLine = "";
  isEditingMilestone.value = false;
  editingMilestoneIndex.value = -1;
  TimeLineDialogVisible.value = false;
};
const getNote = async () => {
  try {
    const res = await getNotes({
      project_id: otherStore.currentProjectId,
      creator_id: userStore.user.userId,
    });
    notes.splice(0, notes.length, ...res.data);
    console.log(res);
  } catch (e) {
    console.log("获取笔记失败", e);
  }
};
const changeNoteStatus = async (id: number, index: number) => {
  try {
    const stu = notes[index].status;
    const res = await updateNote(id, {
      status: !stu,
    });
    if (res.success) {
      notes[index].status = !stu;
      //无需多余网络请求
      //getNote()
    }
  } catch (e) {
    console.log("笔记更新失败", e);
  }
};

// 加载里程碑数据
const loadMilestones = async () => {
  try {
    const res = await getMilestones({
      project_id: otherStore.currentProjectId,
    });
    if (res.success && res.data) {
      // 将后端数据转换为前端格式
      activities.splice(
        0,
        activities.length,
        ...res.data.map((item: any) => ({
          id: item.id,
          content: item.content,
          date: formatDate(item.due_date),
          size: "large",
        })),
      );
      // 重新计算显示属性
      getActivityDisplayProps();
    }
  } catch (error) {
    console.error("加载里程碑数据失败:", error);
  }
};

// 加载项目统计数据
const loadProjectStats = async () => {
  try {
    const projectId = otherStore.currentProjectId;
    if (!projectId) {
      console.warn("当前没有选择项目");
      return;
    }

    const res = await getProjectStats(projectId);
    if (res.success && res.data) {
      projectStats.total_hours = res.data.project_hours;
      projectStats.total_tasks = res.data.total_tasks;
      projectStats.completed_tasks = res.data.completed_tasks;
      projectStats.warning_tasks = res.data.warning_tasks;
      projectStats.expired_tasks = res.data.expired_tasks;
    }
  } catch (error) {
    console.error("加载项目统计数据失败:", error);
  }
};

// 组件挂载时初始化显示属性
onMounted(() => {
  // 等待 userStore 初始化完成后再获取数据
  const initData = () => {
    loadMilestones(); // 加载里程碑数据
    getNote(); // 获取便签
    loadProjectStats(); // 加载项目统计
  };

  if (userStore.user.userId) {
    initData();
  } else {
    // 如果 userId 还未初始化，延迟调用
    const checkUserId = setInterval(() => {
      if (userStore.user.userId) {
        clearInterval(checkUserId);
        initData();
      }
    }, 100);
    // 设置超时保护，最多等待 3 秒
    setTimeout(() => {
      clearInterval(checkUserId);
    }, 3000);
  }
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
