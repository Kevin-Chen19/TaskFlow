<template>
  <div class="fileBigBox">
    <div class="kindPic" :style="{ backgroundColor: topLeftBgColor }">
      <img :src="computedFileIcon"
          alt="左侧图标"/>
    </div>
    <div class="fileMess">
      <div>
        <div class="fileNameSty">{{ computedFileName }}</div>
        <div class="fileSmallSty">{{ computedFileTime }}</div>
      </div>
      <div class="fileMessRight">
        <div class="fileSmallSty">{{ computedFileMaker }}</div>
        <div class="fileSmallSty">{{ computedFileSize }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import floderIcon from "@/assets/icons/文件夹.png";
import DocIcon from '@/assets/icons/Doc.png';
import PdfIcon from '@/assets/icons/pdf.png';
import PptIcon from '@/assets/icons/ppt.png';
import ImgIcon from '@/assets/icons/img.png';
import XlsxIcon from '@/assets/icons/xlsx.png';
// 定义组件属性
const props = defineProps({
  topLeftImg: {
    type: String,
    default: "",
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
  fileMaker:{
    type: String,
    default: "",
  },
  fileSize:{
    type: String,
    default: "",
  }
});
const topLeftBgColor = computed(() => props.topLeftBgc || "#faf5ff");
const computedTopLeftImg = computed(() => props.topLeftImg || DocIcon);
const computedFileName = computed(() => props.fileName || "");
const computedFileTime = computed(() => props.fileTime || "");
const computedFileMaker = computed(() => props.fileMaker || "");
const computedFileSize = computed(() => props.fileSize || "");
const computedFileIcon = computed(() => {
  if (props.fileName.endsWith(".docx")) {
    return DocIcon;
  } else if (props.fileName.endsWith(".ppt")) {
    return PptIcon;
  } else if (props.fileName.endsWith(".pdf")) {
    return PdfIcon;
  } else if (props.fileName.endsWith(".png") || props.fileName.endsWith(".jpg") || props.fileName.endsWith(".jpeg")) {
    return ImgIcon;
  } else if (props.fileName.endsWith(".xlsx")) {
    return XlsxIcon;
  }else{
    return floderIcon;
  }
});
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
}
.fileBigBox:hover{
  background-color: #b2e4e6b0;
  border: 1px solid #1fa2ad;
}
.kindPic {
  width: 3rem;
  height: 100%;
  background-color: #faf5ff;
  border-radius: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 50%;
  }
}
.leftIcon{
  background-color: transparent;
  img{
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
</style>
