import { defineStore } from 'pinia';

export const useOrderStore = defineStore('order', { 
  state: () => ({ 
    token: '', 
    userInfo: {}, 
  }),
  actions: {

  },
  getters: {
  }
})
