<template>
  <div>
    <h3>全平台订单管理</h3>
    <el-table :data="orderList" border>
      <el-table-column prop="order_id" label="订单号" />
      <el-table-column prop="user_id" label="用户ID" />
      <el-table-column prop="total_amount" label="金额" />
      <el-table-column prop="status" label="订单状态" />
      <el-table-column prop="refundStatus" label="退款状态">
        <template #default="scope">
          <el-tag :type="scope.row.refundStatus === '已同意' ? 'success' : scope.row.refundStatus === '待审核' ? 'warning' : scope.row.refundStatus === '已拒绝' ? 'danger' : 'info'">
            {{ scope.row.refundStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button text @click="viewOrder(scope.row)">查看详情</el-button>
          <template v-if="scope.row.refundStatus === '待审核'">
            <el-button text type="success" @click="auditRefund(scope.row, '已同意')">同意退款</el-button>
            <el-button text type="danger" @click="auditRefund(scope.row, '已拒绝')">拒绝退款</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const orderList = ref([
  { order_id: '2024001', user_id: 2, total_amount: 10898, status: '已完成', refundStatus: '无退款' },
  { order_id: '2024002', user_id: 3, total_amount: 399, status: '待发货', refundStatus: '待审核' },
])

const viewOrder = (row) => {
  ElMessage.info(`订单：${row.order_id}，金额：${row.total_amount}`)
}
const auditRefund = async (row, status) => {
  const reason = status === '已拒绝' ? await ElMessageBox.prompt('拒绝理由') : null
  row.refundStatus = status
  ElMessage.success(`已${status}退款`)
  if (reason) ElMessage.info('理由：' + reason.value)
}
</script>