<template>
  <div class="buy-page">
    <main class="buy-container">
      <!-- 面包屑 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>确认订单</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row :gutter="20">
        <!-- 左侧 -->
        <el-col :md="16">
          <!-- 收货地址 -->
          <div class="card">
            <div class="card-title">收货地址</div>
            <div class="address-list">
              <div
                v-for="addr in addressList"
                :key="addr.address_id"
                class="address-item"
                :class="{ active: selectedAddressId === addr.address_id }"
                @click="selectedAddressId = addr.address_id"
              >
                <div>
                  <span class="name">{{ addr.recipient_name }}</span>
                  <span class="phone">{{ addr.phone }}</span>
                </div>
                <div class="addr-detail">
                  {{ addr.address_line1 }} {{ addr.city }} {{ addr.state }}
                </div>
                <el-radio v-model="selectedAddressId" :label="addr.address_id" />
              </div>
            </div>
          </div>

          <!-- 商品信息 -->
          <div class="card">
            <div class="card-title">商品信息</div>
            <div class="goods-item">
              <div class="goods-img"></div>
              <div class="goods-info">
                <div class="name">{{ goodsInfo.name }}</div>
                <div class="spec">规格：默认</div>
                <div class="price">¥{{ goodsInfo.price }}</div>
              </div>
              <div class="count">x{{ buyCount }}</div>
            </div>
          </div>

          <!-- 支付方式 → 纯色块！无任何图标！ -->
          <div class="card">
            <div class="card-title">支付方式</div>
            <div class="pay-list">
              <div
                v-for="pay in payMethods"
                :key="pay.id"
                class="pay-item"
                :class="{ active: selectedPayId === pay.id }"
                @click="selectedPayId = pay.id"
              >
                <!-- 纯 CSS 色块 -->
                <div class="pay-block" :style="{ background: pay.color }"></div>
                <span class="pay-text">{{ pay.name }}</span>
                <el-radio v-model="selectedPayId" :label="pay.id" />
              </div>
            </div>
          </div>
        </el-col>

        <!-- 右侧结算 -->
        <el-col :md="8">
          <div class="card settle-card">
            <div class="card-title">结算信息</div>
            <div class="settle-row">
              <span>商品总价</span>
              <span>¥{{ (goodsInfo.price * buyCount).toFixed(2) }}</span>
            </div>
            <div class="settle-row">
              <span>运费</span>
              <span>包邮</span>
            </div>
            <div class="total-row">
              <span>实付款</span>
              <span>¥{{ (goodsInfo.price * buyCount).toFixed(2) }}</span>
            </div>
            <el-button
              type="primary"
              class="pay-btn"
              @click="handlePay"
            >
              提交订单
            </el-button>
          </div>
        </el-col>
      </el-row>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 直接从路由拿商品数据，不发请求！
const goodsInfo = ref({})
const addressList = ref([])
const selectedAddressId = ref('')
const buyCount = ref(1)
const orderId = ref('')

// 支付方式（纯色块，无任何图标）
const payMethods = ref([
  { id: 1, name: '微信支付', color: '#07C160' },
  { id: 2, name: '支付宝', color: '#1677FF' },
  { id: 3, name: '银行卡', color: '#FF9500' }
])
const selectedPayId = ref(1)

onMounted(() => {
  console.log("完整路由信息：", route)
  console.log("传递过来的数据：", history.state)

  // 拿数据
  if (history.state?.goods) {
    goodsInfo.value = history.state.goods
    buyCount.value = goodsInfo.value.count || 1
    console.log("商品数据接收成功：", goodsInfo.value)
  }

  // 新增：接收从我的订单页传递的订单ID
  if (history.state?.orderId) {
    orderId.value = history.state.orderId
    console.log("订单ID接收成功：", orderId.value)
  }

  // 地址模拟数据
  addressList.value = [
    {
      address_id: 1,
      recipient_name: '测试用户',
      phone: '13800138000',
      address_line1: '测试街道',
      city: '测试城市',
      state: '测试区'
    }
  ]
  selectedAddressId.value = 1
})

// 提交订单
const handlePay = () => {
  // 新增：判断是否从订单页跳转
  const payTitle = orderId.value ? '确认支付该订单？' : '确认提交订单？'
  
  ElMessageBox.confirm(payTitle).then(() => {
    if (orderId.value) {
      ElMessage.success(`订单${orderId.value}支付成功！`)
    } else {
      ElMessage.success('支付成功！')
    }
    // 支付成功后跳转回我的订单页
    router.push('/user/orders') // 假设我的订单页路由为 /orders
  })
}
</script>

<style scoped>
.buy-page {
  background: #f5f5f5;
  padding: 20px;
  min-height: 100vh;
}
.buy-container {
  max-width: 1200px;
  margin: 0 auto;
}
.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.card-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}
.address-item {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
}
.address-item.active {
  border-color: #ff5000;
  background: #fff9f5;
}
.name {
  margin-right: 15px;
  font-weight: 500;
}
.phone {
  color: #666;
}
.addr-detail {
  margin-top: 5px;
  color: #888;
  font-size: 14px;
}

/* 商品信息 */
.goods-item {
  display: flex;
  align-items: center;
}
.goods-img {
  width: 70px;
  height: 70px;
  background: #f2f2f2;
  border-radius: 4px;
  margin-right: 15px;
}
.goods-info {
  flex: 1;
}
.name {
  font-weight: 500;
}
.spec {
  color: #999;
  font-size: 13px;
  margin: 4px 0;
}
.price {
  color: #ff5000;
  font-weight: bold;
}
.count {
  color: #666;
}

/* 支付方式 → 纯色块！ */
.pay-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
}
.pay-item.active {
  border-color: #ff5000;
  background: #fff9f5;
}
.pay-block {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  margin-right: 12px;
}
.pay-text {
  flex: 1;
}

/* 结算 */
.settle-card {
  position: sticky;
  top: 20px;
}
.settle-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #666;
}
.total-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 18px;
  font-weight: bold;
  color: #ff5000;
  border-top: 1px solid #eee;
  margin-top: 10px;
}
.pay-btn {
  width: 100%;
  background: #ff5000;
  border-color: #ff5000;
  margin-top: 15px;
}
</style>