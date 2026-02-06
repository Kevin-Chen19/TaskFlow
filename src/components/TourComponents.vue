<template>
  <el-tour v-model="internalMode" @finish="handleFinish">
    <el-tour-step
      target="#tour1"
      :title="$t('tour.Currentproject')"
      :description="$t('tour.Displaystheproject')"
    />
    <el-tour-step
      target="#tour2"
      placement="bottom-start"
      :title="$t('tour.Topmenubar')"
      :description="$t('tour.Languageswitching')"
    />
    <el-tour-step
      target="#tour5"
      :title="$t('tour.Kanbaninterface')"
      :description="$t('tour.Seetheoverall')"
    />
    <el-tour-step
      target="#tour6"
      :title="$t('tour.Filelibrary')"
      :description="$t('tour.Aplacewhere')"
    />
    <el-tour-step
      target="#tour7"
      :title="$t('tour.Taskinterface')"
      :description="$t('tour.Visualizand')"
    />
    <el-tour-step
      target="#tour8"
      :title="$t('tour.Calendarview')"
      :description="$t('tour.Displayand')"
    />
    <el-tour-step
      target="#tour9"
      :title="$t('tour.Teaminterface')"
      :description="$t('tour.Showcaseall')"
    />
    <el-tour-step
      target="#tour10"
      :title="$t('tour.Characterinterface')"
      :description="$t('tour.Manageproject')"
    />
    <el-tour-step
      target="#tour11"
      :title="$t('tour.Myinterface')"
      :description="$t('tour.Displaysrelevant')"
    />
    <template #indicators="{ current, total }">
      <span>{{ current + 1 }} / {{ total }}</span>
    </template>
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