<template>
  <!-- 登录页面公共布局 -->
  <div class="login-container">
    <!-- 左侧品牌展示区 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="brand-logo">
        <van-icon name="shopping-cart-o" size="64" color="#fff" />
        </div>
        <h1 class="brand-title">优选商城</h1>
        <p class="brand-desc">品质生活，优选之选</p>
        <div class="brand-features">
          <div class="feature-item">
            <van-icon name="shield" size="24" color="#fff" />
            <span>正品保障</span>
          </div>
          <div class="feature-item">
            <van-icon name="truck" size="24" color="#fff" />
            <span>快速配送</span>
          </div>
          <div class="feature-item">
            <van-icon name="refresh" size="24" color="#fff" />
            <span>7天无理由</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧登录卡片 -->
    <div class="login-card-wrapper">
      <div class="login-card">
        <!-- 二级路由出口 -->
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import  VanIcon  from 'vant'
</script>

<style scoped>
/* 全局容器：淘宝风格布局 */
.login-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100vh;
  background: url('https://neeko-copilot.bytedance.net/api/text_to_image?prompt=modern%20e-commerce%20shopping%20background%20with%20orange%20warm%20colors%20abstract%20pattern%20luxury%20style&image_size=landscape_16_9') no-repeat center center;
  background-size: cover;
  position: relative;
  overflow: hidden;
  padding: 0 300px;
}

/* 橙色遮罩层 - 保持淘宝风格色调 */
.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 102, 0, 0.8) 0%, rgba(255, 68, 0, 0.6) 50%, rgba(230, 57, 0, 0.7) 100%);
  pointer-events: none;
}

/* 装饰圆点 */
.login-container::after {
  content: '';
  position: absolute;
  top: 10%;
  left: 15%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.2); opacity: 0.2; }
}

/* 左侧品牌展示区 */
.brand-section {
  position: absolute;
  left: 180px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
}

.brand-content {
  max-width: 400px;
}

.brand-logo {
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.brand-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 12px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.brand-desc {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
}

.brand-features {
  display: flex;
  gap: 30px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.9;
}

/* 右侧登录卡片容器 */
.login-card-wrapper {
  position: relative;
  z-index: 1;
}

/* 登录卡片 */
.login-card {
  width: 460px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
}

/* Logo区域 */
.logo-wrapper {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff6600 0%, #ff4400 100%);
  border-radius: 50%;
  margin-bottom: 12px;
  box-shadow: 0 8px 25px rgba(255, 68, 0, 0.3);
}

.logo-text {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .brand-section {
    display: none;
  }
  
  .login-container {
    justify-content: center;
    padding: 0 20px;
  }
}

@media (max-width: 450px) {
  .login-card {
    width: 100%;
    padding: 25px;
    margin: 0 15px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
  }
  
  .logo-text {
    font-size: 20px;
  }
}

/* 统一按钮样式 - 淘宝橙色主题 */
:deep(.van-button--primary) {
  background: linear-gradient(135deg, #ff6600 0%, #ff4400 100%);
  border: none;
  border-radius: 12px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(255, 68, 0, 0.3);
  transition: all 0.3s ease;
}

:deep(.van-button--primary:hover) {
  background: linear-gradient(135deg, #ff7700 0%, #ff5500 100%);
  box-shadow: 0 6px 20px rgba(255, 68, 0, 0.4);
  transform: translateY(-1px);
}

:deep(.van-button--primary:active) {
  transform: translateY(1px);
  box-shadow: 0 2px 10px rgba(255, 68, 0, 0.3);
}

:deep(.van-button--primary:disabled) {
  background: #ccc !important;
  box-shadow: none !important;
  transform: none !important;
}

/* 默认按钮样式 */
:deep(.van-button--default) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ff4400;
  color: #ff4400;
  border-radius: 12px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.van-button--default:hover) {
  background: #fff;
  border-color: #ff6600;
}

/* 镂空按钮样式 - 在白色卡片内显示橙色文字 */
:deep(.van-button--plain) {
  background: transparent;
  border: 1px solid #ff4400;
  color: #ff4400;
  border-radius: 12px;
  height: 48px;
  font-size: 16px;
}

:deep(.van-button--plain:hover) {
  background: rgba(255, 68, 0, 0.05);
  border-color: #ff6600;
}

/* 小型按钮样式 */
:deep(.van-button--small) {
  height: 32px;
  padding: 0 15px;
  font-size: 14px;
  border-radius: 8px;
}

/* 表单输入框样式 */
:deep(.van-field) {
  border-radius: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

:deep(.van-field:focus) {
  border-color: #ff4400;
  box-shadow: 0 0 0 3px rgba(255, 68, 0, 0.1);
}
</style>
