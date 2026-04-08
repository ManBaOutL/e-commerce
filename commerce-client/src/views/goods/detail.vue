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
              :src="currentMainImage || product.main_image" 
              fit="contain" 
              class="main-image"
              :preview-src-list="allImages"
            />
            <div class="thumb-list">
              <div 
                v-for="(img, idx) in allImages" :key="idx"
                class="thumb-item"
                :class="{ active: (currentMainImage || product.main_image) === img }"
                @mouseenter="currentMainImage = img"
              >
                <el-image :src="img" fit="cover" />
              </div>
            </div>
          </div>
        </el-col>

        <el-col :md="14" :sm="24">
          <div class="goods-detail-info">
            <h1 class="goods-title">{{ product.name }}</h1>
            <p class="goods-intro">{{ product.description }}</p>

            <!-- 价格区域（联动选中的SKU） -->
            <div class="price-area">
              <div class="price-row">
                <span class="label">抢购价</span>
                <span class="currency">¥</span>
                <span class="price">{{ selectedSku.price || product.price }}</span>
                <span class="old-price">¥{{ selectedSku.original_price || product.original_price }}</span>
              </div>
              <div class="promo-tag" v-if="product.coupon_threshold">
                领券满{{ product.coupon_threshold }}减{{ product.coupon_value }}
              </div>
            </div>

            <!-- 销量/库存/好评度（联动SKU库存） -->
            <div class="sales-bar">
              <div class="item">销量 <span>{{ product.sales_count }}</span></div>
              <div class="item">好评度 <span>{{ product.positive_rate }}%</span></div>
              <div class="item">库存 
                <span :class="{ 'text-danger': (selectedSku.stock_count || product.stock_count) < 10 }">
                  {{ selectedSku.stock_count || product.stock_count }}
                </span>
              </div>
            </div>

            <!-- SKU规格选择区（淘宝风格） -->
            <div class="spec-section">
              <!-- 规格标题 -->
              <div class="spec-title">选择规格</div>
              
              <!-- 多规格循环（颜色/版本/尺寸等） -->
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

              <!-- SKU选中提示 -->
              <div class="spec-tip" v-if="!isAllSpecSelected">
                <i class="el-icon-warning"></i> 请选择完整规格
              </div>
              <div class="spec-selected" v-else>
                已选：<span v-for="(val, key) in selectedSpecs" :key="key">{{ product.spec_groups[key].name }}:{{ val }} </span>
              </div>
            </div>

            <!-- 购买区域 -->
            <div class="action-footer">
              <div class="quantity">
                <span class="spec-label">数量</span>
                <el-input-number 
                  v-model="buyCount" 
                  :min="1" 
                  :max="selectedSku.stock_count || product.stock_count" 
                  @change="checkQuantity"
                  :disabled="!isAllSpecSelected"
                />
              </div>
              <div class="btns">
                <el-button 
                  type="danger" 
                  size="large" 
                  plain 
                  @click="handleBuyNow"
                  :disabled="!isAllSpecSelected"
                >立即购买</el-button>
                <el-button 
                  type="danger" 
                  size="large" 
                  icon="ShoppingCart" 
                  @click="handleAddToCart"
                  :disabled="!isAllSpecSelected"
                >加入购物车</el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 底部详情（新增SKU详情/商品参数） -->
      <div class="bottom-content">
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 商品详情 -->
          <el-tab-pane label="详情描述" name="desc">
            <div class="rich-text" v-html="product.content_html"></div>
            <div class="detail-imgs">
              <el-image v-for="(img, i) in product.detail_images" :key="i" :src="img" lazy />
            </div>
          </el-tab-pane>

          <!-- 商品参数（淘宝风格） -->
          <el-tab-pane label="商品参数" name="params">
            <div class="params-table">
              <table>
                <colgroup>
                  <col width="150">
                  <col width="auto">
                </colgroup>
                <tbody>
                  <tr v-for="(param, key) in product.params" :key="key">
                    <td class="param-label">{{ param.name }}</td>
                    <td class="param-value">{{ param.value }}</td>
                  </tr>
                  <!-- SKU参数补充 -->
                  <tr v-if="isAllSpecSelected">
                    <td class="param-label">选中规格价格</td>
                    <td class="param-value">¥{{ selectedSku.price }}</td>
                  </tr>
                  <tr v-if="isAllSpecSelected">
                    <td class="param-label">选中规格库存</td>
                    <td class="param-value">{{ selectedSku.stock_count }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-tab-pane>

          <!-- 评价区 -->
          <el-tab-pane name="reviews">
            <template #label>
              累计评价 <span class="badge">{{ commentStats.total }}</span>
            </template>
            
            <div class="review-filter">
              <el-radio-group v-model="currentFilter" size="small">
                <el-radio-button value="all">全部 ({{ commentStats.total }})</el-radio-button>
                <el-radio-button value="good">好评 ({{ commentStats.good }})</el-radio-button>
                <el-radio-button value="bad">差评 ({{ commentStats.bad }})</el-radio-button>
                <el-radio-button value="image">有图 ({{ commentStats.withImage }})</el-radio-button>
              </el-radio-group>
            </div>

            <div class="comment-list">
              <div v-for="item in filteredComments" :key="item.id" class="comment-card">
                <div class="u-info">
                  <el-avatar :size="40" :src="item.user_avatar">{{ item.username[0] }}</el-avatar>
                  <span class="u-name">{{ item.username }}</span>
                </div>
                <div class="c-content">
                  <div class="c-meta">
                    <el-rate v-model="item.score" disabled />
                    <span class="c-time">{{ item.created_at }}</span>
                  </div>
                  <p class="c-text">{{ item.comment_text }}</p>
                  <div class="c-imgs" v-if="item.images?.length">
                    <el-image 
                      v-for="(img, idx) in item.images" :key="idx"
                      :src="img" :preview-src-list="item.images"
                      class="mini-img"
                    />
                  </div>
                  <div class="append-wrap" v-if="item.append_comment">
                    <div class="append-title">用户 {{ item.append_days }} 天后追评：</div>
                    <p class="append-text">{{ item.append_comment }}</p>
                  </div>
                  <div class="reply-box" v-if="item.merchant_reply">
                    <span class="reply-tag">卖家回复：</span>{{ item.merchant_reply }}
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </main>
    
    <el-skeleton v-else :rows="10" animated style="padding: 40px" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 1. 商品数据模型（对齐后端API，新增SKU相关字段）
const product = ref({
  id: null,
  name: '',
  description: '',
  price: 0,          // 默认价格（无规格时）
  original_price: 0, // 默认原价
  stock_count: 0,    // 默认库存
  sales_count: 0,
  positive_rate: 0,
  main_image: '',
  sub_images: [],
  detail_images: [],
  category_name: '',
  content_html: '',
  coupon_value: 0,
  coupon_threshold: 0,
  // 新增：规格组（多规格，如颜色/版本/尺寸）
  spec_groups: {
    color: { name: '颜色', options: [] },
    version: { name: '版本', options: [] }
  },
  // 新增：SKU列表（key为规格组合如"星空黑|标准版"，value为SKU详情）
  sku_list: {},
  // 新增：商品参数（淘宝风格）
  params: [
    { name: '品牌', value: '' },
    { name: '型号', value: '' },
    { name: '上市时间', value: '' },
    { name: '售后服务', value: '' }
  ]
})

// 响应式数据
const currentMainImage = ref('')
const selectedSpecs = ref({}) // 选中的规格 {color: '星空黑', version: '标准版'}
const buyCount = ref(1)
const activeTab = ref('desc')
const currentFilter = ref('all')

// 合并主图和副图
const allImages = computed(() => {
  if (!product.value.main_image) return []
  return [product.value.main_image, ...product.value.sub_images]
})

// 检查是否选完所有规格
const isAllSpecSelected = computed(() => {
  const specKeys = Object.keys(product.value.spec_groups)
  return specKeys.every(key => !!selectedSpecs.value[key])
})

// 生成选中规格的SKU key（如"星空黑|标准版"）
const getSelectedSkuKey = computed(() => {
  if (!isAllSpecSelected.value) return ''
  const specKeys = Object.keys(product.value.spec_groups)
  return specKeys.map(key => selectedSpecs.value[key]).join('|')
})

// 获取选中的SKU详情
const selectedSku = computed(() => {
  if (!getSelectedSkuKey.value) return {}
  return product.value.sku_list[getSelectedSkuKey.value] || {}
})

// 规格选择方法
const selectSpec = (groupKey, specValue) => {
  // 禁用规格不可选
  const specOption = product.value.spec_groups[groupKey].options.find(opt => opt.value === specValue)
  if (specOption && !specOption.stock_count) return

  // 更新选中规格
  selectedSpecs.value = {
    ...selectedSpecs.value,
    [groupKey]: specValue
  }

  // 库存不足提示
  if (selectedSku.value.stock_count === 0) {
    ElMessage.warning('该规格已售罄')
  }
}

// 数量校验
const checkQuantity = () => {
  const maxStock = selectedSku.value.stock_count || product.value.stock_count
  if (buyCount.value > maxStock) {
    buyCount.value = maxStock
    ElMessage.warning(`库存不足，最大可购买${maxStock}件`)
  }
}

// 2. 模拟API数据加载（完全对齐后端返回格式）
const loadProductData = () => {
  const res = {
    id: 1001,
    name: '2026款 极客大师降噪耳机 Gen3',
    description: '采用自研 AI 降噪芯片，60小时超长续航，支持高保真无损音质。',
    price: 899.00,          // 默认价格
    original_price: 1299.00,
    stock_count: 56,        // 默认库存
    sales_count: 1280,
    positive_rate: 98,
    main_image: 'https://picsum.photos/400/400?random=1',
    sub_images: ['https://picsum.photos/400/400?random=2', 'https://picsum.photos/400/400?random=3'],
    detail_images: ['https://picsum.photos/800/1000?random=4', 'https://picsum.photos/800/1000?random=5'],
    category_name: '智能数码',
    content_html: '<p>这款耳机代表了当前的最高音频水准...</p>',
    coupon_value: 50,
    coupon_threshold: 500,
    // 规格组（多规格配置）
    spec_groups: {
      color: {
        name: '颜色',
        options: [
          { value: '星空黑', stock_count: 20 },
          { value: '珍珠白', stock_count: 15 },
          { value: '极光蓝', stock_count: 0 } // 无库存
        ]
      },
      version: {
        name: '版本',
        options: [
          { value: '标准版', stock_count: 30 },
          { value: 'Pro版', stock_count: 5 }
        ]
      }
    },
    // SKU列表（规格组合 -> 价格/库存）
    sku_list: {
      '星空黑|标准版': { price: 899, original_price: 1299, stock_count: 18 },
      '星空黑|Pro版': { price: 1299, original_price: 1699, stock_count: 2 },
      '珍珠白|标准版': { price: 919, original_price: 1399, stock_count: 14 },
      '珍珠白|Pro版': { price: 1319, original_price: 1799, stock_count: 1 },
      '极光蓝|标准版': { price: 899, original_price: 1299, stock_count: 0 },
      '极光蓝|Pro版': { price: 1299, original_price: 1699, stock_count: 0 }
    },
    // 商品参数
    params: [
      { name: '品牌', value: '极客大师' },
      { name: '型号', value: 'Gen3' },
      { name: '上市时间', value: '2026年' },
      { name: '售后服务', value: '全国联保1年' },
      { name: '降噪深度', value: '45dB' },
      { name: '续航时间', value: '60小时' },
      { name: '连接方式', value: '蓝牙5.4' }
    ]
  }
  product.value = res
  
  // 默认选中第一个可选规格
  const defaultSpecs = {}
  Object.keys(res.spec_groups).forEach(groupKey => {
    const firstValidOption = res.spec_groups[groupKey].options.find(opt => opt.stock_count)
    if (firstValidOption) {
      defaultSpecs[groupKey] = firstValidOption.value
    }
  })
  selectedSpecs.value = defaultSpecs
}

// 3. 评价数据（原有逻辑不变）
const comments = ref([
  {
    id: 1, username: '技术宅小王', user_avatar: '', score: 5, 
    created_at: '2026-03-15 10:20', comment_text: '降噪效果非常惊人，在地铁上安静得像在图书馆。',
    images: ['https://picsum.photos/200/200?random=10'],
    append_comment: '用了一个星期了，佩戴感依然很舒服，不夹耳朵。',
    append_days: 7,
    merchant_reply: '感谢您的支持，极客大师为您服务！'
  },
  {
    id: 2, username: '购物狂人', user_avatar: '', score: 2, 
    created_at: '2026-03-18 14:05', comment_text: '物流有点慢，盒子角撞扁了。',
    images: [],
    merchant_reply: '抱歉给您带来不好的物流体验，我们会加强包装。'
  }
])

const commentStats = computed(() => ({
  total: comments.value.length,
  good: comments.value.filter(c => c.score >= 4).length,
  bad: comments.value.filter(c => c.score <= 2).length,
  withImage: comments.value.filter(c => c.images.length > 0).length
}))

const filteredComments = computed(() => {
  const list = comments.value
  switch (currentFilter.value) {
    case 'good': return list.filter(c => c.score >= 4)
    case 'bad': return list.filter(c => c.score <= 2)
    case 'image': return list.filter(c => c.images.length > 0)
    default: return list
  }
})

// 购物车/购买逻辑（增强规格校验）
const handleAddToCart = () => {
  if (!isAllSpecSelected.value) {
    return ElMessage.warning('请选择完整的商品规格')
  }
  ElMessage.success(`已加入购物车：${Object.values(selectedSpecs.value).join(' ')} x ${buyCount.value}`)
}

const handleBuyNow = () => {
  if (!isAllSpecSelected.value) {
    return ElMessage.warning('请选择完整的商品规格')
  }
  ElMessage.warning(`跳转结算页：${Object.values(selectedSpecs.value).join(' ')} x ${buyCount.value}`)
}

onMounted(loadProductData)
</script>

<style scoped>
.detail-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.breadcrumb { margin-bottom: 20px; }

/* 头部信息区 */
.goods-info-wrap { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.main-image { width: 100%; height: 400px; border: 1px solid #f0f0f0; border-radius: 8px; }
.thumb-list { display: flex; gap: 12px; margin-top: 15px; }
.thumb-item { width: 64px; height: 64px; border: 2px solid transparent; cursor: pointer; transition: 0.3s; }
.thumb-item.active { border-color: #f56c6c; border-radius: 4px; overflow: hidden; }
.thumb-item .el-image { width: 100%; height: 100%; }

.goods-title { font-size: 26px; font-weight: bold; color: #333; margin: 0 0 10px 0; }
.goods-intro { color: #f56c6c; line-height: 1.6; margin-bottom: 20px; }

.price-area { background: #fff5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
.price-row { display: flex; align-items: baseline; }
.price-area .label { font-size: 13px; color: #999; margin-right: 10px; }
.price-area .currency { color: #f56c6c; font-size: 18px; font-weight: bold; }
.price-area .price { color: #f56c6c; font-size: 32px; font-weight: bold; margin-right: 15px; }
.price-area .old-price { text-decoration: line-through; color: #bbb; font-size: 14px; }
.promo-tag { display: inline-block; background: #f56c6c; color: #fff; font-size: 12px; padding: 2px 8px; border-radius: 4px; margin-top: 8px; }

.sales-bar { display: flex; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; padding: 12px 0; margin-bottom: 25px; }
.sales-bar .item { flex: 1; text-align: center; border-right: 1px solid #eee; font-size: 13px; color: #999; }
.sales-bar .item:last-child { border: none; }
.sales-bar .item span { color: #333; font-weight: bold; margin-left: 4px; }
.text-danger { color: #f56c6c; }

/* SKU规格样式（淘宝风格） */
.spec-section { margin-bottom: 25px; }
.spec-title { font-size: 14px; color: #333; margin-bottom: 15px; font-weight: bold; }
.spec-row { display: flex; flex-wrap: wrap; margin-bottom: 15px; align-items: flex-start; }
.spec-label { width: 60px; color: #999; font-size: 14px; line-height: 32px; }
.spec-options { display: flex; flex-wrap: wrap; gap: 10px; flex: 1; }
.spec-item { 
  height: 32px; 
  line-height: 32px;
  padding: 0 12px; 
  border: 1px solid #ccc; 
  border-radius: 4px; 
  cursor: pointer; 
  transition: all 0.2s;
  position: relative;
}
.spec-item.active { 
  border-color: #f56c6c; 
  color: #f56c6c; 
  background: #fff5f5;
}
.spec-item.disabled { 
  color: #ccc; 
  cursor: not-allowed; 
  background: #f9f9f9;
}
.spec-item.disabled::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: #ccc;
  transform: rotate(-15deg);
}
.spec-stock { 
  font-size: 10px; 
  color: #999; 
  margin-left: 5px;
}
.spec-tip { 
  color: #f56c6c; 
  font-size: 12px; 
  margin-top: 10px;
}
.spec-selected { 
  color: #333; 
  font-size: 12px; 
  margin-top: 10px;
}

/* 购买区域 */
.action-footer { margin-top: 30px; padding-top: 20px; border-top: 1px dashed #eee; }
.quantity { display: flex; align-items: center; margin-bottom: 20px; }
.btns { display: flex; gap: 15px; }

/* 底部内容区 */
.bottom-content { margin-top: 30px; }
.rich-text { padding: 20px; line-height: 2; }
.detail-imgs .el-image { width: 100%; display: block; }
.review-filter { margin: 10px 0 20px; }

/* 商品参数表格（淘宝风格） */
.params-table { padding: 20px; }
.params-table table { width: 100%; border-collapse: collapse; }
.params-table td { 
  padding: 12px; 
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}
.param-label { 
  color: #999; 
  background: #f9f9f9;
  text-align: right;
}
.param-value { color: #333; }

/* 评价区样式 */
.comment-card { display: flex; padding: 24px 0; border-bottom: 1px solid #f0f0f0; }
.u-info { width: 100px; text-align: center; }
.u-name { display: block; font-size: 12px; color: #999; margin-top: 8px; }
.c-content { flex: 1; padding-left: 20px; }
.c-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.c-time { font-size: 12px; color: #ccc; }
.c-text { line-height: 1.6; margin-bottom: 15px; color: #444; }
.c-imgs { display: flex; gap: 10px; margin-bottom: 15px; }
.mini-img { width: 80px; height: 80px; border-radius: 4px; cursor: zoom-in; border: 1px solid #eee; }

.append-wrap { background: #f9f9f9; padding: 12px; border-radius: 4px; margin-top: 15px; position: relative; }
.append-wrap::before { content: ""; position: absolute; top: -8px; left: 20px; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 8px solid #f9f9f9; }
.append-title { color: #e6a23c; font-size: 12px; font-weight: bold; margin-bottom: 5px; }
.reply-box { margin-top: 12px; background: #fdf6ec; padding: 8px 12px; font-size: 13px; color: #8d5100; border-radius: 4px; }
.reply-tag { font-weight: bold; }
</style>