<template>
  <div class="card-container" @click="handleClick">
    <!-- 顶部区域 -->
    <slot name="header">
      <div class="cardTop">
        <div class="cardTop_left" :style="{ backgroundColor: topLeftBgColor }">
          <img
            :src="computedTopLeftImg"
            alt="左侧图标"
          />
        </div>
        <div class="cardTop_right">
          <img src="@/assets/icons/菜单.png" alt="菜单图标">
        </div>
      </div>
    </slot>

    <!-- 中间内容区域 -->
    <slot name="body">
      <div :class="props.ifFolder ? 'floderStyle' : 'cardBody'">
        {{ bodyContents }}
      </div>
    </slot>

    <!-- 底部区域 -->
    <slot name="footer">
      <div :class="props.ifFolder ? 'floderFooter' : 'cardFooter'">
        {{ footerContents }}
      </div>
    </slot>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import defaultTimeIcon from "@/assets/icons/时间.png";
import defaultMenuIcon from "@/assets/icons/菜单.png";
import floderIcon from "@/assets/icons/文件夹.png";
import DocIcon from '@/assets/icons/Doc.png';
import PdfIcon from '@/assets/icons/pdf.png';
import PptIcon from '@/assets/icons/ppt.png';
import ImgIcon from '@/assets/icons/img.png';
import XlsxIcon from '@/assets/icons/xlsx.png';

// 定义组件属性
const props = defineProps({
  // 顶部区域
  topLeftImg: {
    type: String,
    default: "",
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
  if(props.topLeftImg ){
    return props.topLeftImg;
  }
  if (props.bodyContent.endsWith(".docx")) {
    return DocIcon;
  } else if (props.bodyContent.endsWith(".ppt")) {
    return PptIcon;
  } else if (props.bodyContent.endsWith(".pdf")) {
    return PdfIcon;
  } else if (props.bodyContent.endsWith(".png") || props.bodyContent.endsWith(".jpg") || props.bodyContent.endsWith(".jpeg")) {
    return ImgIcon;
  } else if (props.bodyContent.endsWith(".xlsx")) {
    return XlsxIcon;
  }else{
    return floderIcon;
  }
});
</script>

<style scoped lang="scss">
.cardTop {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.cardTop_left {
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
.cardTop_right {
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
