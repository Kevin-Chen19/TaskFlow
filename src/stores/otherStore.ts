import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useOtherStore = defineStore('other', () => {
  const ifEditTask = ref(false)
  const currentProjectId = 1;
  const currentProjectName = ref('');

  return { ifEditTask, currentProjectId, currentProjectName }
})
