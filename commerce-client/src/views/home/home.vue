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
          <el-carousel height="380px" class="home-carousel" trigger="click">
            <el-carousel-item v-for="item in bannerList" :key="item.id">
              <div class="banner-wrapper" @click="handleBannerClick(item.link)">
                <img :src="item.image" :alt="item.title" class="banner-img" />
              </div>
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
        <h3 class="grid-title">猜你喜欢</h3>
           <ProductPage />
      </section>
    </main>
  </div>
</template>

<script setup>
import {useRouter} from 'vue-router'
import HomeMenu from './HomeMenu.vue'

// 🌟 核心：在 Vite/Vue3 中静态图片必须显式 import 进来
import banner1 from '@/assets/images/banners/1.png'
import banner2 from '@/assets/images/banners/2.png'
import banner3 from '@/assets/images/banners/3.png'

const router = useRouter()

// 定义轮播图数据数组
const bannerList = [
  { id: 1, image: banner1, title: '双十一大促', link: '/product?category_id=1' },
  { id: 2, image: banner2, title: '数码家电上新', link: '/product?category_id=2' },
  { id: 3, image: banner3, title: '秋冬服装焕新', link: '/product' }
]

// 点击轮播图跳转
const handleBannerClick = (link) => {
  if (link) {
    router.push(link)
  }
}

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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* 加点阴影更高级 */
}

/* 🌟 轮播图图片专属样式 */
.banner-wrapper {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证图片铺满且不被拉伸变形 */
  transition: transform 0.3s ease;
}

.banner-wrapper:hover .banner-img {
  transform: scale(1.02); /* 鼠标放上去微微放大，提升点击欲 */
}

/* 覆盖 Element Plus 默认的指示器(小圆点)样式，模仿淘宝 */
:deep(.el-carousel__indicator.is-active button) {
  background-color: var(--primary-orange);
  width: 20px;
  border-radius: 10px;
}
:deep(.el-carousel__button) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
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

:deep(.product-card) {
  cursor: pointer;
}
</style>