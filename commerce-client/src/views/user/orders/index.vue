<template>
  <div class="order-page">
    <main class="order-container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>我的订单</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="filter-bar card">
        <el-input v-model="orderSearch" placeholder="订单编号搜索" class="search-input" clearable />
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="date-filter" />
        <el-select v-model="statusFilter" placeholder="订单状态" clearable>
          <el-option label="全部" value="" />
          <el-option label="待支付" value="待支付" />
          <el-option label="已支付" value="已支付" />
          <el-option label="已发货" value="已发货" />
          <el-option label="已完成" value="已完成" />
          <el-option label="已取消" value="已取消" />
        </el-select>
        <el-button type="primary" @click="resetFilter">清空筛选</el-button>
      </div>

      <div class="order-list">
        <div v-for="order in filteredOrders" :key="order.order_id" class="order-item card">
          <div class="order-header">
            <div class="order-left">
              <span class="order-no">订单编号：{{ order.order_id }}</span>
              <span class="create-time">创建时间：{{ formatTime(order.create_time) }}</span>
            </div>
            <div class="order-right">
              <el-tag :type="getStatusTagType(order.status)">{{ order.status }}</el-tag>
            </div>
          </div>

          <!-- 收货地址（已优化） -->
          <div class="order-address" v-if="order.address">
            <div class="label">收货地址：</div>
            <div class="text">
              <span>{{ order.address.recipient_name }}</span>
              <span>{{ order.address.phone }}</span>
              <span>{{ order.address.address_line1 }} {{ order.address.city }} {{ order.address.state }}</span>
            </div>
          </div>

          <div class="order-goods">
            <div v-for="item in order.details" :key="`${order.order_id}-${item.product_id}`" class="goods-item">
              <div class="goods-img"></div>
              <div class="goods-info">
                <div class="name">{{ item.product_name }}</div>
                <div class="spec">规格：默认</div>
                <div class="price">¥{{ item.price }}</div>
              </div>
              <div class="count">x{{ item.quantity }}</div>
            </div>
          </div>

          <!-- 金额 -->
          <div class="order-amount">
            <span>实付款：</span>
            <span class="total-price">¥{{ order.total_amount.toFixed(2) }}</span>
          </div>

          <!-- ✅ 新增：优惠券（有就显示，没有不显示） -->
          <div v-if="order.coupon" class="coupon-info">
            <span>使用优惠券：</span>
            <span class="coupon-text">{{ order.coupon.name }}（-¥{{ order.coupon.discount }}）</span>
          </div>

          <div class="order-actions">
            <el-button v-if="order.status === '待支付'" type="primary" @click="handlePay(order)">去支付</el-button>
            <el-button v-if="order.status === '待支付'" type="text" @click="cancelOrder(order.order_id)" class="cancel-btn">取消订单</el-button>
            <el-button v-if="order.status === '已完成'" type="text" @click="toComment(order)">去评价</el-button>
            <el-button type="text" @click="viewDetail(order)">查看详情</el-button>
          </div>
        </div>
      </div>

      <div v-if="filteredOrders.length === 0" class="empty-order">
        <el-empty description="暂无订单" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()
const orderSearch = ref('')
const dateRange = ref(null)
const statusFilter = ref('')

// ✅ 订单数据已自动加入 coupon 字段（有/无 自动判断）
const orderList = ref([
  {
    order_id: 2024001,
    total_amount: 10698.0,
    status: '已完成',
    create_time: '2024-02-10 10:30:00',
    address: { recipient_name: '张伟', phone: '13800138002', address_line1: '阳光新城12栋301室', city: '北京市', state: '朝阳区' },
    coupon: { name: '满10000减200', discount: 200 }, // ✅ 有优惠券
    details: [
      { product_id: 10001, product_name: 'iPhone 15 Pro', price: 8999, quantity: 1 },
      { product_id: 10006, product_name: 'AirPods Pro 2', price: 1899, quantity: 1 }
    ]
  },
  {
    order_id: 2024004,
    total_amount: 299.0,
    status: '待支付',
    create_time: '2024-03-01 11:40:00',
    address: { recipient_name: '陈洁', phone: '13800138005', address_line1: '书香门第3栋101室', city: '深圳市', state: '南山区' },
    coupon: null, // ✅ 无优惠券
    details: [{ product_id: 10009, product_name: '女士针织衫', price: 299, quantity: 1 }]
  },
  {
    order_id: 2024005,
    total_amount: 1699.0,
    status: '待支付',
    create_time: '2024-03-01 15:30:00',
    address: { recipient_name: '刘洋', phone: '13800138006', address_line1: '碧水湾21栋602室', city: '杭州市', state: '西湖区' },
    coupon: { name: '满1500减200', discount: 200 }, // ✅ 有优惠券
    details: [{ product_id: 10006, product_name: 'AirPods Pro 2', price: 1899, quantity: 1 }]
  },
  {
    order_id: 2024008,
    total_amount: 159.0,
    status: '已取消',
    create_time: '2024-02-20 13:25:00',
    address: { recipient_name: '李娜', phone: '13800138003', address_line1: '锦绣花园5栋202室', city: '上海市', state: '浦东新区' },
    coupon: null,
    details: [{ product_id: 10012, product_name: '坚果大礼包', price: 159, quantity: 1 }]
  }
])

const filteredOrders = computed(() => {
  return orderList.value.filter(order => {
    if (orderSearch.value && !order.order_id.toString().includes(orderSearch.value)) return false
    if (dateRange.value) { const t = dayjs(order.create_time); if (t.isBefore(dateRange.value[0]) || t.isAfter(dateRange.value[1])) return false }
    if (statusFilter.value && order.status !== statusFilter.value) return false
    return true
  })
})

const formatTime = time => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
const getStatusTagType = status => ({ 待支付: 'warning', 已支付: 'primary', 已发货: 'info', 已完成: 'success', 已取消: 'danger' }[status] || '')
const resetFilter = () => { orderSearch.value = ''; dateRange.value = null; statusFilter.value = '' }

const handlePay = order => router.push({ path: '/buy', state: { goods: order.details[0], orderId: order.order_id } })
const cancelOrder = orderId => ElMessageBox.confirm('确定取消？').then(() => { const o = orderList.value.find(x => x.order_id === orderId); if (o) o.status = '已取消'; ElMessage.success('已取消') })
const toComment = order => ElMessage.success('去评价：' + order.order_id)
const viewDetail = order => router.push('/order/detail/' + order.order_id)
</script>

<style scoped>
.order-page { background: #f5f5f5; padding: 20px; min-height: 100vh; }
.order-container { max-width: 1200px; margin: 0 auto; }
.card { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
.breadcrumb { margin-bottom: 20px; }
.filter-bar { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.search-input { width: 280px; }
.date-filter { width: 300px; }

.order-item { margin-bottom: 16px; }
.order-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #eee; margin-bottom: 12px; }
.order-no { font-weight: 500; margin-right: 16px; }
.create-time { color: #666; font-size: 14px; }

/* 地址样式（已美化） */
.order-address {
  display: flex;
  padding: 12px 15px;
  margin-bottom: 12px;
  background: #fafafa;
  border-radius: 6px;
  font-size: 14px;
  color: #555;
}
.order-address .label { min-width: 70px; font-weight: 500; color: #333; }
.order-address .text { flex: 1; display: flex; flex-wrap: wrap; gap: 8px 14px; }

.order-goods { margin-bottom: 12px; }
.goods-item { display: flex; align-items: center; padding: 8px 0; }
.goods-img { width: 60px; height: 60px; background: #f2f2f2; border-radius: 4px; margin-right: 12px; }
.goods-info { flex: 1; }
.name { font-weight: 500; margin-bottom: 4px; }
.spec { color: #999; font-size: 13px; }
.price { color: #ff5000; font-weight: bold; }
.count { color: #666; }

.order-amount { text-align: right; padding: 8px 0; border-top: 1px solid #eee; margin-bottom: 8px; }
.total-price { font-size: 16px; font-weight: bold; color: #ff5000; }

/* ✅ 优惠券样式（美观清爽） */
.coupon-info {
  text-align: right;
  font-size: 13px;
  color: #ff5000;
  margin-bottom: 12px;
}
.coupon-text {
  background: #fff1f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.order-actions { display: flex; justify-content: flex-end; gap: 8px; }
.cancel-btn { color: #ff5000; }
.empty-order { text-align: center; padding: 40px 0; }
</style>