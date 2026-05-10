<template>
  <div class="order-page">
    <main class="order-container">

      <div class="filter-bar card">
        <el-input v-model="orderSearch" placeholder="订单编号搜索" class="search-input" clearable />
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="date-filter" />
        <el-select v-model="statusFilter" placeholder="订单状态" clearable>
          <el-option label="全部" value="" />
          <el-option label="待支付" value="待支付" />
          <el-option label="已完成" value="已完成" />
          <el-option label="申请退款" value="申请退款" />
          <el-option label="待审核" value="待审核" />
          <el-option label="已退款" value="已退款" />
          <el-option label="退款驳回" value="退款驳回" />
          <el-option label="已取消" value="已取消" />
        </el-select>
        <el-button type="primary" @click="resetFilter">清空筛选</el-button>
      </div>
      <!-- 订单列表 -->
      <div class="order-list" v-loading="loading">
        <div v-for="order in filteredOrders" :key="order.order_id" class="order-item card">
          
          <div class="order-header">
            <div class="order-left">
              <span class="order-no">订单编号：{{ order.order_id }}</span>
              <span class="create-time">创建时间：{{ order.create_time }}</span>
            </div>
            <div class="order-right">
              <el-tag :type="getStatusTagType(order.status)">{{ order.status }}</el-tag>
            </div>
          </div>
          <!-- 订单详情 -->
          <div class="order-goods">
            <div v-for="item in order.details" :key="`${order.order_id}-${item.product_id}`" class="goods-item">
              <!-- 商品图片 -->
              <div class="goods-img">
                <el-image 
                  style="width: 100%; height: 100%; border-radius: 4px;"
                  :src="getFullUrl(item.main_image)" 
                  fit="cover"
                >
                  <template #error><div class="img-fallback">无图</div></template>
                </el-image>
              </div>
              <!-- 商品信息 -->
              <div class="goods-info">
                <div class="name">{{ item.product_name }}</div>
                <div class="spec">规格：默认</div>
                <div class="price">¥{{ Number(item.price).toFixed(2) }}</div>
              </div>
              <div class="count">x{{ item.quantity }}</div>
              <!-- 商品评论 -->
              <div class="goods-action" style="margin-left: 20px;" v-if="order.status === '已完成'">
                <el-button 
                  v-if="!item.review_id" 
                  size="small" 
                  plain 
                  type="warning" 
                  @click="toComment(order.order_id, item.product_id, item.product_name, item.main_image)"> 去评价
                </el-button>

                <el-button 
                  v-else-if="item.is_appended === 0" 
                  size="small" 
                  plain 
                  type="primary" 
                  @click="toAppendComment(order.order_id, item.product_id, item.product_name, item.review_id, item.main_image)"> 追加评价
                </el-button>

                <el-button 
                  v-else 
                  size="small" 
                  plain 
                  type="info" 
                  disabled>
                  已完成评价
                </el-button>              
              </div>
            </div>
          </div>
          <!-- 订单金额 -->
          <div class="order-amount-wrap">
            <div v-if="order.coupon" class="coupon-info">
              <span class="label">使用优惠券：</span>
              <span class="coupon-text">{{ order.coupon.name }}（-¥{{ Number(order.coupon.discount).toFixed(2) }}）</span>
            </div>
            <div class="order-amount">
              <span>实付款：</span>
              <span class="total-price">¥{{ Number(order.total_amount).toFixed(2) }}</span>
            </div>
          </div>
          <!-- 订单的不同状态有不同的操作按钮（后续还需补充） -->
          <div class="order-actions">
            <el-button v-if="order.status === '待支付'" type="primary" @click="handlePay(order)">提交订单</el-button>
            <el-button v-if="order.status === '待支付'" link type="info" @click="cancelOrder(order.order_id)" class="cancel-btn">取消订单</el-button>
            
            <el-button v-if="order.status === '已完成'" size="small" plain type="danger" @click="openRefundDialog(order.order_id)">申请退款</el-button>
            
            <el-button link type="primary" @click="viewDetail(order)">查看详情</el-button>
          </div>
        </div>
      </div>
      <div v-if="!loading && filteredOrders.length === 0" class="empty-order">
        <el-empty description="暂无订单" />
      </div>
      <!-- 退款对话框 -->
      <el-dialog v-model="refundDialogVisible" title="申请退款" width="450px" destroy-on-close>
        <div style="margin-bottom: 10px; color: #666; font-size: 13px;">请填写您的退款诉求，商家将尽快为您处理。</div>
        <el-input
          v-model="refundForm.reason"
          type="textarea"
          :rows="4"
          placeholder="请详细描述您的退款原因（必填）"
        />
        <template #footer>
          <span class="dialog-footer">
            <el-button type="info"@click="refundDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitRefund" :loading="refundLoading">
              提交申请
            </el-button>
          </span>
        </template>
      </el-dialog>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import getFullUrl from '@/utils/getFullUrl'
import { storeToRefs } from 'pinia'

import { useOrderStore } from '@/stores/modules/user/orderStore'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

// 响应式拉取 Store 里的订单数据
const { orderList } = storeToRefs(orderStore)
const loading = ref(true)

// 筛选状态
const orderSearch = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const statusFilter = ref('')

// 页面初始化：拉取真实订单
onMounted(async () => {
  loading.value = true
  
  // 如果 URL 传了 out_trade_no 参数，说明是支付宝回调，需要主动查询支付状态
  if (route.query.out_trade_no) {
    try {
      // 告诉用户正在同步数据
      ElMessage.success({ message: '正在同步支付结果...', duration: 2000 })
      
      // 1. 拿着 URL 里的订单号，主动去后端触发一次查询和兜底清算
      await orderStore.checkAlipayStatus(Number(route.query.out_trade_no))
      
      // 2. 为了页面美观，清空 URL 上那一长串支付宝自带的参数，只保留干干净净的路径
      router.replace({ path: route.path })
    } catch (err) {
      console.error('主动查询支付状态异常:', err)
    }
  }

  // 此时拉取的订单列表，绝对是最新的状态！
  await orderStore.fetchOrderList()
  loading.value = false
  
  // 如果 URL 传了 status 参数，自动赋值给筛选框
  if (route.query.status) {
    statusFilter.value = route.query.status as string
  }
})

// 计算过滤后的订单
const filteredOrders = computed(() => {
  return orderList.value.filter(order => {
    if (orderSearch.value && !order.order_id.toString().includes(orderSearch.value)) return false
    if (dateRange.value) { 
      const t = dayjs(order.create_time); 
      if (t.isBefore(dateRange.value[0]) || t.isAfter(dateRange.value[1])) return false 
    }
    if (statusFilter.value && order.status !== statusFilter.value) return false
    return true
  })
})

// 工具函数：状态颜色
const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    待支付: 'warning',   // 黄色
    已完成: 'success',   // 绿色
    申请退款: 'warning', // 黄色 (处理中)
    待审核: 'primary',   // 蓝色 (需要管理员介入)
    已退款: 'info',      // 灰色 (终态)
    退款驳回: 'danger',  // 红色 (异常终态)
    已取消: 'info'       // 灰色 (终态)
  };
  return statusMap[status] || 'info';
}
const resetFilter = () => { orderSearch.value = ''; dateRange.value = null; statusFilter.value = '' }

// ========== 交互动作 ==========
const handlePay = (order: any) => {
  ElMessage.success('正在跳转收银台...')
  
  // 携带订单核心参数，跳转到你的支付/结算页面
  router.push({
    path: '/user/orders/order-pay',
    query: {
      buy_type: 'unpaid',       // 🌟 告诉结算页：这是一个已经存在的待支付订单
      order_id: order.order_id, // 传订单号
      price: order.total_amount // 传实付总金额
    }
  })
}

const cancelOrder = (order_id: number) => {
  ElMessageBox.confirm('确定取消该订单吗？取消后优惠券将被退回。', '提示', { type: 'warning' }).then(async () => {
    
    // 🌟 调用刚刚在 Store 里写好的真实接口
    const res = await orderStore.cancelOrder(order_id);
    
    if (res.success) {
      ElMessage.success('订单已取消');
      orderStore.fetchOrderList(); // 重新拉取列表，订单状态会变成灰色的“已取消”
    } else {
      ElMessage.error(res.message || '取消失败');
    }

  }).catch(() => {
    // 用户点击了弹窗的取消，什么都不做
  })
}

const viewDetail = (order: any) => router.push({ path: '/user/orders/detail', query: { order_id: order.order_id } })

// 🌟 接收 productImage 并放入 query
const toComment = (orderId: number, productId: number, productName: string, productImage?: string) => {
  router.push({ 
    path: '/user/orders/comment', 
    query: { orderId, productId, productName, productImage } 
  })
}

// 🌟 接收 productImage 并放入 query
const toAppendComment = (orderId: number, productId: number, productName: string, reviewId: number, productImage?: string) => {
  router.push({ 
    path: '/user/orders/comment', 
    query: { 
      orderId, 
      productId, 
      productName, 
      mode: 'append',
      reviewId: reviewId,
      productImage // 传给评价页
    } 
  })
}

// ========== 退款相关逻辑 ==========
const refundDialogVisible = ref(false);
const refundLoading = ref(false);
const refundForm = ref<{
  order_id: number;
  reason: string;
}>({ order_id: 0, reason: '' });

// 打开退款弹窗
const openRefundDialog = (order_id: number) => {
  refundForm.value.order_id = order_id;
  refundForm.value.reason = '';
  refundDialogVisible.value = true;
};

// 提交退款申请
const submitRefund = async () => {
  if (!refundForm.value.reason.trim()) {
    return ElMessage.warning('退款原因不能为空');
  }

  refundLoading.value = true;
  const res = await orderStore.applyRefund(Number(refundForm.value.order_id), refundForm.value.reason);
  refundLoading.value = false;

  if (res.success) {
    ElMessage.success('退款申请已提交');
    refundDialogVisible.value = false;
    orderStore.fetchOrderList(); // 刷新列表，订单状态会变成黄色的“申请退款”
  } else {
    ElMessage.error(res.message || '申请失败');
  }
};
</script>

<style scoped>
.order-page { background: #f5f5f5; padding: 20px; min-height: 100vh; }
.order-container { max-width: 1200px; margin: 0 auto; }
.card { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
.filter-bar { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.search-input { width: 280px; }
.date-filter { width: 300px; }

.order-item { margin-bottom: 16px; }
.order-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #eee; margin-bottom: 12px; }
.order-no { font-weight: 500; margin-right: 16px; color: #333;}
.create-time { color: #999; font-size: 13px; }

.order-goods { margin-bottom: 12px; }
.goods-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px dashed #f5f5f5; }
.goods-img { width: 60px; height: 60px; background: #f9f9f9; border-radius: 4px; margin-right: 12px; }
.img-fallback { text-align: center; line-height: 60px; color: #ccc; font-size: 12px; }
.goods-info { flex: 1; }
.name { font-weight: 500; margin-bottom: 4px; color: #333;}
.spec { color: #999; font-size: 13px; margin-bottom: 4px;}
.price { color: #333; font-weight: 500; }
.count { color: #999; font-size: 14px; }

.order-amount-wrap { text-align: right; padding: 12px 0; border-bottom: 1px solid #eee; margin-bottom: 12px; }
.coupon-info { font-size: 13px; color: #ff5000; margin-bottom: 8px; }
.coupon-text { background: #fff1f0; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
.order-amount { color: #333; font-size: 14px;}
.total-price { font-size: 18px; font-weight: bold; color: #ff5000; }

.order-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;}
.cancel-btn { color: #999; }
.empty-order { text-align: center; padding: 40px 0; }
</style>