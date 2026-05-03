<template>
  <div class="header-container">
    <div class="container-inner">
      <el-row :gutter="20" align="middle">
        <el-col :sm="5" :xs="0">
          <div class="logo" @click="router.push('/')">MALL</div>
        </el-col>

        <el-col :sm="14" :xs="24">
          <div class="search-wrapper">
            <el-input 
              v-model="searchKeyword" 
              placeholder="输入喜欢的宝贝..." 
              class="search-input"
              size="large"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
              </template>
            </el-input>
          </div>
        </el-col>
        <!-- 一些功能按钮 -->
        <el-col :sm="5" :xs="0" class="text-right">
          <div class="action-icons">
            <el-badge :value="cartCount" :hidden="cartCount === 0" class="badge-item">
              <el-button icon="ShoppingCart" circle class="icon-btn" @click="handleToCart" />
            </el-badge>
            
            <el-badge :value="favoriteCount" :hidden="favoriteCount === 0" class="badge-item">
              <el-button icon="Star" circle class="icon-btn" @click="handleToFav" />
            </el-badge>
            
            <el-button icon="User" circle class="icon-btn" @click="handleToUserCenter" />
            
            <el-button icon="SwitchButton" circle class="icon-btn" @click="handleToLogin" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/modules/user/cartStore'
import { useUserStore } from '@/stores/modules/user/userStore'
import { useLoginStore} from '@/stores/modules/common/loginStore'

const router = useRouter()
const route = useRoute()

// 引入状态库
const cartStore = useCartStore()
const userStore = useUserStore()
const loginStore = useLoginStore()

// 搜索框输入内容
const searchKeyword = ref('')

// 🌟 动态计算购物车和收藏夹的数量
const cartCount = computed(() => cartStore.cartList?.length || 0)
const favoriteCount = computed(() => userStore.favoriteList?.length || 0)

// 跳转逻辑
const handleToCart = () => {
  router.push('/cart')
}
const handleToFav = () => {
  router.push('/favorites')
}
const handleToUserCenter = () => {
  router.push('/user')
}
const handleToLogin = () => {
  loginStore.logout()
}
const handleSearch = () => {
  router.push({
    path: '/product',
    query: {
      ...route.query,
      keyword: searchKeyword.value,
      // 搜索新词时，建议重置分类 ID 
      category_id: undefined 
    }
  })
}

// 🌟 新增：页面加载时主动拉取角标数据
onMounted(() => {
  // 必须判断有没有 token，防止未登录的用户在首页疯狂报错
  if (localStorage.getItem('token')) {
    // 拉取购物车数据
    if (!cartStore.cartList || cartStore.cartList.length === 0) {
      cartStore.fetchCartList()
    }
    // 拉取收藏夹数据
    if (!userStore.favoriteList || userStore.favoriteList.length === 0) {
      userStore.fetchFavoriteList()
    }
  }
})
</script>

<style scoped>
.header-container {
  width: 100%;
  padding: 20px 0;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.container-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo {
  font-size: 28px;
  color: #ff5000;
  font-weight: bold;
  cursor: pointer;
  letter-spacing: 1px;
}

/* ================= 搜索框深度美化 ================= */
.search-wrapper {
  max-width: 560px; /* 限制搜索框的最大宽度，不让它拉得太长 */
  margin: 0 auto;   /* 在 col 内部居中 */
}

/* 改造 Element Plus 默认的方形边框为胶囊圆角，并加上品牌色 */
.search-input :deep(.el-input__wrapper) {
  border-radius: 20px 0 0 20px;
  box-shadow: 0 0 0 2px #ff5000 inset; /* 淘宝同款橙色内边框 */
  padding-left: 15px;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #ff5000 inset; /* 聚焦时保持橙色不变成默认蓝色 */
}

.search-input :deep(.el-input-group__append) {
  border-radius: 0 20px 20px 0;
  background-color: #ff5000;
  color: white;
  border: none;
  box-shadow: 0 0 0 2px #ff5000 inset;
  padding: 0 25px;
}

.search-btn {
  font-size: 15px;
  letter-spacing: 2px;
}
.search-btn:hover {
  background-color: #ff6a00;
}

/* ================= 右侧按钮区域排版 ================= */
.text-right {
  display: flex;
  justify-content: flex-end;
}

.action-icons {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 让 badge 角标位置更合理 */
.badge-item :deep(.el-badge__content.is-fixed) {
  top: 4px;
  right: 12px;
}

/* 统一按钮 Hover 态，提升手感 */
.icon-btn:hover, .badge-item .el-button:hover {
  color: #ff5000;
  border-color: #ff5000;
  background-color: #fff8f5;
}

/* 彻底清除 Element Plus 相邻按钮的自带 margin，把间距控制权全交给 gap */
.action-icons :deep(.el-button) {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* 确保徽标容器不会产生额外的不可见占位 */
.action-icons .badge-item {
  display: flex;
  align-items: center;
}
</style>