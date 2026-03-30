<template>
  <div class="search-page">
    <TheHeader />

    <div class="container">
      <div class="filter-card">
        <!-- 分类筛选 -->
        <FilterTreeItem :categoryTree="productStore.categoryTree" />
        <!-- 筛选框 -->
        <div class="sort-bar">
          <div 
            v-for="option in sortOptions" 
            :key="option.value"
            class="sort-item"
            :class="{ active: queryParams?._sort === option.value }"
            @click="handleSort(option.value)"
          >
            <span>{{ option.label }}</span>
            <el-icon v-if="option.value === 'price'"><CaretBottom /></el-icon>
          </div>
        </div>
      </div>
      <!-- 商品列表 -->
      <div class="product-grid">
        <el-row :gutter="15">
          <el-col 
            v-for="item in productStore.productList" 
            :key="item.id" 
            :xs="12" :sm="8" :md="6" :lg="4.8"
          >
            <ProductCard 
              :name="item.name" 
              :price="item.price" 
              :image="item.image"
            />
          </el-col>
        </el-row>

        <el-empty v-if="productStore.productList.length === 0" description="暂无相关商品" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FilterTreeItem from './FilterTreeItem.vue'
import { ref, onMounted, reactive, watch } from 'vue'
import { useProductStore } from '@/stores/modules/product'
import { CaretBottom } from '@element-plus/icons-vue'
import {useRoute}from 'vue-router'

const route = useRoute()
const productStore = useProductStore()

// 1. 获取商品 API 支持不同参数 (响应式参数对象)
const queryParams = reactive({
  category_id: undefined as number | undefined,
  keyword: '',    // 关键词
  _sort: 'price',  // 此处json-server排序功能不响应，在后端部分实现
  _page: 1,
  _per_page: 5
})

const sortOptions = [
  { label: '综合', value: 'id' },
  { label: '销量', value: 'sales' },
  { label: '价格', value: 'price' }
]
// 补充：排序点击逻辑
const handleSort = (value: string) => {
  if (queryParams._sort === value && value === 'price') {
    // 如果点击的是价格，切换升降序
    // queryParams._order = queryParams._order === 'asc' ? 'desc' : 'asc';
  } else {
    queryParams._sort = value;
    // queryParams._order = 'asc';
  }
  loadData();
}

// 执行搜索
const loadData = () => {
  // 调用 pinia actions，其内部封装了 reqGetProducts(params)
  productStore.getProductList(queryParams)
}

// 监听路由 query 参数的变化
watch(
  () => route.query,
  (newQuery) => {
    // console.log('路由参数变化了:', newQuery)
    // 1. 同步路由参数到响应式变量 queryParams 中
    // 注意：category_id 是从路由拿的字符串，需要转成 Number
    queryParams.category_id = newQuery.category_id ? Number(newQuery.category_id) : undefined;
    queryParams.keyword = (newQuery.keyword as string) || '';
    
    // 2. 重新请求数据
    loadData();
  },
  
  { deep: true, immediate: true } // immediate 保证初次进入页面也会触发一次 loadData
)

onMounted(() => {
  // 获取分类树
  productStore.getCategoryList()
  // 获取初始商品数据
  loadData()
})
</script>

<style scoped>
.search-page {
  background-color: #f4f4f4;
  min-height: 100vh;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

/* 分类筛选卡片 */
.filter-card {
  background: #fff;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  align-items: flex-start;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-label {
  color: #999;
  font-size: 14px;
  width: 80px;
  padding-top: 5px;
}

/* 排序栏 */
.sort-bar {
  display: flex;
  padding-top: 15px;
  gap: 30px;
}

.sort-item {
  font-size: 14px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.sort-item.active {
  color: #ff5000;
  font-weight: bold;
}

/* 淘宝式 5 列布局 */
@media (min-width: 1200px) {
  .el-col-lg-4-8 {
    width: 20%;
    max-width: 20%;
    flex: 0 0 20%;
  }
}
</style>