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
          <!-- 商品详情图 -->
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
               <el-rate 
                 :model-value="Number(product.rate || 5)" 
                 disabled 
                 show-score 
                 text-color="#ff9900" 
                 score-template="{value} 分" 
               />
               <span class="rate-sales-divider">|</span>
               <span class="sales-text">已售 {{ product.sales_count || 0 }} 件</span>
            </div>
            
            <p class="goods-intro">{{ product.description }}</p>

            <div class="price-area" :class="{ 'is-flash-sale': hasFlashSale }">
              <div class="flash-banner" v-if="hasFlashSale">
                <div class="flash-title">
                  <el-icon><Timer /></el-icon> 限时秒杀
                </div>
                <div class="flash-countdown">
                  结束时间：{{ formatTime(product.active_campaigns?.flashSale?.end_time as string) }}
                </div>
              </div>

              <div class="price-content">
                <div class="price-row">
                  <span class="label">
                    {{ hasFlashSale ? '秒杀价' : (otherActivities.length > 0 ? '活动价' : '价格') }}
                  </span>
                  <span class="currency">¥</span>
                  <span class="price">{{ displayPrice }}</span>
                  
                  <span class="original-price" v-if="showOriginalPrice">
                    ¥{{ currentUnitPrice }}
                  </span>
                </div>

                <div class="activity-row" v-if="otherActivities.length > 0">
                  <span class="act-label">优惠</span>
                  <div class="act-tags">
                    <span class="act-tag" v-for="act in otherActivities" :key="act.act_id">
                      {{ act.rule }}
                    </span>
                  </div>
                </div>
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
                  icon="Goods" 
                  @click="handleBuyNow"
                  :disabled="!isAllSpecSelected"
                >立即购买</el-button>
                <el-button 
                  type="danger" 
                  size="large" 
                  icon="ShoppingCart" 
                  @click="handleAddToCart"
                  :disabled="!isAllSpecSelected || isInCart"
                >{{ isInCart ? '已在购物车' : '加入购物车' }}</el-button>
                <el-button 
                  :type="isFavorite ? 'warning' : 'danger'" 
                  :plain="isFavorite"
                  size="large" 
                  :icon="isFavorite ? 'StarFilled' : 'Star'" 
                  @click="handleAddToFav"
                  :disabled="!isAllSpecSelected"
                  >
                  {{ isFavorite ? '已收藏' : '加入收藏夹' }}
                </el-button>

              </div>
            </div>
            <!-- 👇 新增：店铺入口名片 -->
            <div class="shop-entry-card" v-if="product.shop_id">
              <div class="shop-info-left">
                <el-avatar :size="48" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                <div class="shop-text">
                  <div class="shop-name">{{ product.shop_name || '官方严选店铺' }}</div>
                  <div class="shop-tags">
                    <el-tag size="small" type="danger" effect="plain">正品保证</el-tag>
                    <span class="shop-rate">综合体验 4.9 分</span>
                  </div>
                </div>
              </div>
              <div class="shop-btn-right">
                <el-button round @click="goToShop(product.shop_id)">进店逛逛</el-button>
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
                <div class="big-score">{{ Number(product.rate || 5).toFixed(1) }}</div>
                <el-rate 
                  :model-value="Number(product.rate || 5)" 
                  disabled 
                  text-color="#ff9900" 
                  size="large"
                />
              </div>
                <div class="filter-box">
                  <el-radio-group v-model="commentFilter" size="small">
                    <el-radio-button value="all">全部 ({{ comments.length }})</el-radio-button>
                    <el-radio-button value="good">好评 ({{ goodComments.length }})</el-radio-button>
                    <el-radio-button value="mid">中评 ({{ midComments.length }})</el-radio-button>
                    <el-radio-button value="bad">差评 ({{ badComments.length }})</el-radio-button>
                    <el-radio-button value="img">有图 ({{ imgComments.length }})</el-radio-button>
                    <el-radio-button value="append">追评 ({{ appendComments.length }})</el-radio-button>
                  </el-radio-group>
                </div>
              </div>

              <div class="comment-list">
                <div v-for="c in filteredComments" :key="c.id" class="comment-item">
                  
                  <div class="user-info">
                    <el-avatar 
                      :size="40" 
                      :src="c.user_avatar ? getFullUrl(c.user_avatar) : 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
                    />
                    <span class="username">{{ c.username || '匿名用户' }}</span>
                  </div>
                  
                  <div class="comment-content">
                    <div class="comment-meta">
                      <el-rate :model-value="c.score" disabled size="small" />
                      <span class="time">{{ c.created_at }}</span>
                    </div>
                    
                    <p class="text">{{ c.comment_text }}</p>
                    
                    <div class="images" v-if="c.images && c.images.length > 0">
                      <el-image 
                        v-for="(img, i) in c.images" 
                        :key="'img_'+i" 
                        :src="getFullUrl(img)" 
                        :preview-src-list="c.images.map(i => getFullUrl(i))"
                        fit="cover"
                        class="c-img"
                        hide-on-click-modal
                      />
                    </div>
                    
                    <div class="merchant-reply" v-if="c.merchant_reply">
                      <span class="reply-label">商家回复：</span>
                      <span>{{ c.merchant_reply }}</span>
                    </div>

                    <div class="append-review" v-if="c.is_appended === 1">
                      <div class="append-header">
                        <span class="append-label">用户追评</span>
                        <span class="append-days" v-if="c.append_days && c.append_days > 0">
                          购买后 {{ c.append_days }} 天追评
                        </span>
                        <span class="append-days" v-else>当天追评</span>
                      </div>
                      
                      <p class="text append-text">{{ c.append_content }}</p>
                      
                      <div class="images" v-if="c.append_images && c.append_images.length > 0">
                        <el-image 
                          v-for="(img, i) in c.append_images" 
                          :key="'app_img_'+i" 
                          :src="getFullUrl(img)" 
                          :preview-src-list="c.append_images.map(i => getFullUrl(i))"
                          fit="cover"
                          class="c-img"
                          hide-on-click-modal
                        />
                      </div>
                    </div>
                    
                  </div>
                </div>
                
                <el-empty v-if="filteredComments.length === 0" description="暂无符合条件的评价" />
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
import { useUserStore } from '@/stores/modules/user/userStore'
import { useCartStore} from '@/stores/modules/user/cartStore'
import getFullUrl from '@/utils/getFullUrl'
// 🌟 引入图标
import { Timer } from '@element-plus/icons-vue'

const productStore = useProductStore()
const userStore = useUserStore()
const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()

// 使用 Pinia 提取数据
const { currentProduct: product, currentComments: comments } = storeToRefs(productStore)

// 页面基础交互状态
const currentMainImage = ref('')
const selectedSpecs = ref<Record<string, string>>({}) 
const buyCount = ref(1)
const activeTab = ref('desc')

// ==========================================
//    增加活动信息相关的计算属性
// ==========================================
// 判断是否有秒杀活动
const hasFlashSale = computed(() => !!product.value.active_campaigns?.flashSale)
// 提取普通优惠活动（满减、折扣）
const otherActivities = computed(() => product.value.active_campaigns?.otherActivities || [])

// 🌟 1. 获取当前商品/SKU的真实底价（未参加活动的原始价格）
const currentUnitPrice = computed(() => {
  return selectedSku.value?.price || product.value.price || 0
})

// 🌟 2. 纯前端动态计费引擎（复刻后端逻辑）
const displayPrice = computed(() => {
  let unitPrice = Number(currentUnitPrice.value)
  let qty = buyCount.value || 1

  // 规则 1：秒杀优先级最高，独占逻辑
  if (hasFlashSale.value) {
    return Number(product.value.active_campaigns!.flashSale!.max_discount_value).toFixed(2)
  }

  // 规则 2：满减核算（动态根据购买数量判断是否达到门槛！）
  const fullReductions = otherActivities.value.filter(a => a.act_type === '满减')
  let totalAmount = unitPrice * qty // 算出当前总金额
  
  fullReductions.forEach(fr => {
    if (totalAmount >= Number(fr.min_amount)) {
      totalAmount -= Number(fr.max_discount_value) // 减去优惠额
    }
  })
  unitPrice = totalAmount / qty // 将减免后的总价重新分摊回单价展示

  // 规则 3：折扣核算
  const discounts = otherActivities.value.filter(a => a.act_type === '折扣')
  discounts.forEach(disc => {
    unitPrice = unitPrice * Number(disc.max_discount_value)
  })

  // 兜底防止负数
  return Math.max(unitPrice, 0.01).toFixed(2)
})

// 🌟 3. 判断是否需要展示划线原价
const showOriginalPrice = computed(() => {
  return Number(displayPrice.value) < Number(currentUnitPrice.value)
})

// 时间格式化小工具（用于展示秒杀结束时间）
const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
// ==========================================

const commentFilter = ref('all')

const goodComments = computed(() => comments.value.filter(c => c.score >= 4))
const midComments = computed(() => comments.value.filter(c => c.score === 3))
const badComments = computed(() => comments.value.filter(c => c.score <= 2))
const imgComments = computed(() => comments.value.filter(c => (c.images && c.images.length > 0) || (c.append_images && c.append_images.length > 0)))
const appendComments = computed(() => comments.value.filter(c => c.is_appended === 1))

const filteredComments = computed(() => {
  switch (commentFilter.value) {
    case 'good': return goodComments.value;
    case 'mid': return midComments.value;
    case 'bad': return badComments.value;
    case 'img': return imgComments.value;
    case 'append': return appendComments.value;
    default: return comments.value;
  }
})

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

const isFavorite = computed(() => {
  const targetSkuId = selectedSku.value?.sku_id;
  if (!targetSkuId || !userStore.favoriteList) return false;
  return userStore.favoriteList.some(item => item.id === targetSkuId);
})

// 检查当前选中SKU是否已在购物车中
const isInCart = computed(() => {
  const targetSkuId = selectedSku.value?.sku_id;
  if (!targetSkuId) return false;
  return cartStore.isInCart(targetSkuId);
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
    productStore.fetchProductComments(productId),
    userStore.fetchFavoriteList()
  ]);

  if (!product.value.params || product.value.params.length === 0) {
    product.value.params = [
      { name: '商品名称', value: product.value.name },
      { name: '所属分类', value: product.value.category_name || '通用分类' },
      { name: '商品编号', value: `SPU-${String(product.value.id).padStart(6, '0')}` }, 
      { name: '服务保障', value: '正品保证 · 极速退款 · 七天无理由退换' }
    ];
  }

  if (product.value.spec_groups) {
    const defaultSpecs: Record<string, string> = {};
    Object.keys(product.value.spec_groups).forEach(groupKey => {
      const firstValidOption = product.value.spec_groups[groupKey]?.options.find((opt: any) => opt.stock_count > 0);
      if (firstValidOption) defaultSpecs[groupKey] = firstValidOption.value;
    });
    selectedSpecs.value = defaultSpecs;
  }
}

const handleBuyNow = () => {
  if (!isAllSpecSelected.value) return ElMessage.warning('请选择完整的商品规格')
  const targetSkuId = selectedSku.value?.sku_id;
  if (!targetSkuId) return;

  router.push({
    path: '/user/orders/order-pay',
    query: {
      buy_type: 'direct',
      product_id: product.value.id,
      sku_id: targetSkuId,
      quantity: buyCount.value,
      // 🌟 传递真正的展示价格
      price: displayPrice.value 
    }
  });
}

const handleAddToCart = async () => {
  if (!isAllSpecSelected.value) return ElMessage.warning('请选择完整的商品规格')
  
  const targetSkuId = selectedSku.value?.sku_id;
  if (!targetSkuId) return;

  await cartStore.addToCart({
    sku_id: targetSkuId,
    quantity: buyCount.value
  });
}

const handleAddToFav = async () => {
  if (!isAllSpecSelected.value) return ElMessage.warning('请选择完整的商品规格')
  
  const targetSkuId = selectedSku.value?.sku_id;
  if (!targetSkuId) return;

  const res = await userStore.toggleFavorite(targetSkuId);
  if (res.success) {
    ElMessage.success(res.is_favorite ? '收藏成功，可在我的收藏查看' : '已取消收藏');
  } else {
    ElMessage.error(res.message || '操作失败');
  }
}
// 跳转到店铺主页
const goToShop = (shopId: number | string) => {
  if (!shopId) return;
  router.push(`/shop/${shopId}`);
}

onMounted(() => loadProductData())
onUnmounted(() => productStore.clearCurrentProduct())
</script>

<style scoped>
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

/* =======================================
   🌟 核心修改 3：价格与活动区域的专属样式
   ======================================= */
.price-area { 
  background: #fff5f5; 
  border-radius: 8px; 
  margin-bottom: 20px; 
  overflow: hidden; 
  transition: all 0.3s;
}

/* 秒杀专属边框 */
.price-area.is-flash-sale {
  background: #fff;
  border: 2px solid #f56c6c;
}

/* 红色渐变条 */
.flash-banner {
  background: linear-gradient(90deg, #ff0036, #ff5000);
  color: #fff;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.flash-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
  font-size: 16px;
  letter-spacing: 1px;
}
.flash-countdown { font-size: 13px; }

.price-content { padding: 20px; }
.price-row { display: flex; align-items: baseline; }
.price-area .label { font-size: 13px; color: #999; margin-right: 10px; }
.price-area.is-flash-sale .label { color: #f56c6c; font-weight: bold; }
.price-area .currency { color: #f56c6c; font-size: 18px; font-weight: bold; }
.price-area .price { color: #f56c6c; font-size: 32px; font-weight: bold; margin-right: 15px; }
.original-price { color: #999; font-size: 14px; text-decoration: line-through; }

/* 促销活动标签行 */
.activity-row {
  display: flex;
  align-items: flex-start;
  margin-top: 15px;
  border-top: 1px dashed #fadcd9;
  padding-top: 15px;
}
.act-label {
  font-size: 13px;
  color: #999;
  margin-right: 15px;
  line-height: 24px;
}
.act-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.act-tag {
  background: #fff1eb;
  color: #ff5000;
  border: 1px solid #ff5000;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}
/* ======================================= */

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

/* 下半部分样式保持不变 */
.bottom-content { margin-top: 30px; }
.block-img { width: 100%; display: block; margin-bottom: -5px; } 

.params-wrap { padding: 20px; }
.product-desc-wrapper {
  padding: 30px 40px; 
  max-width: 850px; 
  margin: 0 auto; 
}
.desc-text-section { text-align: center; margin-bottom: 30px; }
.desc-head-title { font-size: 20px; color: #333; margin-bottom: 16px; position: relative; display: inline-block; letter-spacing: 2px; }
.desc-head-title::after { content: ''; display: block; width: 30px; height: 3px; background: #ff5000; margin: 10px auto 0; border-radius: 2px; }
.desc-content-text { font-size: 15px; color: #666; line-height: 1.8; text-align: justify; text-align-last: center; }
.article-img { width: 100%; display: block; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03); }

.comments-wrap { padding: 10px 20px; }
.comment-overview { display: flex; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #eee; margin-bottom: 20px; }
.score-box { display: flex; flex-direction: column; align-items: center; margin-right: 40px; }
.big-score { font-size: 36px; font-weight: bold; color: #f56c6c; line-height: 1; margin-bottom: 8px; }
.comment-item { display: flex; padding: 24px 0; border-bottom: 1px solid #f9f9f9; }
.user-info { width: 120px; display: flex; flex-direction: column; align-items: center; }
.username { font-size: 12px; color: #666; margin-top: 8px; }
.comment-content { flex: 1; padding-left: 20px; }
.comment-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.time { font-size: 12px; color: #999; }
.text { font-size: 14px; color: #333; line-height: 1.6; margin-bottom: 12px; }
.images { display: flex; gap: 10px; margin-bottom: 12px; }
.c-img { width: 80px; height: 80px; border-radius: 4px; cursor: zoom-in; }
.merchant-reply { background: #f5f5f5; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #555; line-height: 1.5; margin-top: 10px; }
.reply-label { color: #ff5000; font-weight: bold; }
.append-review { margin-top: 16px; padding-top: 16px; border-top: 1px dashed #e4e7ed; }
.append-header { display: flex; align-items: center; margin-bottom: 10px; }
.append-label { color: #ff5000; font-size: 12px; border: 1px solid #ff5000; padding: 1px 6px; border-radius: 10px; margin-right: 10px; }
.append-days { font-size: 12px; color: #999; }
.append-text { color: #555; }
/* 🌟 新增：店铺入口卡片样式 */
.shop-entry-card {
  margin-top: 25px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #f0f0f0;
}
.shop-info-left {
  display: flex;
  align-items: center;
  gap: 15px;
}
.shop-text .shop-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}
.shop-text .shop-tags {
  display: flex;
  align-items: center;
  gap: 10px;
}
.shop-rate {
  font-size: 12px;
  color: #ff5000;
}
.shop-btn-right .el-button {
  border-color: #ff5000;
  color: #ff5000;
}
.shop-btn-right .el-button:hover {
  background: #fff5f5;
}
</style>