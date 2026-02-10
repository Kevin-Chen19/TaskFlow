import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useOtherStore = defineStore('other', () => {
  const ifEditTask = ref(false)
  const currentProjectId = 1;

  return { ifEditTask, currentProjectId }
})
