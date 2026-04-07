<template>
  <div>
    <h2>商家订单管理</h2>

    <!-- 极简筛选 -->
    <el-select v-model="statusFilter" placeholder="筛选状态" style="width:160px;margin-bottom:10px;">
      <el-option label="全部" value="" />
      <el-option label="待发货" value="待发货" />
      <el-option label="已发货" value="已发货" />
      <el-option label="已完成" value="已完成" />
      <el-option label="申请退款" value="申请退款" />
      <el-option label="已退款" value="已退款" />
      <el-option label="退款驳回" value="退款驳回" />
    </el-select>

    <!-- 订单列表 -->
    <el-table :data="filterList" border>
      <el-table-column label="订单号" prop="orderId" />
      <el-table-column label="商品" prop="goodsName" />
      <el-table-column label="金额" prop="money" />
      <el-table-column label="订单状态">
        <template #default="scope">
          <el-tag 
            :type="scope.row.status ==='申请退款'?'warning':scope.row.status ==='已退款'?'success':scope.row.status ==='退款驳回'?'danger':''"
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 新增：驳回理由列 -->
      <el-table-column label="驳回理由">
        <template #default="scope">
          <el-tag v-if="scope.row.refundRejectReason" type="info" size="small">
            {{ scope.row.refundRejectReason }}
          </el-tag>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <!-- 只有申请退款的订单能审核 -->
          <el-button
            type="success"
            text
            v-if="scope.row.status === '申请退款'"
            @click="agree(scope.row)"
          >同意退款</el-button>
          <el-button
            type="danger"
            text
            v-if="scope.row.status === '申请退款'"
            @click="reject(scope.row)"
          >驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选条件
const statusFilter = ref('')

// 订单列表：新增refundRejectReason字段，和allOrder.vue数据结构对齐
const orderList = ref([
  { orderId: '20260407001', goodsName: '手机', money: '3999', status: '待发货', refundRejectReason: '' },
  { orderId: '20260407002', goodsName: '电脑', money: '5999', status: '已发货', refundRejectReason: '' },
  { orderId: '20260407003', goodsName: '耳机', money: '299', status: '申请退款', refundRejectReason: '' },
  { orderId: '20260407004', goodsName: '平板', money: '2499', status: '已完成', refundRejectReason: '' },
  { orderId: '20260407005', goodsName: '手表', money: '1299', status: '申请退款', refundRejectReason: '' },
  // 示例：已驳回的订单（带理由）
  { orderId: '20260407006', goodsName: '音箱', money: '899', status: '退款驳回', refundRejectReason: '商品影响二次销售，拒绝退款' },
])

// 筛选
const filterList = computed(() => {
  if (!statusFilter.value) return orderList.value
  return orderList.value.filter(item => item.status === statusFilter.value)
})

// 同意退款
const agree = (row) => {
  row.status = '已退款'
  row.refundRejectReason = '' // 同意退款时清空驳回理由
  ElMessage.success('已同意退款')
}

// 驳回退款：强制填写理由并存储
const reject = async (row) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      '请输入驳回退款理由', 
      '驳回审核', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        // 验证理由不能为空
        validator: (value) => {
          if (!value) return '驳回理由不能为空！'
          return true
        }
      }
    )
    row.status = '退款驳回'
    row.refundRejectReason = reason // 存储驳回理由
    ElMessage.success('已驳回退款申请')
    ElMessage.info(`驳回理由：${reason}`)
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('驳回操作失败')
  }
}
</script>