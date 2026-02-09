import request from '@/utils/request'

// ==================== 认证相关接口 ====================

/**
 * 用户注册
 */
export const register = (data: {
  phone: string
  fullname: string
  email: string
  password: string
  avatar_url?: string
  skills?: string[]
  mooto?: string
}) => {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

/**
 * 用户登录
 */
export const login = (data: {
  phone?: string
  email?: string
  password: string
}) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return request({
    url: '/auth/me',
    method: 'get'
  })
}

/**
 * 修改密码
 */
export const changePassword = (data: {
  current_password: string
  new_password: string
}) => {
  return request({
    url: '/auth/change-password',
    method: 'post',
    data
  })
}

// ==================== 用户相关接口 ====================

/**
 * 获取所有用户
 */
export const getUsers = () => {
  return request({
    url: '/users',
    method: 'get'
  })
}

/**
 * 获取单个用户
 */
export const getUserById = (id: number) => {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

/**
 * 创建用户
 */
export const createUser = (data: {
  phone: string
  fullname: string
  email: string
  password: string
  avatar_url?: string
  skills?: string[]
  mooto?: string
}) => {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export const updateUser = (id: number, data: {
  phone?: string
  fullname?: string
  email?: string
  avatar_url?: string
  skills?: string[]
  mooto?: string
}) => {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export const deleteUser = (id: number) => {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

// ==================== 项目相关接口 ====================

/**
 * 获取所有项目
 */
export const getProjects = () => {
  return request({
    url: '/projects',
    method: 'get'
  })
}

/**
 * 获取单个项目
 */
export const getProjectById = (id: number) => {
  return request({
    url: `/projects/${id}`,
    method: 'get'
  })
}

/**
 * 创建项目
 */
export const createProject = (data: {
  name: string
  description?: string
  owner_id: number
  assignee_ids?: number[]
  progress?: number
  total_hours?: number
}) => {
  return request({
    url: '/projects',
    method: 'post',
    data
  })
}

/**
 * 更新项目
 */
export const updateProject = (id: number, data: {
  name?: string
  description?: string
  assignee_ids?: number[]
  progress?: number
  total_hours?: number
}) => {
  return request({
    url: `/projects/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除项目
 */
export const deleteProject = (id: number) => {
  return request({
    url: `/projects/${id}`,
    method: 'delete'
  })
}

// ==================== 任务相关接口 ====================

/**
 * 获取任务列表
 */
export const getTasks = (params?: {
  project_id?: number
}) => {
  return request({
    url: '/tasks',
    method: 'get',
    params
  })
}

/**
 * 获取单个任务
 */
export const getTaskById = (id: number) => {
  return request({
    url: `/tasks/${id}`,
    method: 'get'
  })
}

/**
 * 创建任务
 */
export const createTask = (data: {
  title: string
  description?: string
  project_id: number
  creator_id: number
  assignee_ids?: number[]
  due_date?: string
  start_date?: string
  progress?: number
  priority?: number
}) => {
  return request({
    url: '/tasks',
    method: 'post',
    data
  })
}

/**
 * 更新任务
 */
export const updateTask = (id: number, data: {
  title?: string
  description?: string
  assignee_ids?: number[]
  due_date?: string
  start_date?: string
  progress?: number
  priority?: number
}) => {
  return request({
    url: `/tasks/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除任务
 */
export const deleteTask = (id: number) => {
  return request({
    url: `/tasks/${id}`,
    method: 'delete'
  })
}

// ==================== 通知相关接口 ====================

/**
 * 获取通知列表
 */
export const getNotifications = (params?: {
  project_id?: number
  creator_id?: number
}) => {
  return request({
    url: '/notifications',
    method: 'get',
    params
  })
}

/**
 * 创建通知
 */
export const createNotification = (data: {
  project_id: number
  creator_id: number
  description: string
  type?: string
  assignee_ids?: number[]
  status?: number[]
}) => {
  return request({
    url: '/notifications',
    method: 'post',
    data
  })
}

/**
 * 更新通知
 */
export const updateNotification = (id: number, data: {
  description?: string
  type?: string
  assignee_ids?: number[]
  status?: number[]
}) => {
  return request({
    url: `/notifications/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除通知
 */
export const deleteNotification = (id: number) => {
  return request({
    url: `/notifications/${id}`,
    method: 'delete'
  })
}

// ==================== 笔记相关接口 ====================

/**
 * 获取笔记列表
 */
export const getNotes = (params?: {
  project_id?: number
  creator_id?: number
}) => {
  return request({
    url: '/notes',
    method: 'get',
    params
  })
}

/**
 * 创建笔记
 */
export const createNote = (data: {
  project_id: number
  creator_id?: number
  description: string
  status?: boolean
}) => {
  return request({
    url: '/notes',
    method: 'post',
    data
  })
}

/**
 * 更新笔记
 */
export const updateNote = (id: number, data: {
  description?: string
  status?: boolean
}) => {
  return request({
    url: `/notes/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除笔记
 */
export const deleteNote = (id: number) => {
  return request({
    url: `/notes/${id}`,
    method: 'delete'
  })
}

// ==================== 项目成员相关接口 ====================

/**
 * 获取项目的所有成员
 */
export const getProjectMembers = (projectId: number) => {
  return request({
    url: `/project-members/project/${projectId}`,
    method: 'get'
  })
}

/**
 * 添加项目成员
 */
export const addProjectMember = (data: {
  project_id: number
  user_id: number
  role?: string
  position?: string
  is_active?: boolean
}) => {
  return request({
    url: '/project-members',
    method: 'post',
    data
  })
}

/**
 * 更新项目成员
 */
export const updateProjectMember = (id: number, data: {
  role?: string
  position?: string
  is_active?: boolean
}) => {
  return request({
    url: `/project-members/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除项目成员
 */
export const deleteProjectMember = (id: number) => {
  return request({
    url: `/project-members/${id}`,
    method: 'delete'
  })
}

// ==================== 项目角色相关接口 ====================

/**
 * 获取项目角色列表
 */
export const getProjectRoles = (params?: {
  project_id?: number
}) => {
  return request({
    url: '/project-roles',
    method: 'get',
    params
  })
}

/**
 * 创建项目角色
 */
export const createProjectRole = (data: {
  project_id: number
  rolename: string
  description?: string
  settings?: any
}) => {
  return request({
    url: '/project-roles',
    method: 'post',
    data
  })
}

/**
 * 更新项目角色
 */
export const updateProjectRole = (id: number, data: {
  rolename?: string
  description?: string
  settings?: any
}) => {
  return request({
    url: `/project-roles/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除项目角色
 */
export const deleteProjectRole = (id: number) => {
  return request({
    url: `/project-roles/${id}`,
    method: 'delete'
  })
}

// ==================== 项目职位相关接口 ====================

/**
 * 获取项目职位列表
 */
export const getProjectPositions = (params?: {
  project_id?: number
}) => {
  return request({
    url: '/project-positions',
    method: 'get',
    params
  })
}

/**
 * 创建项目职位
 */
export const createProjectPosition = (data: {
  project_id: number
  positionname: string
  description?: string
}) => {
  return request({
    url: '/project-positions',
    method: 'post',
    data
  })
}

/**
 * 更新项目职位
 */
export const updateProjectPosition = (id: number, data: {
  positionname?: string
  description?: string
}) => {
  return request({
    url: `/project-positions/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除项目职位
 */
export const deleteProjectPosition = (id: number) => {
  return request({
    url: `/project-positions/${id}`,
    method: 'delete'
  })
}

// ==================== 项目文件夹相关接口 ====================

/**
 * 获取项目文件夹列表
 */
export const getProjectFolders = (params?: {
  project_id?: number
  parent_folder_id?: number
}) => {
  return request({
    url: '/project-folders',
    method: 'get',
    params
  })
}

/**
 * 创建文件夹
 */
export const createProjectFolder = (data: {
  project_id: number
  parent_folder_id?: number
  name: string
  creator_id?: number
}) => {
  return request({
    url: '/project-folders',
    method: 'post',
    data
  })
}

/**
 * 更新文件夹
 */
export const updateProjectFolder = (id: number, data: {
  name?: string
}) => {
  return request({
    url: `/project-folders/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除文件夹
 */
export const deleteProjectFolder = (id: number) => {
  return request({
    url: `/project-folders/${id}`,
    method: 'delete'
  })
}

// ==================== 项目文档相关接口 ====================

/**
 * 获取项目文档列表
 */
export const getProjectDocuments = (params?: {
  project_id?: number
  parent_folder_id?: number
}) => {
  return request({
    url: '/project-documents',
    method: 'get',
    params
  })
}

/**
 * 创建文档
 */
export const createProjectDocument = (data: {
  project_id: number
  parent_folder_id?: number
  name: string
  creator_id?: number
}) => {
  return request({
    url: '/project-documents',
    method: 'post',
    data
  })
}

/**
 * 更新文档
 */
export const updateProjectDocument = (id: number, data: {
  name?: string
}) => {
  return request({
    url: `/project-documents/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除文档
 */
export const deleteProjectDocument = (id: number) => {
  return request({
    url: `/project-documents/${id}`,
    method: 'delete'
  })
}
