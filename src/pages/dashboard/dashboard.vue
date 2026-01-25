<template>
  <div class="bigBox">
    <div class="bigTitle">Project Overview</div>
    <div class="Line_two">
      <span class="smallText"
        >Welcome back,Kevin.Task Flow is on track for Q4 delivery.</span
      >
      <div class="new_task" @click="openNewTaskDialog">+ New Task</div>
    </div>
    <div class="cards">
      <div class="cardItem">
        <CardTamp
          :topLeftImg="TimeIcon"
          bodyContent="Total Hours"
          footerContent="100.5h"
        ></CardTamp>
      </div>
      <div class="cardItem">
        <CardTamp
          :topLeftImg="taskIcon"
          topLeftBgc="rgba(167, 234, 167, 0.777)"
          bodyContent="Tasks Completed"
          footerContent="23/100"
        ></CardTamp>
      </div>
      <div class="cardItem">
        <CardTamp
          :topLeftImg="WarningIcon"
          topLeftBgc="#f5e5d3a5"
          bodyContent="Early Warning"
          footerContent="3"
        ></CardTamp>
      </div>
      <div class="cardItem">
        <CardTamp
          :topLeftImg="ExpiredIcon"
          topLeftBgc="rgba(227, 158, 158, 0.739)"
          bodyContent="Expired Tasks"
          footerContent="0"
        ></CardTamp>
      </div>
    </div>
    <div class="bottomBox">
      <div class="TimeLine">
        <span class="MiddleTitle">Project Timeline</span>
        <div class="Line_two" style="margin-bottom: 1.5rem">
          <span style="color: #909cad">Phases and key milestones</span>
          <span class="GanttSty">View Gantt</span>
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
            :timestamp="activity.timestamp"
          >
            <span style="font-size: larger">{{ activity.content }}</span>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div class="Team_Note">
        <div class="NoteBox">
          <span class="noteStyle">Note</span>
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
          <div class="addBtn" @click="addNote">+ Add Note</div>
        </div>
        <div class="NoteBox TeamBox">
          <span class="noteStyle">Team Avaliability</span>
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
    title="Create New Task"
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
  <el-dialog
    v-model="noteDialogVisible"
    title="Add New Note"
    width="600"
    align-center
  >
    <div class="line"></div>
    <div class="inputName">CONTENT</div>
    <el-input
      v-model="noteContent"
      placeholder="请输入内容"
      class="content-input"
      @change="submitNote"
    ></el-input>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible = false" class="cancelBtn">
          Cancel
        </el-button>
        <el-button type="primary" @click="submitNote" class="confirmBtn">
          Add Note
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, reactive } from "vue";
import CardTamp from "../../components/cardTamp.vue";
import TaskCard from "../../components/taskCard.vue";
import TimeIcon from "@/assets/icons/时间.png";
import taskIcon from "@/assets/icons/任务.png";
import ExpiredIcon from "@/assets/icons/逾期.png";
import WarningIcon from "@/assets/icons/预警.png";
import user1 from "@/assets/pics/用户头像.jpg";
import user2 from "@/assets/pics/用户2.jpg";
import user3 from "@/assets/pics/用户3.jpg";
import user4 from "@/assets/pics/用户4.jpg";
import { Check, Refresh, Delete } from "@element-plus/icons-vue";
import type { TimelineItemProps } from "element-plus";
const centerDialogVisible = ref(false);
const noteDialogVisible = ref(false);
const noteContent = ref('');
interface ActivityType extends Partial<TimelineItemProps> {
  content: string;
}

const activities: ActivityType[] = [
  {
    content: "Phase 1: Discovery & Startegy",
    timestamp: "Completed on Oct 10,2025",
    size: "large",
    color: "#0bbd87",
    icon: Check,
  },
  {
    content: "Phase 2: UI/UX Design",
    timestamp: "Due on Feb 10,2026",
    size: "large",
    color: "#24a4af",
    icon: Refresh,
  },
  {
    content: "Phase 3: Development",
    timestamp: "Scheduled on Apr 10,2026",
    size: "large",
  },
  {
    content: "Phase 4: Testing",
    timestamp: "Scheduled on Jun 10,2026",
    size: "large",
  },
  {
    content: "Phase 5: Deployment",
    timestamp: "Scheduled on Aug 10,2026",
    size: "large",
  },
  {
    content: "Phase 6: Maintenance",
    timestamp: "Scheduled on Oct 10,2026",
    size: "large",
  },
];
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
const taskCardRef = ref<InstanceType<typeof TaskCard> | null>(null);
const handleSubmit = () => {
  try {
    // 访问子组件暴露的数据
    const componentData = taskCardRef.value?.formData;
    componentData.createLine = Date.now();
    console.log("获取到的数据:", componentData);
    console.log("选中的用户:", taskCardRef.value?.chooseUser);
  } catch (error) {
    console.error("获取数据失败:", error);
  }
  centerDialogVisible.value = false;
};
const addNote = () => {
  noteDialogVisible.value = true;
}

const openNewTaskDialog = () => {
  centerDialogVisible.value = true;
  noteContent.value = '';
}
const submitNote = () => {
  console.log(noteContent);
  notes.push({
    content: noteContent.value,
    ifFinish: false,
    //将id设置为时间戳
    id: Date.now(),
  });
  console.log(notes);
  noteContent.value = '';
  noteDialogVisible.value = false;
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
  box-shadow: -10px 10px 10px rgba(0, 0, 0, 0.2);
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
:deep(.el-timeline-item__content ){
  font-size: 1.1rem;
}
:deep(.el-timeline-item__timestamp) {
  font-size: 1rem;
}
:deep(.el-timeline-item__node--large) {
  width: 1.5rem;
  height: 1.5rem;
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
  box-shadow: -10px 10px 10px rgba(0, 0, 0, 0.2);
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
.item_content{
  flex:1;
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
  border-radius: 0px !important;
  background-color: #fff !important;
  box-shadow: none !important;
  border: 1px solid #ccc;
}

:deep(.el-input__wrapper:focus-within) {
  border: 2px solid black;
}

</style>
