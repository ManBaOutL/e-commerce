<template>
  <div class="home-page">
    <TheHeader />

    <main class="main-container">
      <el-row :gutter="20">
        <!-- 左侧菜单 -->
        <el-col :md="5" :sm="0" :xs="0">
          <div class="side-menu">
            <HomeMenu />
          </div>
        </el-col>
        <!-- 右侧轮播图 -->
        <el-col :md="14" :sm="24" :xs="24">
          <el-carousel height="380px" class="home-carousel">
            <el-carousel-item v-for="i in 3" :key="i">
              <div class="banner-content">活动大促海报 {{ i }}</div>
            </el-carousel-item>
          </el-carousel>
        </el-col>
        <!-- 右侧用户信息 -->
        <el-col :lg="5" :md="0" :sm="0" :xs="0">
          <div class="user-panel">
            <el-avatar :size="60" />
            <p class="welcome-text">Hi, 欢迎回来!</p>
            <div class="auth-btns">
              <el-button type="primary" size="small" @click="handleToLogin">登录</el-button>
              <el-button size="small" plain @click="handleToRegister">注册</el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <section class="goods-section">
        <div class="guess-you-like">
        <h3 class="section-title">猜你喜欢</h3>
        <el-row :gutter="15">
          <el-col
            v-for="item in recommendProducts"
            :key="item.id"
            :xs="12"
            :sm="8"
            :md="6"
            :lg="6"
          >
            <ProductCard :name="item.name" :price="item.price" :image="item.image"/>
          </el-col>
        </el-row>
      </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import HomeMenu from './HomeMenu.vue'
import {useRouter} from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { useProductStore } from '@/stores/modules/product'

const router = useRouter()
const productStore = useProductStore()

// 推荐商品
const recommendProducts = computed(() => productStore.productList.slice(0, 6))
// 获取商品数据
const getProducts = () => {
  productStore.getProductList()
}

onMounted(() => {
  getProducts()
})
  
const handleToLogin = () => {
  router.push('/login')
}
const handleToRegister = () => {
  router.push('/login/register')
}
</script>

<style scoped>
/* 定义局部 CSS 变量，方便统一管理颜色 */
.home-page {
  --primary-orange: #ff5000;
  background-color: #f4f4f4;
  min-height: 100vh;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 10px;
}

.side-menu {
  background: #fff;
  border-radius: 8px;
  padding: 10px 0;
  height: 380px;
  box-sizing: border-box;
}

.menu-item {
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  color: #333;
}

.menu-item:hover {
  background-color: #fff1eb;
  color: var(--primary-orange);
}

.home-carousel {
  border-radius: 8px;
  overflow: hidden;
}

.banner-content {
  height: 100%;
  background: linear-gradient(135deg, #ff9000, #ff5000);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 24px;
}

.user-panel {
  background: #fff;
  border-radius: 8px;
  height: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.welcome-text {
  margin: 15px 0;
  font-weight: bold;
}

.auth-btns {
  display: flex;
  gap: 10px;
}

.goods-section {
  margin-top: 30px;
}

.grid-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  padding-left: 5px;
  border-left: 4px solid var(--primary-orange);
}
</style>