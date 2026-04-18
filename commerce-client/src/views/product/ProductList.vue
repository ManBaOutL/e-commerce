<template>
  <div class="search-page">
    <TheHeader />

    <div class="container">
      <div class="filter-card">
        <div class="filter-header">
          <FilterTreeItem :categoryTree="categoryStore.categoryTree" />
          <el-button class="tb-trigger-btn" type="primary" plain @click="drawerVisible = true">
            综合筛选 <el-icon class="el-icon--right"><Filter /></el-icon>
          </el-button>
        </div>
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
            <el-icon v-if="option.value === 'price' && queryParams?.sort_order === 'asc'"><CaretTop /></el-icon>
            <el-icon v-else-if="option.value === 'price' && queryParams?.sort_order === 'desc'"><CaretBottom /></el-icon>
          </div>
        </div>
      </div>
      <!-- 商品列表 -->
      <ProductPage />
    </div>

    <el-drawer
      v-model="drawerVisible"
      title="筛选"
      direction="rtl"
      size="360px"
      class="taobao-drawer"
      :show-close="false"
    >
    <div class="drawer-content">
      <div class="filter-block">
        <div class="block-title">价格区间 (元)</div>
        <div class="price-range">
          <el-input 
            v-model="tempParams.minPrice" 
            type="number" 
            placeholder="最低价" 
            class="pill-input"
          />
          <span class="split-line"></span>
          <el-input 
            v-model="tempParams.maxPrice" 
            type="number" 
            placeholder="最高价" 
            class="pill-input"
          />
        </div>
      </div>

      <div class="filter-block">
        <div class="block-title">全部分类</div>
        <el-cascader
          v-model="tempParams.category_id"
          :options="categoryStore.categoryTree"
          :props="{ label: 'name', value: 'id', checkStrictly: true, emitPath: false }"
          placeholder="请选择分类"
          clearable
          class="tb-cascader"
          popper-class="tb-cascader-popper"
        />
      </div>

      <div class="filter-block">
        <div class="block-title">上架时间</div>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
          class="tb-date-picker"
        />
      </div>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <button class="tb-btn btn-reset" @click="handleReset">重置</button>
        <button class="tb-btn btn-confirm" @click="handleConfirm">确定</button>
      </div>
    </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import FilterTreeItem from './FilterTreeItem.vue'
import { ref, onMounted, reactive, watch } from 'vue'
import { useProductStore } from '@/stores/modules/user/productStore'
import { useCategoryStore } from '@/stores/modules/common/categoryStore'
import { useRoute } from 'vue-router'
import type { ProductQueryParams } from '@/api/product/types'
import { ElMessage } from 'element-plus'

const route = useRoute()
const productStore = useProductStore()
const categoryStore = useCategoryStore()

const drawerVisible = ref(false)
const dateRange = ref<[string, string] | null>(null)

//  临时筛选参数（用于抽屉内修改，不直接触发请求）
const tempParams = reactive({
  minPrice: undefined,
  maxPrice: undefined,
  category_id: undefined,
  start_time: '',
  end_time: ''
})
// 处理日期选择
const handleDateChange = (val: [string, string] | null) => {
  if (val) {
    tempParams.start_time = val[0]
    tempParams.end_time = val[1]
  } else {
    tempParams.start_time = ''
    tempParams.end_time = ''
  }
}

// 重置抽屉内容
const handleReset = () => {
  Object.assign(tempParams, {
    minPrice: undefined,
    maxPrice: undefined,
    category_id: undefined,
    start_time: '',
    end_time: ''
  })
  dateRange.value = null
}

// 确定筛选：将临时参数同步到全局 queryParams
const handleConfirm = () => {
  // 判断最大最小价格是否合法
  if (tempParams.minPrice !== undefined && tempParams.maxPrice !== undefined && tempParams.minPrice > tempParams.maxPrice) {
    tempParams.minPrice = undefined
    tempParams.maxPrice = undefined
    ElMessage.error('最低价不能高于最高价, 请重新输入')
    return
  }
  Object.assign(queryParams, tempParams)
  queryParams.page = 1
  productStore.init({ ...queryParams })
  drawerVisible.value = false
}

// 排序切换（重置页码）
const handleSort = (value: string) => {
  // console.log('排序切换', value)
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

// 1. 专门监听 URL 地址栏（分类、关键词）的变化
watch(
  () => route.query,
  (newQuery) => {
    // 每次 URL 改变，就更新参数并重新发请求
    queryParams.category_id = newQuery.category_id ? Number(newQuery.category_id) : undefined;
    queryParams.keyword = (newQuery.keyword as string) || '';
    queryParams.page = 1;
    
    // 发起带参数的请求
    productStore.init({ ...queryParams });
  },
  { deep: true }
)

// 2. 专门监听排序（综合/价格/销量）的变化
watch(
  [() => queryParams.sort_field, () => queryParams.sort_order],
  () => {
    queryParams.page = 1; // 排序改变也需要重置回第一页
    productStore.init({ ...queryParams });
  }
)

onMounted(() => {
  categoryStore.getCategoryList()
  // 初始化时，主动将 URL 里的参数合入 queryParams 并请求
  queryParams.category_id = route.query.category_id ? Number(route.query.category_id) : undefined;
  queryParams.keyword = (route.query.keyword as string) || '';
  productStore.init({ ...queryParams });
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


.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}
.price-range .el-input-number {
  flex: 1;
}
.drawer-footer {
  color: #ff5000;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
/* 🌟 修改点 2：淘宝风触发按钮 CSS */
.tb-trigger-btn {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 16px;
  border-radius: 16px;
  background-color: #fff2e8; /* 浅橙底色 */
  color: #ff5000; /* 淘宝橙 */
  border: 1px solid #ffcbaf;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-top: 5px;
}

.tb-trigger-btn:hover {
  background-color: #ffedde;
  border-color: #ff5000;
}

.tb-trigger-btn .el-icon {
  margin-left: 4px;
}

:deep(.taobao-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.taobao-drawer .el-drawer__body) {
  background-color: #f7f8fa; 
  padding: 0;
  overflow-y: auto;
}

:deep(.taobao-drawer .el-drawer__footer) {
  padding: 0;
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

.filter-block {
  background-color: #fff;
  padding: 16px 20px;
  margin-bottom: 12px;
}

.block-title {
  font-size: 14px;
  color: #333;
  font-weight: bold;
  margin-bottom: 16px;
}

.price-range {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.split-line {
  width: 12px;
  height: 1px;
  background-color: #ccc;
  margin: 0 10px;
}

/* 价格胶囊输入框 */
:deep(.pill-input .el-input__wrapper) {
  background-color: #f5f5f5;
  border-radius: 20px;
  box-shadow: none !important; 
  padding: 4px 15px;
}

/* 输入框获取焦点时，边框变成淘宝橙 */
:deep(.pill-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #ff5000 inset !important;
  background-color: #fff;
}

:deep(.pill-input .el-input__inner) {
  text-align: center;
  color: #333;
  font-size: 13px;
}

:deep(.tb-cascader .el-input__wrapper),
:deep(.tb-date-picker .el-input__wrapper) {
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: none !important;
}

/* 选择器获取焦点统一使用淘宝橙 */
:deep(.tb-cascader .el-input__wrapper.is-focus),
:deep(.tb-date-picker .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #ff5000 inset !important;
  background-color: #fff;
}

/* 底部操作按钮 */
.drawer-footer {
  display: flex;
  padding: 12px 20px;
  gap: 12px;
  background: #fff;
}

.tb-btn {
  flex: 1;
  height: 40px;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.tb-btn:active {
  opacity: 0.8;
}

.btn-reset {
  background-color: #fff;
  color: #333;
  border: 1px solid #e3e8f0;
}

/* 统一淘宝渐变橙 */
.btn-confirm {
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  color: #fff;
  box-shadow: 0 4px 10px rgba(255, 80, 0, 0.3);
}

:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>