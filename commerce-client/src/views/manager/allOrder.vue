<template>
  <div>
    <h3>管理员 - 全平台订单管理</h3>

    <!-- 筛选栏 -->
    <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center; flex-wrap: wrap;">
      <el-input v-model="filterForm.orderId" placeholder="订单号" style="width:160px" clearable />
      <el-input v-model="filterForm.userId" placeholder="用户ID" style="width:120px" clearable />

      <!-- 年 -->
      <el-select v-model="filterForm.year" placeholder="年" style="width:100px">
        <el-option 
          v-for="y in yearList" 
          :key="y" 
          :label="`${y}年`" 
          :value="y" 
        />
      </el-select>

      <!-- 月 -->
      <el-select v-model="filterForm.month" placeholder="月" style="width:100px">
        <el-option 
          v-for="m in monthList" 
          :key="m" 
          :label="`${m}月`" 
          :value="m" 
        />
      </el-select>

      <!-- 日 -->
      <el-select v-model="filterForm.day" placeholder="日" style="width:100px">
        <el-option 
          v-for="d in dayList" 
          :key="d" 
          :label="`${d}日`" 
          :value="d" 
        />
      </el-select>

      <el-select v-model="filterForm.status" placeholder="订单状态" style="width:160px">
        <el-option label="全部" value="" />
        <el-option label="待发货" value="待发货" />
        <el-option label="已发货" value="已发货" />
        <el-option label="已完成" value="已完成" />
        <el-option label="申请退款" value="申请退款" />
        <el-option label="待审核" value="待审核" />
        <el-option label="已退款" value="已退款" />
        <el-option label="退款驳回" value="退款驳回" />
      </el-select>

      <el-button type="primary" @click="handleFilter">筛选</el-button>
      <el-button @click="resetFilter">清空</el-button>

      <el-button type="success" @click="batchAgree">一键同意待审核</el-button>
      <el-button type="danger" @click="batchReject">一键驳回待审核</el-button>
    </div>

    <el-table :data="filterList" border>
      <el-table-column label="订单号" prop="orderId" />
      <el-table-column label="用户ID" prop="userId" />
      <el-table-column label="商品" prop="goodsName" />
      <el-table-column label="金额" prop="money" />
      <el-table-column label="创建时间" prop="createTime" />
      <el-table-column label="状态">
        <template #default="scope">
          <el-tag 
            :type="scope.row.status === '申请退款'?'warning':
                   scope.row.status === '待审核'?'warning':
                   scope.row.status === '已退款'?'success':
                   scope.row.status === '退款驳回'?'danger':'info'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button text @click="openDetail(scope.row)">查看详情</el-button>
          <el-button text type="success" v-if="scope.row.status === '待审核'" @click="agreeRefund(scope.row)">同意退款</el-button>
          <el-button text type="danger" v-if="scope.row.status === '待审核'" @click="rejectRefund(scope.row)">拒绝退款</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="detailVisible" title="订单详情" width="500px">
      <div v-if="currentOrder">
        <p>订单号：{{ currentOrder.orderId }}</p>
        <p>用户ID：{{ currentOrder.userId }}</p>
        <p>商品：{{ currentOrder.goodsName }}</p>
        <p>金额：{{ currentOrder.money }}</p>
        <p>创建时间：{{ currentOrder.createTime }}</p>
        <p>状态：{{ currentOrder.status }}</p>

        <div v-if="currentOrder.status === '申请退款'" style="margin-top:10px;">
          <p>退款理由：{{ currentOrder.userRefundReason }}</p>
          <p style="color:#1989fa">请等待买卖双方协商</p>
        </div>
        <div v-if="currentOrder.status === '待审核'" style="margin-top:10px;">
          <p>用户退款理由：{{ currentOrder.userRefundReason }}</p>
          <p>商家驳回理由：{{ currentOrder.merchantReason }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选条件
const filterForm = ref({
  orderId: '',
  userId: '',
  year: '',
  month: '',
  day: '',
  status: ''
})

// 年月日数组（自动生成）
const yearList = ref(['2026'])
const monthList = ref(Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')))
const dayList = ref(Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')))

// 弹窗
const detailVisible = ref(false)
const currentOrder = ref(null)

// 订单数据
const orderList = ref([
  { orderId: '2026001', userId: '1001', goodsName: '苹果手机', money: '5999', status: '待发货', createTime: '2026-04-01', userRefundReason:'', merchantReason:'' },
  { orderId: '2026002', userId: '1002', goodsName: '华为平板', money: '3499', status: '已发货', createTime: '2026-04-02', userRefundReason:'', merchantReason:'' },
  { orderId: '2026003', userId: '1003', goodsName: '无线耳机', money: '899', status: '已完成', createTime: '2026-04-03', userRefundReason:'', merchantReason:'' },
  { orderId: '2026004', userId: '1004', goodsName: '机械键盘', money: '499', status: '申请退款', createTime: '2026-04-04', userRefundReason:'买错型号', merchantReason:'' },
  { orderId: '2026005', userId: '1005', goodsName: '电竞鼠标', money: '299', status: '待审核', createTime: '2026-04-05', userRefundReason:'产品失灵', merchantReason:'已拆封' },
  { orderId: '2026006', userId: '1006', goodsName: '智能手表', money: '1599', status: '已退款', createTime: '2026-04-06', userRefundReason:'', merchantReason:'' },
  { orderId: '2026007', userId: '1007', goodsName: '充电宝', money: '129', status: '退款驳回', createTime: '2026-04-07', userRefundReason:'', merchantReason:'' },
])

// 筛选逻辑
const filterList = computed(() => {
  return orderList.value.filter(item => {
    const matchOrderId = item.orderId.includes(filterForm.value.orderId)
    const matchUserId = item.userId.includes(filterForm.value.userId)
    const matchStatus = !filterForm.value.status || item.status === filterForm.value.status

    // 日期匹配
    const [y, m, d] = item.createTime.split('-')
    const matchYear = !filterForm.value.year || y === filterForm.value.year
    const matchMonth = !filterForm.value.month || m === filterForm.value.month
    const matchDay = !filterForm.value.day || d === filterForm.value.day

    return matchOrderId && matchUserId && matchStatus && matchYear && matchMonth && matchDay
  })
})

const handleFilter = () => ElMessage.success('筛选成功')
const resetFilter = () => {
  filterForm.value = { orderId: '', userId: '', year: '', month: '', day: '', status: '' }
  ElMessage.success('已清空')
}

const openDetail = (row) => {
  currentOrder.value = row
  detailVisible.value = true
}

const agreeRefund = async (row) => {
  await ElMessageBox.confirm('确定同意？')
  row.status = '已退款'
  ElMessage.success('成功')
}

const rejectRefund = async (row) => {
  await ElMessageBox.confirm('确定驳回？')
  row.status = '退款驳回'
  ElMessage.success('成功')
}

const batchAgree = async () => {
  await ElMessageBox.confirm('确定一键同意所有待审核订单？')
  orderList.value.forEach(i => i.status === '待审核' && (i.status = '已退款'))
  ElMessage.success('批量完成')
}

const batchReject = async () => {
  await ElMessageBox.confirm('确定一键驳回所有待审核订单？')
  orderList.value.forEach(i => i.status === '待审核' && (i.status = '退款驳回'))
  ElMessage.success('批量完成')
}
</script>