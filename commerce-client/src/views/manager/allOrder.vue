<template>
  <div>
    <h3>管理员 - 全平台订单管理</h3>

    <!-- 筛选栏 -->
    <div style="display: flex; gap: 10px; margin-bottom: 15px; align-items: center; flex-wrap: wrap;">
      <el-input v-model="filterForm.orderId" placeholder="订单号" style="width:160px" clearable />
      <el-input v-model="filterForm.userId" placeholder="用户ID" style="width:120px" clearable />

      <el-select v-model="filterForm.year" placeholder="年" style="width:100px">
        <el-option v-for="y in yearList" :key="y" :label="`${y}年`" :value="y" />
      </el-select>

      <el-select v-model="filterForm.month" placeholder="月" style="width:100px">
        <el-option v-for="m in monthList" :key="m" :label="`${m}月`" :value="m" />
      </el-select>

      <el-select v-model="filterForm.day" placeholder="日" style="width:100px">
        <el-option v-for="d in dayList" :key="d" :label="`${d}日`" :value="d" />
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

    <!-- 订单表格 -->
    <el-table :data="filterList" border>
      <el-table-column label="订单号" prop="orderId" />
      <el-table-column label="用户ID" prop="userId" />
      <el-table-column label="商品" prop="showGoodsName" />
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

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="780px" destroy-on-close>
      <div v-if="currentOrder" class="detail-content">
        
        <el-descriptions border :column="2" size="small" style="margin-bottom:15px;">
          <el-descriptions-item label="订单号">{{ currentOrder.orderId }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ currentOrder.userId }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="
              currentOrder.status === '已退款' ? 'success' :
              currentOrder.status === '退款驳回' ? 'danger' :
              currentOrder.status === '待审核' ? 'warning' : 'info'
            ">
              {{ currentOrder.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
          <el-descriptions-item label="订单总价" :span="2">
            <span style="color:#f56c6c; font-weight:bold">¥{{ currentOrder.money }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div>
          <h4>商品明细</h4>
          <el-table :data="currentOrder.goodList" border size="small">
            <el-table-column label="商品名称" prop="name" />
            <el-table-column label="商家" prop="merchant" />
            <el-table-column label="规格" prop="size" />
            <el-table-column label="数量" prop="num" />
            <el-table-column label="商品总价" prop="price">
              <template #default="scope">
                <span style="color:#f56c6c">¥{{ scope.row.price }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div style="margin-top:15px;" v-if="currentOrder.userRefundReason || currentOrder.merchantReason">
          <h4>退款信息</h4>
          <el-descriptions border :column="1" size="small">
            <el-descriptions-item label="用户退款理由" v-if="currentOrder.userRefundReason">
              {{ currentOrder.userRefundReason }}
            </el-descriptions-item>
            <el-descriptions-item label="商家处理理由" v-if="currentOrder.merchantReason">
              {{ currentOrder.merchantReason }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top:15px; text-align:right;"
      @change="getPageData"  
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/modules/orderStore'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const orderStore = useOrderStore()
const { orderList, pagination } = storeToRefs(orderStore)

const filterForm = ref({
  orderId: '',
  userId: '',
  year: '',
  month: '',
  day: '',
  status: ''
})

const yearList = ref(['2026'])
const monthList = ref(Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')))
const dayList = ref(Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')))

const detailVisible = ref(false)
const currentOrder = ref(null)

const filterList = computed(() => {
  return orderList.value.map(item => {
    let showGoodsName = '无商品'
    if (item.goodList && item.goodList.length > 0) {
      showGoodsName = item.goodList[0].name
      if (item.goodList.length > 1) showGoodsName += '...'
    }
    return { ...item, showGoodsName }
  })
})

const handleFilter = () => {
  getPageData(pagination.currentPage, pagination.pageSize)
  ElMessage.success('筛选成功')
}

const resetFilter = () => {
  filterForm.value = { orderId: '', userId: '', year: '', month: '', day: '', status: '' }
  getPageData(1, 10)
  ElMessage.success('已清空筛选')
}

const openDetail = (row) => {
  currentOrder.value = row
  detailVisible.value = true
}

const agreeRefund = async (row) => {
  await ElMessageBox.confirm('确定同意该订单退款？').catch(() => {})
  // 构造并输出符合接口格式的数据
  const operationData = {
    order_id: [Number(row.orderId)], // 确保是number数组
    operation: 'enable' // 操作类型：同意退款
  }
  console.log('处理待审核订单-同意退款：', operationData) // 输出目标格式
  // 业务逻辑（状态修改）
  orderStore.postOrder(operationData)
  ElMessage.success('操作成功')
}

const rejectRefund = async (row) => {
  await ElMessageBox.confirm('确定驳回该订单退款？').catch(() => {})
  // 构造并输出符合接口格式的数据
  const operationData = {
    order_id: [Number(row.orderId)], // 确保是number数组
    operation: 'disable' // 操作类型：拒绝退款
  }
  console.log('处理待审核订单-拒绝退款：', operationData) // 输出目标格式
  // 业务逻辑（状态修改）
  orderStore.postOrder(operationData)
  ElMessage.success('操作成功')
}

const batchAgree = async () => {
  await ElMessageBox.confirm('确定批量同意所有待审核退款？').catch(() => {})
  // 收集所有待审核订单ID（转为number类型）
  const pendingOrderIds = orderList.value
    .filter(i => i.status === '待审核')
    .map(i => Number(i.orderId))
  // 构造并输出符合接口格式的数据
  const operationData = {
    order_id: pendingOrderIds,
    operation: 'enable' // 批量同意退款
  }
  console.log('批量处理待审核订单-同意退款：', operationData) // 输出目标格式
  // 业务逻辑（状态修改）
  orderStore.postOrder(operationData)
  ElMessage.success('批量操作成功')
}

const batchReject = async () => {
  await ElMessageBox.confirm('确定批量驳回所有待审核退款？').catch(() => {})
  // 收集所有待审核订单ID（转为number类型）
  const pendingOrderIds = orderList.value
    .filter(i => i.status === '待审核')
    .map(i => Number(i.orderId))
  // 构造并输出符合接口格式的数据
  const operationData = {
    order_id: pendingOrderIds,
    operation: 'disable' // 批量驳回退款
  }
  console.log('批量处理待审核订单-驳回退款：', operationData) // 输出目标格式
  // 业务逻辑（状态修改）
  orderStore.postOrder(operationData)
  ElMessage.success('批量操作成功')
}

const getPageData = async (currentPage, pageSize) => {
  //console.log("筛选条件:", filterForm.value)
  //console.log("当前页:", currentPage, "每页数量:", pageSize)
  await orderStore.getOrderListByPage(filterForm.value, currentPage, pageSize)
  //console.log("当前页2:", currentPage, "每页数量2:", pageSize)
}

onMounted(() => {
  getPageData(1, 10)
})
</script>

<style scoped>
.detail-content {
  padding: 5px;
}

h4 {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #333;
  font-weight: 600;
}
</style>