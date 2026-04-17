<template>
  <div style="padding: 40px 0">
    <el-row :span="24" :gutter="30">
      <el-col :span="12" style="margin-right: 50px">
        <el-card class="content-card">
          <template #header>
            <div class="card-header" style="cursor: pointer; display: flex; justify-content: space-between;" @click="goToOrder('')">
              <span>我的交易</span>
              <span style="color: #999; font-size: 14px;">全部订单 ></span>
            </div>
          </template>
          <el-row>
            <el-col :span="6" class="status-item clickable" @click="goToOrder('待支付')">
              <div class="num">{{ pendingPaymentCount }}</div>
              <div class="label">待付款</div>
            </el-col>
            <el-col :span="6" class="status-item clickable" @click="goToOrder('待发货')">
              <div class="num">{{ pendingShipmentCount }}</div>
              <div class="label">待发货</div>
            </el-col>
            <el-col :span="6" class="status-item clickable" @click="goToOrder('已发货')">
              <div class="num">{{ pendingReceiptCount }}</div>
              <div class="label">待收货</div>
            </el-col>
            <el-col :span="6" class="status-item clickable" @click="goToOrder('已完成')">
              <div class="num">{{ pendingReviewCount }}</div>
              <div class="label">待评价</div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <el-col :span="5">
        <el-card class="content-card clickable-card" @click="$router.push('/favorites')">
          <template #header>
            <div>
              <span>我的收藏 ></span>
            </div>
          </template>
          <div class="status-item">
            <div class="num">{{ favoriteCount }}</div>
            <div class="label">收藏商品</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="5">
        <el-card class="content-card clickable-card" @click="$router.push('/cart')">
          <template #header>
            <div>
              <span>购物车 ></span>
            </div>
          </template>
          <div class="status-item">
            <div class="num">{{ cartCount }}</div>
            <div class="label">购物车商品</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="guess-you-like">
      <h3 class="section-title">猜你喜欢</h3>
      <div v-loading="loadingProducts">
        <el-row :gutter="15" v-if="recommendProducts.length > 0">
          <el-col
            v-for="item in recommendProducts"
            :key="item.id"
            :xs="12"
            :sm="8"
            :md="6"
            :lg="6"
            class="recommend-col"
          >
            <ProductCard :product="item" :id="item.id" :name="item.name" :price="item.price" :image="item.image" />
          </el-col>
        </el-row>
        <el-empty v-else description="暂无推荐商品" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request' // 引入你的 axios 封装
import { useOrderStore } from '@/stores/modules/user/orderStore'
import { useCartStore } from '@/stores/modules/user/cartStore'
import type { ApiResponse } from '@/api/types'

const router = useRouter()
const orderStore = useOrderStore()
const cartStore = useCartStore()

// ================= 数据统计计算 =================
// 动态计算各个状态的订单数量
const pendingPaymentCount = computed(() => orderStore.orderList.filter(o => o.status === '待支付').length)
const pendingShipmentCount = computed(() => orderStore.orderList.filter(o => o.status === '待发货').length)
const pendingReceiptCount = computed(() => orderStore.orderList.filter(o => o.status === '已发货').length)
const pendingReviewCount = computed(() => orderStore.orderList.filter(o => o.status === '已完成').length)

// 动态计算购物车数量
const cartCount = computed(() => cartStore.cartList.length)

// 收藏数量 (预留字段，等你写了收藏接口后替换为 store 里的真实数据)
const favoriteCount = ref(0) 

// ================= 跳转逻辑 =================
// 点击不同的订单状态，跳转到订单列表并带上状态参数
const goToOrder = (status: string) => {
  router.push({
    path: '/user/orders',
    query: status ? { status } : {} // 如果有状态就传过去，没有就查全部
  })
}

// ================= 猜你喜欢 =================
const recommendProducts = ref<any[]>([])
const loadingProducts = ref(false)

onMounted(async () => {
  // 1. 如果当前页面没有订单数据，拉取一下以保证数字准确
  if (orderStore.orderList.length === 0) {
    orderStore.fetchOrderList()
  }
  
  // 2. 如果购物车没有数据，拉取一下
  if (cartStore.cartList.length === 0) {
    cartStore.fetchCartList()
  }

  // 3. 拉取猜你喜欢的商品列表 (调用获取商品列表接口，可按销量排序)
  try {
    loadingProducts.value = true
    const res = await request.get<any, ApiResponse<any>>('/front/product/list', {
      params: { page: 1, pageSize: 8, sort_field: 'sales', sort_order: 'desc' }
    })
    if (res.success) {
      recommendProducts.value = res.data.list
    }
  } catch (error) {
    console.error('获取推荐商品失败', error)
  } finally {
    loadingProducts.value = false
  }
})
</script>

<style scoped>
/* 右侧内容独立滚动 */
.scroll-content {
  min-height: 100%;
}

.content-card {
  margin-bottom: 30px;
}

/* 鼠标悬浮的交互效果 */
.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}
.clickable:hover {
  transform: translateY(-2px);
  opacity: 0.8;
}

.clickable-card {
  cursor: pointer;
  transition: all 0.2s ease;
}
.clickable-card:hover {
  border-color: #ff5000;
  box-shadow: 0 2px 12px 0 rgba(255, 80, 0, 0.1);
}

.status-item {
  text-align: center;
  padding: 20px 0;
}

.status-item .num {
  font-size: 24px;
  color: #ff5000;
  font-weight: bold;
}

/* 猜你喜欢样式 */
.guess-you-like {
  margin-top: 10px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #ff5000;
}

.recommend-col {
  margin-bottom: 15px;
}
</style>