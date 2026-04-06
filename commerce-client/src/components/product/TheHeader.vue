<template>
  <div class="header-container">
    <div class="container-inner">
      <el-row :gutter="20" align="middle">
        <el-col :sm="4" :xs="0">
          <div class="logo" @click="router.push('/')">MALL</div>
        </el-col>

        <el-col :sm="16" :xs="24">
          <el-input 
            v-model="searchKeyword" 
            placeholder="输入喜欢的宝贝..." 
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </el-col>

        <el-col :sm="4" :xs="0" class="text-right">
          <!-- 购物车 -->
          <el-badge :value="3" class="item">
            <el-button icon="ShoppingCart" circle @click="handleToCart" />
          </el-badge>
          <!-- 用户中心 -->
          <el-button
            icon="User"
            circle
            style="margin-left: 10px"
            @click="handleToUserCenter"
          />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 搜索框输入内容
const searchKeyword = ref('')


// 跳转逻辑
const handleToCart = () => {
  router.push('/cart')
}
const handleToUserCenter = () => {
  router.push('/user')
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
</script>

<style scoped>
.header-container {
  width: 100%;
  padding: 20px 0;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

/* 核心：这个容器不带 el-row 的负 margin 干扰 */
.container-inner {
  max-width: 1200px;
  margin: 0 auto; /* 现在它可以完美居中了 */
  padding: 0 20px; /* 预留呼吸空间 */
}

.logo {
  font-size: 28px;
  color: #ff5000;
  font-weight: bold;
  cursor: pointer;
}

.text-right {
  text-align: right;
}

.search-input :deep(.el-input-group__append) {
  background-color: #ff5000;
  color: white;
  border: none;
}
</style>
