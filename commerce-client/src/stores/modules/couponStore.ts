import { defineStore } from 'pinia';

export const useCouponStore = defineStore('coupon', { 
  state: () => ({ 
    token: '', 
    userInfo: {}, 
  }),
  actions: {

  },
  getters: {
  }
})
