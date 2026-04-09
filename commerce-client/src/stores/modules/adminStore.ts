// log . shop . active . user . 
import { defineStore } from 'pinia';

export const useAdminStore = defineStore('admin', { 
  state: () => ({ 
    token: '', 
    userInfo: {}, 
  }),
  actions: {

  },
  getters: {
  }
})
