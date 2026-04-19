<template>
  <div>
    <the-header />

    <div class="cart-page">
      <div class="page-container">
        <!-- 购物车中有商品已下架或库存不足，建议及时清理 -->
        <el-alert
          v-if="hasInvalidItems"
          title="您的购物车中有商品已下架或库存不足，建议及时清理。"
          type="warning"
          show-icon
          class="mb-20"
        >
          <template #default>
            <el-button link type="primary" @click="clearInvalidItems">一键清理失效商品</el-button>
          </template>
        </el-alert>

        <div class="cart-header">
          <h2 class="title">购物车 (全部 {{ cartList.length }})</h2>
          <div class="nav-actions">
            <el-button @click="router.push('/')" icon="HomeFilled" link>返回首页</el-button>
          </div>
        </div>

        <div class="table-header">
          <el-row align="middle">
            <el-col :span="1">
              <el-checkbox v-model="allSelected" :indeterminate="isIndeterminate" />
            </el-col>
            <el-col :span="1">全选</el-col>
            <el-col :span="9">商品信息</el-col>
            <el-col :span="3">单价</el-col>
            <el-col :span="4">数量</el-col>
            <el-col :span="3">金额</el-col>
            <el-col :span="3">操作</el-col>
          </el-row>
        </div>

        <!-- 购物车列表 -->
        <div class="cart-list">
          <div 
            v-for="item in cartList" 
            :key="item.id" 
            class="cart-item"
            :class="{ 'item-invalid': item.product_status !== '通过' || item.stock === 0 }"
          >
            <el-row align="middle">
              <el-col :span="2">
                <el-checkbox 
                  v-model="item.selected" 
                  :disabled="item.product_status !== '通过' || item.stock === 0"
                />
              </el-col>
              <el-col :span="9">
                <div class="product-info">
                  <div class="img-box">
                    <el-tag v-if="item.product_status === '下架'" type="info" size="small" class="status-tag">已下架</el-tag>
                    <el-tag v-else-if="item.stock === 0" type="danger" size="small" class="status-tag">无货</el-tag>
                    <el-image 
                      style="width: 100%; height: 100%; border-radius: 4px;"
                      :src="getFullUrl(item.main_image)" 
                      fit="cover"
                      >
                      <template #error>
                        <div class="image-fallback">无图</div>
                      </template>
                    </el-image>
                  </div>
                  <div class="text-content">
                    <p class="p-name">{{ item.name }}</p>
                    <p class="p-desc">规格：{{ item.spec }}</p>
                  </div>
                </div>
              </el-col>
              <el-col :span="3">
                <span class="unit-price">¥{{ Number(item.price).toFixed(2) }}</span>
              </el-col>
              <el-col :span="4">
                <el-input-number 
                  v-model="item.count" 
                  :min="item.stock > 0 ? 1 : 0" 
                  :max="item.stock || 0"
                  size="small" 
                  :disabled="item.product_status === 0 || item.stock === 0"
                  @change="(val) => handleCountChange(item.id, val)"
                />
              </el-col>
              <el-col :span="3">
                <span class="total-price">¥{{ (Number(item.price) * item.count).toFixed(2) }}</span>  
              </el-col>
              <el-col :span="3">
                <el-button type="danger" link @click="removeItem(item.id)">删除</el-button>
              </el-col>
            </el-row>
          </div>
        </div>

        <div class="footer-bar">
          <div class="footer-container">
            <div class="operations-left">
              <el-checkbox v-model="allSelected" :indeterminate="isIndeterminate">全选</el-checkbox>
              <span class="action-link" @click="removeSelected">删除选中商品</span>
              <span class="selected-info">已选 <em class="orange-text">{{ selectedCount }}</em> 件商品</span>
            </div>

            <div class="settlement-right">
              <div class="coupon-trigger" @click="couponDialogVisible = true">
                <span class="label">优惠券</span>
                <span class="coupon-name">
                  {{ selectedCouponId ? userStore.myCoupons.find(c => c.coupon_id === selectedCouponId)?.name : (usableCoupons.length > 0 ? usableCoupons.length + '张可用' : '无可用') }}
                </span>
                <el-icon><ArrowRight /></el-icon>
              </div>
              <div class="price-breakdown">
                <div class="breakdown-item">
                  <span class="label">商品总价：</span>
                  <span class="value">¥{{ totalPrice.toFixed(2) }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="label">预估运费：</span>
                  <span class="value">{{ shippingFee === 0 ? '包邮' : '¥' + shippingFee }}</span>
                </div>
                <div class="breakdown-item discount">
                  <span class="label">优惠减免：</span>
                  <span class="value">- ¥{{ discountTotal.toFixed(2) }}</span>
                </div>
              </div>

              <div class="final-price-box">
                <span class="total-label">合计 (不含运费)：</span>
                <span class="total-amount">¥ <em>{{ (totalPrice + shippingFee - discountTotal).toFixed(2) }}</em></span>
              </div>
              
              <el-button 
                type="primary" 
                class="checkout-btn" 
                :disabled="selectedCount === 0"
                @click="handleCheckout"
              >
                结 算
              </el-button>
            </div>

            <!-- 优惠卷选择对话框 -->
            <el-dialog v-model="couponDialogVisible" title="选择优惠券" width="400px">
              <div class="coupon-select-list">
                <div 
                  v-for="coupon in userStore.myCoupons.filter(c => c.status === '未使用')" 
                  :key="coupon.coupon_id"
                  class="coupon-select-item"
                  :class="{ 
                    'is-disabled': totalPrice < Number(coupon.min_order_amount),
                    'is-active': selectedCouponId === coupon.coupon_id 
                  }"
                  @click="totalPrice >= Number(coupon.min_order_amount) && selectCoupon(coupon.coupon_id)"
                >
                  <div class="c-left">
                    <span class="unit" v-if="coupon.type !== '折扣'">¥</span>
                    <span class="val">{{ coupon.discount_value }}</span>
                    <span class="unit" v-if="coupon.type === '折扣'" style="font-size: 14px;">折</span>
                  </div>
                  <div class="c-right">
                    <div class="c-title">{{ coupon.name }}</div>
                    <div class="c-desc">{{ coupon.type }}券 · 满{{ coupon.min_order_amount }}可用</div>
                    <div class="c-status" v-if="totalPrice < Number(coupon.min_order_amount)">
                      未满 ¥{{ coupon.min_order_amount }} 可用
                    </div>
                  </div>
                  <el-icon v-if="selectedCouponId === coupon.coupon_id" class="check-icon"><Check /></el-icon>
                </div>
                <el-empty v-if="userStore.myCoupons.filter(c => c.status === '未使用').length === 0" description="暂无优惠券" />
              </div>
            </el-dialog>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/modules/user/userStore'
import { useCartStore } from '@/stores/modules/user/cartStore'
import getFullUrl from '@/utils/getFullUrl'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

// 1. 响应式接管购物车数据
const { cartList } = storeToRefs(cartStore)

// 初始化：同时拉取购物车和优惠券
onMounted(() => {
  cartStore.fetchCartList()
  userStore.fetchMyCoupons()
})

// === 购物车基础逻辑 ===
const hasInvalidItems = computed(() => cartList.value.some(item => item.product_status === '待审核' || item.product_status === '已驳回' || item.stock === 0))

const allSelected = computed({
  get: () => {
    const validItems = cartList.value.filter(item => item.product_status === '通过' && item.stock > 0)
    return validItems.length > 0 && validItems.every(item => item.selected)
  },
  set: (val) => {
    cartList.value.forEach(item => {
      if (item.product_status === '通过' && item.stock > 0) item.selected = val
    })
  }
})

const isIndeterminate = computed(() => {
  const validItems = cartList.value.filter(item => item.product_status === '通过' && item.stock > 0)
  const selectedCount = validItems.filter(item => item.selected).length
  return selectedCount > 0 && selectedCount < validItems.length
})

const selectedCount = computed(() => cartList.value.filter(i => i.selected && i.product_status === '通过' && i.stock > 0).length);
const totalPrice = computed(() => cartList.value.filter(i => i.selected && i.product_status === '通过' && i.stock > 0).reduce((sum, item) => sum + Number(item.price) * item.count, 0));
const shippingFee = computed(() => (totalPrice.value >= 99 || totalPrice.value === 0 ? 0 : 10));

// 🌟 2. 数量改变时，同步更新到数据库
const handleCountChange = (cart_id, count) => {
  cartStore.updateCount(cart_id, count);
}

// 🌟 3. 删除逻辑对接后端
const removeItem = (id) => {
  ElMessageBox.confirm('确定删除该商品吗？', '提示').then(() => {
    cartStore.removeItems([id]);
  })
}

const removeSelected = () => {
  if (selectedCount.value === 0) return ElMessage.warning('请先选择商品')
  ElMessageBox.confirm('确定删除选中商品吗？', '提示').then(() => {
    const ids = cartList.value.filter(i => i.selected).map(i => i.id);
    cartStore.removeItems(ids);
  })
}

const clearInvalidItems = () => {
  const ids = cartList.value.filter(i => i.product_status !== '通过' || i.stock === 0).map(i => i.id);
  if (ids.length > 0) cartStore.removeItems(ids);
}

// === 优惠券逻辑 (保持之前写的完美逻辑不变) ===
const couponDialogVisible = ref(false)
const selectedCouponId = ref(null)

const usableCoupons = computed(() => userStore.myCoupons.filter(c => c.status === '未使用' && totalPrice.value >= Number(c.min_order_amount)))

const discountTotal = computed(() => {
  const coupon = userStore.myCoupons.find(c => c.coupon_id === selectedCouponId.value)
  if (!coupon || totalPrice.value < Number(coupon.min_order_amount)) return 0;
  
  const val = Number(coupon.discount_value);
  if (coupon.type === '满减' || coupon.type === '无门槛') {
    return val > totalPrice.value ? totalPrice.value : val;
  } else if (coupon.type === '折扣') {
    return totalPrice.value * (1 - (val / 100));
  }
  return 0;
})

const selectCoupon = (id) => {
  selectedCouponId.value = id === selectedCouponId.value ? null : id 
  couponDialogVisible.value = false
}

// 4. 终极一跃：结算跳转！
const handleCheckout = () => {
  // 找出所有被勾选的有效商品的 cart_id
  const selectedCartIds = cartList.value
    .filter(i => i.selected && i.product_status === '通过' && i.stock > 0)
    .map(i => i.id);
    
  if (selectedCartIds.length === 0) return ElMessage.warning('请选择要结算的商品');

  // 将选中的商品 ID 和 选中的优惠券 ID 通过 Query 传给结算确认页
  router.push({
    path: '/user/orders/order-pay',
    query: {
      cart_ids: selectedCartIds.join(','),  // 例如: "1,4,5"
      coupon_id: selectedCouponId.value || '' // 例如: "601"
    }
  });
}
</script>

<style scoped>
.cart-page { padding: 20px 0 100px; max-width: 1200px; margin: 0 auto; }
.mb-20 { margin-bottom: 20px; }
.cart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.table-header { background: #fff; padding: 15px 20px; border-radius: 8px 8px 0 0; border-bottom: 1px solid #f0f0f0; }

.cart-item { background: #fff; padding: 20px; border-bottom: 1px solid #f0f0f0; }
.item-invalid { background: #f9f9f9; }
.item-invalid .product-info { filter: grayscale(1); opacity: 0.6; }

.product-info { display: flex; align-items: center; }
.img-box { width: 80px; height: 80px; background: #eee; margin-right: 15px; position: relative; display: flex; align-items: center; justify-content: center; }
.status-tag { position: absolute; top: 0; left: 0; }

.total-price { color: #ff5000; font-weight: bold; }

/* 底部结算栏增强 */
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%; /* 占满屏幕宽度，内部容器负责居中 */
  height: 72px;
  background: #fff;
  box-shadow: 0 -3px 10px rgba(0,0,0,0.05);
  z-index: 1000;
  display: flex;
  justify-content: center;
}

.footer-container {
  width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 左侧操作区 */
.operations-left {
  display: flex;
  align-items: center;
  gap: 25px;
  color: #666;
  font-size: 14px;
}

.action-link {
  cursor: pointer;
  transition: color 0.2s;
}
.action-link:hover { color: #ff5000; }

.selected-info { margin-left: 10px; }
.orange-text { color: #ff5000; font-weight: bold; font-style: normal; font-size: 16px; }

/* 右侧结算区 */
.settlement-right {
  display: flex;
  align-items: center;
}

/* 价格拆解明细 */
.price-breakdown {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 20px;
  border-right: 1px solid #f0f0f0;
  margin-right: 20px;
}

.breakdown-item {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
  text-align: right;
}

.breakdown-item .value {
  display: inline-block;
  min-width: 70px;
  color: #333;
}

.breakdown-item.discount .value {
  color: #ff5000;
}

/* 最终价格 */
.final-price-box {
  margin-right: 20px;
}

.total-label {
  font-size: 14px;
  color: #333;
}

.total-amount {
  color: #ff5000;
  font-weight: bold;
}

.total-amount em {
  font-size: 24px;
  font-style: normal;
}

/* 结算按钮 */
.checkout-btn {
  width: 140px;
  height: 50px;
  border-radius: 25px; /* 胶囊形状更美观 */
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  border: none;
  font-size: 18px;
  font-weight: bold;
}

.checkout-btn.is-disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 优惠券入口样式 */
.coupon-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 25px;
  font-size: 13px;
  background: #fffcfb;
  border: 1px solid #ffefe9;
  padding: 4px 12px;
  border-radius: 4px;
}
.coupon-trigger .coupon-name {
  color: #ff5000;
  margin: 0 5px;
}

/* 弹窗内部样式 */
.coupon-select-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}
.coupon-select-item.is-active {
  border-color: #ff5000;
  background-color: #fffcfb;
}
.coupon-select-item.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(1);
}
.c-left {
  color: #ff5000;
  /* width: 60px; */
  font-weight: bold;
}
.c-left .val { font-size: 22px; margin-right: 15px; }
.c-right .c-title { font-size: 14px; font-weight: bold; }
.c-right .c-desc { font-size: 12px; color: #999; }
.c-status { font-size: 11px; color: #ff5000; margin-top: 4px; }
.check-icon {
  position: absolute;
  right: 15px;
  color: #ff5000;
  font-size: 20px;
}
.image-fallback {
  width: 100%; height: 100%;
  background: #f5f7fa; color: #a8abb2;
  display: flex; justify-content: center; align-items: center;
  font-size: 12px;
}
</style>