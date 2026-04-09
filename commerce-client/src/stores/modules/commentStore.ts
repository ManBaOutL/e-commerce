import { defineStore } from 'pinia';

export const useCommentStore = defineStore('comment', { 
  state: () => ({ 
    token: '', 
    userInfo: {}, 
  }),
  actions: {

  },
  getters: {
  }
})
