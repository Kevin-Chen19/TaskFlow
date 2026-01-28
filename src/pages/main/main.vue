<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="topLine">
          <div class="title">
            <div class="logo">
              <img src="@/assets/icons/项目管理.png" alt="Logo">
            </div>
            Task Flow
          </div>
          <div class="flex-1">
            <div class="ProjectData">
              <span style="color:gray; margin-right: 1rem;">Current Project</span>
              <span style="color:gray; margin-right: 1rem;">/</span>
              <span style="font-weight: 500;">项目管理平台PC端</span>
            </div>
            <div style="display: flex; align-items: center">
              <div class="notifyStyle">
                <img src="../../assets/icons/通知.png" alt="通知图标" />
              </div>
              <div class="notifyStyle userPic">
                <img src="../../assets/pics/用户头像.jpg" alt="用户头像" />
              </div>
            </div>
          </div>
        </div>
      </el-header>
      <el-container>
        <el-aside width="13vw">
          <div class="leftItem" @click="changePage('dashboard')" :class="which === 'dashboard' ? 'leftChoose' : ''">
            <img src="../../assets/icons/看板1.png" alt="看板1图标" />
            <div>Dashboard</div>
          </div>
          <div class="leftItem" @click="changePage('projects')" :class="which === 'projects' ? 'leftChoose' : ''">
            <img src="../../assets/icons/文件1.png" alt="文件1图标" />
            <div class="itemName">Projects</div>
          </div>
          <div class="leftItem" @click="changePage('tasks')" :class="which === 'tasks' ? 'leftChoose' : ''">
            <img src="../../assets/icons/任务1.png" alt="任务1图标" />
            <div class="itemName">Tasks</div>
          </div>
          <div class="leftItem" @click="changePage('team')" :class="which === 'team' ? 'leftChoose' : ''">
            <img src="../../assets/icons/团队1.png" alt="团队1图标" />
            <div class="itemName">Team</div>
          </div>
          <div class="leftItem" @click="changePage('reports')" :class="which === 'reports' ? 'leftChoose' : ''">
            <img src="../../assets/icons/报告1.png" alt="报告1图标" />
            <div class="itemName">Reports</div>
          </div>
          <div class="leftItem" @click="changePage('roles')" :class="which === 'roles' ? 'leftChoose' : ''">
            <img src="../../assets/icons/权限设置.png" alt="权限设置图标" />
            <div class="itemName">Roles</div>
          </div>
          <div class="leftItem" @click="changePage('me')" :class="which === 'me' ? 'leftChoose' : ''">
            <img src="../../assets/icons/我的.png" alt="我的图标" />
            <div class="itemName">Me</div>
          </div>
        </el-aside>
        <el-container>
          <el-main>
            <div class="mainBox">
              <router-view></router-view>
            </div>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
const which = ref("dashboard");
const router = useRouter();
const changePage = (name: string) => {
  which.value = name;
  router.push({
    path:`/${name}`,
  })
};
</script>
<style scoped lang="scss">
.el-header,
.el-aside,
.el-main {
  padding: 0;
  margin: 0;
}
:deep().el-header {
  height: 7vh;
}
:deep().el-aside {
  height: 93vh;
  background-color: #fff;
}
.logo{
  width: 3rem;
  height: 3rem;
  background-color: #1193d4;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem;
  margin-right: 1rem;
  img{
    width: 70%;
  }
}
.title {
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 600;
}
.topLine {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  background-color: #c9e9f3cc;
}
.ProjectData{
  margin-left:4.6rem;
  height: 5rem;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  font-size: 1.2rem;
  border-left: 2px solid #fff;
}
.flex-1 {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
:deep().el-input__wrapper {
  width: 17vw;
  height: 3.5vh;
  border-radius: 1vw;
  background-color: #eff0f1;
  font-size: medium;
}
.notifyStyle {
  margin-left: 10px;
  width: 3vh;
  height: 3vh;
  background-color: #eff0f1;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0; // 不收缩,防止被自适应宽度的input压缩
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 50%;
  }
}
.userPic {
  width: 5vh;
  height: 5vh;
  overflow: hidden;
  img {
    width: 100%;
  }
}
.leftBox {
  background-color: #fff;
}
.mainBox {
  height: 93vh;
  background-color: #eaeef1;
}
.leftItem {
  box-sizing: border-box;
  height: 5vh;
  width: 90%;
  margin-left: 5%;
  margin-top: 5px;
  background-color: #fff;
  color: #979aa1;
  border-radius: 1.5vh;
  display: flex;
  align-items: center;
  padding: 0 6%;
  font-weight: 500;
  cursor: pointer;
  img {
    width: 1.5vw;
    margin-right: 0.5vw;
  }
}
.leftItem:hover{
  background-color: #c9e9f3cc;
  color: #12a6b1;
}
.leftChoose{
  background-color: #c9e9f3cc;
  color: #12a6b1;
}
.mainBox{
  height: 93vh;
  overflow: auto;
    /* 隐藏标准滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
