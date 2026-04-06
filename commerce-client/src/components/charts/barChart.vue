<template>
  <div>
    <div ref="chartRef" style="width:100%;height:280px;cursor:pointer" @click="openBig"></div>

    <ElDialog v-model="bigVisible" width="800px" top="50px" append-to-body>
      <div ref="bigChartRef" style="width:100%;height:500px"></div>
      <template #footer>
        <ElButton @click="exportImg" type="primary">导出图片</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { ElDialog, ElButton } from 'element-plus'

const props = defineProps({
  xData: Array,
  seriesData: Array,
  title: String,
})

const chartRef = ref(null)
const bigChartRef = ref(null)
const bigVisible = ref(false)

let myChart = null
let bigChart = null

onMounted(() => {
  myChart = echarts.init(chartRef.value)
  setChart(myChart, props.xData, props.seriesData)
})

function setChart(chart, xd, yd) {
  chart.setOption({
    title: { text: props.title },
    xAxis: { type: 'category', data: xd },
    yAxis: { type: 'value' },
    series: [{ data: yd, type: 'bar' }]
  })
}

watch(() => [props.xData, props.seriesData], () => {
  setChart(myChart, props.xData, props.seriesData)
}, { deep: true })

function openBig() {
  bigVisible.value = true
  setTimeout(() => {
    bigChart = echarts.init(bigChartRef.value)
    setChart(bigChart, props.xData, props.seriesData)
  }, 200)
}

function exportImg() {
  const link = bigChart.getDataURL()
  const a = document.createElement('a')
  a.href = link
  a.download = (props.title || 'chart') + '.png'
  a.click()
}
</script>