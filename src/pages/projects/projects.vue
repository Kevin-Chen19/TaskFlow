<template>
  <div class="bigBox">
    <div class="bigTitle">Project Document Libary</div>
    <div class="Line_two">
      <span class="smallText"> Welcome back,Kevin.Share team files here. </span>
      <div class="Line_two_right">
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
          <div>Upload File</div>
        </div>
      </div>
    </div>
    <div class="inputName" style="margin-top: 2rem">
      <span v-if="folderPath.length > 0" class="backBtn" @click="backToParent">
        ← 返回上级
      </span>
      FLODERS
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
            item.children ? item.children.length + 'files' : item.fileTime
          "
          @click="enterFolder(item)"
        ></CardTamp>
      </div>
      <div class="createFolderBox">
        <img src="@/assets/icons/新建文件夹.png" alt="新建文件夹图标" />
        <div>New Folder</div>
      </div>
    </div>
    <div class="listFloders" v-if="menuKind == 1">
      <el-tree
        ref="treeRef2"
        style="max-width: 100%"
        :data="AllFiles"
        node-key="id"
        :expand-on-click-node="false"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <FileCard
              :fileName="data.fileName"
              :fileTime="
                data.children ? data.children.length + ' files' : data.fileTime
              "
              :fileMaker="data.fileMaker"
              :fileSize="data.fileSize"
              @click="data.children ? (data.children = null) : null"
            >
            </FileCard>
          </div>
        </template>
      </el-tree>
    </div>
    <div class="dropBox">
      <el-upload
        class="upload-demo"
        drag
        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
        multiple
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
      </el-upload>
    </div>
  </div>
</template>
<script setup lang="ts">
import CardTamp from "@/components/cardTamp.vue";
import FileCard from "@/components/fileCard.vue";
import floderIcon from "@/assets/icons/文件夹.png";
import { UploadFilled } from "@element-plus/icons-vue";
import type {
  RenderContentContext,
  RenderContentFunction,
  TreeInstance,
} from "element-plus";
import { ref, reactive, onMounted} from "vue";
type Node = RenderContentContext["node"];
type Data = RenderContentContext["data"];
let id = 1000;
const treeRef2 = ref<TreeInstance>();
const menuKind = ref(0);
const showFloders = reactive<filesTree[]>([]);
const folderPath = reactive<filesTree[][]>([]); // 记录文件夹路径（二维数组）

onMounted(() => {
  showFloders.push(...AllFiles);
});
const recentFiles = [
  {
    fileName: "项目计划.docx",
    fileTime: "2026-01-18 14:19",
    fileMaker: "Kevin",
    fileSize: "2.5MB",
  },
  {
    fileName: "路演.ppt",
    fileTime: "2026-01-19 15:39",
    fileMaker: "Kevin",
    fileSize: "21.5MB",
  },
  {
    fileName: "财务报表.xlsx",
    fileTime: "2026-01-20 16:39",
    fileMaker: "Alice",
    fileSize: "1.5MB",
  },
  {
    fileName: "项目章程.pdf",
    fileTime: "2026-01-21 17:39",
    fileMaker: "Peter",
    fileSize: "2.5MB",
  },
  {
    fileName: "UI设计稿.png",
    fileTime: "2026-01-18 14:19",
    fileMaker: "Bob",
    fileSize: "7.5MB",
  },
];
const AllFiles: filesTree[] = [
  {
    fileName: "Product Mockups",
    children: [
      {
        fileName: "Product Design",
        children: [
          {
            fileName: "项目章程.pdf",
            fileTime: "2026-01-21 17:39",
            fileMaker: "Peter",
            fileSize: "2.5MB",
          },
          {
            fileName: "UI设计稿.png",
            fileTime: "2026-01-18 14:19",
            fileMaker: "Bob",
            fileSize: "7.5MB",
          },
        ],
      },
      {
        fileName: "项目计划.docx",
        fileTime: "2026-01-18 14:19",
        fileMaker: "Kevin",
        fileSize: "2.5MB",
      },
      {
        fileName: "路演.ppt",
        fileTime: "2026-01-19 15:39",
        fileMaker: "Kevin",
        fileSize: "21.5MB",
      },
      {
        fileName: "财务报表.xlsx",
        fileTime: "2026-01-20 16:39",
        fileMaker: "Alice",
        fileSize: "1.5MB",
      },
    ],
  },
  {
    fileName: "Product Design",
    children: [
      {
        fileName: "项目章程.pdf",
        fileTime: "2026-01-21 17:39",
        fileMaker: "Peter",
        fileSize: "2.5MB",
      },
      {
        fileName: "UI设计稿.png",
        fileTime: "2026-01-18 14:19",
        fileMaker: "Bob",
        fileSize: "7.5MB",
      },
    ],
  },
  {
    fileName: "项目客户",
    children: [
      {
        fileName: "项目章程.pdf",
        fileTime: "2026-01-21 17:39",
        fileMaker: "Peter",
        fileSize: "2.5MB",
      },
      {
        fileName: "UI设计稿.png",
        fileTime: "2026-01-18 14:19",
        fileMaker: "Bob",
        fileSize: "7.5MB",
      },
    ],
  },
  {
    fileName: "UI设计稿.png",
    fileTime: "2026-01-18 14:19",
    fileMaker: "Bob",
    fileSize: "7.5MB",
  },
  {
    fileName: "项目章程.pdf",
    fileTime: "2026-01-21 17:39",
    fileMaker: "Peter",
    fileSize: "2.5MB",
  },
  {
    fileName: "项目计划.docx",
    fileTime: "2026-01-18 14:19",
    fileMaker: "Kevin",
    fileSize: "2.5MB",
  }
];
interface filesTree {
  fileName: string;
  fileTime?: string;
  fileMaker?: string;
  fileSize?: string;
  children?: filesTree[];
}
const defaultProps = {
  children: "children",
  label: "label",
};
const handleNodeClick = (data: filesTree) => {
  console.log(data);
};
// 进入文件夹
const enterFolder = (item: filesTree) => {
  if (item.children) {
    folderPath.push([...showFloders]);
    // 清空当前显示
    showFloders.splice(0, showFloders.length);
    // 显示子文件夹内容
    showFloders.push(...item.children);
  }
};

// 返回上级文件夹
const backToParent = () => {
  if (folderPath.length > 0) {
    // 清空当前显示
    showFloders.splice(0, showFloders.length);
    // 返回上一级（取路径栈的最后一项）
    const parentFolder = folderPath[folderPath.length - 1];
    if (parentFolder) {
      showFloders.push(...parentFolder);
    }
    // 推出当前路径
    folderPath.pop();
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
  cursor: pointer;
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
.backBtn{
  margin-right: 1rem;
  cursor: pointer;
}
.backBtn:hover{
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
</style>
