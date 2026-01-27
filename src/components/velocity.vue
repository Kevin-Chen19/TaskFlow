<template>
  <div ref="chartRef" style="width: 100%; height: 100%"></div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts/core';
import { GridComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([GridComponent, LineChart, CanvasRenderer, UniversalTransition]);

const chartRef = ref<HTMLDivElement>();
let myChart: echarts.ECharts | null = null;

onMounted(() => {
  if (chartRef.value) {
    myChart = echarts.init(chartRef.value);
    const option = {
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line',
          areaStyle: {}
        }
      ]
    };
    myChart.setOption(option);

    window.addEventListener('resize', () => {
      myChart?.resize();
    });
  }
});

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose();
    window.removeEventListener('resize', () => {
      myChart?.resize();
    });
  }
});
</script>
<style scoped lang="scss">
</style>