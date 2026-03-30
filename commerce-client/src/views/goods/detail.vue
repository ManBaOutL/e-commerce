<template>
  <div class="goods-detail-page">
    <!-- 头部复用公共组件 -->
    <TheHeader />

    <main class="detail-container">
      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>智能穿戴设备</el-breadcrumb-item>
        <el-breadcrumb-item>商品详情</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 商品核心信息区 -->
      <el-row :gutter="20" class="goods-info-wrap">
        <!-- 左侧商品图片 -->
        <el-col :md="10" :sm="24">
          <div class="goods-image-wrap">
            <!-- 主图 -->
            <el-image 
              :src="goodsMainImage" 
              fit="contain" 
              class="main-image"
              preview-src-list="[goodsMainImage, ...goodsSubImages]"
            >
              <template #error><div class="err-txt">暂无商品图片</div></template>
            </el-image>
            <!-- 缩略图列表 -->
            <div class="thumb-list">
              <div 
                v-for="(img, idx) in [goodsMainImage, ...goodsSubImages]" 
                :key="idx"
                class="thumb-item"
                :class="{ active: activeThumb === idx }"
                @click="activeThumb = idx"
              >
                <el-image :src="img" fit="cover" />
              </div>
            </div>
          </div>
        </el-col>

        <!-- 右侧商品信息 -->
        <el-col :md="14" :sm="24">
          <div class="goods-info">
            <h1 class="goods-title">{{ goodsInfo.name }}</h1>
            
            <!-- 价格区域 -->
            <div class="price-area">
              <span class="label">到手价：</span>
              <span class="price">¥{{ goodsInfo.price }}</span>
              <span class="original-price">¥{{ goodsInfo.originalPrice }}</span>
            </div>

            <!-- 销量/库存信息 -->
            <div class="sales-stock">
              <span>销量：{{ goodsInfo.sales }}+</span>
              <span>库存：{{ goodsInfo.stock }}件</span>
            </div>

            <!-- 规格选择 -->
            <div class="spec-area">
              <div class="spec-label">选择规格：</div>
              <div class="spec-list">
                <el-button 
                  v-for="spec in goodsSpecs" 
                  :key="spec.id"
                  :class="{ active: selectedSpec === spec.id }"
                  plain
                  @click="selectedSpec = spec.id"
                >
                  {{ spec.name }}
                </el-button>
              </div>
            </div>

            <!-- 购买数量 -->
            <div class="count-area">
              <div class="count-label">购买数量：</div>
              <el-input-number 
                v-model="buyCount" 
                :min="1" 
                :max="goodsInfo.stock" 
                size="small"
              />
            </div>

            <!-- 操作按钮 -->
            <div class="operate-btns">
              <el-button 
                type="primary" 
                size="large" 
                class="add-cart-btn"
                @click="handleAddCart"
              >
                <el-icon><ShoppingCart /></el-icon>
                加入购物车
              </el-button>
              <el-button 
                size="large" 
                class="buy-now-btn"
                @click="handleBuyNow"
              >
                立即购买
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 商品详情标签页 -->
      <el-tabs class="goods-tabs" v-model="activeTab">
        <el-tab-pane label="商品详情" name="detail">
          <div class="detail-content">
            <h3>当前商品ID：{{ goodsId }}</h3>
            <el-image 
              v-for="descImg in goodsDescImages" 
              :key="descImg"
              :src="descImg" 
              fit="contain" 
              class="desc-image"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="规格参数" name="params">
          <el-table :data="goodsParams" border class="params-table">
            <el-table-column prop="name" label="参数名称" width="180" />
            <el-table-column prop="value" label="参数值" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="用户评价" name="comments">
          <div class="comments-empty">
            <el-empty description="暂无评价" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TheHeader from '@/components/product/TheHeader.vue'
import { ShoppingCart } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted } from 'vue'

const router = useRouter()
const route = useRoute()   

// 模拟商品数据
const goodsMainImage = 'https://picsum.photos/800/800?random=1'
const goodsSubImages = [
  'https://picsum.photos/800/800?random=2',
  'https://picsum.photos/800/800?random=3',
  'https://picsum.photos/800/800?random=4'
]
const goodsInfo = ref({
  name: '2026新款 智能穿戴设备 极客系列第5代',
  price: '1299.00',
  originalPrice: '1599.00',
  sales: 2358,
  stock: 189
})
const goodsSpecs = ref([
  { id: 1, name: '黑色 | 46mm' },
  { id: 2, name: '白色 | 46mm' },
  { id: 3, name: '黑色 | 42mm' },
  { id: 4, name: '白色 | 42mm' }
])
const goodsParams = ref([
  { name: '品牌', value: '极客系列' },
  { name: '型号', value: 'GEEK-2026' },
  { name: '尺寸', value: '46mm/42mm' },
  { name: '续航', value: '7天续航' },
  { name: '防水', value: '50米防水' },
  { name: '连接方式', value: '蓝牙5.3' }
])
const goodsDescImages = [
  'https://picsum.photos/1200/600?random=5',
  'https://picsum.photos/1200/600?random=6'
]

// 响应式数据
const activeThumb = ref(0) // 选中的缩略图索引
const selectedSpec = ref(1) // 选中的规格ID
const buyCount = ref(1) // 购买数量
const goodsId = ref(0) // 商品ID

// 加入购物车
const handleAddCart = () => {
  ElMessage.success('加入购物车成功')
}

// 立即购买
const handleBuyNow = () => {
  if (!selectedSpec) {
    ElMessage.warning('请选择商品规格')
    return
  }
  const buyGoods = {
    ...goodsInfo.value,
    spec: selectedSpec.value,
    count: buyCount.value
  }
  console.log(buyGoods)
  router.push({
    path: `/buy`,
    state: {
      goods: buyGoods // 整个商品对象直接传，不拼 URL
    }
  })
}

// 标签页激活项
const activeTab = ref('detail')

onMounted(() => {
  console.log(route.params.id)
  // 👇 获取路由上的 id
  goodsId.value = route.params.id
  console.log('当前商品ID：', goodsId.value)
  
  // 在这里可以根据ID请求商品数据、渲染页面
  //getGoodsDetail(goodsId.value)
})
</script>

<style scoped>
.goods-detail-page {
  --primary-orange: #ff5000;
  background-color: #f4f4f4;
  min-height: 100vh;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 10px;
}

/* 面包屑 */
.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

/* 商品信息外层 */
.goods-info-wrap {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

/* 左侧图片区 */
.goods-image-wrap {
  width: 100%;
}

.main-image {
  width: 100%;
  height: 400px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.thumb-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.thumb-item {
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
}

.thumb-item.active {
  border-color: var(--primary-orange);
}

.err-txt {
  color: #999;
  font-size: 14px;
}

/* 右侧商品信息 */
.goods-info {
  padding: 10px 0;
}

.goods-title {
  font-size: 20px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 20px;
}

/* 价格区域 */
.price-area {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.price-area .label {
  font-size: 14px;
  color: #666;
}

.price-area .price {
  font-size: 28px;
  color: var(--primary-orange);
  font-weight: bold;
  margin: 0 10px;
}

.price-area .original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

/* 销量库存 */
.sales-stock {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

/* 规格选择 */
.spec-area {
  margin-bottom: 20px;
}

.spec-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
}

.spec-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-list .el-button {
  padding: 8px 15px;
}

.spec-list .el-button.active {
  background-color: #fff1eb;
  border-color: var(--primary-orange);
  color: var(--primary-orange);
}

/* 购买数量 */
.count-area {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.count-label {
  font-size: 14px;
  color: #333;
  margin-right: 10px;
}

/* 操作按钮 */
.operate-btns {
  display: flex;
  gap: 15px;
}

.add-cart-btn {
  background-color: var(--primary-orange);
  border-color: var(--primary-orange);
  width: 180px;
}

.buy-now-btn {
  border-color: var(--primary-orange);
  color: var(--primary-orange);
  width: 180px;
}

/* 商品标签页 */
.goods-tabs {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.desc-image {
  width: 100%;
  margin-bottom: 10px;
  border-radius: 4px;
}

.params-table {
  width: 100%;
  --el-table-row-hover-bg-color: #fff1eb;
}

.comments-empty {
  padding: 40px 0;
  text-align: center;
}
</style>