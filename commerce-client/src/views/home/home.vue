<template>
    <!-- 普通用户首页 -->
  <div class="home-page">
    <!-- 顶部导航栏（核心：含用户中心跳转） -->
    <header class="top-nav">
      <div class="nav-left">
        <!-- logo区：纯色背景+文字 -->
        <div class="logo">平台LOGO</div>
      </div>
      <div class="nav-center">
        <!-- 搜索功能区 -->
        <input type="text" placeholder="搜索功能" class="search-input" />
        <button class="search-btn">搜索</button>
      </div>
      <div class="nav-right">
        <!-- 用户中心按钮（核心跳转） -->
        <button class="user-center-btn" @click="goToUserCenter">
          用户中心
        </button>
      </div>
    </header>

    <!-- 主体内容区（极简结构） -->
    <main class="main-content">
      <!-- 左侧分类栏 -->
      <aside class="category-sidebar">
        <div class="sidebar-title">分类导航区</div>
        <ul class="category-list">
          <li>分类1</li>
          <li>分类2</li>
          <li>分类3</li>
        </ul>
      </aside>

      <!-- 右侧内容区 -->
      <section class="content-area">
        <!-- 轮播区（纯色背景） -->
        <div class="banner">轮播展示区</div>

        <!-- 商品展示区 -->
        <div class="goods-section">
          <div class="section-title">商品展示区</div>
          <div class="goods-list">
            <!-- 商品项：纯色背景+功能描述 -->
            <div class="goods-item">商品卡片1</div>
            <div class="goods-item">商品卡片2</div>
            <div class="goods-item">商品卡片3</div>
          </div>
        </div>

        <!-- 功能模块区 -->
        <div class="function-section">
          <div class="section-title">功能模块区</div>
          <div class="function-list">
            <div class="function-item">功能入口1</div>
            <div class="function-item">功能入口2</div>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部区 -->
    <footer class="footer">底部信息区</footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

// 初始化路由
const router = useRouter();

// 核心功能：跳转到用户中心
const goToUserCenter = () => {
  // 跳转到用户中心路由（需在路由配置中定义 /user 路径）
  // router.push('/user');
  console.log('跳转用户中心前的token:', localStorage.getItem('token'));
  if (localStorage.getItem('token')) {
    //router.push('/user');
    console.log('跳转到用户中心');
  } else {
    router.push('/login');
  }
};
</script>

<style scoped>
/* 全局基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 顶部导航栏 */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
}
.logo {
  width: 80px;
  height: 32px;
  background: #ff6700; /* 纯色背景 */
  color: #fff;
  text-align: center;
  line-height: 32px;
  font-size: 14px;
}
.search-input {
  width: 300px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #e5e5e5;
  outline: none;
}
.search-btn {
  height: 32px;
  padding: 0 12px;
  background: #ff6700;
  color: #fff;
  border: none;
  cursor: pointer;
}
.user-center-btn {
  padding: 6px 12px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 主体内容区 */
.main-content {
  display: flex;
  margin: 16px;
  gap: 16px;
}
/* 左侧分类栏 */
.category-sidebar {
  width: 200px;
  background: #f9f9f9;
  padding: 16px;
}
.sidebar-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}
.category-list {
  list-style: none;
}
.category-list li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

/* 右侧内容区 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
/* 轮播区（纯色背景） */
.banner {
  height: 120px;
  background: #e6f7ff; /* 浅蓝色纯色背景 */
  text-align: center;
  line-height: 120px;
  color: #1890ff;
  font-size: 18px;
}
/* 商品展示区 */
.goods-section, .function-section {
  background: #fafafa;
  padding: 16px;
}
.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}
.goods-list, .function-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.goods-item, .function-item {
  width: 120px;
  height: 120px;
  background: #f0f2f5; /* 浅灰色纯色背景 */
  text-align: center;
  line-height: 120px;
  color: #333;
}

/* 底部区 */
.footer {
  height: 60px;
  background: #f5f5f5;
  text-align: center;
  line-height: 60px;
  color: #666;
  margin-top: 16px;
}
</style>
