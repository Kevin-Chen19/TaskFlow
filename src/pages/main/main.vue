<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="topLine">
          <div class="title">Task Flow</div>
          <div class="flex-1">
            <div class="ProjectData">当前项目</div>
            <div style="display: flex; align-items: center">
              <el-input
                v-model="input2"
                class="responsive-input"
                placeholder="Search tasks,doucments,or team members"
                :prefix-icon="Search"
              />
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
          <div class="leftItem" @click="changePage('settings')" :class="which === 'settings' ? 'leftChoose' : ''">
            <img src="../../assets/icons/设置1.png" alt="设置1图标" />
            <div class="itemName">Settings</div>
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
import { Search } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
const which = ref("dashboard");
const router = useRouter();
const input2 = ref("");
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
  margin-left: 8rem;
  height: 2rem;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  border-left: 2px solid black;
}
.flex-1 {
  flex: 1;
  display: flex;
  align-items: center;
  margin-left: 10px;
  padding: 0 10px;
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
