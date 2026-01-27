<template>
  <div class="bigBox1">
    <div class="userBox">
      <div class="topBox">
        <div class="picBox">
          <div class="picItem">
            <img src="@/assets/pics/用户头像.jpg" alt="用户头像">
          </div>
        </div>
        <div class="editBox">
          <img src="@/assets/icons/编辑.png" alt="编辑图标">
        </div>
      </div>
      <div class="nameBox">Alex Sterling</div>
      <div class="job_EmailBox">Senior Product Designer / alex.sterling@taskflow.com</div>
      <div class="tagsBox">
        <div class="tagItem">UI</div>
        <div class="tagItem">Figma</div>
        <div class="tagItem">UX</div>
      </div>
      <div class="juziBox">"Simplicity is the ultimate sophistication."</div>
    </div>
    <div class="projectsBox">
      <div class="Line_two">
        <div class="TitleBox">
          <div class="iconBox">
            <img src="@/assets/icons/文件夹2.png" alt="文件夹图标">
          </div>
          <div class="titleName">Projects | Created</div>
        </div>
        <div class="btnBox">
          <div class="left_rightBtn">
            <img src="@/assets/icons/左箭头.png" alt="左箭头图标">
          </div>
          <div class="left_rightBtn">
            <img src="@/assets/icons/右箭头.png" alt="右箭头图标">
          </div>
        </div>
      </div>
      <div class="cardsBox">
        <div class="cardsItem" v-for="item in allProjects.filter(item => item.creator === userStore.user.userId)" :key="item.id">
          <ProjectCard :project="item"></ProjectCard>
        </div>
      </div>
    </div>
    <div class="projectsBox">
      <div class="Line_two">
        <div class="TitleBox">
          <div class="iconBox" style="width: 2rem; height: 2rem;">
            <img src="@/assets/icons/加入.png" alt="加入图标">
          </div>
          <div class="titleName">Projects | Joined</div>
        </div>
        <div class="btnBox">
          <div class="left_rightBtn">
            <img src="@/assets/icons/左箭头.png" alt="左箭头图标">
          </div>
          <div class="left_rightBtn">
            <img src="@/assets/icons/右箭头.png" alt="右箭头图标">
          </div>
        </div>
      </div>
      <div class="cardsBox">
        <div class="cardsItem" v-for="item in allProjects.filter(item => item.joinUser.includes(userStore.user.userId) && item.creator !== userStore.user.userId)" :key="item.id">
          <ProjectCard :project="item"></ProjectCard>
        </div>
      </div>
    </div>
    <div class="projectsBox">
      <div class="TitleBox">
        <div class="iconBox" style="width: 2rem; height: 2rem;">
          <img src="@/assets/icons/图表.png" alt="图表图标">
        </div>
        <div class="titleName">Performance Analytics</div>
      </div>
      <div class="analyticsBox">
        <div class="analyticsLeft">
          <div class="Line_two">
            <div>
              <div class="titleName">Task Velocity</div>
              <div class="smallTips">Tasks completed over the last 30 days</div>
            </div>
            <div class="timeBox">Last 30 Day</div>
          </div>
          <div class="echarsBox">
            <Velocity></Velocity>
          </div>
        </div>
        <div class="analyticsRight">
          <div class="rightItem1">
            <div>
              <div class="smallTips">On-time Completion</div>
              <div class="rateNumber">94%</div>
            </div>
            <div class="progressBox">
              <el-progress type="dashboard" :percentage="94" width="70" color="#9256f5">
                <template #default="{ percentage }">
                  <span style="font-size: 1.2rem; font-weight: 600;">A+</span>
                </template>
              </el-progress>
            </div>
          </div>
          <div class="rightItem2">
            <div class="Line_two" style="align-items: center;">
              <div>
                <div class="smallTips">Number of tasks completed</div>
                <div class="rateNumber">25</div>
              </div>
              <div class="icon_Box">
                <img src="@/assets/icons/闪电.png" alt="闪电图标">
              </div>
            </div>
            <div class="longBox">
              <el-progress :show-text="false" :percentage="80" :stroke-width="16" color="#9256f5"/>
            </div>
            <div class="bottomTip">The task completion rate reached 80%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
//任务完成量折线图；工作按时完成率；工作项数量；工作完成率；
import ProjectCard from "@/components/projectCard.vue"
import Velocity from "@/components/velocity.vue"
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
const userStore = useUserStore();
import avatarImg from '@/assets/pics/用户头像.jpg';
const allProjects = [
  {
    id: "202601271",
    creator: "202601051",
    projectName: '项目管理平台PC端',
    description: 'Final UI polish and integration testing before the beta release next month1.',
    percentage: 70,
    joinUser:['202601051','202601053','202601054']
  },{
    id: "202601272",
    creator: "202601051",
    projectName: '项目管理平台移动端',
    description: 'Final UI polish and integration testing before the beta release next month2.',
    percentage: 40,
    joinUser:['202601051','202601053','202601054','202601055']
  },{
    id: "202601273",
    creator: "202601051",
    projectName: 'Electron跨端终端图形化命令行工具',
    description: 'Final UI polish and integration testing before the beta release next month3.',
    percentage: 20,
    joinUser:['202601051','202601053','202601055','202601054']
  },{
    id: "202601274",
    creator: "202601053",
    projectName: 'Project Name4',
    description: 'Final UI polish and integration testing before the beta release next month.4',
    percentage: 70,
    joinUser:['202601051','202601053','202601054']
  },{
    id: "202601275",
    creator: "202601054",
    projectName: 'Project Name5',
    description: 'Final UI polish and integration testing before the beta release next month.5',
    percentage: 70,
    joinUser:['202601051','202601053','202601054']
  }
]
</script>
<style scoped lang="scss">
.bigBox1{
  box-sizing: border-box;
  padding: 1rem 7.5%;
  width: 100%;
  height: 90%;
  overflow: auto;
}
.projectsBox{
  margin-top: 2rem;
}
.userBox{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.topBox{
  position: relative;
}
.picBox{
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  .picItem{
    width: 95%;
    height: 95%;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    img{
      width: 100%;
    }
  }

}
.editBox{
  position: absolute;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #135bec;
  right:0;
  bottom:0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  img{
    width: 50%;
  }
}
.nameBox{
  margin-top: 1rem;
  font-size: 2rem;
  font-weight: 600;
}
.job_EmailBox{
  margin-top: 0.5rem;
  font-size: 1rem;
  font-weight: 400;
  color: #666666;
}
.tagsBox{
  margin-top: 0.5rem;
  display: flex;
  gap: 1rem;
}
.tagItem{
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  background-color: #135becb2;
  color: #fff;
  font-size: 0.8rem;
}
.juziBox{
  margin-top: 0.5rem;
  font-size: 1.2rem;
  font-style: italic;
  font-weight: 400;
}
.TitleBox{
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  .iconBox{
    width: 3rem;
    height: 3rem;
    img{
      width: 100%;
    }
  }
}
.titleName{
  font-size: 1.2rem;
  font-weight: 600;
}
.btnBox{
  display: flex;
  gap: 0.5rem;
  .left_rightBtn{
    width: 2rem;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    border-radius: 50%;
    border: 1px solid #acacac;
    cursor: pointer;
    img{
      width: 50%;
    }
  }
  .left_rightBtn:hover{
    background-color: #f9f9f9c2;
  }
}
.cardsBox{
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 5rem;
}
.cardsItem{
  width: 25rem;
  height: 20rem;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 5px 5px 10px #00000026;
  cursor: pointer;
}
.cardsItem:hover{
  box-shadow: 10px 10px 10px #00000026;
}
.analyticsBox{
  margin-top: 1rem;
  width: 100%;
  height: 30rem;
  display: flex;
  justify-content: space-between;
}
.analyticsLeft{
  box-sizing: border-box;
  padding: 1.5rem;
  width: 65%;
  height: 100%;
  border-radius: 1rem;
  background-color: #fff;
}
.analyticsRight{
  width: 30%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .rightItem1{
    box-sizing: border-box;
    padding: 0 5%;
    width: 100%;
    height: 40%;
    border-radius: 1rem;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .rightItem2{
    box-sizing: border-box;
    padding: 0 5%;
    width: 100%;
    height: 50%;
    border-radius: 1rem;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
.smallTips{
  color: #939aa5;
}
.timeBox{
  padding: 0.3rem 0.8rem;
  background-color: #ebecedf0;
  border-radius: 0.5rem;
  cursor: pointer;
}
.echarsBox{
  margin-top: 1rem;
  width: 100%;
  height: 23rem;
}
.rateNumber{
  font-size: 2.5rem;
  font-weight: 600;
}
.progressBox{
  width: 5rem;
  height: 5rem;
}
:deep(.el-progress-circle){
  width: 5rem !important;
  height: 5rem !important;
}
.longBox{
  width: 100%;
  margin-top: 1rem;
}
.bottomTip{
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  justify-content: end;
  color: #939aa5;
}
.icon_Box{
  width: 3rem;
  height: 3rem;
  display: flex;
  justify-content:center;
  align-items: center;
  background-color: #f7f5e4;
  border-radius: 0.5rem;
  img{
    width: 50%;
  }
}
</style>