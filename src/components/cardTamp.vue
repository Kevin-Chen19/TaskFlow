<template>
  <div class="card-container" @click="handleClick">
    <!-- 顶部区域 -->
    <slot name="header">
      <div class="card-top">
        <div class="card-top_left" :style="{ backgroundColor: topLeftBgColor }">
          <img
            :src="computedTopLeftImg"
            alt="左侧图标"
          />
        </div>
        <div class="card-top_right">
          <el-dropdown trigger="click" @command="handleCommand">
             <img src="@/assets/icons/菜单.png" alt="菜单图标" @click.stop>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="rename">{{ t('projects.rename') }}</el-dropdown-item>
                <el-dropdown-item v-if="!props.ifBin" command="delete">{{ t('fileCard.moveToBin') }}</el-dropdown-item>
                <el-dropdown-item v-if="props.ifBin" command="deletePermanently">{{ t('fileCard.delete') }}</el-dropdown-item>
                <el-dropdown-item command="download">{{ t('fileCard.download') }}</el-dropdown-item>
                <el-dropdown-item command="notify">{{ t('fileCard.remindMembers') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </slot>

    <!-- 中间内容区域 -->
    <slot name="body">
      <div class="floderStyle">
        {{ bodyContents }}
      </div>
    </slot>

    <!-- 底部区域 -->
    <slot name="footer">
      <div class="floderFooter">
        {{ footerContents }}
      </div>
    </slot>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import defaultMenuIcon from "@/assets/icons/菜单.png";
import floderIcon from "@/assets/icons/文件夹.png";
import DocIcon from '@/assets/icons/Doc.png';
import PdfIcon from '@/assets/icons/pdf.png';
import PptIcon from '@/assets/icons/ppt.png';
import ImgIcon from '@/assets/icons/img.png';
import XlsxIcon from '@/assets/icons/xlsx.png';

const { t } = useI18n();

// 定义组件属性
const props = defineProps({
  // 顶部区域
  topLeftImg: {
    type: String,
    default: "",
  },
  ifBin: {
    type: Boolean,
    default: false,
  },
  topLeftBgc: {
    type: String,
    default: "",
  },
  topRightImg: {
    type: String,
    default: "",
  },

  // 中间区域
  bodyContent: {
    type: String,
    default: "",
  },
  ifFolder:{
    type: Boolean,
    default: false,
  },

  // 底部区域
  footerContent: {
    type: String,
    default: "",
  }
});

// 定义组件事件
const emit = defineEmits<{
  click: [];
  command: [command: string];
}>();

// 处理点击事件
const handleClick = () => {
  emit('click');
};

// 计算属性
//const computedTopLeftImg = computed(() => props.topLeftImg || defaultTimeIcon);
const computedTopRightImg = computed(
  () => props.topRightImg || defaultMenuIcon
);
const topLeftBgColor = computed(() => props.topLeftBgc || "#faf5ff");
const bodyContents = computed(()=> props.bodyContent || "Total Hours")
const footerContents = computed(()=> props.footerContent || "120.5h")
const computedTopLeftImg = computed(() => {
  // 如果传入了自定义图标，直接使用
  if (props.topLeftImg) {
    return props.topLeftImg;
  }
  // 否则根据文件名判断图标
  const content = props.bodyContent;
  // 如果是文件夹（ifFolder 为 true）或者没有扩展名，使用文件夹图标
  if (props.ifFolder || !content) {
    return floderIcon;
  }
  // 文件类型图标映射
  if (content.endsWith(".docx")) {
    return DocIcon;
  } else if (content.endsWith(".ppt")) {
    return PptIcon;
  } else if (content.endsWith(".pdf")) {
    return PdfIcon;
  } else if (content.endsWith(".png") || content.endsWith(".jpg") || content.endsWith(".jpeg")) {
    return ImgIcon;
  } else if (content.endsWith(".xlsx")) {
    return XlsxIcon;
  } else {
    // 默认返回文件夹图标（用于未知文件类型）
    return floderIcon;
  }
});
const handleCommand = (command: string) => {
  emit('command', command);
}

</script>

<style scoped lang="scss">
.card-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.card-top_left {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem;
  img {
    width: 70%;
  }
}
.card-top_right {
  width: 1.5rem;
  height: 1.5rem;
  img {
    width: 100%;
  }
  cursor: pointer;
}
.cardBody{
  margin-top: 1rem;
  font-weight: 500;
  color: gray;
}
.cardFooter{
  margin-top: 0.5rem;
  font-weight: 600;
  font-size: 1.5rem;
}
.floderStyle{
  margin-top: 0.5rem;
  font-weight: 600;
  font-size: 1.2rem;
  //超出隐藏显示小数点
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.floderFooter{
  margin-top: 1rem;
  font-weight: 500;
  color: gray;
}
</style>
