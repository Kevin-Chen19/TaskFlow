<template>
  <div class="bigBox">
    <div class="bigTitle">{{ $t("projects.documentLibary") }}</div>
    <div class="Line_two">
      <span class="smallText">{{ $t("projects.shareTeamFiles") }}</span>
      <div class="Line_two_right">
        <el-tooltip
          class="box-item"
          effect="dark"
          :content="ifBin ? t('projects.colseBin') : t('projects.openbin')"
          placement="bottom"
        >
          <div class="iconBox">
            <div
              class="smallIconBox"
              :class="ifBin ? 'chooseIconBox' : ''"
              @click="showBinFolders"
            >
              <img src="@/assets/icons/回收站.png" alt="回收站图标" />
            </div>
          </div>
        </el-tooltip>
        <div class="spaceLine"></div>
        <div class="iconBox">
          <div
            class="smallIconBox"
            :class="menuKind == 0 ? 'chooseIconBox' : ''"
            @click="menuKind = 0"
          >
            <img src="@/assets/icons/菜单1.png" alt="菜单1图标" />
          </div>
          <div
            class="smallIconBox"
            :class="menuKind == 1 ? 'chooseIconBox' : ''"
            @click="menuKind = 1"
          >
            <img src="@/assets/icons/菜单2.png" alt="菜单2图标" />
          </div>
        </div>
        <div class="spaceLine"></div>
        <div class="iconBox uploadBox" @click="openUploadDialog">
          <img src="@/assets/icons/上传文件.png" alt="上传文件图标" />
          <div>{{ $t("projects.uploadFile") }}</div>
        </div>
      </div>
    </div>
    <div class="Line_two">
      <div class="inputName" style="margin-top: 2rem">
        <span
          v-if="folderPath.length > 0"
          class="backBtn"
          @click="backToParent"
        >
          ← {{ $t("projects.returnSuperior") }}
        </span>
        {{ $t("projects.FLODERS") }}
      </div>
      <div>
        <el-input
          v-model="searchFileValue"
          class="responsive-input"
          :placeholder="$t('projects.searchByFileName')"
          :prefix-icon="Search"
          @change="searchFiles"
        />
      </div>
    </div>
    <div v-if="menuKind == 0" class="folderScroll">
      <div
        class="cardItem floderItem"
        v-for="item in showFloders"
        :key="item.id"
      >
        <CardTamp
          :ifFolder="!!item.children"
          :bodyContent="item.fileName"
          :footerContent="getFooterContent(item)"
          :topRightImg="'菜单.png'"
          :ifBin="item.ifInBin"
          @click="item.children ? enterFolder(item) : null"
          @command="(command) => handleCommand(item, command)"
        ></CardTamp>
      </div>
      <div
        class="createFolderBox"
        v-show="ifShowCreateBox"
        @click="createFolder"
      >
        <img src="@/assets/icons/新建文件夹.png" alt="新建文件夹图标" />
        <div>{{ $t("projects.newFolder") }}</div>
      </div>
    </div>
    <div class="listFloders" v-if="menuKind == 1">
      <el-tree
        ref="treeRef2"
        style="max-width: 100%"
        :data="showFloders"
        node-key="id"
        :expand-on-click-node="false"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <FileCard
              :ifFolder="!!data.children"
              :ifBin="data.ifInBin"
              :fileName="data.fileName"
              :fileTime="
                data.children ? data.children.length + $t('projects.files') : formatFileTime(data.fileTime)
              "
              :fileMaker="data.fileMaker"
              :fileSize="data.fileSize"
              @command="(command) => handleCommand(data, command)"
            >
            </FileCard>
          </div>
        </template>
      </el-tree>
    </div>
    <div class="emptyBox" v-if="ifEmpty">{{ $t("noMatchFound") }}</div>
    <div class="dropBox">
      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        :show-file-list="false"
        multiple
        :on-change="handleDropFileChange"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          {{ $t("projects.dropFileOr") }}
          <em>{{ $t("projects.clickToUpload") }}</em>
        </div>
      </el-upload>
    </div>
  </div>
  <el-dialog
    v-model="renameDialogVisible"
    :title="$t('projects.rename')"
    width="600"
    align-center
  >
    <div class="line"></div>
    <div class="inputName">{{ $t("projects.newName") }}</div>
    <el-input
      v-model="newName"
      :placeholder="$t('pleaseEnterContent')"
      class="content-input"
    ></el-input>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="renameDialogVisible = false" class="cancelBtn">
          {{ $t("cancel") }}
        </el-button>
        <el-button type="primary" @click="submitName" class="confirmBtn">
          {{ $t("save") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="notificationDialogVisible"
    :title="$t('projects.memberNotification')"
    width="800"
    align-center
  >
    <div class="line"></div>
    <MentionsCard :mentionsDate="mentionsDate"></MentionsCard>
    <template #footer>
      <div class="dialog-footer">
        <div @click="notificationDialogVisible = false" class="cancelBtn">
          {{$t('cancel')}}
        </div>
        <div type="primary" class="sendBtn" @click="sendNotification">
          {{$t('projects.sendNotifications')}}
        </div>
      </div>
    </template>
  </el-dialog>

  <!-- 上传文件对话框 -->
  <el-dialog
    v-model="uploadDialogVisible"
    :title="$t('projects.uploadFile')"
    width="600"
    align-center
  >
    <div class="line"></div>
    <el-upload
      drag
      :auto-upload="false"
      multiple
      :on-change="handleFileChange"
      :file-list="fileList"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        {{ $t("projects.dropFileOr") }}
        <em>{{ $t("projects.clickToUpload") }}</em>
      </div>
    </el-upload>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="uploadDialogVisible = false" class="cancelBtn">
          {{ $t("cancel") }}
        </el-button>
        <el-button type="primary" @click="submitUpload" class="confirmBtn">
          {{ $t("save") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import CardTamp from "@/components/cardTamp.vue";
import { useI18n } from "vue-i18n";
import FileCard from "@/components/fileCard.vue";
import MentionsCard from "@/components/mentionsCard.vue";
import { UploadFilled } from "@element-plus/icons-vue";
import { useNotificationStore } from "@/stores/notificationStore";
import { useUserStore } from "@/stores/userStore";
import { useFileStore } from "@/stores/fileStore";
import { useOtherStore } from "@/stores/otherStore";
import type {
  TreeInstance,
} from "element-plus";
import { ref, reactive, onMounted, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";

const userStore = useUserStore();
const { t } = useI18n();
const notificationStore = useNotificationStore();
const fileStore = useFileStore();
const otherStore = useOtherStore();

const renameDialogVisible = ref(false);
const notificationDialogVisible = ref(false);
const uploadDialogVisible = ref(false);
const treeRef2 = ref<TreeInstance>();
const menuKind = ref(0);
const ifBin = ref(false);
const newName = ref("");
const houzhui = ref("");
const currentFileId = ref("");
const ifShowCreateBox = ref(true);
const ifEmpty = ref(false);
const searchFileValue = ref("");
const fileList = ref<any[]>([]);
const mentionsDate = reactive({
  members: [],
  note: "",
  fileName: "",
});

// 使用 fileStore 的数据
const showFloders = computed(() => fileStore.showFloders)
const folderPath = computed(() => fileStore.folderPath)

// 获取当前文件夹 ID（用于上传和创建文件夹）
const currentFolderId = computed(() => {
  return folderPath.value.length > 0
    ? folderPath.value[folderPath.value.length - 1]
    : null
})

// 初始化
onMounted(() => {
  const projectId = otherStore.currentProjectId
  if (projectId) {
    fileStore.loadProjectFiles(projectId)
  }
})

// 监听项目变化
watch(() => otherStore.currentProjectId, (newProjectId) => {
  if (newProjectId) {
    fileStore.loadProjectFiles(newProjectId)
  }
})

// 文件树接口定义
interface filesTree {
  fileName: string;
  fileTime?: string;
  fileMaker?: string;
  fileSize?: string;
  children?: filesTree[];
  ifInBin: boolean;
  id: string;
}

// 进入文件夹
const enterFolder = (item: any) => {
  fileStore.enterFolder(item.id)
}

// 返回上级文件夹
const backToParent = () => {
  fileStore.backToParent()
}

// 搜索文件
const searchFiles = () => {
  if (searchFileValue.value !== "") {
    ifShowCreateBox.value = false;
    fileStore.searchFiles(searchFileValue.value)
    ifEmpty.value = fileStore.showFloders.length === 0
  } else {
    ifShowCreateBox.value = true;
    fileStore.searchFiles("")
    ifEmpty.value = false
  }
}

// 显示/隐藏回收站
const showBinFolders = () => {
  ifBin.value = !ifBin.value
  ifShowCreateBox.value = !ifBin.value
  fileStore.toggleBin(ifBin.value)
  // 清空路径
  fileStore.folderPath = []
}

// 打开上传对话框
const openUploadDialog = () => {
  fileList.value = []
  uploadDialogVisible.value = true
}

// 处理文件上传
const handleFileChange = (file: any) => {
  console.log('文件选择:', file)
  console.log('file.raw:', file.raw)
  console.log('file.raw instanceof File:', file.raw instanceof File)

  // 将新文件添加到 fileList
  const existingIndex = fileList.value.findIndex(f => f.uid === file.uid)
  if (existingIndex === -1) {
    fileList.value.push(file)
  }
}

// 处理拖拽区域文件变化 - 直接上传
const handleDropFileChange = async (file: any) => {
  const projectId = otherStore.currentProjectId
  if (!projectId) {
    ElMessage.warning('请先选择项目')
    return
  }

  const fileToUpload = file.raw
  if (!fileToUpload || !(fileToUpload instanceof File)) {
    console.error('无效的文件对象:', file)
    ElMessage.error(`${file.name} 上传失败：无效文件`)
    return
  }

  try {
    const result = await fileStore.uploadFile(projectId, fileToUpload, currentFolderId.value)
    if (result.success) {
      ElMessage.success(`${file.name} 上传成功`)
    } else {
      ElMessage.error(`${file.name} 上传失败`)
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error(`${file.name} 上传失败`)
  }
}

// 提交上传
const submitUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择文件')
    return
  }

  const projectId = otherStore.currentProjectId
  if (!projectId) {
    ElMessage.warning('请先选择项目')
    return
  }

  try {
    for (const file of fileList.value) {
      // el-upload 的 fileList 中文件对象结构：{ name, size, percentage, status, uid, raw: File }
      const fileToUpload = file.raw
      if (!fileToUpload || !(fileToUpload instanceof File)) {
        console.error('无效的文件对象:', file)
        ElMessage.error(`${file.name} 上传失败：无效文件`)
        continue
      }

      const result = await fileStore.uploadFile(projectId, fileToUpload, currentFolderId.value)
      if (!result.success) {
        ElMessage.error(`${file.name} 上传失败`)
      }
    }
    ElMessage.success('文件上传成功')
    uploadDialogVisible.value = false
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('文件上传失败')
  }
}
// 处理菜单文件命令
const handleCommand = async (file: any, command: string) => {
  console.log("Received command:", command, file);

  if (command === "rename") {
    newName.value = file.fileName;
    // 使用 lastIndexOf 正确获取文件扩展名（处理文件名中包含多个点的情况）
    const lastDotIndex = newName.value.lastIndexOf(".");
    houzhui.value = lastDotIndex > -1 ? newName.value.substring(lastDotIndex + 1) : "";
    currentFileId.value = file.id;
    renameDialogVisible.value = true;
  } else if (command === "delete") {
    // 移动到回收站
    const result = await fileStore.moveToBin(file.id)
    if (result.success) {
      ElMessage.success('已移至回收站')
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } else if (command === "notify") {
    mentionsDate.fileName = file.fileName;
    notificationDialogVisible.value = true;
  } else if (command === "deletePermanently") {
    // 彻底删除
    try {
      await ElMessageBox.confirm('确定要彻底删除该文件吗？此操作不可恢复', '提示', {
        type: 'warning',
      })
      const result = await fileStore.deletePermanently(file.id)
      if (result.success) {
        ElMessage.success('删除成功')
      } else {
        ElMessage.error(result.message || '删除失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
      }
    }
  } else if (command === "download") {
    // 下载文件或文件夹
    if (file.children && file.children.length > 0) {
      // 是文件夹，下载为 ZIP
      await fileStore.downloadFolder(file)
    } else {
      // 是单个文件，直接下载
      await fileStore.downloadFile(file)
    }
  }
}

// 处理文件卡片操作
const handleFileAction = async (file: any, action: string) => {
  if (action === 'edit') {
    newName.value = file.fileName
    // 使用 lastIndexOf 正确获取文件扩展名
    const lastDotIndex = newName.value.lastIndexOf(".")
    houzhui.value = lastDotIndex > -1 ? newName.value.substring(lastDotIndex + 1) : ""
    currentFileId.value = file.id
    renameDialogVisible.value = true
  } else if (action === 'delete') {
    const result = await fileStore.moveToBin(file.id)
    if (result.success) {
      ElMessage.success('已移至回收站')
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  }
}
// 递归查找文件/文件夹
const findFileById = (files: filesTree[], id: string): filesTree | null => {
  for (const file of files) {
    if (file.id === id) {
      return file;
    }
    if (file.children) {
      const found = findFileById(file.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

// 递归删除文件夹及其子文件
const deleteFileRecursively = (file: filesTree, inBin: boolean) => {
  file.ifInBin = inBin;
  if (file.children) {
    file.children.forEach((child) => {
      deleteFileRecursively(child, inBin);
    });
  }
};

// 查找父文件夹
const findParentFolder = (
  files: filesTree[],
  childId: string | undefined,
): filesTree | null => {
  for (const file of files) {
    if (file.children) {
      for (const child of file.children) {
        if (child.id === childId) {
          return file;
        }
        if (child.children) {
          const found = findParentFolder([child], childId);
          if (found) {
            return found;
          }
        }
      }
    }
  }
  return null;
};

const submitName = async () => {
  // 实现对文件或文件夹的重命名
  const result = await fileStore.renameFile(currentFileId.value, newName.value)
  if (result.success) {
    ElMessage.success('重命名成功')
    renameDialogVisible.value = false
  } else {
    ElMessage.error(result.message || '重命名失败')
  }
}

// 新建文件夹
const createFolder = async () => {
  // 生成唯一的文件夹名称
  let folderName = "新建文件夹";
  let counter = 1;
  const targetFiles = currentFolderId.value
    ? fileStore.findFileById(fileStore.allFiles, currentFolderId.value)?.children
    : fileStore.allFiles

  while (targetFiles?.some((item) => item.fileName === folderName && !!item.children)) {
    folderName = `新建文件夹${counter}`;
    counter++;
  }

  const projectId = otherStore.currentProjectId
  if (!projectId) {
    ElMessage.warning('请先选择项目')
    return
  }

  const result = await fileStore.createFolder(projectId, folderName, currentFolderId.value)
  if (result.success) {
    ElMessage.success('文件夹创建成功')
  } else {
    ElMessage.error(result.message || '创建失败')
  }
}
const sendNotification = () => {
  console.log(mentionsDate);
  notificationStore.notifications.unshift({
    // 使用 slice() 替代已弃用的 substr()
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    name: mentionsDate.fileName + "提醒",
    time: formatDate(new Date()),
    status: "未读",
    creator: userStore.user.name,
    receiver: [...mentionsDate.members],
    kind: "文件提醒",
    content: mentionsDate.note,
  });
  console.log(notificationStore.notifications);
  notificationDialogVisible.value = false;
  clearmentionsDate();
};
const clearmentionsDate = () => {
  mentionsDate.note = "";
  mentionsDate.members = [];
  mentionsDate.fileName = "";
  console.log(mentionsDate);
};

// 格式化日期为 yyyy-MM-dd HH:mm:ss
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 格式化后端返回的时间字符串为 yyyy-MM-dd HH:mm
const formatFileTime = (timeStr?: string): string => {
  if (!timeStr) return "";
  try {
    const date = new Date(timeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    return timeStr;
  }
};

// 获取底部显示内容
const getFooterContent = (item: any): string => {
  if (item.children) {
    // 文件夹显示子文件数量
    return String(item.children.length) + t('projects.files');
  } else {
    // 单个文件显示上传时间
    return formatFileTime(item.fileTime);
  }
};
</script>
<style scoped lang="scss">
.Line_two_right {
  display: flex;
}
.iconBox {
  display: flex;
  background-color: rgb(235, 230, 230);
  height: 2rem;
  padding: 0.2rem;
  border-radius: 0.5rem;
}
.spaceLine {
  width: 0.2rem;
  height: 2.5rem;
  background-color: rgb(190, 189, 189);
  margin: 0 1rem;
}
.smallIconBox {
  width: 2rem;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.3rem;
  margin-right: 0.2rem;
  cursor: pointer;
  img {
    width: 60%;
  }
}
.chooseIconBox {
  background-color: #fff;
}
.folderScroll {
  width: 100%;
  display: flex;
  padding: 0.5rem;
  flex-wrap: wrap;
  max-height: 29.5rem;
  overflow: auto;
  /* 隐藏标准滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.floderItem {
  box-sizing: border-box;
  margin: 2rem 3.5rem 2rem 0;
  flex-shrink: 0;
}
.floderItem:hover {
  border: 1px solid rgb(175, 174, 174);
}
.uploadBox {
  align-items: center;
  background-color: #1fa2ad;
  cursor: pointer;
  color: #fff;
  padding: 0.3rem 0.8rem;
  img {
    width: 1.5rem;
    margin-right: 0.2rem;
  }
}
.uploadBox:hover {
  background-color: #48b3bd;
}
.backBtn {
  margin-right: 1rem;
  cursor: pointer;
}
.backBtn:hover {
  color: #1fa2ad;
}
.createFolderBox {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 20%;
  min-width: 25vh;
  height: 10rem;
  border: 0.2rem dotted rgb(203, 198, 198);
  margin: 2rem 3.5rem 2rem 0;
  border-radius: 1rem;
  cursor: pointer;
  img {
    width: 2rem;
    margin-bottom: 1rem;
  }
}
.createFolderBox:hover {
  border: 0.2rem dotted rgb(175, 174, 174);
}
.listFloders {
  max-height: 29.5rem;
  overflow: auto;
  /* 隐藏标准滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.recentFilesBox {
  height: 15rem;
  overflow: auto;
  /* 隐藏标准滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.dropBox {
  margin-top: 2rem;
  width: 100%;
  height: 20rem;
  background-color: #fff;
}
:deep(.el-upload) {
  height: 20rem;
}
:deep(.el-upload-dragger) {
  height: 100%;
  border: 2px dotted rgb(203, 198, 198);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
:deep(.custom-tree-node) {
  width: 100%;
  height: 4rem;
}
:deep(.el-tree) {
  --el-tree-node-content-height: 100%;
  background-color: transparent;
}
:deep(.el-tree-node__content) {
  margin-bottom: 1rem;
  height: fit-content;
  background-color: transparent;
}
:deep(.el-tree-node:focus > .el-tree-node__content) {
  background-color: transparent;
}
:deep(.el-input__wrapper) {
  box-sizing: border-box;
  height: 2rem !important;
  border-radius: 0 !important;
  padding: 0.2rem 0.5rem !important;
  background-color: #fff !important;
  border: 1px solid #ccc;
  box-shadow: none;
}
:deep(.el-input__wrapper:focus-within) {
  border: 1px solid black;
}
.dialog-footer {
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 1rem;
}
.cancelBtn {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  cursor: pointer;
}
.cancelBtn:hover {
  background-color: #ebe9e9;
}
.sendBtn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #2563eb;
  color: #fff;
  cursor: pointer;
}
.sendBtn:hover {
  background-color: #1d4ed8;
}
</style>
