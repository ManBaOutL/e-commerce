<template>
  <div class="merchant-order-page">
    <h2>商家订单管理</h2>

    <!-- 🌟 筛选区：双向绑定筛选条件并触发查询 -->
    <div class="filter-box" style="margin-bottom: 20px;">
      <el-select v-model="searchParams.status" placeholder="筛选状态" style="width:160px; margin-right: 15px;" clearable @change="handleSearch">
        <el-option label="全部" value="" />
        <el-option label="待发货" value="待发货" />
        <el-option label="已发货" value="已发货" />
        <el-option label="已完成" value="已完成" />
        <el-option label="申请退款" value="申请退款" />
        <el-option label="已退款" value="已退款" />
        <el-option label="退款驳回" value="退款驳回" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
    </div>

    <!-- 订单列表 -->
    <el-table :data="orderList" border v-loading="loading">
      <el-table-column label="订单号" prop="orderId" width="180" />
      <el-table-column label="商品" prop="goodsName" />
      <el-table-column label="金额(元)" prop="money" width="100" />
      <el-table-column label="订单状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="用户退款原因" show-overflow-tooltip>
        <template #default="scope">
          <span v-if="scope.row.userRefundReason" style="color: #e6a23c;">{{ scope.row.userRefundReason }}</span>
          <span v-else style="color: #999;">--</span>
        </template>
      </el-table-column>
      <el-table-column label="驳回理由" show-overflow-tooltip>
        <template #default="scope">
          <span v-if="scope.row.refundRejectReason" style="color: #f56c6c;">{{ scope.row.refundRejectReason }}</span>
          <span v-else style="color: #999;">--</span>
        </template>
      </el-table-column>
      
      <!-- 🌟 操作列：增加发货逻辑 -->
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewDetail(scope.row)">详情</el-button>
          
          <el-button 
            type="success" 
            link 
            v-if="scope.row.status === '待发货'"
            @click="handleShip(scope.row)"
          >发货</el-button>

          <template v-if="scope.row.status === '申请退款'">
            <el-button type="success" link @click="agreeRefund(scope.row)">同意退款</el-button>
            <el-button type="danger" link @click="rejectRefund(scope.row)">驳回</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 🌟 分页器 -->
    <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="orderPagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSearch"
        @current-change="loadData"
      />
    </div>

    <!-- 订单详情弹窗 (保持原样，只做了排版微调) -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="600px" destroy-on-close>
      <el-descriptions :column="2" border style="margin-top:10px;">
        <el-descriptions-item label="订单号">{{ currentOrder.orderId }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ currentOrder.goodsName }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ currentOrder.money }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusTagType(currentOrder.status)">{{ currentOrder.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单用户">{{ currentOrder.userName || '--' }}</el-descriptions-item>
        <el-descriptions-item label="用户手机号">{{ currentOrder.userPhone || '--' }}</el-descriptions-item>
        <el-descriptions-item label="下单时间" :span="2">{{ currentOrder.createTime || '--' }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ currentOrder.address || '--' }}</el-descriptions-item>
        <el-descriptions-item label="用户退款原因" :span="2">
          {{ currentOrder.userRefundReason || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="退款驳回理由" :span="2">
          {{ currentOrder.refundRejectReason || '--' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useMerchantStore } from '@/stores/modules/merchantStore' // 路径按你实际的来

const merchantStore = useMerchantStore()
const { orderList, orderPagination } = storeToRefs(merchantStore)

// 页面状态
const loading = ref(false)
const searchParams = reactive({ status: '' })
const currentPage = ref(1)
const pageSize = ref(10)

// 详情弹窗控制
const detailDialogVisible = ref(false)
const currentOrder = ref<any>({})

// 🌟 初始化加载
onMounted(() => {
  loadData()
})

const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const loadData = async () => {
  loading.value = true
  await merchantStore.fetchOrderList(searchParams, currentPage.value, pageSize.value)
  loading.value = false
}

// 标签颜色辅助函数
const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    '待发货': 'warning', '已发货': 'primary', '已完成': 'success',
    '申请退款': 'warning', '已退款': 'info', '退款驳回': 'danger'
  }
  return map[status] || 'info'
}

// 查看详情
const viewDetail = (row: any) => {
  currentOrder.value = { ...row }
  detailDialogVisible.value = true
}

// 🌟 发货动作
const handleShip = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认该订单已发货？', '发货确认', { type: 'info' })
    const res = await merchantStore.shipOrder(row.orderId)
    if (res.success) {
      ElMessage.success('发货成功')
      loadData() // 刷新列表
    } else {
      ElMessage.error(res.message || '发货失败')
    }
  } catch (error) { /* 用户取消 */ }
}

// 🌟 同意退款 (接入后端事务回滚逻辑)
const agreeRefund = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定同意退款吗？<br>订单实付款 <b style="color:red">¥${row.money}</b> 将退回给用户，且商品库存会自动回滚。`, 
      '同意退款', 
      { type: 'warning', dangerouslyUseHTMLString: true }
    )
    
    // 调用 Store (触发后端 agreeRefund 接口)
    const res = await merchantStore.processRefund({ order_id: row.orderId, is_agree: true })
    if (res.success) {
      ElMessage.success('退款已同意，款项正在原路退回')
      loadData() // 状态变更为'已退款'
    } else {
      ElMessage.error(res.message || '处理失败')
    }
  } catch (error) { /* 用户取消 */ }
}

// 🌟 驳回退款
const rejectRefund = async (row: any) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入驳回退款理由（必填）', '驳回审核', {
      confirmButtonText: '确定驳回',
      cancelButtonText: '取消',
      inputValidator: (value) => value && value.trim() ? true : '驳回理由不能为空'
    })
    
    const res = await merchantStore.processRefund({ 
      order_id: row.orderId, 
      is_agree: false, 
      reject_reason: reason 
    })

    if (res.success) {
      ElMessage.success('已驳回退款申请')
      loadData() // 状态变更为'退款驳回'
    } else {
      ElMessage.error(res.message || '驳回失败')
    }
  } catch (error) { /* 用户取消 */ }
}
</script>