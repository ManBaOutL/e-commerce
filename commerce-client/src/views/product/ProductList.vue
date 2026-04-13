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
            :class="{ active: queryParams?.sort_field === option.value }"
            @click="handleSort(option.value)"
          >
            <span>{{ option.label }}</span>
            <el-icon v-if="option.value === 'price'"><CaretBottom /></el-icon>
          </div>
        </div>
      </div>
      <!-- 商品列表 -->
      <ProductPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import FilterTreeItem from './FilterTreeItem.vue'
import { ref, onMounted, reactive, watch } from 'vue'
import { useProductStore } from '@/stores/modules/productStore'
import { CaretBottom } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import type { ProductQueryParams } from '@/api/product/types'

const route = useRoute()
const productStore = useProductStore()

// 排序切换（重置页码）
const handleSort = (value: string) => {
  if (queryParams.sort_field === value) {
    queryParams.sort_order = queryParams.sort_order === 'asc' ? 'desc' : 'asc'
  } else {
    queryParams.sort_field = value as any
    queryParams.sort_order = 'asc'
  }
  // 排序切换后重置为第一页
  queryParams.page = 1
}

// 分页参数
const queryParams = reactive<ProductQueryParams>({
  page: 1,
  pageSize: 10,
  // 1. 基础搜索
  keyword: '',                   // 商品名称模糊搜索
  category_id: undefined,        // 分类 ID 筛选
  shop_id: undefined,            // 店铺 ID 筛选
  status: undefined,             // 商品状态 (如：通过)

  // 2. 价格区间
  minPrice: undefined,           // 最低价
  maxPrice: undefined,           // 最高价

  // 3. 时间区间 (对应 create_time)
  start_time: undefined,         // 开始时间 (YYYY-MM-DD)
  end_time: undefined,           // 结束时间 (YYYY-MM-DD)

  // 4. 排序相关
  // sortField: 排序字段，如 'price', 'create_time', 'stock'
  // sortOrder: 'asc' (升序) 或 'desc' (降序)
  sort_field: undefined,
  sort_order: 'asc'
})

const sortOptions = [
  { label: '综合', value: 'id' },
  { label: '销量', value: 'sales' },
  { label: '价格', value: 'price' },
  { label: '上架时间', value: 'created_time' },
]

// 监听路由参数（分类/关键词筛选）
watch(
  () => route.query,
  (newQuery) => {
    // 这里可扩展分类/关键词筛选逻辑（基于init数据过滤）
    queryParams.category_id = newQuery.category_id ? Number(newQuery.category_id) : undefined
    queryParams.keyword = (newQuery.keyword as string) || ''
    queryParams.page = 1 // 筛选后重置页码
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  // 初始化测试数据
  productStore.init()
  productStore.getCategoryList()
})

</script>

<style scoped>
.search-page {
  background-color: #f4f4f4;
  min-height: 100vh;
}
/* 滚动容器：必须设置高度 + 允许滚动 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
/* 分类筛选卡片 */
.filter-card {
  background: #fff;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
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

</style>