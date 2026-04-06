<template>
  <div>
    <h2>订单管理</h2>
    <el-table :data="orderList" border>
      <el-table-column prop="order_id" label="订单号" />
      <el-table-column prop="total_amount" label="金额" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="text">查看</el-button>
          <el-button type="text" v-if="scope.row.status === '待发货'">发货</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 模拟订单列表
const orderList = ref([
  { order_id: '2024001', total_amount: 10898, status: '已完成' },
  { order_id: '2024006', total_amount: 399, status: '待发货' },
])
</script>