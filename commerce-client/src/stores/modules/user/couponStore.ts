import { defineStore } from 'pinia'
import { useCartStore } from './cartStore'
import type { CouponState } from '../../types'

export const useCouponStore = defineStore('coupon', {
  state: (): CouponState => ({
    // 用户拥有的所有优惠券 (coupon表)
    userCoupons: [],
    // 当前选中的优惠券ID
    selectedCouponId: null,
  }),

  getters: {
    // 获取当前选中的优惠券详情
    selectedCoupon: (state) => {
      return state.userCoupons.find(c => c.coupon_id === state.selectedCouponId) || null
    },

    // 核心逻辑：根据购物车金额，筛选目前“可用”的优惠券
    availableCoupons: (state) => {
      const cartStore = useCartStore()
      const currentTotal = cartStore.rawTotalPrice

      return state.userCoupons.filter(coupon => {
        const isStatusOk = coupon.status === '正常'
        const isAmountOk = 'min_order_amount' in coupon ? currentTotal >= (coupon.min_order_amount || 0) : true
        // 校验时间逻辑
        const now = new Date().getTime()
        const isTimeOk = now >= new Date(coupon.start_time).getTime() && 
                         now <= new Date(coupon.end_time).getTime()
        
        return isStatusOk && isAmountOk && isTimeOk
      })
    }
  },

  actions: {
    // 选中或切换优惠券
    pickCoupon(id: number | null) {
      this.selectedCouponId = id
    },
    // 获取用户优惠券列表
    async fetchUserCoupons(userId: number) {
      // API 请求：getCouponsByUserId(userId)
    }
  }
})