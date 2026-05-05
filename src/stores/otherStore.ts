import { ref } from 'vue'
import { defineStore } from 'pinia'

const LAST_PROJECT_KEY = 'taskflow_last_project_id'

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
    // 保存到本地存储
    localStorage.setItem(LAST_PROJECT_KEY, String(id))
    // 递增触发器，通知所有监听器项目已切换
    projectChangeTrigger.value++
  }

  // 从本地存储加载上次打开的项目ID
  const loadLastProjectFromStorage = (): number | null => {
    const storedId = localStorage.getItem(LAST_PROJECT_KEY)
    if (storedId) {
      const id = parseInt(storedId, 10)
      if (!isNaN(id) && id > 0) {
        return id
      }
    }
    return null
  }

  // 初始化项目（应用启动时调用）
  const initializeProject = async (userProjects: { id: number; name: string }[]) => {
    // 1. 尝试从本地存储加载
    const lastProjectId = loadLastProjectFromStorage()
    
    if (lastProjectId) {
      // 检查该项目是否仍在用户的项目列表中
      const project = userProjects.find(p => p.id === lastProjectId)
      if (project) {
        currentProjectId.value = project.id
        currentProjectName.value = project.name
        return project
      }
    }
    
    // 2. 如果没有缓存或项目不存在，使用第一个项目
    if (userProjects.length > 0) {
      const firstProject = userProjects[0]
      currentProjectId.value = firstProject.id
      currentProjectName.value = firstProject.name
      // 保存到本地存储
      localStorage.setItem(LAST_PROJECT_KEY, String(firstProject.id))
      return firstProject
    }
    
    // 3. 新用户没有项目的情况
    return null
  }

  return { 
    ifEditTask, 
    currentProjectId, 
    currentProjectName, 
    projectChangeTrigger, 
    setCurrentProject,
    initializeProject,
    loadLastProjectFromStorage
  }
})
