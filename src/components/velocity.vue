<template>
  <div ref="chartRef" style="width: 100%; height: 100%"></div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts/core';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([GridComponent, TooltipComponent, LineChart, CanvasRenderer, UniversalTransition]);

const chartRef = ref<HTMLDivElement>();
let myChart: echarts.ECharts | null = null;

onMounted(() => {
  if (chartRef.value) {
    myChart = echarts.init(chartRef.value);
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{c} Tasks'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Week1', 'Week2', 'Week3', 'Week4']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [10, 12, 23, 19],
          type: 'line',
          areaStyle: {},
          symbol: 'circle',
          symbolSize: 8,
          emphasis: {
            focus: 'series'
          }
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