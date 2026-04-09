import { reactive , ref } from 'vue'
import { defineStore } from 'pinia'
import JSZip from 'jszip'
import { useOtherStore } from '@/stores/otherStore'
import {
  getProjectFolders,
  createProjectFolder,
  updateProjectFolder,
  deleteProjectFolder,
  deleteProjectFolderPermanent,
  moveFolderToBin,
  moveDocumentToBin,
  restoreProjectFolder,
  restoreProjectDocument,
  deleteProjectDocumentPermanent,
  getProjectDocuments,
  uploadProjectDocument,
  updateProjectDocument,
  deleteProjectDocument,
  getDocumentDownloadUrl
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
  const binFiles = reactive<FileItem[]>([])
  const showFloders = reactive<FileItem[]>([])
  const saveFloders = reactive<FileItem[]>([])
  const binFloders = reactive<FileItem[]>([])
  const folderPath = reactive<string[]>([])
  const loading = ref(false)
  const otherStore = useOtherStore()

  // 获取当前项目 ID
  const getCurrentProjectId = () => otherStore.currentProjectId

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
          // 回收站模式：显示所有子项（不管 ifInBin 状态）
          // 正常模式：只显示 ifInBin = false 的子项
          const childrenToKeep = isBin ? item.children : filterFiles(item.children, isBin)
          return { ...item, children: childrenToKeep }
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
        // 文件：检查是否匹配
        if (isMatch) {
          result.push(item)
        }
      } else {
        // 文件夹：先检查自身是否匹配，再递归搜索子项
        if (isMatch) {
          result.push(item)
        }
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
      // 加载所有文件夹（包括正常和已删除）
      const allFolderRes: any = await getProjectFolders({ project_id: projectId, include_deleted: true })
      // 加载所有文档（包括正常和已删除）
      const allDocRes: any = await getProjectDocuments({ project_id: projectId, include_deleted: true })

      // 构建完整的文件树
      const allFolderMap = new Map<string, FileItem>()
      const normalRootFiles: FileItem[] = [] // 正常文件的根级
      const binRootFiles: FileItem[] = [] // 回收站文件的根级

      // 第一步：处理所有文件夹
      if (allFolderRes.success && allFolderRes.data) {
        allFolderRes.data.forEach((folder: any) => {
          const fileItem: FileItem = {
            id: String(folder.id),
            fileName: folder.name,
            fileTime: folder.created_at,
            fileMaker: '',
            fileSize: '',
            ifInBin: folder.deleted_at !== null,
            creatorId: folder.creator_id,
            parentId: folder.parent_folder_id ? String(folder.parent_folder_id) : null,
            children: []
          }
          allFolderMap.set(String(folder.id), fileItem)
        })
      }

      // 第二步：处理所有文档
      if (allDocRes.success && allDocRes.data) {
        allDocRes.data.forEach((doc: any) => {
          const fileItem: FileItem = {
            id: String(doc.id),
            fileName: doc.name,
            fileTime: doc.created_at,
            fileMaker: '',
            fileSize: doc.file_size ? formatFileSize(doc.file_size) : '',
            fileType: doc.file_type,
            fileUrl: doc.file_url,
            ifInBin: doc.deleted_at !== null,
            creatorId: doc.creator_id,
            parentId: doc.parent_folder_id ? String(doc.parent_folder_id) : null
          }

          // 添加到父文件夹或根级
          if (doc.parent_folder_id) {
            const parentFolder = allFolderMap.get(String(doc.parent_folder_id))
            if (parentFolder && parentFolder.children) {
              parentFolder.children.push(fileItem)
            } else {
              // 父文件夹不存在，添加到根级
              if (doc.deleted_at !== null) {
                binRootFiles.push(fileItem)
              } else {
                normalRootFiles.push(fileItem)
              }
            }
          } else {
            // 无父文件夹，添加到根级
            if (doc.deleted_at !== null) {
              binRootFiles.push(fileItem)
            } else {
              normalRootFiles.push(fileItem)
            }
          }
        })
      }

      // 第三步：构建文件夹层级
      // 先将所有根文件夹添加到对应根级
      const rootFolders: FileItem[] = []
      allFolderMap.forEach((folder) => {
        if (!folder.parentId) {
          rootFolders.push(folder)
        }
      })

      // 再建立父子关系（子文件夹不添加到根级）
      allFolderMap.forEach((folder) => {
        if (folder.parentId) {
          const parentFolder = allFolderMap.get(folder.parentId)
          if (parentFolder && parentFolder.children) {
            parentFolder.children.push(folder)
          }
        }
      })

      // 将根级文件夹分类
      rootFolders.forEach((folder) => {
        if (folder.ifInBin) {
          binRootFiles.push(folder)
        } else {
          normalRootFiles.push(folder)
        }
      })

      // 更新存储
      allFiles.splice(0, allFiles.length, ...normalRootFiles)
      binFiles.splice(0, binFiles.length, ...binRootFiles)

      // 正常文件显示（过滤掉回收站文件）
      const filteredShowFiles = filterFiles(allFiles, false)
      // 回收站文件显示（显示完整树结构，只显示已删除的文件夹）
      const filteredBinFiles = filterFiles(binFiles, true)

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

        // 添加到目标位置（同时在正常文件和回收站文件中查找）
        let targetArray = parentId ? findFileById(allFiles, parentId)?.children : null
        if (!targetArray) {
          targetArray = parentId ? findFileById(binFiles, parentId)?.children : null
        }
        if (!targetArray) {
          targetArray = allFiles // 默认添加到根目录
        }
        targetArray.push(newFolder)

        // 刷新显示
        const filteredShowFiles = filterFiles(allFiles, false)
        const filteredBinFiles = filterFiles(binFiles, true)
        saveFloders.splice(0, saveFloders.length, ...filteredShowFiles)
        binFloders.splice(0, binFloders.length, ...filteredBinFiles)

        if (folderPath.length === 0) {
          showFloders.splice(0, showFloders.length, ...saveFloders)
        } else {
          const currentFolderId = folderPath[folderPath.length - 1]
          if (currentFolderId) {
            // 同时在 allFiles 和 binFiles 中查找
            let currentFolder = findFileById(allFiles, currentFolderId)
            if (!currentFolder) {
              currentFolder = findFileById(binFiles, currentFolderId)
            }
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

        // 添加到目标位置（同时在正常文件和回收站文件中查找）
        let targetArray = parentId ? findFileById(allFiles, parentId)?.children : null
        if (!targetArray) {
          targetArray = parentId ? findFileById(binFiles, parentId)?.children : null
        }
        if (!targetArray) {
          targetArray = allFiles // 默认添加到根目录
        }
        targetArray.push(newFile)

        // 刷新显示
        const filteredShowFiles = filterFiles(allFiles, false)
        const filteredBinFiles = filterFiles(binFiles, true)
        saveFloders.splice(0, saveFloders.length, ...filteredShowFiles)
        binFloders.splice(0, binFloders.length, ...filteredBinFiles)

        if (folderPath.length === 0) {
          showFloders.splice(0, showFloders.length, ...saveFloders)
        } else {
          const currentFolderId = folderPath[folderPath.length - 1]
          if (currentFolderId) {
            // 同时在 allFiles 和 binFiles 中查找
            let currentFolder = findFileById(allFiles, currentFolderId)
            if (!currentFolder) {
              currentFolder = findFileById(binFiles, currentFolderId)
            }
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

      const isFolder = !!file.children

      // 调用后端 API 更新 deleted_at 字段
      if (isFolder) {
        const res: any = await moveFolderToBin(parseInt(id))
        if (!res.success) {
          return { success: false, message: res.message || '移至回收站失败' }
        }
      } else {
        const res: any = await moveDocumentToBin(parseInt(id))
        if (!res.success) {
          return { success: false, message: res.message || '移至回收站失败' }
        }
      }

      // 重新加载文件列表
      const projectId = getCurrentProjectId()
      if (projectId) {
        await loadProjectFiles(projectId)
      }

      return { success: true }
    } catch (error) {
      console.error('移至回收站失败:', error)
      return { success: false, message: '移至回收站失败' }
    }
  }

  // 恢复文件
  const restoreFile = async (id: string) => {
    try {
      // 同时在正常文件列表和回收站列表中查找
      let file = findFileById(allFiles, id)
      if (!file) {
        file = findFileById(binFiles, id)
      }
      if (!file) {
        return { success: false, message: '文件不存在' }
      }

      const isFolder = !!file.children

      // 调用后端 API 恢复
      if (isFolder) {
        const res: any = await restoreProjectFolder(parseInt(id))
        if (!res.success) {
          return { success: false, message: res.message || '恢复失败' }
        }
      } else {
        const res: any = await restoreProjectDocument(parseInt(id))
        if (!res.success) {
          return { success: false, message: res.message || '恢复失败' }
        }
      }

      // 重新加载文件列表
      const projectId = getCurrentProjectId()
      if (projectId) {
        await loadProjectFiles(projectId)
      }

      return { success: true }
    } catch (error) {
      console.error('恢复失败:', error)
      return { success: false, message: '恢复失败' }
    }
  }

  // 彻底删除
  const deletePermanently = async (id: string) => {
    try {
      // 同时在正常文件列表和回收站列表中查找
      let file = findFileById(allFiles, id)
      if (!file) {
        file = findFileById(binFiles, id)
      }
      if (!file) {
        return { success: false, message: '文件不存在' }
      }

      const isFolder = !!file.children

      // 调用后端 API 彻底删除（从数据库和文件系统删除）
      if (isFolder) {
        const res: any = await deleteProjectFolderPermanent(parseInt(id))
        if (!res.success) {
          return { success: false, message: res.message || '删除失败' }
        }
      } else {
        const res: any = await deleteProjectDocumentPermanent(parseInt(id))
        if (!res.success) {
          return { success: false, message: res.message || '删除失败' }
        }
      }

      // 重新加载文件列表
      const projectId = getCurrentProjectId()
      if (projectId) {
        await loadProjectFiles(projectId)
      }

      return { success: true }
    } catch (error) {
      console.error('彻底删除失败:', error)
      return { success: false, message: '删除失败' }
    }
  }

  // 进入文件夹
  const enterFolder = (itemId: string, isInBin: boolean = false) => {
    // 同时在正常文件列表和回收站列表中查找
    let item = findFileById(allFiles, itemId)
    if (!item) {
      item = findFileById(binFiles, itemId)
    }
    if (item && item.children && item.id) {
      folderPath.push(item.id)
      // 回收站模式下显示所有子项，正常模式下过滤掉回收站文件
      const filteredChildren = filterFiles(item.children, isInBin)
      showFloders.splice(0, showFloders.length, ...filteredChildren)
    }
  }

  // 返回上级
  const backToParent = (isInBin: boolean = false) => {
    if (folderPath.length > 0) {
      folderPath.pop()

      if (folderPath.length === 0) {
        // 返回到根级时，根据模式显示对应列表
        showFloders.splice(0, showFloders.length, ...(isInBin ? binFloders : saveFloders))
      } else {
        const parentId = folderPath[folderPath.length - 1]
        if (parentId) {
          // 同时在正常文件列表和回收站列表中查找
          let parentFolder = findFileById(allFiles, parentId)
          if (!parentFolder) {
            parentFolder = findFileById(binFiles, parentId)
          }
          if (parentFolder && parentFolder.children) {
            showFloders.splice(0, showFloders.length, ...filterFiles(parentFolder.children, isInBin))
          }
        }
      }
    }
  }

  // 搜索文件
  const searchFiles = (name: string) => {
    if (name !== '') {
      // 从完整的文件树中搜索（allFiles包含所有文件，包括回收站中的）
      const allSearchResults = filterFilesByName(allFiles, name)
      showFloders.splice(0, showFloders.length, ...allSearchResults)
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

  // 下载单个文件
  const downloadFile = (file: FileItem) => {
    if (!file.id) {
      console.error('文件ID不存在')
      return
    }
    // 使用后端专门的下载接口
    const downloadUrl = getDocumentDownloadUrl(Number(file.id))
    window.open(downloadUrl, '_blank')
  }

  // 递归收集文件夹内所有文件
  const collectFolderFiles = async (item: FileItem, parentPath: string, zip: JSZip): Promise<void> => {
    if (item.children && item.children.length > 0) {
      // 是文件夹，递归处理子项
      const folderName = item.fileName
      for (const child of item.children) {
        await collectFolderFiles(child, `${parentPath}/${folderName}`, zip)
      }
    } else if (item.id) {
      // 是文件，使用后端下载接口获取并添加到 ZIP
      try {
        const downloadUrl = getDocumentDownloadUrl(Number(item.id))
        const response = await fetch(downloadUrl)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const blob = await response.blob()
        zip.file(`${parentPath}/${item.fileName}`, blob)
      } catch (error) {
        console.error(`下载文件 ${item.fileName} 失败:`, error)
      }
    }
  }

  // 下载文件夹（打包为 ZIP）
  const downloadFolder = async (folder: FileItem) => {
    const zip = new JSZip()
    const folderName = folder.fileName

    // 收集文件夹内所有文件
    if (folder.children && folder.children.length > 0) {
      for (const child of folder.children) {
        await collectFolderFiles(child, '', zip)
      }
    }

    // 生成 ZIP 并下载
    try {
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = `${folderName}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('生成 ZIP 失败:', error)
    }
  }

  return {
    allFiles,
    binFiles,
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
    findFileById,
    downloadFile,
    downloadFolder
  }
})
