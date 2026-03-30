<template>
    <!-- 登录页面公共布局 -->
  <div class="login-container">
    <div class="login-card">
      <!-- 二级路由出口 -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
/* 全局容器：居中显示 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #409eff;
}

/* 登录卡片 */
.login-card {
  width: 400px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>