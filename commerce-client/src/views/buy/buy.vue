<template>
  <div class="buy-page">
    <main class="buy-container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>立即购买</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row :gutter="20">
        <el-col :md="16">
          <!-- 地址 -->
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

          <!-- 商品 -->
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

          <!-- 支付方式 -->
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
                <div class="pay-block" :style="{ background: pay.color }"></div>
                <span class="pay-text">{{ pay.name }}</span>
                <el-radio v-model="selectedPayId" :label="pay.id" />
              </div>
            </div>
          </div>
        </el-col>

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
            <el-button type="primary" class="pay-btn" @click="handlePay">
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

const goodsInfo = ref({})
const buyCount = ref(1)
const addressList = ref([])
const selectedAddressId = ref('')
const payMethods = ref([
  { id: 1, name: '微信支付', color: '#07C160' },
  { id: 2, name: '支付宝', color: '#1677FF' },
  { id: 3, name: '银行卡', color: '#FF9500' }
])
const selectedPayId = ref(1)

onMounted(() => {
  // 从商品详情页接收数据
  if (history.state?.goods) {
    goodsInfo.value = history.state.goods
    buyCount.value = goodsInfo.value.count || 1
  }

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

const handlePay = () => {
  ElMessageBox.confirm('确认提交订单？').then(() => {
    ElMessage.success('支付成功！')
    router.push('/user/orders')
  })
}
</script>

<style scoped>
/* 样式保持你原来的不变 */
.buy-page {
  background: #f5f5f5;
  padding: 20px;
  min-height: 100vh;
}
.buy-container {
  max-width: 1200px;
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
.card-title {
  font-weight: 500;
  margin-bottom: 15px;
  font-size: 16px;
}
.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
}
.address-item.active {
  border-color: #409eff;
  background: #f0f7ff;
}
.name {
  font-weight: 500;
  margin-right: 10px;
}
.phone {
  color: #666;
}
.addr-detail {
  color: #999;
  font-size: 14px;
  margin-top: 4px;
}
.goods-item {
  display: flex;
  align-items: center;
}
.goods-img {
  width: 70px;
  height: 70px;
  background: #f2f2f2;
  border-radius: 6px;
  margin-right: 12px;
}
.goods-info {
  flex: 1;
}
.goods-info .name {
  font-weight: 500;
  margin-bottom: 4px;
}
.goods-info .spec {
  color: #999;
  font-size: 13px;
}
.price {
  color: #ff5000;
  font-weight: 500;
}
.count {
  color: #666;
}
.pay-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
}
.pay-item.active {
  border-color: #409eff;
  background: #f0f7ff;
}
.pay-block {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}
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
  margin-top: 8px;
}
.pay-btn {
  width: 100%;
  margin-top: 10px;
}
</style>