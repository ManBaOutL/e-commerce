<template>
<!-- 商品列表 -->
<div class="product-grid">
  <el-row :gutter="15">
    <el-col
      v-for="item in productStore.productList"
      :key="item.id"
      :xs="12"
      :sm="8"
      :md="6"
      :lg="4.8"
    >
      <ProductCard v-bind="item" />
    </el-col>
  </el-row>

  <!-- 加载提示 -->
  <div class="load-tip">
    <span v-if="productStore.loading">加载中...</span>
    <span v-else-if="productStore.finished">已加载全部商品</span>
  </div>
</div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useProductStore } from '@/stores/modules/user/productStore'

const productStore = useProductStore()

// 进入页面 → 重置 page = 1 → 加载第一页（保留当前的筛选参数）
onMounted(() => {
  if (Object.keys(productStore.currentParams).length === 0) {
    productStore.init()
  }
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 滚动到底加载更多
const handleScroll = () => {
  const wh = document.documentElement.clientHeight
  const st = document.documentElement.scrollTop
  const sh = document.documentElement.scrollHeight

  if (st + wh + 100 >= sh) {
    productStore.loadMore()
  }
}
</script>

<style scoped>

/* 加载状态样式 */
.load-status {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 14px;
}
</style>