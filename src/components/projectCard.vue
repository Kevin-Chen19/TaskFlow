<template>
  <div class="contentBox1">
    <div class="iconBox">{{ project.projectName.slice(0,1) }}</div>
    <div class="name">{{ project.projectName }}</div>
    <div class="description">{{ project.description }}</div>
    <div class="Line_two">
     <div class="litleTitle">{{ $t('taskPage.Progress') }}</div>
     <div :style="{ color:customColorMethod(project.percentage) }">{{project.percentage}}%</div>
    </div>
    <div class="progressBox">
      <el-progress :show-text="false" :percentage="project.percentage" :color="customColorMethod"/>
    </div>
    <div class="avatarBox">
      <el-avatar-group collapse-avatars :max-collapse-avatars="2">
        <el-avatar v-for="(userId, index) in project.joinUser" :key="index" :src="findPicUrl(userId)" />
      </el-avatar-group>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import avatarImg from '@/assets/pics/用户头像.jpg';
import { useUserStore } from '@/stores/userStore';
const userStore = useUserStore();
const customColorMethod = (percentage: number) => {
  if (percentage < 30) {
    return "#909399";
  }
  if (percentage < 70) {
    return "#e6a23c";
  }
  return "#67c23a";
};
interface Project {
  id: string;
  projectName: string;
  description: string;
  creator: string;
  joinUser: string[];
  percentage: number;
}

const props = defineProps<{
  project?: Project;
}>();
const findPicUrl = (userId: string) => {
  return userStore.getUserById(userId)?.pic || avatarImg;
}
</script>
<style scoped lang="scss">
.contentBox1{
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 1rem;
}
.iconBox{
  width: 3rem;
  height: 3rem;
  background-color: #eff6ff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem;
  font-size: 1.5rem;
  color: blue;
}
.name{
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
}
.description{
  margin-top: 1rem;
  max-height: 3rem;
  //文字超出行数省略
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  text-overflow: ellipsis;
  color: #939aa5;
}
.litleTitle{
  margin-top: 1rem;
  color: #939aa5;
}
.progressBox{
  margin-top: 0.5rem;
  width: 100%;
}
.avatarBox{
  margin-top: 1rem;
}
</style>