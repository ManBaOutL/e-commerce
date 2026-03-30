<template>
  <div class="user-center-page">
    <!-- 顶部导航 -->
    <div class="fixed-breadcrumb">
      <el-breadcrumb separator="/" class="breadcrumb-inner">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
          {{ item.meta.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-row :gutter="20">
      <!-- 左侧导航 -->
      <el-col :span="4">
        <div class="fixed-side-wrapper">
          <el-card shadow="never" class="side-nav-card">
            <div class="user-brief">
              <el-avatar
                :size="60"
                src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
              />
              <p class="username">前端开发爱好者</p>
            </div>
            <el-menu :default-active="$route.path" class="user-menu" router>
              <el-menu-item index="/user/house">
                <el-icon><House /></el-icon>
                <span>我的KK</span>
              </el-menu-item>

              <el-menu-item index="/user/profile">
                <el-icon><User /></el-icon>
                <span>个人资料</span>
              </el-menu-item>

              <el-menu-item index="/user/orders">
                <el-icon><List /></el-icon>
                <span>我的订单</span>
              </el-menu-item>

              <el-menu-item index="/user/coupons">
                <el-icon><Ticket /></el-icon>
                <span>我的优惠券</span>
              </el-menu-item>

              <el-menu-item index="/user/address">
                <el-icon><Location /></el-icon>
                <span>收货地址</span>
              </el-menu-item>

              <el-menu-item index="/user/security">
                <el-icon><Setting /></el-icon>
                <span>账号安全</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </div>
      </el-col>

      <!-- 右侧内容 -->
      <el-col :span="20">
        <router-view></router-view>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
const $route = useRoute()
// 计算属性：过滤出所有配置了 meta.title 的路由记录
const breadcrumbs = computed(() => {
  return $route.matched.filter((item) => item.meta && item.meta.title)
})
</script>

<style scoped>
.user-center-page {
  padding-top: 80px; /* 为固定的面包屑留出空间 */
  background-color: white;
  min-height: 100vh;
}

/* 面包屑固定在顶部 */
.fixed-breadcrumb {
  position: fixed;
  top: 0;
  left: 20px;
  width: 100%; /* 匹配 page-container 的宽度 */
  height: 80px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  z-index: 10;
}
.breadcrumb-inner {
  font-size: 20px;
}

.main-body {
  margin-top: 10px;
}

/* 左侧导航固定 */
.fixed-side-wrapper {
  position: sticky; /* 使用 sticky 比 fixed 在格栅系统中更友好 */
  top: 60px; /* 距离视口顶部的距离，等于面包屑高度 + 间距 */
  height: calc(100vh - 80px); /* 占据屏幕剩余高度 */
}

.side-nav-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.user-brief {
  text-align: center;
  padding: 30px 0;
  border-bottom: 1px solid #f0f0f0;
}
.user-menu {
  flex: 1;
  border-right: none !important;
  overflow-y: auto; /* 如果菜单项过多，菜单内部可滚动 */
}
</style>
