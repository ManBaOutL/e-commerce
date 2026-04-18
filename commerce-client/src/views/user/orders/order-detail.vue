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
            <span>创建时间：{{ order.create_time }}</span>
          </div>
        </div>

        <!-- 收货地址 + 地图选择器 -->
        <div class="card address-card">
          <div class="card-title">收货地址</div>
          <div class="address-main">
            <!-- 地址信息 -->
            <div class="address-info-wrap" v-if="order.address">
              <div class="address-info">
                <div class="recipient-info">
                  <span class="name">{{ order.address.recipient_name }}</span>
                  <span class="phone">{{ order.address.phone }}</span>
                </div>
                <div class="address-detail">
                  {{ order.address.address_line1 }} {{ order.address.city }} {{ order.address.state }}
                </div>
              </div>
            </div>
            <div class="address-info empty" v-else>
              暂无收货地址信息
            </div>

            <!-- 地图选择器（淘宝风格） -->
            <div class="address-map-wrap">
              <div class="map-label">收货地址定位：</div>
              <AmapSelector 
                v-model="addressValue"
                class="amap-selector"
              />
            </div>
          </div>
        </div>

        <!-- 商品清单 -->
        <div class="card">
          <div class="card-title">商品清单</div>
          <div v-for="item in order.details" :key="item.product_id" class="goods-item">
                      
            <div class="goods-img">
              <el-image 
                  style="width: 100%; height: 100%; border-radius: 4px;"
                  :src="getFullUrl(item.main_image)" 
                  fit="cover"
                >
                  <template #error><div style="text-align: center; line-height: 60px; color: #ccc; font-size: 12px;">无图</div></template>
                </el-image>
            </div>
            
            <div class="goods-info">
              <div class="name">{{ item.product_name }}</div>
              <div class="spec">规格：默认</div>
              <div class="price">¥{{ Number(item.price).toFixed(2) }}</div>
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
            <span>¥{{ Number(order.total_amount).toFixed(2) }}</span>
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
import { useOrderStore } from '@/stores/modules/user/orderStore'
import getFullUrl from '@/utils/getFullUrl'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const loading = ref(true)
const order = ref({}) // 存放当前真实的订单数据
const addressValue = ref('广东省 深圳市 南山区 科技园中区') // 暂时写死，因为地址模块还没联调

// 初始化获取详情
onMounted(async () => {
  const orderId = route.query.order_id
  if (!orderId) return ElMessage.warning('订单ID不能为空')

  try {
    loading.value = true
    // 如果 Store 里没有数据（比如用户刷新了页面），强制重新拉取一次列表
    if (orderStore.orderList.length === 0) {
      await orderStore.fetchOrderList()
    }
    
    // 从 Store 列表中捞出当前需要显示的这个订单
    const foundOrder = orderStore.orderList.find(item => String(item.order_id) === String(orderId))
    
    if (foundOrder) {
      order.value = { ...foundOrder }
    } else {
      ElMessage.warning('未找到该订单信息')
    }
  } finally {
    loading.value = false
  }
})

const getStatusTagType = (status) => ({ 待支付: 'warning', 已支付: 'primary', 待发货: 'info', 已发货: 'info', 已完成: 'success', 已取消: 'danger' }[status] || '')

// 计算商品原价总和
const calculateSubtotal = computed(() => {
  if (!order.value.details) return 0
  return order.value.details.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
})

const goBack = () => router.go(-1)
const cancelOrder = () => ElMessage.warning('取消功能即将开放')
const goPay = () => ElMessage.success('支付功能已经跑通啦！')
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

/* 淘宝风格地址卡片样式 */
.address-card {
  position: relative;
}
.address-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.address-info-wrap {
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #eee;
}
.address-info .recipient-info {
  margin-bottom: 8px;
  font-size: 14px;
}
.address-info .name {
  font-weight: 500;
  margin-right: 16px;
}
.address-info .phone {
  color: #666;
}
.address-info .address-detail {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}
.address-info.empty {
  color: #999;
  font-style: italic;
  padding: 12px;
}

/* 地图选择器样式（淘宝风格） */
.address-map-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}
.map-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}
.amap-selector :deep(.map-input) {
  width: 300px;
  max-width: 600px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid #ddd;
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