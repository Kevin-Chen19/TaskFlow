<template>
  <div class="fileBigBox">
    <div class="kindPic" :style="{ backgroundColor: topLeftBgColor }">
      <img :src="computedFileIcon" alt="左侧图标" />
    </div>
    <div class="fileMess">
      <div class="fileMessLeft">
        <div class="fileNameSty">{{ computedFileName }}</div>
        <div class="fileSmallSty">{{ computedFileTime }}</div>
      </div>
      <div
        class="rightBox"
      >
        <div class="rightPic">
          <el-dropdown v-if="!props.ifJob" trigger="click" @command="handleCommand">
            <img src="@/assets/icons/菜单.png" alt="菜单图标" @click.stop />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="rename">{{
                  $t("projects.rename")
                }}</el-dropdown-item>
                <el-dropdown-item v-if="!props.ifBin" command="delete">{{
                  $t("fileCard.moveToBin")
                }}</el-dropdown-item>
                <el-dropdown-item v-if="props.ifBin" command="drop">{{
                  $t("fileCard.delete")
                }}</el-dropdown-item>
                <el-dropdown-item command="download">{{
                  $t("fileCard.download")
                }}</el-dropdown-item>
                <el-dropdown-item command="notify">{{
                  $t("fileCard.remindMembers")
                }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="fileMessRight">
          <div class="fileSmallSty">{{ computedFileMaker }}</div>
          <div
            class="fileSmallSty"
          >
            {{ computedFileSize }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import floderIcon from "@/assets/icons/文件夹.png";
import DocIcon from "@/assets/icons/Doc.png";
import PdfIcon from "@/assets/icons/pdf.png";
import PptIcon from "@/assets/icons/ppt.png";
import ImgIcon from "@/assets/icons/img.png";
import XlsxIcon from "@/assets/icons/xlsx.png";
//职位相关图标
import FrontIcon from "@/assets/icons/前端.png";
import BackendIcon from "@/assets/icons/数据库.png";
import TestIcon from "@/assets/icons/Debug.png";
import DesignIcon from "@/assets/icons/调色板.png";
import OtherJobIcon from "@/assets/icons/职位.png";
// 定义组件属性
const props = defineProps({
  //定义组件类型
  ifFolder: {
    type: Boolean,
    default: true,
  },
  ifJob: {
    type: Boolean,
    default: false,
  },
  ifBin: {
    type: Boolean,
    default: false,
  },
  topLeftBgc: {
    type: String,
    default: "",
  },
  // 中间区域
  fileName: {
    type: String,
    default: "",
  },
  fileTime: {
    type: String,
    default: "",
  },
  fileMaker: {
    type: String,
    default: "",
  },
  fileSize: {
    type: String,
    default: "",
  },
});
const topLeftBgColor = computed(() => props.topLeftBgc || "#faf5ff");
const computedFileName = computed(() => props.fileName || "");
const computedFileTime = computed(() => props.fileTime || "");
const computedFileMaker = computed(() => props.fileMaker || "");
const computedFileSize = computed(() => props.fileSize || "");
// 文件类型图标映射
const FILE_TYPE_ICONS: Record<string, string> = {
  ".docx": DocIcon,
  ".ppt": PptIcon,
  ".pdf": PdfIcon,
  ".png": ImgIcon,
  ".jpg": ImgIcon,
  ".jpeg": ImgIcon,
  ".xlsx": XlsxIcon,
};

// 职位类型图标映射
const JOB_TYPE_ICONS: Record<string, string> = {
  "Front-end": FrontIcon,
  "Backend": BackendIcon,
  "Tester": TestIcon,
  "Designer": DesignIcon,
};

const computedFileIcon = computed(() => {
  const fileName = props.fileName;
  if(props.ifFolder){
    return floderIcon;
  }
  // ifFolder 为 false 时显示文件图标
  if (!props.ifFolder && !props.ifJob) {
    const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
    return FILE_TYPE_ICONS[ext] || floderIcon;
  }

  // ifFolder 为 true 时显示职位图标
  if(props.ifJob){
  for (const [keyword, icon] of Object.entries(JOB_TYPE_ICONS)) {
    if (fileName.includes(keyword)) {
      return icon;
    }
  }
}
  return OtherJobIcon;
});
// 定义组件事件
const emit = defineEmits<{
  command: [command: string];
  edit: [];
  delete: [];
}>();
const handleCommand = (command: string) => {
  emit("command", command);
};
</script>
<style scoped lang="scss">
.fileBigBox {
  margin-top: 1rem;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  height: 4rem;
  background-color: #fff;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
}
.fileBigBox:hover {
  background-color: #b2e4e6b0;
  border: 1px solid #1fa2ad;
}
.kindPic {
  width: 3rem;
  height: 3rem;
  background-color: #faf5ff;
  border-radius: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 50%;
  }
}
.leftIcon {
  background-color: transparent;
  img {
    width: 30%;
  }
}
.fileMess {
  box-sizing: border-box;
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}
.fileMessLeft {
  width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.fileNameSty {
  font-size: 1.2rem;
  font-weight: 500;
}
.fileSmallSty {
  font-size: 0.8rem;
  color: gray;
}
.fileMessRight {
  display: flex;
  div {
    margin-left: 3rem;
  }
}
.positionStyle {
  font-size: 1rem;
  color: black;
  font-weight: 500;
}
.rightBox {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: end;
  .rightPic {
    width: 1.5rem;
    height: 1.5rem;
    img {
      width: 100%;
    }
  }
}
.actionButtons {
  display: flex;
  gap: 0.5rem;
}
.actionIcon {
  cursor: pointer;
  font-size: 1.2rem;
  color: #666;
  transition: color 0.2s;
}
.actionIcon:hover {
  color: #2eb867;
}
.deleteIcon:hover {
  color: #f56c6c;
}
</style>
