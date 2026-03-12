import { reactive , ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getProjectFolders,
  createProjectFolder,
  updateProjectFolder,
  deleteProjectFolder,
  getProjectDocuments,
  uploadProjectDocument,
  updateProjectDocument,
  deleteProjectDocument
} from '@/api'

export interface FileItem {
  id: string
  fileName: string
  fileTime?: string
  fileMaker?: string
  fileSize?: string
  fileType?: string
  fileUrl?: string
  children?: FileItem[]
  ifInBin: boolean
  creatorId?: number
  parentId?: string | null
}

export const useFileStore = defineStore('useFileStore', () => {
  const allFiles = reactive<FileItem[]>([])
  const showFloders = reactive<FileItem[]>([])
  const saveFloders = reactive<FileItem[]>([])
  const binFloders = reactive<FileItem[]>([])
  const folderPath = reactive<string[]>([])
  const loading = ref(false)

  // 递归查找文件/文件夹
  const findFileById = (files: FileItem[], id: string): FileItem | null => {
    for (const file of files) {
      if (file.id === id) {
        return file
      }
      if (file.children) {
        const found = findFileById(file.children, id)
        if (found) {
          return found
        }
      }
    }
    return null
  }

  // 查找父文件夹
  const findParentFolder = (files: FileItem[], childId: string): FileItem | null => {
    for (const file of files) {
      if (file.children) {
        for (const child of file.children) {
          if (child.id === childId) {
            return file
          }
          if (child.children) {
            const found = findParentFolder([child], childId)
            if (found) {
              return found
            }
          }
        }
      }
    }
    return null
  }

  // 递归筛选函数:根据 ifInBin 状态筛选文件树
  const filterFiles = (files: FileItem[], isBin: boolean): FileItem[] => {
    return files
      .filter((item) => {
        if (isBin) {
          return item.ifInBin
        }
        return !item.ifInBin
      })
      .map((item) => {
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterFiles(item.children, isBin)
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren }
          }
          return { ...item, children: undefined }
        }
        return item
      })
  }

  // 扁平化收集回收站中的所有文件
  const collectBinFiles = (files: FileItem[]): FileItem[] => {
    let result: FileItem[] = []
    files.forEach((item) => {
      if (item.ifInBin) {
        result.push({ ...item })
      } else {
        if (item.children) {
          const childrenInBin = collectBinFiles(item.children)
          result.push(...childrenInBin)
        }
      }
    })
    return result
  }

  // 收集匹配的子项
  const collectMatchingItems = (files: FileItem[], name: string): FileItem[] => {
    let result: FileItem[] = []
    files.forEach((item) => {
      const isMatch = item.fileName.toLowerCase().includes(name.toLowerCase())
      if (!item.children) {
        if (isMatch) {
          result.push(item)
        }
      } else {
        const children = collectMatchingItems(item.children, name)
        result.push(...children)
      }
    })
    return result
  }

  // 按名称筛选文件
  const filterFilesByName = (files: FileItem[], name: string): FileItem[] => {
    return files.flatMap((item) => {
      const isMatch = item.fileName.toLowerCase().includes(name.toLowerCase())
      let result: FileItem[] = []

      if (!item.children) {
        if (isMatch) {
          result.push(item)
        }
      } else {
        if (isMatch) {
          result.push(item)
          const matchingChildren = collectMatchingItems(item.children, name)
          result.push(...matchingChildren)
        } else {
          const children = filterFilesByName(item.children, name)
          if (children.length > 0) {
            result.push(...children)
          }
        }
      }
      return result
    })
  }

  // 递归删除文件夹及其子文件
  const deleteFileRecursively = (file: FileItem, inBin: boolean) => {
    file.ifInBin = inBin
    if (file.children) {
      file.children.forEach((child) => {
        deleteFileRecursively(child, inBin)
      })
    }
  }

  // 加载项目文件夹和文档
  const loadProjectFiles = async (projectId: number) => {
    loading.value = true
    try {
      // 加载文件夹
      const folderRes: any = await getProjectFolders({ project_id: projectId })
      const docRes: any = await getProjectDocuments({ project_id: projectId })

      // 构建文件树
      const folderMap = new Map<string, FileItem>()
      const rootFiles: FileItem[] = []

      // 处理文件夹
      if (folderRes.success && folderRes.data) {
        folderRes.data.forEach((folder: any) => {
          folderMap.set(String(folder.id), {
            id: String(folder.id),
            fileName: folder.name,
            fileTime: folder.created_at,
            fileMaker: '',
            fileSize: '',
            ifInBin: false,
            creatorId: folder.creator_id,
            parentId: folder.parent_folder_id ? String(folder.parent_folder_id) : null,
            children: []
          })
        })
      }

      // 处理文档
      if (docRes.success && docRes.data) {
        docRes.data.forEach((doc: any) => {
          const fileItem: FileItem = {
            id: String(doc.id),
            fileName: doc.name,
            fileTime: doc.created_at,
            fileMaker: '',
            fileSize: doc.file_size ? formatFileSize(doc.file_size) : '',
            fileType: doc.file_type,
            fileUrl: doc.file_url,
            ifInBin: false,
            creatorId: doc.creator_id,
            parentId: doc.parent_folder_id ? String(doc.parent_folder_id) : null
          }

          if (doc.parent_folder_id) {
            const parentFolder = folderMap.get(String(doc.parent_folder_id))
            if (parentFolder && parentFolder.children) {
              parentFolder.children.push(fileItem)
            }
          } else {
            rootFiles.push(fileItem)
          }
        })
      }

      // 构建文件夹树
      folderMap.forEach((folder) => {
        if (folder.parentId) {
          const parentFolder = folderMap.get(folder.parentId)
          if (parentFolder && parentFolder.children) {
            parentFolder.children.push(folder)
          }
        } else {
          rootFiles.push(folder)
        }
      })

      // 更新存储
      allFiles.splice(0, allFiles.length, ...rootFiles)
      const filteredShowFiles = filterFiles(allFiles, false)
      const filteredBinFiles = collectBinFiles(allFiles)

      saveFloders.splice(0, saveFloders.length, ...filteredShowFiles)
      binFloders.splice(0, binFloders.length, ...filteredBinFiles)
      showFloders.splice(0, showFloders.length, ...saveFloders)
      folderPath.splice(0, folderPath.length)
    } catch (error) {
      console.error('加载文件失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // 创建文件夹
  const createFolder = async (projectId: number, name: string, parentId?: string | null) => {
    try {
      console.log('创建文件夹参数:', { projectId, name, parentId })

      const res: any = await createProjectFolder({
        project_id: projectId,
        parent_folder_id: parentId ? parseInt(parentId) : undefined,
        name,
        creator_id: 5 // 使用存在的用户ID
      })

      console.log('创建文件夹响应:', res)

      if (res.success && res.data) {
        const newFolder: FileItem = {
          id: String(res.data.id),
          fileName: name,
          fileTime: res.data.created_at,
          ifInBin: false,
          creatorId: res.data.creator_id,
          parentId: parentId || null,
          children: []
        }

        // 添加到目标位置
        const targetArray = parentId ? findFileById(allFiles, parentId)?.children : allFiles
        if (targetArray) {
          targetArray.push(newFolder)
        }

        // 刷新显示
        const filteredShowFiles = filterFiles(allFiles, false)
        saveFloders.splice(0, saveFloders.length, ...filteredShowFiles)

        if (folderPath.length === 0) {
          showFloders.splice(0, showFloders.length, ...saveFloders)
        } else {
          const currentFolderId = folderPath[folderPath.length - 1]
          if (currentFolderId) {
            const currentFolder = findFileById(allFiles, currentFolderId)
            if (currentFolder && currentFolder.children) {
              showFloders.splice(0, showFloders.length, ...currentFolder.children)
            }
          }
        }

        return { success: true }
      }
      return { success: false, message: '创建文件夹失败' }
    } catch (error) {
      console.error('创建文件夹失败:', error)
      return { success: false, message: '创建文件夹失败' }
    }
  }

  // 上传文件
  const uploadFile = async (projectId: number, file: File, parentId?: string | null) => {
    try {
      // 使用 FormData 上传文件
      const formData = new FormData()
      formData.append('file', file)
      formData.append('project_id', String(projectId))
      if (parentId) {
        formData.append('parent_folder_id', parentId)
      }
      formData.append('creator_id', '5')

      // 调用文件上传接口
      const res: any = await uploadProjectDocument(formData)

      if (res.success && res.data) {
        const newFile: FileItem = {
          id: String(res.data.id),
          fileName: res.data.name,
          fileTime: res.data.created_at,
          fileSize: res.data.file_size ? formatFileSize(res.data.file_size) : '',
          fileType: res.data.file_type,
          fileUrl: `http://localhost:3000${res.data.file_url}`,
          ifInBin: false,
          creatorId: res.data.creator_id,
          parentId: res.data.parent_folder_id ? String(res.data.parent_folder_id) : null
        }

        // 添加到目标位置
        const targetArray = parentId ? findFileById(allFiles, parentId)?.children : allFiles
        if (targetArray) {
          targetArray.push(newFile)
        }

        // 刷新显示
        const filteredShowFiles = filterFiles(allFiles, false)
        saveFloders.splice(0, saveFloders.length, ...filteredShowFiles)

        if (folderPath.length === 0) {
          showFloders.splice(0, showFloders.length, ...saveFloders)
        } else {
          const currentFolderId = folderPath[folderPath.length - 1]
          if (currentFolderId) {
            const currentFolder = findFileById(allFiles, currentFolderId)
            if (currentFolder && currentFolder.children) {
              showFloders.splice(0, showFloders.length, ...currentFolder.children)
            }
          }
        }

        return { success: true }
      }
      return { success: false, message: '上传文件失败' }
    } catch (error) {
      console.error('上传文件失败:', error)
      return { success: false, message: '上传文件失败' }
    }
  }

  // 重命名文件/文件夹
  const renameFile = async (id: string, newName: string) => {
    try {
      const file = findFileById(allFiles, id)
      if (!file) {
        return { success: false, message: '文件不存在' }
      }

      // 判断是文件夹还是文档
      const isFolder = !!file.children

      if (isFolder) {
        const res: any = await updateProjectFolder(parseInt(id), { name: newName })
        if (!res.success) {
          return { success: false, message: '重命名失败' }
        }
      } else {
        const res: any = await updateProjectDocument(parseInt(id), { name: newName })
        if (!res.success) {
          return { success: false, message: '重命名失败' }
        }
      }

      // 更新本地数据
      file.fileName = newName

      return { success: true }
    } catch (error) {
      console.error('重命名失败:', error)
      return { success: false, message: '重命名失败' }
    }
  }

  // 删除到回收站
  const moveToBin = async (id: string) => {
    try {
      const file = findFileById(allFiles, id)
      if (!file) {
        return { success: false, message: '文件不存在' }
      }

      // 递归删除
      deleteFileRecursively(file, true)

      // 更新显示
      const filteredShowFiles = filterFiles(allFiles, false)
      const filteredBinFiles = collectBinFiles(allFiles)

      saveFloders.splice(0, saveFloders.length, ...filteredShowFiles)
      binFloders.splice(0, binFloders.length, ...filteredBinFiles)

      if (folderPath.length > 0) {
        const currentFolderId = folderPath[folderPath.length - 1]
        if (currentFolderId) {
          const currentFolder = findFileById(allFiles, currentFolderId)
          if (currentFolder && currentFolder.children) {
            showFloders.splice(0, showFloders.length, ...filterFiles(currentFolder.children, false))
          }
        }
      } else {
        showFloders.splice(0, showFloders.length, ...saveFloders)
      }

      return { success: true }
    } catch (error) {
      console.error('删除失败:', error)
      return { success: false, message: '删除失败' }
    }
  }

  // 恢复文件
  const restoreFile = async (id: string) => {
    try {
      const file = findFileById(allFiles, id)
      if (!file) {
        return { success: false, message: '文件不存在' }
      }

      // 递归恢复
      deleteFileRecursively(file, false)

      // 更新显示
      const filteredShowFiles = filterFiles(allFiles, false)
      const filteredBinFiles = collectBinFiles(allFiles)

      saveFloders.splice(0, saveFloders.length, ...filteredShowFiles)
      binFloders.splice(0, binFloders.length, ...filteredBinFiles)

      showFloders.splice(0, showFloders.length, ...binFloders)

      return { success: true }
    } catch (error) {
      console.error('恢复失败:', error)
      return { success: false, message: '恢复失败' }
    }
  }

  // 彻底删除
  const deletePermanently = async (id: string) => {
    try {
      const file = findFileById(allFiles, id)
      if (!file) {
        return { success: false, message: '文件不存在' }
      }

      const isFolder = !!file.children

      // 调用API删除
      if (isFolder) {
        const res: any = await deleteProjectFolder(parseInt(id))
        if (!res.success) {
          return { success: false, message: '删除失败' }
        }
      } else {
        const res: any = await deleteProjectDocument(parseInt(id))
        if (!res.success) {
          return { success: false, message: '删除失败' }
        }
      }

      // 从父文件夹移除
      const parentFolder = findParentFolder(allFiles, id)
      if (parentFolder && parentFolder.children) {
        parentFolder.children = parentFolder.children.filter(item => item.id !== id)
      } else {
        const index = allFiles.findIndex(item => item.id === id)
        if (index !== -1) {
          allFiles.splice(index, 1)
        }
      }

      // 更新显示
      const filteredShowFiles = filterFiles(allFiles, false)
      const filteredBinFiles = collectBinFiles(allFiles)

      saveFloders.splice(0, saveFloders.length, ...filteredShowFiles)
      binFloders.splice(0, binFloders.length, ...filteredBinFiles)

      showFloders.splice(0, showFloders.length, ...binFloders)

      return { success: true }
    } catch (error) {
      console.error('彻底删除失败:', error)
      return { success: false, message: '删除失败' }
    }
  }

  // 进入文件夹
  const enterFolder = (itemId: string) => {
    const item = findFileById(allFiles, itemId)
    if (item && item.children && item.id) {
      folderPath.push(item.id)
      const filteredChildren = filterFiles(item.children, false)
      showFloders.splice(0, showFloders.length, ...filteredChildren)
    }
  }

  // 返回上级
  const backToParent = () => {
    if (folderPath.length > 0) {
      folderPath.pop()

      if (folderPath.length === 0) {
        showFloders.splice(0, showFloders.length, ...saveFloders)
      } else {
        const parentId = folderPath[folderPath.length - 1]
        if (parentId) {
          const parentFolder = findFileById(allFiles, parentId)
          if (parentFolder && parentFolder.children) {
            showFloders.splice(0, showFloders.length, ...filterFiles(parentFolder.children, false))
          }
        }
      }
    }
  }

  // 搜索文件
  const searchFiles = (name: string) => {
    if (name !== '') {
      const filteredSearchFiles = filterFilesByName(allFiles, name)
      showFloders.splice(0, showFloders.length, ...filteredSearchFiles)
    } else {
      showFloders.splice(0, showFloders.length, ...saveFloders)
    }
  }

  // 切换回收站
  const toggleBin = (showBin: boolean) => {
    folderPath.splice(0, folderPath.length)
    if (showBin) {
      showFloders.splice(0, showFloders.length, ...binFloders)
    } else {
      showFloders.splice(0, showFloders.length, ...saveFloders)
    }
  }

  return {
    allFiles,
    showFloders,
    saveFloders,
    binFloders,
    folderPath,
    loading,
    loadProjectFiles,
    createFolder,
    uploadFile,
    renameFile,
    moveToBin,
    restoreFile,
    deletePermanently,
    enterFolder,
    backToParent,
    searchFiles,
    toggleBin,
    findFileById
  }
})
