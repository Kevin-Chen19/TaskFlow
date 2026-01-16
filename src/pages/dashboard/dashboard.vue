<template>
  <div class="bigBox">
    <div class="bigTitle">Project Overview</div>
    <div class="Line_two">
      <span class="smallText">Welcome back,Kevin.Task Flow is on track for Q4 delivery.</span>
      <div class="new_task"> + New Task </div>
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
        <div class="Line_two" style="margin-bottom: 1.5rem;">
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
              <span style="font-size: larger;">{{ activity.content }}</span>
            </el-timeline-item>
          </el-timeline>
      </div>
      <div class="Team_Note">
        <div class="NoteBox">
          <span class="noteStyle">Note</span>
          <div class="noteItemBox">
            <div class="noteItem" v-for="item in notes" :key="item.id">
              <div class="noteSelect"></div>
              <div>{{ item.content }}</div>
              <div class="delete">
                <el-icon><Delete /></el-icon>
              </div>
            </div>
          </div>
          <div class="addBtn">+ Add Note</div>
        </div>
        <div class="TeamBox"></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import CardTamp from "../../components/cardTamp.vue"
  import TimeIcon from "@/assets/icons/时间.png";
  import taskIcon from "@/assets/icons/任务.png"
  import ExpiredIcon from "@/assets/icons/逾期.png"
  import WarningIcon from "@/assets/icons/预警.png" 
import { Check, Refresh, Delete } from '@element-plus/icons-vue'

import type { TimelineItemProps } from 'element-plus'

interface ActivityType extends Partial<TimelineItemProps> {
  content: string
}

const activities: ActivityType[] = [
  {
    content: 'Phase 1: Discovery & Startegy',
    timestamp: 'Completed on Oct 10,2025',
    size: 'large',
    color: '#0bbd87',
    icon: Check
  },
  {
    content: 'Phase 2: UI/UX Design',
    timestamp: 'Due on Feb 10,2026',
    size: 'large',
    color: '#24a4af',
    icon: Refresh

  },
  {
    content: 'Phase 3: Development',
    timestamp: 'Scheduled on Apr 10,2026',
    size: 'large',
  },
  {
    content: 'Phase 4: Testing',
    timestamp: 'Scheduled on Jun 10,2026',
    size: 'large',
  },
  {
    content: 'Phase 5: Deployment',
    timestamp: 'Scheduled on Aug 10,2026',
    size: 'large',
  },
  {
    content: 'Phase 6: Maintenance',
    timestamp: 'Scheduled on Oct 10,2026',
    size: 'large',
  }
]
const notes = [
  {
    content: 'Finish the task1',
    ifFinish: true,
    id:1
  },
  {
    content: 'Finish the task2',
    ifFinish: false,
    id:2
  },
  {
    content: 'Finish the task3',
    ifFinish: false,
    id:3
  },
  {
    content: 'Finish the task4',
    ifFinish: false,
    id:4
  },
]
</script>
<style scoped lang="scss">
.bigBox {
  width: 85%;
  height: 80%;
}
.Line_two{
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.bigTitle{
  font-size: 1.5rem;
  font-weight: 600;;
}
.smallText{
  font-size: 1rem;
  color: #909cad;
}
.new_task{
  padding: 0.4rem 0.7rem;
  background-color: black;
  color: white;
  border-radius: 0.4rem;
  font-size: 1rem;
  box-shadow: 0 10px 10px rgba(0,0,0,0.2);
}
.new_task:hover{
  cursor: pointer;
  background: rgb(70, 70, 70);
}
.cards{
  width: 100%;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
}
.cardItem{
  box-sizing: border-box;
  width: 20%;
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0 10px 10px rgba(0,0,0,0.2);
  padding: 1rem;
}
.bottomBox{
  box-sizing: border-box;
  margin-top: 2rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.TimeLine{
  box-sizing: border-box;
  width: 65%;
  height:60vh;
  overflow: auto;
  padding: 10px;
  background-color: #fff;
  border-radius: 1rem;
}
.MiddleTitle{
  font-size: large;
  font-weight: 600;
}
.GanttSty{
  color: #0e8ee9;
  font-weight: 500;
}
.GanttSty:hover{
  cursor: pointer;
  color: #036eba;
}
.Team_Note{
  width: 30%;
  height:60vh;
  box-sizing: border-box;
}
.NoteBox{
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
  box-shadow: -10px 10px  rgba(220, 219, 219, 0.2);
}
.TeamBox{
  margin-top: 2vh;
  background-color: #fff;
  width: 100%;
  height: 28vh;
  overflow: auto;
  border-radius: 1rem;
  box-shadow: -10px 10px  rgba(220, 219, 219, 0.2);
}
.noteStyle{
  font-size: 1.5rem;
  font-weight: 600;
}
.noteItemBox{
  width: 100%;
  height: 15vh;
  overflow: auto;
  /* 隐藏标准滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.noteItem{
  width: 100%;
  display: flex;
  align-items: center;
  margin-top: 1rem;
  font-size: large;
}
.noteSelect{
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid black;
  border-radius: 0.5rem;
  margin-right: 1rem;
  cursor: pointer;
}
.delete{
  margin-left: 1rem;
  cursor: pointer;
}
.addBtn{
  margin-left: 15%;
  margin-top: 1rem;
  width: 70%;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: larger;
  font-weight: 600;
  border:1px black dotted;
  border-radius: 1.5rem;
  cursor: pointer;
}
.addBtn:hover{
  background-color: rgba(95, 211, 95, 0.726);
  color: rgb(5, 186, 5);
}
</style>