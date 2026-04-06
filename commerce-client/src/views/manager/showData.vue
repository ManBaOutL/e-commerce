<template>
  <div class="dashboard-page">
    <h3>管理员数据概览</h3>

    <el-row :gutter="20" class="data-row">
      <el-col :span="6"><div class="data-card">总用户：{{ userCount }}</div></el-col>
      <el-col :span="6"><div class="data-card">总商品：{{ goodsCount }}</div></el-col>
      <el-col :span="6"><div class="data-card">总订单：{{ orderCount }}</div></el-col>
      <el-col :span="6"><div class="data-card">今日销售额：¥12860</div></el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12">
        <div class="chart-box"><h4>近7日订单量</h4><LineChart :xData="xData" :seriesData="orderData" /></div>
      </el-col>
      <el-col :span="12">
        <div class="chart-box"><h4>近7日销售额</h4><BarChart :xData="xData" :seriesData="saleData" /></div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12">
        <div class="chart-box">
          <h4>各分类商品成交额占比</h4>
          <PieChart title="各分类商品成交额占比" :pieData="pieData" />
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

const userCount = ref(328)
const goodsCount = ref(126)
const orderCount = ref(842)

const xData = ['1日','2日','3日','4日','5日','6日','7日']
const orderData = [15,28,22,35,39,45,42]
const saleData = [1500,2800,2200,3500,3900,4500,4200]

const pieData = ref([
  { value: 186600, name: '电子产品' },
  { value: 86400, name: '服装鞋包' },
  { value: 42200, name: '家居用品' },
  { value: 28900, name: '食品饮料' },
  { value: 15600, name: '美妆护肤' },
])
</script>

<style scoped>
.data-card { background: white; padding: 30px 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px #00000010; }
.chart-box { background: white; border-radius: 8px; padding:15px; box-shadow: 0 2px 5px #00000010; }
</style>