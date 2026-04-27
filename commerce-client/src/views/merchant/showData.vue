<template>
  <div class="dashboard-page">
    <h3>商家数据概览</h3>

    <!-- 数据卡片 -->
    <el-row :gutter="20" class="data-row">
      <el-col :span="6"><div class="data-card">本店商品：{{ goodsCount }}</div></el-col>
      <el-col :span="6"><div class="data-card">本店订单：{{ orderCount }}</div></el-col>
      <el-col :span="6"><div class="data-card">待发货：{{ waitSend }}</div></el-col>
      <el-col :span="6"><div class="data-card">今日销售额：¥{{ sumOrderAmount }}</div></el-col>
    </el-row>

    <!-- 折线图 + 柱状图 -->
    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12">
        <div class="chart-box">
          <h4>近7日订单量</h4>
          <LineChart title="近7日订单量" :xData="xData" :seriesData="orderData" />
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-box">
          <h4>近7日销售额</h4>
          <BarChart title="近7日销售额" :xData="xData" :seriesData="saleData" />
        </div>
      </el-col>
    </el-row>

    <!-- 饼图：本店分类成交额占比 -->
    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12">
        <div class="chart-box">
          <h4>本店分类成交额占比</h4>
          <PieChart title="分类成交额占比" :pieData="pieData" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LineChart from '@/components/Charts/LineChart.vue'
import BarChart from '@/components/Charts/BarChart.vue'
import PieChart from '@/components/Charts/PieChart.vue'

// 商家数据
const goodsCount = ref(68)
const orderCount = ref(243)
const waitSend = ref(9)
const sumOrderAmount = ref(6860)

// 近7日坐标
const xData = ['1日','2日','3日','4日','5日','6日','7日']

// 订单量折线图
const orderData = [5,12,8,14,18,20,17]

// 销售额柱状图
const saleData = [500,1200,800,1400,1800,2000,1700]

// 饼图：本店分类成交额
const pieData = ref([
  { value: 28600, name: '电子产品' },
  { value: 15400, name: '服装鞋包' },
  { value: 8200, name: '家居用品' },
])
</script>

<style scoped>
.data-card {
  background: white; padding: 30px 20px; border-radius: 8px;
  text-align: center; box-shadow: 0 2px 5px #00000010;
}
.chart-box {
  background: white; border-radius: 8px; padding:15px;
  box-shadow: 0 2px 5px #00000010;
}
</style>