<template>
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
        <img :src="computedTopRightImg" alt="右侧图标" />
      </div>
    </div>
  </slot>

  <!-- 中间内容区域 -->
  <slot name="body">
    <div class="cardBody">
      {{ bodyContents }}
    </div>
  </slot>

  <!-- 底部区域 -->
  <slot name="footer">
    <div class="cardFooter">
      {{ footerContents }}
    </div>
  </slot>
</template>
<script setup lang="ts">
import { computed } from "vue";
import defaultTimeIcon from "@/assets/icons/时间.png";
import defaultMenuIcon from "@/assets/icons/菜单.png";

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

  // 底部区域
  footerContent: {
    type: String,
    default: "",
  }
});

// 计算属性
const computedTopLeftImg = computed(() => props.topLeftImg || defaultTimeIcon);
const computedTopRightImg = computed(
  () => props.topRightImg || defaultMenuIcon
);
const topLeftBgColor = computed(() => props.topLeftBgc || "#faf5ff");
const bodyContents = computed(()=> props.bodyContent || "Total Hours")
const footerContents = computed(()=> props.footerContent || "120.5h")
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
</style>
