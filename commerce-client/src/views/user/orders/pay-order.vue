<template>
  <div class="buy-page">
    <main class="buy-container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/user/orders' }">我的订单</el-breadcrumb-item>
        <el-breadcrumb-item>订单确认与支付</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row :gutter="20">
        <el-col :md="16">
          <!-- 相关地址（只有还未生成订单的情况可以修改） -->
          <div class="card">
            <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
              <span>收货地址</span>
              <el-button 
                v-if="buyType !== 'unpaid'" 
                type="primary" link 
                @click="addressDialogVisible = true"
              >
                修改地址
              </el-button>
              <el-tag v-else type="info" effect="plain" size="small">已锁定</el-tag>
            </div>
            <!-- 地址列表 -->
            <div v-if="selectedAddress" class="address-item active" style="cursor: default;">
              <div>
                <span class="name">{{ selectedAddress.recipient_name }}</span>
                <span class="phone">{{ selectedAddress.phone }}</span>
                <el-tag v-if="selectedAddress.type && selectedAddress.type !== '其他'" size="small" type="success" style="margin-left: 8px;">
                  {{ selectedAddress.type }}
                </el-tag>
                <el-tag v-if="selectedAddress.is_default && buyType !== 'unpaid'" type="danger" size="small" style="margin-left: 8px;">
                  默认
                </el-tag>
              </div>
              <div class="addr-detail" style="margin-top: 8px;">
                {{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }} {{ selectedAddress.address }} {{ selectedAddress.streetNumber }}
              </div>
            </div>

            <div v-else style="padding: 30px 0; text-align: center; color: #999;">
              <span v-if="buyType !== 'unpaid'">您还没有收货地址，请先添加</span>
              <span v-else>地址信息加载异常</span>
              <el-button v-if="buyType !== 'unpaid'" type="primary" size="small" style="margin-left: 10px;" @click="router.push('/user/address')">
                去添加
              </el-button>
            </div>
          </div>
          <!-- 商品信息 -->
          <div class="card">
            <div class="card-title">商品信息</div>
            
            <div 
              class="goods-item" 
              v-for="(item, index) in settleItems" 
              :key="index"
              style="margin-bottom: 20px; border-bottom: 1px dashed #eee; padding-bottom: 15px;"
            >
              <div class="goods-img">
                 <el-image 
                  style="width: 100%; height: 100%; border-radius: 6px;"
                  :src="getFullUrl(item.main_image)" 
                  fit="cover"
                 >
                   <template #error><div style="text-align: center; line-height: 70px; color: #999; font-size: 12px;">无图</div></template>
                 </el-image>
              </div>
              <div class="goods-info">
                <div class="name">{{ item.name || item.product_name }}</div>
                <div class="spec">规格：{{ item.spec }}</div>
              </div>
              
              <div class="price-box" style="text-align: right;">
                <div class="price">¥{{ Number(item.price).toFixed(2) }}</div>
                <div class="count" style="color: #999; font-size: 13px; margin-top: 6px;">x {{ item.count }}</div>
              </div>
            </div>
            
          </div>
          <!-- 支付方式 -->
          <div class="card">
            <div class="card-title">支付方式</div>
            <div class="pay-list">
              <div
                v-for="pay in payMethods"
                :key="pay.id"
                class="pay-item"
                :class="{ active: selectedPayId === pay.id }"
                @click="selectedPayId = pay.id"
              >
                <div class="pay-block" :style="{ background: pay.color }"></div>
                <span class="pay-text">{{ pay.name }}</span>
                <el-radio v-model="selectedPayId" :label="pay.id" />
              </div>
            </div>
          </div>
        </el-col>

        <el-col :md="8">
          <div class="card settle-card">
            <div class="card-title">结算信息</div>
            
            <div class="settle-row">
              <span>商品总价</span>
              <span>¥{{ subTotal.toFixed(2) }}</span>
            </div>
            
            <!-- 未生成订单的情况，可以选择优惠卷 -->
            <div 
              class="settle-row coupon-trigger" 
              :class="{ 'is-link': buyType !== 'unpaid' }"
              @click="buyType !== 'unpaid' && (couponDialogVisible = true)"
            >
              <span>优惠券</span>
              <div class="coupon-right">
                <template v-if="buyType === 'unpaid'">
                  <span v-if="activeCoupon" style="color: #ff5000;">-¥{{ (subTotal - finalAmount).toFixed(2) }} ({{ activeCoupon.name }})</span>
                  <span v-else>未使用</span>
                </template>
                
                <template v-else>
                  <span v-if="activeCoupon" style="color: #ff5000;">-¥{{ (subTotal - finalAmount).toFixed(2) }}</span>
                  <span v-else-if="usableCoupons.length > 0" style="color: #ff5000;">{{ usableCoupons.length }}张可用</span>
                  <span v-else>无可用</span>
                  <el-icon style="margin-left: 4px;" v-if="buyType !== 'unpaid'"><ArrowRight /></el-icon>
                </template>
              </div>
            </div>
            
            <div class="total-row">
              <span>实付款</span>
              <span>¥{{ finalAmount.toFixed(2) }}</span>
            </div>
            
            <el-button type="primary" class="pay-btn" @click="handlePay" :disabled="settleItems.length === 0">
              提交订单
            </el-button>
          </div>
        </el-col>
      </el-row>
      <!-- 优惠券选择弹窗 -->
      <el-dialog v-model="couponDialogVisible" title="选择优惠券" width="400px">
        <div class="coupon-select-list">
          <div 
            v-for="coupon in userStore.myCoupons.filter(c => c.status === '未使用')" 
            :key="coupon.coupon_id"
            class="coupon-select-item"
            :class="{ 
              'is-disabled': subTotal < Number(coupon.min_order_amount),
              'is-active': activeCoupon?.coupon_id === coupon.coupon_id 
            }"
            @click="subTotal >= Number(coupon.min_order_amount) && selectCoupon(coupon)"
          >
            <div class="c-left">
              <span class="unit" v-if="coupon.type !== '折扣'">¥</span>
              <span class="val">{{ coupon.discount_value }}</span>
              <span class="unit" v-if="coupon.type === '折扣'" style="font-size: 14px;">折</span>
            </div>
            <div class="c-right">
              <div class="c-title">{{ coupon.name }}</div>
              <div class="c-desc">{{ coupon.type }}券 · 满{{ coupon.min_order_amount }}可用</div>
              <div class="c-status" v-if="subTotal < Number(coupon.min_order_amount)">
                未满 ¥{{ coupon.min_order_amount }} 可用
              </div>
            </div>
            <el-icon v-if="activeCoupon?.coupon_id === coupon.coupon_id" class="check-icon"><Check /></el-icon>
          </div>
          <el-empty v-if="userStore.myCoupons.filter(c => c.status === '未使用').length === 0" description="暂无优惠券" />
        </div>
      </el-dialog>
      <!-- 地址选择弹窗 -->
      <el-dialog v-model="addressDialogVisible" title="选择收货地址" width="600px">
        <div class="address-select-list">
          <div
            v-for="addr in userStore.addressList"
            :key="addr.address_id"
            class="address-item"
            :class="{ active: tempSelectedAddressId === addr.address_id }"
            @click="tempSelectedAddressId = addr.address_id"
            style="position: relative; padding-right: 40px;"
          >
            <div>
              <span class="name">{{ addr.recipient_name }}</span>
              <span class="phone">{{ addr.phone }}</span>
              <el-tag v-if="addr.type && addr.type !== '其他'" size="small" type="success" style="margin-left: 8px;">{{ addr.type }}</el-tag>
              <el-tag v-if="addr.is_default" type="danger" size="small" style="margin-left: 8px;">默认</el-tag>
            </div>
            <div class="addr-detail">
               {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.address }}{{ addr.streetNumber }}
            </div>
            <el-radio 
              v-model="tempSelectedAddressId" 
              :label="addr.address_id" 
              style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%);"
            >
              <span style="display: none;"></span> 
            </el-radio>
          </div>
        </div>
        <template #footer>
          <div style="display: flex; justify-content: space-between;">
            <el-button @click="router.push('/user/address')">管理/新增地址</el-button>
            <div>
              <el-button @click="addressDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="confirmAddressSelect">确定</el-button>
            </div>
          </div>
        </template>
      </el-dialog>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import getFullUrl from '@/utils/getFullUrl'

import { useCartStore } from '@/stores/modules/user/cartStore'
import { useUserStore } from '@/stores/modules/user/userStore'
import { useProductStore } from '@/stores/modules/user/productStore'
import { useOrderStore } from '@/stores/modules/user/orderStore'

const route = useRoute()
const router = useRouter()
// 调用相关获取数据函数
const cartStore = useCartStore()
const productStore = useProductStore()
// 调用支付逻辑
const userStore = useUserStore()
const orderStore = useOrderStore()

const settleItems = ref([]) 
const activeCoupon = ref(null)
const buyType = ref('cart')

const directBuyData = ref({ product_id: null, sku_id: null, quantity: 1, price: 0 })

onMounted(async () => {
  buyType.value = route.query.buy_type || 'cart'
  const queryCouponId = route.query.coupon_id ? Number(route.query.coupon_id) : null
  // 先拉取地址列表
  await userStore.fetchAddressList()

  if (buyType.value === 'cart') {
    const queryCartIds = route.query.cart_ids ? route.query.cart_ids.split(',') : []
    if (queryCartIds.length === 0) {
      ElMessage.warning('没有可结算的商品'); return router.replace('/cart');
    }
    settleItems.value = cartStore.cartList.filter(item => queryCartIds.includes(String(item.id)))
  
  } else if (buyType.value === 'direct') {
    directBuyData.value = {
      product_id: Number(route.query.product_id),
      sku_id: Number(route.query.sku_id),
      quantity: Number(route.query.quantity),
      price: Number(route.query.price)
    }
    await productStore.fetchProductDetail(directBuyData.value.product_id)
    const pd = productStore.currentProduct
    settleItems.value = [{
      product_name: pd.name,
      spec: pd.sku_list[Object.keys(pd.sku_list).find(k => pd.sku_list[k].sku_id === directBuyData.value.sku_id)]?.value || '默认',
      price: directBuyData.value.price,
      count: directBuyData.value.quantity,
      main_image: pd.main_image
    }]
    await userStore.fetchMyCoupons()
    
  } else if (buyType.value === 'unpaid') {
    // 🌟 ========== 链路 C：待支付订单继续支付 ==========
    const targetOrderId = route.query.order_id;
    
    // 1. 如果刷新了页面导致 store 空了，先拉取一下历史订单
    if (orderStore.orderList.length === 0) {
      await orderStore.fetchOrderList()
    }
    
    // 2. 找到这笔订单
    const existingOrder = orderStore.orderList.find(o => String(o.order_id) === String(targetOrderId));
    if (existingOrder) {
      // 3. 把订单明细格式化为本页面需要的 settleItems 格式
      settleItems.value = existingOrder.details.map(item => ({
        product_name: item.product_name,
        spec: item.spec || '默认',
        price: item.price,
        count: item.quantity, // 注意模板里用的是 count
        main_image: item.main_image
      }));
      // 4. 恢复当时使用的优惠券用于展示
      if (existingOrder.coupon) {
        activeCoupon.value = { name: existingOrder.coupon.name, discount_value: existingOrder.coupon.discount };
      }
      // 🌟 从地址库中匹配订单当时锁定的 address_id
      const lockedAddr = userStore.addressList.find(a => String(a.address_id) === String(existingOrder.address_id));
      if (lockedAddr) {
        selectedAddress.value = lockedAddr;
        selectedAddressId.value = lockedAddr.address_id;
      } else {
        // 如果用户把历史地址删了，做个兜底展示
        selectedAddress.value = { recipient_name: '已隐藏', phone: '订单历史地址', province: '该地址已被您从地址库删除' };
      }
    } else {
      ElMessage.error('订单不存在');
      router.replace('/user/orders');
    }
  }

  // 🌟 如果是新订单 (cart / direct)，自动选择默认地址！
  if (buyType.value !== 'unpaid' && userStore.addressList.length > 0) {
    // 寻找 is_default 为 true 的，如果没有就拿数组第一个
    const defaultAddr = userStore.addressList.find(a => a.is_default) || userStore.addressList[0];
    selectedAddress.value = defaultAddr;
    selectedAddressId.value = defaultAddr.address_id;
  }

  // 购物车和直接购买的优惠券绑定 (保持原逻辑)
  if (queryCouponId && userStore.myCoupons) {
    activeCoupon.value = userStore.myCoupons.find(c => c.coupon_id === queryCouponId)
  }
})

// 金额计算
const subTotal = computed(() => settleItems.value.reduce((sum, item) => sum + Number(item.price) * item.count, 0))

const finalAmount = computed(() => {
  // 🌟 如果是继续支付，直接用路由传过来的已经算好的金额，防止重复扣减！
  if (buyType.value === 'unpaid' && route.query.price) {
    return Number(route.query.price);
  }

  let discount = 0;
  if (activeCoupon.value) {
    if (activeCoupon.value.type === '折扣') {
      discount = subTotal.value * (1 - Number(activeCoupon.value.discount_value) / 100);
    } else {
      discount = Number(activeCoupon.value.discount_value);
    }
  }
  const total = subTotal.value - discount;
  return total > 0 ? total : 0;
})

const payMethods = ref([
// id: 'balance' 代表余额，'alipay' 代表支付宝
{ id: 'balance', name: '余额支付', color: '#07C160' },
{ id: 'alipay', name: '支付宝', color: '#1677FF' }
])
const selectedPayId = ref('balance') // 默认选余额

// 先下单，后支付
const handlePay = async () => {
  let currentOrderId = null;

  try {
    // ================= 1. 未生成订单的先生成订单 =================
    if (buyType.value !== 'unpaid') {

      // 拦截空地址！如果没选地址，直接 return 终止后续流程
      if (!selectedAddressId.value) {
        ElMessage.warning('请先选择或添加收货地址！');
        return; 
      }
      // 组装下单参数
      const payload = {
        address_id: selectedAddressId.value,
        coupon_id: activeCoupon.value ? activeCoupon.value.coupon_id : null,
        total_amount: finalAmount.value.toFixed(2)
      };

      if (buyType.value === 'cart') {
        payload.cart_ids = route.query.cart_ids.split(',').map(Number);
      } else {
        payload.direct_buy = directBuyData.value;
      }

      // 调接口创建订单 (此时后端已生成 '待支付' 订单)
      const res = await orderStore.submitOrder(payload);
      
      if (res.success) {
        currentOrderId = res.order_id;
        // 既然订单已经生成，提前刷新优惠券和购物车
        if (buyType.value === 'cart') cartStore.fetchCartList(); 
        userStore.fetchMyCoupons(); 
      } else {
        return; // 下单失败直接退出
      }
    } else {
      // 如果本来就是继续支付，直接取路由里的 order_id
      currentOrderId = route.query.order_id;
    }

    // ================= 2. 弹出收银台付款 =================
    // 注意：走到这里，数据库里一定有一笔 '待支付' 的订单了
    await ElMessageBox.confirm(`确认支付 ¥${finalAmount.value.toFixed(2)} 吗？`, '收银台', { 
      confirmButtonText: '立即支付',
      cancelButtonText: '稍后支付',
      type: 'warning',
      closeOnClickModal: false // 防止误触遮罩层关掉弹窗
    });
    
    // ================= 3. 确认支付 =================
    // 🌟 传入订单ID 和 选择的支付方式
    const payRes = await orderStore.payExistingOrder(currentOrderId, selectedPayId.value);
    
    if (payRes.success) {
      if (selectedPayId.value === 'balance') {
        ElMessage.success('余额支付成功！订单已流转为【已完成】');
        router.replace('/user/orders');
      } else if (selectedPayId.value === 'alipay' && payRes.url) {
        // 🌟 支付宝支付，直接跳往支付宝收银台！
        window.location.href = payRes.url;
      }
    } else {
      ElMessage.error(payRes.message || '支付唤起失败');
    }

  } catch (err) {
    // ================= 4. 取消/中断支付 =================
    // 🌟 兼容处理：点击“稍后支付”是 'cancel'，点击右上角叉号/按ESC 是 'close'
    if (err === 'cancel' || err === 'close') {
      ElMessage.info('您已暂缓支付，订单已保存至您的列表');
      router.replace('/user/orders'); // 完美跳回列表，用户会看到那笔待支付订单
    } else {
      console.error('支付接口异常:', err);
    }
  }
}

// 优惠券弹窗相关
const couponDialogVisible = ref(false)
// 计算当前订单金额下，真正可用的优惠券
const usableCoupons = computed(() => {
  if (!userStore.myCoupons) return [];
  return userStore.myCoupons.filter(c => c.status === '未使用' && subTotal.value >= Number(c.min_order_amount))
})
// 用户在弹窗里点击某张优惠券
const selectCoupon = (coupon) => {
  // 如果点击的是已经选中的，就取消选中（不使用优惠券）
  if (activeCoupon.value && activeCoupon.value.coupon_id === coupon.coupon_id) {
    activeCoupon.value = null;
  } else {
    // 否则选中该券
    activeCoupon.value = coupon;
  }
  couponDialogVisible.value = false;
}
// ================= 🌟 地址相关逻辑 =================
const addressDialogVisible = ref(false)
const selectedAddress = ref(null)      // 当前展示的完整地址对象
const selectedAddressId = ref(null)    // 用于提交订单的 ID
const tempSelectedAddressId = ref(null) // 弹窗中临时选中的 ID

// 确认选择新地址
const confirmAddressSelect = () => {
  if (tempSelectedAddressId.value) {
    selectedAddressId.value = tempSelectedAddressId.value;
    selectedAddress.value = userStore.addressList.find(a => a.address_id === tempSelectedAddressId.value);
  }
  addressDialogVisible.value = false;
}
// 每次打开弹窗，将临时选中状态同步为当前真实选中的状态
import { watch } from 'vue'
watch(addressDialogVisible, (val) => {
  if (val) tempSelectedAddressId.value = selectedAddressId.value;
})
</script>

<style scoped>
/* 和上面完全一样，保持统一 */
.buy-page {
  background: #f5f5f5;
  padding: 20px;
  min-height: 100vh;
}
.buy-container {
  max-width: 1200px;
  margin: 0 auto;
}
.breadcrumb {
  margin-bottom: 16px;
}
.card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.card-title {
  font-weight: 500;
  margin-bottom: 15px;
  font-size: 16px;
}
.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
}
.address-item.active {
  border-color: #409eff;
  background: #f0f7ff;
}
.name {
  font-weight: 500;
  margin-right: 10px;
}
.phone {
  color: #666;
}
.addr-detail {
  color: #999;
  font-size: 14px;
  margin-top: 4px;
}
.goods-item {
  display: flex;
  align-items: center;
}
.goods-img {
  width: 70px;
  height: 70px;
  background: #f2f2f2;
  border-radius: 6px;
  margin-right: 12px;
}
.goods-info {
  flex: 1;
}
.goods-info .name {
  font-weight: 500;
  margin-bottom: 4px;
}
.goods-info .spec {
  color: #999;
  font-size: 13px;
}
.price {
  color: #ff5000;
  font-weight: 500;
}
.pay-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
}
.pay-item.active {
  border-color: #409eff;
  background: #f0f7ff;
}
.pay-block {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}
.settle-card {
  position: sticky;
  top: 20px;
}
.settle-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #666;
}
.total-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 18px;
  font-weight: bold;
  color: #ff5000;
  border-top: 1px solid #eee;
  margin-top: 8px;
}
.pay-btn {
  width: 100%;
  margin-top: 10px;
}

/* 优惠券入口交互 */
.coupon-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #eee;
}
.coupon-trigger.is-link {
  cursor: pointer;
}
.coupon-trigger.is-link:hover {
  background: #fafafa;
}
.coupon-right {
  display: flex;
  align-items: center;
  font-size: 14px;
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
  width: 70px;
  font-weight: bold;
}
.c-left .val { font-size: 22px; margin-right: 2px; }
.c-right .c-title { font-size: 14px; font-weight: bold; }
.c-right .c-desc { font-size: 12px; color: #999; margin-top: 4px;}
.c-status { font-size: 11px; color: #ff5000; margin-top: 4px; }
.check-icon {
  position: absolute;
  right: 15px;
  color: #ff5000;
  font-size: 20px;
}
</style>

