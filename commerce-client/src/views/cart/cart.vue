<template>
  <div>
    <the-header />

    <div class="cart-page">
      <div class="page-container">
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

        <div class="cart-list">
          <div 
            v-for="item in cartList" 
            :key="item.id" 
            class="cart-item"
            :class="{ 'item-invalid': item.status === 0 || item.stock === 0 }"
          >
            <el-row align="middle">
              <el-col :span="2">
                <el-checkbox 
                  v-model="item.selected" 
                  :disabled="item.status === 0 || item.stock === 0" 
                />
              </el-col>
              <el-col :span="9">
                <div class="product-info">
                  <div class="img-box">
                    <el-tag v-if="item.status === 0" type="info" size="small" class="status-tag">已下架</el-tag>
                    <el-tag v-else-if="item.stock === 0" type="danger" size="small" class="status-tag">无货</el-tag>
                    图片
                  </div>
                  <div class="text-content">
                    <p class="p-name">{{ item.name }}</p>
                    <p class="p-desc">规格：{{ item.spec }}</p>
                  </div>
                </div>
              </el-col>
              <el-col :span="3">
                <span class="unit-price">¥{{ item.price.toFixed(2) }}</span>
              </el-col>
              <el-col :span="4">
                <el-input-number 
                  v-model="item.count" 
                  :min="item.stock > 0 ? 1 : 0" 
                  :max="item.stock || 0"
                  size="small" 
                  :disabled="item.status === 0 || item.stock === 0"
                />
              </el-col>
              <el-col :span="3">
                <span class="total-price">¥{{ (item.price * item.count).toFixed(2) }}</span>
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
              <span class="action-link">移入收藏夹</span>
              <span class="selected-info">已选 <em class="orange-text">{{ selectedCount }}</em> 件商品</span>
            </div>

            <div class="settlement-right">
              <div class="coupon-trigger" @click="couponDialogVisible = true">
                <span class="label">优惠券</span>
                <span class="coupon-name">
                  {{ selectedCouponId ? myAvailableCoupons.find(c => c.id === selectedCouponId).title : (usableCoupons.length > 0 ? usableCoupons.length + '张可用' : '无可用') }}
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
              >
                结 算
              </el-button>
            </div>
            <el-dialog v-model="couponDialogVisible" title="选择优惠券" width="400px">
              <div class="coupon-select-list">
                <div 
                  v-for="coupon in myAvailableCoupons" 
                  :key="coupon.id"
                  class="coupon-select-item"
                  :class="{ 
                    'is-disabled': totalPrice < coupon.threshold,
                    'is-active': selectedCouponId === coupon.id 
                  }"
                  @click="totalPrice >= coupon.threshold && selectCoupon(coupon.id)"
                >
                  <div class="c-left">
                    <span class="unit">¥</span>
                    <span class="val">{{ coupon.value }}</span>
                  </div>
                  <div class="c-right">
                    <div class="c-title">{{ coupon.title }}</div>
                    <div class="c-desc">{{ coupon.desc }}</div>
                    <div class="c-status" v-if="totalPrice < coupon.threshold">未满 ¥{{ coupon.threshold }} 可用</div>
                  </div>
                  <el-icon v-if="selectedCouponId === coupon.id" class="check-icon"><Check /></el-icon>
                </div>
              </div>
            </el-dialog>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()

// 模拟数据：增加库存 stock 和 状态 status
const cartList = ref([
  { id: 1, name: '2026新款 降噪无线蓝牙耳机', spec: '经典黑', price: 299.00, count: 1, selected: true, stock: 10, status: 1 },
  { id: 2, name: '机械键盘 104键 RGB版', spec: '青轴', price: 499.00, count: 1, selected: false, stock: 0, status: 1 },
  { id: 3, name: '超高性能 4K 显示器', spec: '27英寸', price: 1800.00, count: 1, selected: true, stock: 5, status: 0 },
])

// --- 核心逻辑 ---

// 计算属性：是否有失效商品
const hasInvalidItems = computed(() => {
  return cartList.value.some(item => item.status === 0 || item.stock === 0)
})

// 计算属性：全选双向绑定
const allSelected = computed({
  get: () => {
    const validItems = cartList.value.filter(item => item.status === 1 && item.stock > 0)
    return validItems.length > 0 && validItems.every(item => item.selected)
  },
  set: (val) => {
    cartList.value.forEach(item => {
      if (item.status === 1 && item.stock > 0) {
        item.selected = val
      }
    })
  }
})

// 计算属性：半选状态
const isIndeterminate = computed(() => {
  const validItems = cartList.value.filter(item => item.status === 1 && item.stock > 0)
  const selectedCount = validItems.filter(item => item.selected).length
  return selectedCount > 0 && selectedCount < validItems.length
})

// 确保选中件数包含有效性判断
const selectedCount = computed(() => {
  return cartList.value.filter(i => i.selected && i.status !== 0 && i.stock > 0).length
});

// 总价（仅计算勾选且有效的商品）
const totalPrice = computed(() => {
  return cartList.value
    .filter(i => i.selected && i.status !== 0 && i.stock > 0)
    .reduce((sum, item) => sum + item.price * item.count, 0)
});

// 模拟费用
const shippingFee = computed(() => (totalPrice.value >= 99 || totalPrice.value === 0 ? 0 : 10));

// --- 方法 ---

const removeItem = (id) => {
  ElMessageBox.confirm('确定删除该商品吗？', '提示').then(() => {
    cartList.value = cartList.value.filter(i => i.id !== id)
  })
}

const removeSelected = () => {
  if (selectedCount.value === 0) return ElMessage.warning('请先选择商品')
  ElMessageBox.confirm('确定删除选中商品吗？', '提示').then(() => {
    cartList.value = cartList.value.filter(i => !i.selected)
  })
}

const clearInvalidItems = () => {
  cartList.value = cartList.value.filter(item => item.status === 1 && item.stock > 0)
  ElMessage.success('清理完成')
}


// --- 优惠券相关逻辑 ---
const couponDialogVisible = ref(false)
const selectedCouponId = ref(null)

// 模拟已领取的可用优惠券数据（对应之前领券中心领到的券）
const myAvailableCoupons = ref([
  { id: 101, title: '新人大礼包', type: 'reduction', value: 50, threshold: 500, desc: '满500减50' },
  { id: 104, title: '数码专项券', type: 'reduction', value: 100, threshold: 2000, desc: '满2000减100' },
  { id: 105, title: '全场通用', type: 'reduction', value: 10, threshold: 100, desc: '满100减10' }
])

// 计算当前满足金额条件的优惠券
const usableCoupons = computed(() => {
  return myAvailableCoupons.value.filter(coupon => totalPrice.value >= coupon.threshold)
})

// 计算选中的优惠券减免金额
const discountTotal = computed(() => {
  const coupon = myAvailableCoupons.value.find(c => c.id === selectedCouponId.value)
  // 只有当商品总价满足门槛时才计算减免
  if (coupon && totalPrice.value >= coupon.threshold) {
    return coupon.value
  }
  return 0
})

const selectCoupon = (id) => {
  selectedCouponId.value = id === selectedCouponId.value ? null : id // 再次点击可取消选择
  couponDialogVisible.value = false
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
  width: 60px;
  font-weight: bold;
}
.c-left .val { font-size: 24px; }
.c-right .c-title { font-size: 14px; font-weight: bold; }
.c-right .c-desc { font-size: 12px; color: #999; }
.c-status { font-size: 11px; color: #ff5000; margin-top: 4px; }
.check-icon {
  position: absolute;
  right: 15px;
  color: #ff5000;
  font-size: 20px;
}
</style>