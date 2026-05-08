import { defineStore } from 'pinia';
import type { AddressItem, CommentAppendData, CommentSubmitData } from '@/api/user/types';
import type { UserState } from '@/stores/types';
import { 
  reqAddComment, 
  reqAppendComment, 
  reqGetCommentList, 
  reqDeleteComment, 
  reqGetMyCoupons 
} from '@/api/user';

import { 
  reqGetAddressList, 
  reqAddAddress, 
  reqUpdateAddress, 
  reqDeleteAddress, 
  reqSetDefaultAddress ,
  
  reqGetFavoriteList,
  reqRemoveFavorite,
  reqToggleFavorite
} from '@/api/user/index';
import {
  reqUpdateUserInfo,
  reqUserRecharge,
  reqUserWithdraw
} from '@/api/user/index';

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    addressList: [],
    myCoupons: [],
    favoriteList: [],
    loading: false,
    commentList: []
  }),
  getters: {},
  actions: {
    
    // 🌟 1. 获取真实地址列表（替换掉了原来的 init）
    async fetchAddressList() {
      try {
        const res = await reqGetAddressList();
        if (res.success) {
          this.addressList = res.data;
        }
      } catch (error) {
        console.error('获取地址列表失败', error);
      }
    },

    // 🌟 2. 新增地址
    async addAddress(address: AddressItem) {
      try {
        const res = await reqAddAddress(address);
        if (res.success) {
          await this.fetchAddressList(); // 成功后立刻重新拉取最新列表，同步 Vue 视图
          return { success: true };
        }
        return { success: false, message: res.message || '新增失败' };
      } catch (error) {
        return { success: false, message: '网络请求异常' };
      }
    },

    // 🌟 3. 编辑地址
    async editAddress(address: AddressItem) {
      try {
        const res = await reqUpdateAddress(address);
        if (res.success) {
          await this.fetchAddressList(); // 成功后重新拉取最新列表
          return { success: true };
        }
        return { success: false, message: res.message || '编辑失败' };
      } catch (error) {
        return { success: false, message: '网络请求异常' };
      }
    },

    // 🌟 4. 删除地址
    async deleteAddress(addressId: number) {
      try {
        const res = await reqDeleteAddress(addressId);
        if (res.success) {
          await this.fetchAddressList(); // 成功后重新拉取最新列表
        }
      } catch (error) {
        console.error('删除地址失败', error);
      }
    },

    // 🌟 5. 设为默认地址
    async setDefaultAddress(addressId?: number) {
      if (!addressId) return;
      try {
        const res = await reqSetDefaultAddress(addressId);
        if (res.success) {
          await this.fetchAddressList(); // 成功后重新拉取最新列表
        }
      } catch (error) {
        console.error('设置默认地址失败', error);
      }
    },

    // 商品评价
    // 🌟 统一管理的提交商品评价 Action
    async submitProductComment(payload: CommentSubmitData) {
      try {
        const res = await reqAddComment(payload);
        // 将结果 return 给组件，让组件决定弹窗提示什么
        return res; 
      } catch (error) {
        // console.error('提交评价失败:', error);
        return { success: false, message: '网络请求失败' };
      }
    },
    async appendProductComment(payload: CommentAppendData) {
      try {
        const res = await reqAppendComment(payload);
        // 将结果 return 给组件，让组件决定弹窗提示什么
        return res; 
      } catch (error) {
        // console.error('追加评价失败:', error);
        return { success: false, message: '网络请求失败' };
      }
    },
    // 拉取评价列表
    async fetchMyComments() {
      this.loading = true
      try {
        const res: any = await reqGetCommentList()
        if (res.success) {
          this.commentList = res.data
        }
        return res
      } catch (error) {
        console.error('拉取评价列表异常:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 删除评价
    async deleteComment(reviewId: number) {
      try {
        const res: any = await reqDeleteComment({ review_id: reviewId })
        return res
      } catch (error) {
        console.error('删除评价异常:', error)
        throw error
      }
    },

    // 获取我的优惠券
    async fetchMyCoupons() {
      try {
        const res = await reqGetMyCoupons();
        if (res.success) {
          this.myCoupons = res.data;
        }
      } catch (error) {
        console.error('获取优惠券失败', error);
      }
    },

    // 获取真实收藏列表
    async fetchFavoriteList() {
      try {
        const res = await reqGetFavoriteList();
        if (res.success) {
          this.favoriteList = res.data; 
        }
      } catch (error) {
        console.error('获取收藏列表失败', error);
      }
    },
    // 移除收藏 (支持单条和批量)
    async removeFavorite(skuIds: number[]) {
      try {
        const res = await reqRemoveFavorite(skuIds);
        if (res.success) {
          await this.fetchFavoriteList(); 
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    // 🌟 切换商品收藏状态 (详情页点星星专用)
    async toggleFavorite(skuId: number) {
      try {
        const res = await reqToggleFavorite(skuId);
        if (res.success) {
          // 切换成功后，静默拉取一次最新列表，保证全局状态同步
          await this.fetchFavoriteList(); 
          // 返回最新的状态给组件，让星星发光或熄灭
          return { success: true, is_favorite: res.data.is_favorite };
        }
        return { success: false, message: res.message || '操作失败' };
      } catch (error) {
        console.error('切换收藏状态异常:', error);
        return { success: false, message: '网络异常' };
      }
    },

    // profile页面相关
    // 🌟 更新用户信息（昵称、邮箱、手机号等）
    async updateUserInfo(data: Record<string, any>) {
      try {
        const res = await reqUpdateUserInfo(data);
        return res;
      } catch (error) {
        console.error('更新用户信息异常:', error);
        return { success: false, message: '网络异常' };
      }
    },
    async userRecharge(data:  { amount: number }) {
      try {
        const res = await reqUserRecharge(data);
        return res;
      } catch (error) {
        console.error('用户充值异常:', error);
        return { success: false, message: '网络异常' };
      }
    },
    async userWithdraw(data: { amount: number }) {
      try {
        const res = await reqUserWithdraw(data);
        return res;
      } catch (error) {
        console.error('用户提现异常:', error);
        return { success: false, message: '网络异常' };
      }
    }
  }
});