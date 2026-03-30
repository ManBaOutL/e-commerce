<template>
  <div class="order-detail-page">
    <main class="order-detail-container">

      <!-- 面包屑 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/user/orders' }">我的订单</el-breadcrumb-item>
        <el-breadcrumb-item>订单详情</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- 订单不存在提示 -->
      <div v-else-if="!order.order_id" class="empty-container">
        <el-empty description="订单不存在或已失效" />
        <el-button class="back-btn" type="primary" @click="goBack">返回订单列表</el-button>
      </div>

      <!-- 订单信息 -->
      <div v-else>
        <!-- 订单头部信息 -->
        <div class="card">
          <div class="order-head">
            <span>订单号：{{ order.order_id }}</span>
            <el-tag :type="getStatusTagType(order.status)">{{ order.status }}</el-tag>
          </div>
          <div class="info-line">
            <span>创建时间：{{ formatTime(order.create_time) }}</span>
          </div>
        </div>

        <!-- 收货地址 + 【预留地图区域】 -->
        <div class="card">
          <div class="card-title">收货地址</div>
          <div class="address-info" v-if="order.address">
            {{ order.address.recipient_name }}　{{ order.address.phone }}<br>
            {{ order.address.address_line1 }} {{ order.address.city }} {{ order.address.state }}
          </div>
          <div class="address-info empty" v-else>
            暂无收货地址信息
          </div>

          <div class="map-placeholder">
            <div class="map-tip">这里将显示地图配送位置（地图 API）</div>
          </div>
        </div>

        <!-- 商品清单 -->
        <div class="card">
          <div class="card-title">商品清单</div>
          <div v-for="item in order.details" :key="item.product_id" class="goods-item">
            <div class="goods-img"></div>
            <div class="goods-info">
              <div class="name">{{ item.product_name }}</div>
              <div class="spec">规格：{{ item.spec || '默认' }}</div>
              <div class="price">¥{{ item.price.toFixed(2) }}</div>
            </div>
            <div class="count">x{{ item.quantity }}</div>
          </div>
        </div>

        <!-- 金额信息 -->
        <div class="card">
          <div class="card-title">金额信息</div>
          <div class="price-row">
            <span>商品总价</span>
            <span>¥{{ calculateSubtotal.toFixed(2) }}</span>
          </div>

          <div class="price-row" v-if="order.coupon">
            <span>优惠券抵扣 ({{ order.coupon.name }})</span>
            <span class="red">-¥{{ order.coupon.discount.toFixed(2) }}</span>
          </div>

          <div class="price-row total">
            <span>实付款</span>
            <span>¥{{ order.total_amount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-bar">
          <el-button @click="goBack">返回订单</el-button>
          <el-button v-if="order.status === '待支付'" type="danger" @click="cancelOrder">取消订单</el-button>
          <el-button v-if="order.status === '待支付'" type="primary" @click="goPay">去支付</el-button>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()

// 状态管理
const loading = ref(true)
const order = ref({
  order_id: '',
  total_amount: 0,
  status: '',
  create_time: '',
  address: null,
  coupon: null,
  details: []
})

// 模拟订单数据库
const orderDatabase = [
  {
    order_id: 2024001,
    total_amount: 10698.0,
    status: '已完成',
    create_time: '2024-02-10 10:30:00',
    address: { recipient_name: '张伟', phone: '13800138002', address_line1: '阳光新城12栋301室', city: '北京市', state: '朝阳区' },
    coupon: { name: '满10000减200', discount: 200 },
    details: [
      { product_id: 10001, product_name: 'iPhone 15 Pro', price: 8999, quantity: 1, spec: '256GB 原色钛金属' },
      { product_id: 10006, product_name: 'AirPods Pro 2', price: 1899, quantity: 1, spec: '标准版' }
    ]
  },
  {
    order_id: 2024004,
    total_amount: 299.0,
    status: '待支付',
    create_time: '2024-03-01 11:40:00',
    address: { recipient_name: '陈洁', phone: '13800138005', address_line1: '书香门第3栋101室', city: '深圳市', state: '南山区' },
    coupon: null,
    details: [{ product_id: 10009, product_name: '女士针织衫', price: 299, quantity: 1, spec: 'M码 米白色' }]
  },
  {
    order_id: 2024005,
    total_amount: 1699.0,
    status: '待支付',
    create_time: '2024-03-01 15:30:00',
    address: { recipient_name: '刘洋', phone: '13800138006', address_line1: '碧水湾21栋602室', city: '杭州市', state: '西湖区' },
    coupon: { name: '满1500减200', discount: 200 },
    details: [{ product_id: 10006, product_name: 'AirPods Pro 2', price: 1899, quantity: 1, spec: 'USB-C版' }]
  },
  {
    order_id: 2024008,
    total_amount: 159.0,
    status: '已取消',
    create_time: '2024-02-20 13:25:00',
    address: { recipient_name: '李娜', phone: '13800138003', address_line1: '锦绣花园5栋202室', city: '上海市', state: '浦东新区' },
    coupon: null,
    details: [{ product_id: 10012, product_name: '坚果大礼包', price: 159, quantity: 1, spec: '1.2kg装' }]
  }
]

// 模拟请求订单详情接口
const fetchOrderDetail = async (orderId) => {
  try {
    loading.value = true
    // 模拟接口延迟
    //await new Promise(resolve => setTimeout(resolve, 500))
    
    // 从数据库筛选订单
    const foundOrder = orderDatabase.find(item => item.order_id === Number(orderId))
    if (foundOrder) {
      order.value = { ...foundOrder }
    } else {
      order.value = {}
      ElMessage.warning('未找到该订单信息')
    }
  } catch (error) {
    ElMessage.error('获取订单详情失败：' + error.message)
    order.value = {}
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const statusMap = {
    '待支付': 'warning',
    '已支付': 'primary',
    '已发货': 'info',
    '已完成': 'success',
    '已取消': 'danger'
  }
  return statusMap[status] || ''
}

// 计算商品总价（无优惠）
const calculateSubtotal = computed(() => {
  return order.value.details.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)
})

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 去支付
const goPay = () => {
  router.push({ 
    path: '/buy', 
    query: { orderId: order.value.order_id } 
  })
  ElMessage.info('跳转到支付页面：' + order.value.order_id)
}

// 取消订单
const cancelOrder = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消该订单吗？取消后将无法恢复',
      '取消订单',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟更新订单状态接口
    await new Promise(resolve => setTimeout(resolve, 300))
    order.value.status = '已取消'
    ElMessage.success('订单已成功取消')
  } catch (error) {
    ElMessage.info('已取消操作')
  }
}

// 页面挂载时获取订单详情
onMounted(() => {
  // 从URL参数获取订单ID
  const orderId = route.query.orderId
  if (orderId) {
    fetchOrderDetail(orderId)
  } else {
    loading.value = false
    ElMessage.warning('订单ID不能为空')
  }
})
</script>

<style scoped>
.order-detail-page {
  background: #f5f5f5;
  padding: 20px;
  min-height: 100vh;
}
.order-detail-container {
  max-width: 1000px;
  margin: 0 auto;
}
.breadcrumb {
  margin-bottom: 16px;
}
.card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.order-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.info-line {
  color: #666;
  font-size: 14px;
}
.card-title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}
.address-info {
  color: #555;
  line-height: 1.6;
  margin-bottom: 12px;
}
.address-info.empty {
  color: #999;
  font-style: italic;
}

/* 地图预留区域 */
.map-placeholder {
  width: 100%;
  height: 280px;
  background: #f9f9f9;
  border: 1px dashed #ccc;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}
.map-tip {
  text-align: center;
  line-height: 1.5;
}

/* 商品样式 */
.goods-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.goods-item:last-child {
  border-bottom: none;
}
.goods-img {
  width: 60px;
  height: 60px;
  background: #f2f2f2;
  border-radius: 4px;
  margin-right: 12px;
}
.goods-info {
  flex: 1;
}
.name {
  font-weight: 500;
  margin-bottom: 4px;
}
.spec {
  color: #999;
  font-size: 13px;
  margin-bottom: 4px;
}
.price {
  color: #ff5000;
  font-weight: 500;
}
.count {
  color: #666;
  font-size: 14px;
  min-width: 40px;
  text-align: right;
}

/* 价格样式 */
.price-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}
.red {
  color: #ff5000;
}
.price-row.total {
  font-weight: bold;
  font-size: 16px;
  color: #ff5000;
  border-top: 1px solid #eee;
  padding-top: 12px;
  margin-top: 6px;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* 加载和空状态 */
.loading-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.empty-container {
  background: #fff;
  padding: 60px 20px;
  border-radius: 8px;
  text-align: center;
}
.back-btn {
  margin-top: 20px;
}
</style>