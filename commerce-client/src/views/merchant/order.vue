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
      <!-- 新增：用户退款原因列 -->
      <el-table-column label="用户退款原因">
        <template #default="scope">
          <el-tag v-if="scope.row.userRefundReason" type="warning" size="small">
            {{ scope.row.userRefundReason }}
          </el-tag>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <!-- 原有：驳回理由列 -->
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
          <!-- 新增：详情按钮 -->
          <el-button
            type="primary"
            text
            @click="viewDetail(scope.row)"
          >查看详情</el-button>
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

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="600px"
      destroy-on-close
    >
      <el-descriptions :column="2" border style="margin-top:10px;">
        <el-descriptions-item label="订单号">{{ currentOrder.orderId }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ currentOrder.goodsName }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ currentOrder.money }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag 
            :type="currentOrder.status ==='申请退款'?'warning':currentOrder.status ==='已退款'?'success':currentOrder.status ==='退款驳回'?'danger':''"
          >
            {{ currentOrder.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单用户">{{ currentOrder.userName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="用户手机号">{{ currentOrder.userPhone || '无' }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ currentOrder.createTime || '无' }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">{{ currentOrder.address || '无' }}</el-descriptions-item>
        <el-descriptions-item label="用户退款原因" :span="2">
          {{ currentOrder.userRefundReason || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="退款驳回理由" :span="2">
          {{ currentOrder.refundRejectReason || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选条件
const statusFilter = ref('')

// 详情弹窗控制
const detailDialogVisible = ref(false)
// 当前选中的订单
const currentOrder = ref({})

// 订单列表：补充完整字段（userName/userPhone/createTime/address）
const orderList = ref([
  { 
    orderId: '20260407001', 
    goodsName: '手机', 
    money: '3999', 
    status: '待发货', 
    refundRejectReason: '', 
    userRefundReason: '',
    userName: '张三',
    userPhone: '13800138000',
    createTime: '2026-04-07 10:00:00',
    address: '北京市朝阳区XX路XX号'
  },
  { 
    orderId: '20260407002', 
    goodsName: '电脑', 
    money: '5999', 
    status: '已发货', 
    refundRejectReason: '', 
    userRefundReason: '',
    userName: '李四',
    userPhone: '13900139000',
    createTime: '2026-04-07 11:00:00',
    address: '上海市浦东新区XX路XX号'
  },
  { 
    orderId: '20260407003', 
    goodsName: '耳机', 
    money: '299', 
    status: '申请退款', 
    refundRejectReason: '', 
    userRefundReason: '商品音质差，不符合预期',
    userName: '王五',
    userPhone: '13700137000',
    createTime: '2026-04-07 12:00:00',
    address: '广州市天河区XX路XX号'
  },
  { 
    orderId: '20260407004', 
    goodsName: '平板', 
    money: '2499', 
    status: '已完成', 
    refundRejectReason: '', 
    userRefundReason: '',
    userName: '赵六',
    userPhone: '13600136000',
    createTime: '2026-04-07 13:00:00',
    address: '深圳市南山区XX路XX号'
  },
  { 
    orderId: '20260407005', 
    goodsName: '手表', 
    money: '1299', 
    status: '申请退款', 
    refundRejectReason: '', 
    userRefundReason: '商品质量有问题',
    userName: '孙七',
    userPhone: '13500135000',
    createTime: '2026-04-07 14:00:00',
    address: '杭州市西湖区XX路XX号'
  },
  { 
    orderId: '20260407006', 
    goodsName: '音箱', 
    money: '899', 
    status: '退款驳回', 
    refundRejectReason: '商品影响二次销售，拒绝退款', 
    userRefundReason: '音箱有杂音，质量问题',
    userName: '周八',
    userPhone: '13400134000',
    createTime: '2026-04-07 15:00:00',
    address: '成都市锦江区XX路XX号'
  },
])

// 筛选逻辑（保留原有）
const filterList = computed(() => {
  if (!statusFilter.value) return orderList.value
  return orderList.value.filter(item => item.status === statusFilter.value)
})

// 新增：查看订单详情
const viewDetail = (row) => {
  currentOrder.value = { ...row } // 深拷贝避免弹窗修改影响原数据
  detailDialogVisible.value = true
}

// 同意退款（保留原有逻辑）
const agree = (row) => {
  row.status = '已退款'
  row.refundRejectReason = '' // 同意退款时清空驳回理由
  ElMessage.success('已同意退款')
}

// 驳回退款（保留原有逻辑）
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