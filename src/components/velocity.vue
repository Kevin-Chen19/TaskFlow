<template>
  <div ref="chartRef" style="width: 100%; height: 100%"></div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as echarts from 'echarts/core';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([GridComponent, TooltipComponent, LineChart, CanvasRenderer, UniversalTransition]);

interface Props {
  data?: number[];
  labels?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [0, 0, 0, 0],
  labels: () => ['Week1', 'Week2', 'Week3', 'Week4']
});

const chartRef = ref<HTMLDivElement>();
let myChart: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartRef.value) return;
  
  if (myChart) {
    myChart.dispose();
  }
  
  myChart = echarts.init(chartRef.value);
  updateChart();

  window.addEventListener('resize', handleResize);
};

const updateChart = () => {
  if (!myChart) return;
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{c} Tasks'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.labels
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        data: props.data,
        type: 'line',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(146, 86, 245, 0.3)' },
              { offset: 1, color: 'rgba(146, 86, 245, 0.05)' }
            ]
          }
        },
        lineStyle: {
          color: '#9256f5',
          width: 2
        },
        itemStyle: {
          color: '#9256f5'
        },
        symbol: 'circle',
        symbolSize: 8,
        emphasis: {
          focus: 'series'
        }
      }
    ]
  };
  
  myChart.setOption(option);
};

const handleResize = () => {
  myChart?.resize();
};

onMounted(() => {
  console.log('Velocity 组件挂载，初始数据:', props.data, props.labels);
  initChart();
});

// 监听数据变化，更新图表
watch(() => props.data, (newData) => {
  console.log('Velocity 组件收到新数据:', newData);
  updateChart();
}, { deep: true, immediate: true });

watch(() => props.labels, (newLabels) => {
  console.log('Velocity 组件收到新标签:', newLabels);
  updateChart();
}, { deep: true, immediate: true });

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
});
</script>
<style scoped lang="scss">
</style>
