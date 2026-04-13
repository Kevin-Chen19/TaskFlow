import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useOtherStore = defineStore('other', () => {
  const ifEditTask = ref(false)
  const currentProjectId = ref(1)
  const currentProjectName = ref('')
  // 用于触发项目切换事件的计数器
  const projectChangeTrigger = ref(0)

  // 设置当前项目
  const setCurrentProject = (id: number, name: string = '') => {
    currentProjectId.value = id
    currentProjectName.value = name
    // 递增触发器，通知所有监听器项目已切换
    projectChangeTrigger.value++
  }

  return { ifEditTask, currentProjectId, currentProjectName, projectChangeTrigger, setCurrentProject }
})
