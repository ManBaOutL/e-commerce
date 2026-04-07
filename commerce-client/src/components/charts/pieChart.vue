<template>
  <div>
    <div ref="chartRef" style="width:100%;height:280px;cursor:pointer" @click="openBig"></div>

    <ElDialog v-model="bigVisible" width="700px" top="50px" append-to-body>
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
  pieData: Array,
  title: String,
})

const chartRef = ref(null)
const bigChartRef = ref(null)
const bigVisible = ref(false)

let myChart = null
let bigChart = null

onMounted(() => {
  myChart = echarts.init(chartRef.value)
  setChart(myChart, props.pieData)
})

function setChart(chart, data) {
  // 计算总和用于计算占比
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  chart.setOption({
    title: { text: props.title },
    tooltip: { 
      trigger: 'item',
      // tooltip中显示名称、数值、占比
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      name: '成交额',
      type: 'pie',
      radius: '65%',
      data: data,
      label: {  // 在饼图上显示名称、数值、占比
        show: true,
        formatter: (params) => {
          // 自定义显示格式：名称 + 数值 + 占比(保留1位小数)
          return `${params.name}: ${params.value} (${params.percent.toFixed(1)}%)`
        }
      },
      labelLine: {  // 显示标签连接线
        show: true
      }
    }]
  })
}

watch(() => props.pieData, () => {
  setChart(myChart, props.pieData)
}, { deep: true })

function openBig() {
  bigVisible.value = true
  setTimeout(() => {
    bigChart = echarts.init(bigChartRef.value)
    setChart(bigChart, props.pieData)
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