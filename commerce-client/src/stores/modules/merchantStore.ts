import { defineStore } from 'pinia';

export const useMerchantStore = defineStore('merchant', { 
  state: () => ({ 
    token: '', 
    userInfo: {}, 
  }),
  actions: {

  },
  getters: {
  }
})
