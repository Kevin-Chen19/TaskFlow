<template>
  <el-tour v-model="internalMode" @finish="handleFinish">
    <el-tour-step
      target="#tour1"
      title="当前项目"
      description="显示当前所在的项目"
    />
    <el-tour-step
      target="#tour2"
      title="国际化"
      description="选择想要的语言"
    />
    <el-tour-step
      target="#tour3"
      title="通知"
      description="点击后弹出通知框"
    />
    <el-tour-step
      target="#tour4"
      title="头像"
      description="点击后显示用户导航菜单"
    />
    <el-tour-step
      target="#tour5"
      title="看板界面"
      description="一览项目的整体状况，添加个人便签"
    />
    <el-tour-step
      target="#tour6"
      title="文件库"
      description="项目团队共享项目文件的地方"
    />
    <el-tour-step
      target="#tour7"
      title="任务界面"
      description="以表格的方式直观显示并操作项目任务"
    />
    <el-tour-step
      target="#tour8"
      title="日历视图"
      description="通过甘特图方式在日历上显示并操作项目任务"
    />
    <el-tour-step
      target="#tour9"
      title="团队界面"
      description="展示项目团队的全部成员"
    />
    <el-tour-step
      target="#tour10"
      title="角色界面"
      description="管理项目角色权限与职位"
    />
    <el-tour-step
      target="#tour11"
      title="我的界面"
      description="显示个人的相关内容"
    />
  </el-tour>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  mode: boolean;
}>();

const emit = defineEmits<{
  finish: [];
}>();

const internalMode = ref(props.mode);

watch(() => props.mode, (newValue) => {
  internalMode.value = newValue;
});

const handleFinish = () => {
  emit('finish');
};
</script>
<style scoped lang="scss">

</style>