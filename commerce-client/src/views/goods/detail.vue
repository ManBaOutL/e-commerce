<template>
  <div class="goods-detail-page">
    <TheHeader />

    <main class="detail-container" v-if="product.id">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ product.category_name }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row :gutter="40" class="goods-info-wrap">
        <el-col :md="10" :sm="24">
          <div class="goods-image-wrap">
            <el-image 
              :src="getFullUrl(currentMainImage || product.main_image)" 
              fit="contain" 
              class="main-image"
              :preview-src-list="allImages.map(img => getFullUrl(img))"
            >
              <template #error><div class="err-txt">图片加载失败</div></template>
            </el-image>
            
            <div class="thumb-list">
              <div 
                v-for="(img, idx) in allImages" :key="idx"
                class="thumb-item"
                :class="{ active: (currentMainImage || product.main_image) === img }"
                @mouseenter="currentMainImage = img"
              >
                <el-image :src="getFullUrl(img)" fit="cover" />
              </div>
            </div>
          </div>
        </el-col>

        <el-col :md="14" :sm="24">
          <div class="goods-detail-info">
            <h1 class="goods-title">{{ product.name }}</h1>
            
            <div class="rate-wrap">
               <el-rate v-model="product.rate" disabled show-score text-color="#ff9900" score-template="{value} 分" />
               <span class="rate-sales-divider">|</span>
               <span class="sales-text">已售 {{ product.sales_count }} 件</span>
            </div>
            
            <p class="goods-intro">{{ product.description }}</p>

            <div class="price-area">
              <div class="price-row">
                <span class="label">抢购价</span>
                <span class="currency">¥</span>
                <span class="price">{{ selectedSku?.price || product.price }}</span>
              </div>
            </div>

            <div class="spec-section">
              <div class="spec-title">选择规格</div>
              <div v-for="(specGroup, groupKey) in product.spec_groups" :key="groupKey" class="spec-row">
                <span class="spec-label">{{ specGroup.name }}：</span>
                <div class="spec-options">
                  <div 
                    v-for="spec in specGroup.options" :key="spec.value"
                    class="spec-item"
                    :class="{ 
                      active: selectedSpecs[groupKey] === spec.value,
                      disabled: !spec.stock_count 
                    }"
                    @click="selectSpec(groupKey, spec.value)"
                  >
                    {{ spec.value }}
                    <span class="spec-stock" v-if="spec.stock_count">库存{{ spec.stock_count }}</span>
                  </div>
                </div>
              </div>
              <div class="spec-selected" v-if="isAllSpecSelected">
                已选：<span v-for="(val, key) in selectedSpecs" :key="key">{{ val }} </span>
              </div>
            </div>

            <div class="action-footer">
              <div class="quantity">
                <span class="spec-label">数量</span>
                <el-input-number 
                  v-model="buyCount" 
                  :min="1" 
                  :max="selectedSku?.stock_count || product.stock_count" 
                  @change="checkQuantity"
                  :disabled="!isAllSpecSelected"
                />
              </div>
              <div class="btns">
                <el-button 
                  type="danger" 
                  size="large" 
                  icon="ShoppingCart" 
                  @click="handleAddToCart"
                  :disabled="!isAllSpecSelected"
                >加入购物车</el-button>
                <el-button 
                  type="danger" 
                  size="large" 
                  icon="StarFilled" 
                  @click="handleAddToFav"
                  :disabled="!isAllSpecSelected"
                >加入收藏夹</el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <div class="bottom-content">
        <el-tabs v-model="activeTab" type="border-card">

          <el-tab-pane label="商品介绍" name="desc">
            <div class="product-desc-wrapper">
              
              <div class="desc-text-section" v-if="product.description">
                <h3 class="desc-head-title">产品概述</h3>
                <p class="desc-content-text">{{ product.description }}</p>
              </div>

              <el-divider border-style="dashed" />

              <div class="detail-imgs" v-if="product.detail_images?.length">
                <el-image 
                  v-for="(img, i) in product.detail_images" 
                  :key="i" 
                  :src="getFullUrl(img)" 
                  lazy 
                  class="article-img"
                />
              </div>
              <el-empty v-else description="暂无图文详情" />
              
            </div>
          </el-tab-pane>

          <el-tab-pane label="规格参数" name="params">
            <div class="params-wrap">
              <el-descriptions title="基本属性" :column="1" border v-if="product.params?.length">
                <el-descriptions-item 
                  v-for="(p, index) in product.params" 
                  :key="index" 
                  :label="p.name"
                >
                  {{ p.value }}
                </el-descriptions-item>
              </el-descriptions>
              <el-empty v-else description="暂无详细参数信息" />
            </div>
          </el-tab-pane>

          <el-tab-pane :label="`商品评价 (${comments.length})`" name="comments">
            <div class="comments-wrap">
              
            <div class="comment-overview">
              <div class="score-box">
                <div class="big-score">{{ product.rate.toFixed(1) }}</div>
                <el-rate v-model="product.rate" disabled text-color="#ff9900" />
              </div>
              <div class="filter-box">
                <el-radio-group v-model="commentFilter" size="small">
                  <el-radio-button value="all">全部 ({{ comments.length }})</el-radio-button>
                  <el-radio-button value="good">好评 ({{ goodComments.length }})</el-radio-button>
                  <el-radio-button value="mid">中评 ({{ midComments.length }})</el-radio-button>
                  <el-radio-button value="bad">差评 ({{ badComments.length }})</el-radio-button>
                  <el-radio-button value="img">有图 ({{ imgComments.length }})</el-radio-button>
                </el-radio-group>
              </div>
            </div>

              <div class="comment-list">
                <div v-for="c in filteredComments" :key="c.id" class="comment-item">
                  <div class="user-info">
                    <el-avatar :size="40" :src="getFullUrl(c.user_avatar)" />
                    <span class="username">{{ c.username }}</span>
                  </div>
                  
                  <div class="comment-content">
                    <div class="comment-meta">
                      <el-rate :model-value="c.score" disabled size="small" />
                      <span class="time">{{ c.created_at }}</span>
                    </div>
                    
                    <p class="text">{{ c.comment_text }}</p>
                    
                    <div class="images" v-if="c.images?.length">
                      <el-image 
                        v-for="(img, i) in c.images" 
                        :key="i" 
                        :src="getFullUrl(img)" 
                        :preview-src-list="c.images.map(img => getFullUrl(img))"
                        fit="cover"
                        class="c-img" 
                      />
                    </div>
                    
                    <div class="merchant-reply" v-if="c.merchant_reply">
                      <span class="reply-label">商家回复：</span>
                      <span>{{ c.merchant_reply }}</span>
                    </div>
                  </div>
                </div>
                <el-empty v-if="filteredComments.length === 0" description="没有符合条件的评价" />
              </div>
            </div>
          </el-tab-pane>

        </el-tabs>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/modules/user/productStore'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

// 使用 Pinia 提取数据
const { currentProduct: product, currentComments: comments } = storeToRefs(productStore)

// 页面基础交互状态
const currentMainImage = ref('')
const selectedSpecs = ref<Record<string, string>>({}) 
const buyCount = ref(1)
const activeTab = ref('desc') // 默认选中图文介绍

// 🌟 评价筛选逻辑
const commentFilter = ref('all')

const goodComments = computed(() => comments.value.filter(c => c.score >= 4))
const midComments = computed(() => comments.value.filter(c => c.score === 3))
const badComments = computed(() => comments.value.filter(c => c.score <= 2))
const imgComments = computed(() => comments.value.filter(c => c.images && c.images.length > 0))

const filteredComments = computed(() => {
  switch (commentFilter.value) {
    case 'good': return goodComments.value;
    case 'mid': return midComments.value;
    case 'bad': return badComments.value;
    case 'img': return imgComments.value;
    default: return comments.value;
  }
})

// 图片路径拼接
const getFullUrl = (imgPath: string) => {
  if (!imgPath) return ''; 
  if (imgPath.startsWith('http') || imgPath.startsWith('data:')) return imgPath;
  const baseURL = import.meta.env.VITE_APP_BASE_API || 'http://127.0.0.1:8888/';
  const safeBaseURL = baseURL.endsWith('/') ? baseURL : baseURL + '/';
  const cleanPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
  return safeBaseURL + cleanPath;
}

const allImages = computed(() => {
  if (!product.value.main_image) return []
  return [product.value.main_image, ...(product.value.sub_images || [])]
})

const isAllSpecSelected = computed(() => {
  if (!product.value.spec_groups || Object.keys(product.value.spec_groups).length === 0) return false;
  return Object.keys(product.value.spec_groups).every(key => !!selectedSpecs.value[key])
})

const getSelectedSkuKey = computed(() => {
  if (!isAllSpecSelected.value) return ''
  return Object.keys(product.value.spec_groups).map(key => selectedSpecs.value[key]).join('|')
})

const selectedSku = computed(() => {
  if (!getSelectedSkuKey.value) return undefined;
  return product.value.sku_list[getSelectedSkuKey.value];
})

const selectSpec = (groupKey: string, specValue: string) => {
  const specOption = product.value.spec_groups[groupKey]?.options.find((opt: any) => opt.value === specValue)
  if (specOption && !specOption.stock_count) return
  selectedSpecs.value = { ...selectedSpecs.value, [groupKey]: specValue }
  if (selectedSku.value?.stock_count === 0) {
    ElMessage.warning('该规格已售罄')
  }
}

const checkQuantity = () => {
  const maxStock = selectedSku.value?.stock_count || product.value.stock_count
  if (buyCount.value > maxStock) {
    buyCount.value = maxStock
    ElMessage.warning(`库存不足，最大可购买${maxStock}件`)
  }
}

const loadProductData = async () => {
  const productId = Number(route.params.id); 
  if (!productId) return;

  await Promise.all([
    productStore.fetchProductDetail(productId),
    productStore.fetchProductComments(productId)
  ]);

  if (!product.value.params || product.value.params.length === 0) {
    product.value.params = [
      { name: '商品名称', value: product.value.name },
      { name: '所属分类', value: product.value.category_name || '通用分类' },
      { name: '商品编号', value: `SPU-${String(product.value.id).padStart(6, '0')}` }, // 补齐6位编号，提升高级感
      { name: '商品毛重', value: '以实际发货为准' },
      { name: '包装清单', value: '原装完整包装' },
      { name: '服务保障', value: '正品保证 · 极速退款 · 七天无理由退换' }
    ];
  }

  // 默认选中第一套有库存的规格
  if (product.value.spec_groups) {
    const defaultSpecs: Record<string, string> = {};
    Object.keys(product.value.spec_groups).forEach(groupKey => {
      const firstValidOption = product.value.spec_groups[groupKey]?.options.find((opt: any) => opt.stock_count > 0);
      if (firstValidOption) defaultSpecs[groupKey] = firstValidOption.value;
    });
    selectedSpecs.value = defaultSpecs;
  }
}

const handleAddToCart = () => {
  if (!isAllSpecSelected.value) return ElMessage.warning('请选择完整的商品规格')
  const targetSkuId = selectedSku.value?.sku_id;
  // console.log('加购', targetSkuId, buyCount.value);
  ElMessage.success('成功加入购物车！');
}
const handleAddToFav = () => {
  if (!isAllSpecSelected.value) return ElMessage.warning('请选择完整的商品规格')
  const targetSkuId = selectedSku.value?.sku_id;
  // console.log('加购', targetSkuId, buyCount.value);
  ElMessage.success('成功加入收藏夹！');
}

const handleGoToComment = () => {
  if (!product.value.id) return;
  
  // 根据路由表，跳转到 /user/orders/comment
  // 通过 query 传参把当前商品的 ID 带过去，方便评价页面知道是在评价哪个商品
  router.push({
    path: '/user/orders/comment',
    query: { product_id: product.value.id }
  });
}
onMounted(() => loadProductData())
onUnmounted(() => productStore.clearCurrentProduct())
</script>

<style scoped>
/* 保持你原本顶部的排版样式不变 */
.detail-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.breadcrumb { margin-bottom: 20px; }
.goods-info-wrap { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.main-image { width: 100%; height: 400px; border: 1px solid #f0f0f0; border-radius: 8px; }
.thumb-list { display: flex; gap: 12px; margin-top: 15px; }
.thumb-item { width: 64px; height: 64px; border: 2px solid transparent; cursor: pointer; transition: 0.3s; }
.thumb-item.active { border-color: #f56c6c; border-radius: 4px; overflow: hidden; }
.thumb-item .el-image { width: 100%; height: 100%; }
.goods-title { font-size: 22px; font-weight: bold; color: #333; margin: 0 0 10px 0; }
.goods-intro { color: #f56c6c; line-height: 1.6; margin-bottom: 20px; font-size: 14px;}
.rate-wrap { display: flex; align-items: center; margin-bottom: 15px; }
.rate-sales-divider { margin: 0 12px; color: #ddd; }
.sales-text { font-size: 13px; color: #999; }
.price-area { background: #fff5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
.price-row { display: flex; align-items: baseline; }
.price-area .label { font-size: 13px; color: #999; margin-right: 10px; }
.price-area .currency { color: #f56c6c; font-size: 18px; font-weight: bold; }
.price-area .price { color: #f56c6c; font-size: 32px; font-weight: bold; margin-right: 15px; }
.spec-section { margin-bottom: 25px; }
.spec-title { font-size: 14px; color: #333; margin-bottom: 15px; font-weight: bold; }
.spec-row { display: flex; flex-wrap: wrap; margin-bottom: 15px; align-items: flex-start; }
.spec-label { width: 60px; color: #999; font-size: 14px; line-height: 32px; }
.spec-options { display: flex; flex-wrap: wrap; gap: 10px; flex: 1; }
.spec-item { height: 32px; line-height: 32px; padding: 0 12px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; transition: all 0.2s; position: relative; }
.spec-item.active { border-color: #f56c6c; color: #f56c6c; background: #fff5f5; }
.spec-item.disabled { color: #ccc; cursor: not-allowed; background: #f9f9f9; }
.spec-stock { font-size: 10px; color: #999; margin-left: 5px; }
.spec-selected { color: #333; font-size: 12px; margin-top: 10px; }
.action-footer { margin-top: 30px; padding-top: 20px; border-top: 1px dashed #eee; }
.quantity { display: flex; align-items: center; margin-bottom: 20px; }
.btns { display: flex; gap: 15px; }

/* 🌟 下半部分 Tab 与评价样式 */
.bottom-content { margin-top: 30px; }
.block-img { width: 100%; display: block; margin-bottom: -5px; } 

.params-wrap { padding: 20px; }
.product-desc-wrapper {
  padding: 30px 40px; 
  max-width: 850px; /* 限制最大宽度，防止大屏下图片宽得离谱 */
  margin: 0 auto; /* 整体居中，营造杂志感 */
}

/* 文字引言区 */
.desc-text-section {
  text-align: center;
  margin-bottom: 30px;
}

.desc-head-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 16px;
  position: relative;
  display: inline-block;
  letter-spacing: 2px;
}

/* 标题底部的一抹品牌色下划线 */
.desc-head-title::after {
  content: '';
  display: block;
  width: 30px;
  height: 3px;
  background: #ff5000;
  margin: 10px auto 0;
  border-radius: 2px;
}

.desc-content-text {
  font-size: 15px;
  color: #666;
  line-height: 1.8;
  text-align: justify;
  text-align-last: center; /* 让最后一行居中对齐 */
}

/* 高级感图片样式 */
.article-img {
  width: 100%;
  display: block;
  border-radius: 8px; /* 柔和的圆角，不再是生硬的直角 */
  margin-bottom: 15px; /* 图片之间留一点点呼吸间距 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03); /* 微弱的弥散阴影 */
}
/* 评价看板区 */
.comments-wrap { padding: 10px 20px; }
.comment-overview { 
  display: flex; 
  align-items: center; 
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}
.score-box { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  margin-right: 40px; 
}
.big-score { 
  font-size: 36px; 
  font-weight: bold; 
  color: #f56c6c; 
  line-height: 1;
  margin-bottom: 8px;
}

/* 评价列表区 */
.comment-item {
  display: flex;
  padding: 24px 0;
  border-bottom: 1px solid #f9f9f9;
}
.user-info {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.username {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}
.comment-content {
  flex: 1;
  padding-left: 20px;
}
.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.time {
  font-size: 12px;
  color: #999;
}
.text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
}
.images {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.c-img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  cursor: zoom-in;
}

/* 商家回复气泡 */
.merchant-reply {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  margin-top: 10px;
}
.reply-label {
  color: #ff5000;
  font-weight: bold;
}
</style>