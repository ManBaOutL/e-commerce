import { defineStore } from 'pinia';
import type { merchantInfo } from '@/api/merchant/type';
import { getMerchantInfo } from '@/api/merchant/merchant';

export const useMerchantStore = defineStore('merchant', {
  state: () => ({
    token: '',
    merchantInfo: {} as merchantInfo,
  }),
  actions: {
    async setMerchantInfo() {
      const info = await getMerchantInfo();
      this.merchantInfo = info.data;
    }
  },
  getters: {
  }
})
