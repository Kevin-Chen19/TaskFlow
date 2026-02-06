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
        <div class="iconBox uploadBox">
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
        v-for="(item, index) in showFloders"
        :key="index"
      >
        <CardTamp
          :ifFolder="true"
          :bodyContent="item.fileName"
          :footerContent="
            item.children ? String(item.children.length) + $t('projects.files') : (item.fileTime || '')
          "
          :topRightImg="'菜单.png'"
          :ifBin="item.ifInBin"
          @click="enterFolder(item)"
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
              :ifFolder="true"
              :ifBin="data.ifInBin"
              :fileName="data.fileName"
              :fileTime="
                data.children ? data.children.length + $t('projects.files') : data.fileTime
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
        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
        multiple
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
</template>
<script setup lang="ts">
import CardTamp from "@/components/cardTamp.vue";
import { useI18n } from "vue-i18n";
import FileCard from "@/components/fileCard.vue";
import MentionsCard from "@/components/mentionsCard.vue";
import floderIcon from "@/assets/icons/文件夹.png";
import { UploadFilled } from "@element-plus/icons-vue";
import { useNotificationStore } from "@/stores/notificationStore";
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const { t } = useI18n();
const notificationStore = useNotificationStore();
import type {
  RenderContentContext,
  RenderContentFunction,
  TreeInstance,
} from "element-plus";
import { ref, reactive, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
type Node = RenderContentContext["node"];
type Data = RenderContentContext["data"];
let id = 1000;
const renameDialogVisible = ref(false);
const notificationDialogVisible = ref(false);
const treeRef2 = ref<TreeInstance>();
const menuKind = ref(0);
const ifBin = ref(false);
const newName = ref("");
const houzhui = ref("");
const currentFileId = ref("");
const ifShowCreateBox = ref(true);
const ifEmpty = ref(false);
const searchFileValue = ref("");
const showFloders = reactive<filesTree[]>([]); //展示的文件
const saveFloders = reactive<filesTree[]>([]); //未删除的文件
const binFloders = reactive<filesTree[]>([]); //回收站文件
const folderPath = reactive<string[]>([]); // 记录文件夹路径（ID数组）
const mentionsDate = reactive({
  members: [],
  note: "",
  fileName: "",
});

// 递归筛选函数:根据 ifInBin 状态筛选文件树
const filterFiles = (files: filesTree[], isBin: boolean): filesTree[] => {
  return files
    .filter((item) => {
      // 如果在回收站模式下,只包含 ifInBin 为 true 的项
      if (isBin) {
        return item.ifInBin;
      }
      // 在正常模式下,只包含 ifInBin 为 false 的项
      return !item.ifInBin;
    })
    .map((item) => {
      // 递归处理子项
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterFiles(item.children, isBin);
        // 只有当子项不为空时才保留 children 属性
        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        // 如果筛选后没有子项,则移除 children 属性
        return { ...item, children: undefined };
      }
      return item;
    });
};

// 扁平化收集回收站中的所有文件
const collectBinFiles = (files: filesTree[]): filesTree[] => {
  let result: filesTree[] = [];
  files.forEach((item) => {
    if (item.ifInBin) {
      // 文件或文件夹本身在回收站中，直接添加（保持树形结构）
      result.push({ ...item });
    } else {
      // 父文件夹不在回收站，但子文件可能在回收站中
      if (item.children) {
        const childrenInBin = collectBinFiles(item.children);
        result.push(...childrenInBin);
      }
    }
  });
  return result;
};
// 收集匹配的子项(用于扁平化显示在文件夹名称匹配时)
const collectMatchingItems = (
  files: filesTree[],
  name: string,
): filesTree[] => {
  let result: filesTree[] = [];
  files.forEach((item) => {
    const isMatch = item.fileName.toLowerCase().includes(name.toLowerCase());
    if (!item.children) {
      // 文件匹配则添加
      if (isMatch) {
        result.push(item);
      }
    } else {
      // 文件夹匹配:收集所有匹配的子项
      const children = collectMatchingItems(item.children, name);
      result.push(...children);
    }
  });
  return result;
};
const filterFilesByName = (
  files: filesTree[],
  name: string,
  parentMatched = false,
): filesTree[] => {
  return files.flatMap((item) => {
    const isMatch = item.fileName.toLowerCase().includes(name.toLowerCase());
    let result = [];

    if (!item.children) {
      // 文件:匹配则返回,不匹配则不返回
      if (isMatch) {
        result.push(item);
      }
    } else {
      // 文件夹
      if (isMatch) {
        // 文件夹名称匹配:返回该文件夹(保留所有子项)
        result.push(item);
        // 同时把内部匹配的子项单独提取出来
        const matchingChildren = collectMatchingItems(item.children, name);
        result.push(...matchingChildren);
      } else {
        // 文件夹不匹配:递归筛选匹配的子项
        const children = filterFilesByName(item.children, name, false);
        if (children.length > 0) {
          result.push(...children);
        }
      }
    }
    return result;
  });
};
const showBinFolders = () => {
  ifBin.value = !ifBin.value;
  if (ifBin.value) {
    ifShowCreateBox.value = false;
  } else {
    ifShowCreateBox.value = true;
  }

  //清空路径
  folderPath.splice(0, folderPath.length);
  if (ifBin.value) {
    // 重新收集回收站文件
    const filteredBinFiles = collectBinFiles(AllFiles);
    binFloders.splice(0, binFloders.length);
    binFloders.push(...filteredBinFiles);
    showFloders.splice(0, showFloders.length);
    showFloders.push(...binFloders);
  } else {
    showFloders.splice(0, showFloders.length);
    showFloders.push(...saveFloders);
  }
};
onMounted(() => {
  // 筛选正常文件和回收站文件,递归处理所有层级
  const filteredShowFiles = filterFiles(AllFiles, false);
  // 回收站使用扁平化收集，确保子文件夹中的被删除文件也能显示
  const filteredBinFiles = collectBinFiles(AllFiles);

  saveFloders.push(...filteredShowFiles);
  binFloders.push(...filteredBinFiles);
  showFloders.push(...saveFloders);
});
const AllFiles: filesTree[] = [
  {
    fileName: "Product Mockups",
    ifInBin: false,
    id: "123",
    children: [
      {
        fileName: "Product Design",
        ifInBin: false,
        id: "124",
        children: [
          {
            fileName: "项目章程1.pdf",
            fileTime: "2026-01-21 17:39",
            fileMaker: "Peter",
            fileSize: "2.5MB",
            ifInBin: false,
            id: "125",
          },
          {
            fileName: "UI设计稿1.png",
            fileTime: "2026-01-18 14:19",
            fileMaker: "Bob",
            fileSize: "7.5MB",
            ifInBin: true,
            id: "126",
          },
        ],
      },
      {
        fileName: "项目计划.docx",
        fileTime: "2026-01-18 14:19",
        fileMaker: "Kevin",
        fileSize: "2.5MB",
        ifInBin: false,
        id: "127",
      },
      {
        fileName: "路演.ppt",
        fileTime: "2026-01-19 15:39",
        fileMaker: "Kevin",
        fileSize: "21.5MB",
        ifInBin: false,
        id: "128",
      },
      {
        fileName: "财务报表.xlsx",
        fileTime: "2026-01-20 16:39",
        fileMaker: "Alice",
        fileSize: "1.5MB",
        ifInBin: false,
        id: "129",
      },
    ],
  },
  {
    fileName: "Product Design",
    ifInBin: false,
    id: "113",
    children: [
      {
        fileName: "项目章程2.pdf",
        fileTime: "2026-01-21 17:39",
        fileMaker: "Peter",
        fileSize: "2.5MB",
        ifInBin: false,
        id: "133",
      },
      {
        fileName: "UI设计稿2.png",
        fileTime: "2026-01-18 14:19",
        fileMaker: "Bob",
        fileSize: "7.5MB",
        ifInBin: false,
        id: "143",
      },
    ],
  },
  {
    fileName: "项目客户",
    ifInBin: true,
    id: "153",
    children: [
      {
        fileName: "项目章程3.pdf",
        fileTime: "2026-01-21 17:39",
        fileMaker: "Peter",
        fileSize: "2.5MB",
        ifInBin: true,
        id: "163",
      },
      {
        fileName: "UI设计稿3.png",
        fileTime: "2026-01-18 14:19",
        fileMaker: "Bob",
        fileSize: "7.5MB",
        ifInBin: true,
        id: "173",
      },
    ],
  },
  {
    fileName: "UI设计稿4.png",
    fileTime: "2026-01-18 14:19",
    fileMaker: "Bob",
    fileSize: "7.5MB",
    ifInBin: true,
    id: "183",
  },
  {
    fileName: "项目章程4.pdf",
    fileTime: "2026-01-21 17:39",
    fileMaker: "Peter",
    fileSize: "2.5MB",
    ifInBin: false,
    id: "193",
  },
  {
    fileName: "项目计划2.docx",
    fileTime: "2026-01-18 14:19",
    fileMaker: "Kevin",
    fileSize: "2.5MB",
    ifInBin: false,
    id: "023",
  },
];
interface filesTree {
  fileName: string;
  fileTime?: string;
  fileMaker?: string;
  fileSize?: string;
  children?: filesTree[];
  ifInBin: boolean;
  id: string;
}
const defaultProps = {
  children: "children",
  label: "fileName",
};
const handleNodeClick = (data: filesTree) => {
  console.log(data);
};
// 进入文件夹
const enterFolder = (item: filesTree) => {
  if (item.children && item.id) {
    // 保存当前文件夹ID到路径栈
    folderPath.push(item.id);
    // 清空当前显示
    showFloders.splice(0, showFloders.length);
    // 从 AllFiles 中重新获取并显示子文件夹内容
    const folderInAllFiles = findFileById(AllFiles, item.id);
    if (folderInAllFiles && folderInAllFiles.children) {
      const filteredChildren = filterFiles(
        folderInAllFiles.children,
        ifBin.value,
      );
      showFloders.push(...filteredChildren);
    }
  }
};

// 返回上级文件夹
const backToParent = () => {
  if (folderPath.length > 0) {
    // 移除当前文件夹ID
    folderPath.pop();

    if (folderPath.length === 0) {
      // 返回根目录
      showFloders.splice(0, showFloders.length);
      showFloders.push(...(ifBin.value ? binFloders : saveFloders));
    } else {
      // 返回到上一级文件夹
      const parentId = folderPath[folderPath.length - 1];
      const parentFolder = findFileById(AllFiles, parentId!);
      if (parentFolder && parentFolder.children) {
        const filteredChildren = filterFiles(
          parentFolder.children,
          ifBin.value,
        );
        showFloders.splice(0, showFloders.length);
        showFloders.push(...filteredChildren);
      }
    }
  }
};
// 搜索文件
const searchFiles = () => {
  ifBin.value = false;
  if (searchFileValue.value !== "") {
    ifShowCreateBox.value = false;
    const filteredSearchFiles = filterFilesByName(
      AllFiles,
      searchFileValue.value,
    );
    showFloders.splice(0, showFloders.length);
    showFloders.push(...filteredSearchFiles);
    if (showFloders.length === 0) {
      ifEmpty.value = true;
    } else {
      ifEmpty.value = false;
    }
  } else {
    ifShowCreateBox.value = true;
    const filteredShowFiles = filterFiles(AllFiles, false);
    showFloders.splice(0, showFloders.length);
    showFloders.push(...filteredShowFiles);
    ifEmpty.value = false;
  }
};
//处理菜单文件命令
const handleCommand = (file: filesTree, command: string) => {
  console.log("Received command:", command, file);
  // 处理不同命令
  if (command === "rename") {
    newName.value = file.fileName;
    const parts = newName.value.split(".");
    houzhui.value = parts.length > 1 ? parts[1] || "" : "";
    currentFileId.value = file.id;
    renameDialogVisible.value = true;
  } else if (command === "delete") {
    // 在原始数据源中查找并递归删除
    const targetFile = findFileById(AllFiles, file.id);
    if (targetFile) {
      // 递归删除文件夹及其所有子文件
      deleteFileRecursively(targetFile, true);

      // 统一更新所有数据源
      const filteredShowFiles = filterFiles(AllFiles, false);
      // 回收站使用扁平化收集，确保子文件夹中的被删除文件也能显示
      const filteredBinFiles = collectBinFiles(AllFiles);

      // 更新 saveFloders 和 binFloders
      saveFloders.splice(0, saveFloders.length);
      binFloders.splice(0, binFloders.length);
      saveFloders.push(...filteredShowFiles);
      binFloders.push(...filteredBinFiles);

      // 根据当前状态更新显示
      if (folderPath.length > 0) {
        // 在子文件夹中：从路径栈获取当前文件夹ID，重新构建显示
        const currentFolderId = folderPath[folderPath.length - 1];
        const currentFolder = findFileById(AllFiles, currentFolderId!);
        if (currentFolder && currentFolder.children) {
          const filteredCurrentFolder = filterFiles(
            currentFolder.children,
            ifBin.value,
          );
          showFloders.splice(0, showFloders.length);
          showFloders.push(...filteredCurrentFolder);
        }
      } else {
        // 在根目录：根据当前视图模式显示
        showFloders.splice(0, showFloders.length);
        showFloders.push(...(ifBin.value ? binFloders : saveFloders));
      }
    }
  } else if (command === "notify") {
    mentionsDate.fileName = file.fileName;
    notificationDialogVisible.value = true;
  } else if (command === "drop") {
    //彻底删除文件
    const targetFile = findFileById(AllFiles, file.id);
    if (targetFile) {
      // 从父文件夹中移除该文件
      const parentFolder = findParentFolder(AllFiles, file.id);
      if (parentFolder && parentFolder.children) {
        parentFolder.children = parentFolder.children.filter(
          (item) => item.id !== file.id,
        );
      } else {
        // 如果没有父文件夹，说明在根目录，直接从 AllFiles 中移除
        const index = AllFiles.findIndex((item) => item.id === file.id);
        if (index !== -1) {
          AllFiles.splice(index, 1);
        }
      }

      // 统一更新所有数据源
      const filteredShowFiles = filterFiles(AllFiles, false);
      const filteredBinFiles = collectBinFiles(AllFiles);

      // 更新 saveFloders 和 binFloders
      saveFloders.splice(0, saveFloders.length);
      binFloders.splice(0, binFloders.length);
      saveFloders.push(...filteredShowFiles);
      binFloders.push(...filteredBinFiles);

      // 根据当前状态更新显示
      if (folderPath.length > 0) {
        // 在子文件夹中：从路径栈获取当前文件夹ID，重新构建显示
        const currentFolderId = folderPath[folderPath.length - 1];
        const currentFolder = findFileById(AllFiles, currentFolderId!);
        if (currentFolder && currentFolder.children) {
          const filteredCurrentFolder = filterFiles(
            currentFolder.children,
            ifBin.value,
          );
          showFloders.splice(0, showFloders.length);
          showFloders.push(...filteredCurrentFolder);
        }
      } else {
        // 在根目录：根据当前视图模式显示
        showFloders.splice(0, showFloders.length);
        showFloders.push(...(ifBin.value ? binFloders : saveFloders));
      }
    }
  }
};
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

const submitName = () => {
  //实现对文件或文件夹的重命名
  const file = findFileById(showFloders, currentFileId.value!);
  if (!file) {
    console.error("File not found:", currentFileId.value);
    renameDialogVisible.value = false;
    return;
  }
  if (file.children) {
    // 文件夹：不需要后缀名
    const parts = newName.value.split(".");
    file.fileName = parts[0] || "";
  } else {
    // 文件：处理后缀名
    const parts = newName.value.split(".");
    const fileName = parts[0] || "";
    const fileType = parts.length > 1 ? parts[1] : "";

    if (fileType && fileType === houzhui.value) {
      file.fileName = newName.value;
    } else {
      file.fileName = fileName + "." + houzhui.value;
    }
  }
  renameDialogVisible.value = false;
};
//新建文件夹
const createFolder = () => {
  // 确定父级文件夹ID
  let parentId: string | undefined;

  if (folderPath.length === 0) {
    // 在根目录下创建，parentId 为 undefined
    parentId = undefined;
  } else {
    // 在子文件夹中创建，获取当前文件夹ID
    parentId = folderPath[folderPath.length - 1];
  }

  // 查找父级文件夹
  let parentFolder: filesTree | null = null;
  if (parentId) {
    parentFolder = findFileById(AllFiles, parentId);
  }

  // 确定要添加到的目标数组
  const targetArray = parentFolder ? parentFolder.children : AllFiles;
  if (!targetArray) return;

  // 生成唯一的文件夹名称（检查同名文件夹，即有children的项）
  let folderName = "新建文件夹";
  let counter = 1;
  let isNameExist = targetArray.some(
    (item) => item.fileName === folderName && !!item.children,
  );

  while (isNameExist) {
    folderName = `新建文件夹${counter}`;
    counter++;
    isNameExist = targetArray.some(
      (item) => item.fileName === folderName && !!item.children,
    );
  }

  // 创建新文件夹
  const newFolder: filesTree = {
    fileName: folderName,
    ifInBin: false,
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    children: [],
  };

  // 添加到目标数组
  targetArray.push(newFolder);

  // 更新显示列表
  const filteredShowFiles = filterFiles(AllFiles, false);

  if (folderPath.length === 0) {
    // 根目录：直接刷新
    saveFloders.splice(0, saveFloders.length);
    saveFloders.push(...filteredShowFiles);
    showFloders.splice(0, showFloders.length);
    showFloders.push(...saveFloders);
  } else {
    // 子文件夹：更新根目录数据，确保父级文件夹的子文件数量正确
    saveFloders.splice(0, saveFloders.length);
    saveFloders.push(...filteredShowFiles);

    // 更新当前文件夹显示
    if (parentFolder && parentFolder.children) {
      const filteredChildren = filterFiles(parentFolder.children, ifBin.value);
      showFloders.splice(0, showFloders.length);
      showFloders.push(...filteredChildren);
    }
  }
};
const sendNotification = () => {
  console.log(mentionsDate);
  notificationStore.notifications.unshift({
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
  mentionsDate.members.splice(0, mentionsDate.members.length);
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
