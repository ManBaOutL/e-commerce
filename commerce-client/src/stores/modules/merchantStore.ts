import { defineStore } from 'pinia';
import type {
  merchantInfo, merchantShowData,
  productList, pagination, productCategory, productCondition, productOperation
} from '@/api/merchant/type';
import { getMerchantInfo, createShop } from '@/api/merchant/merchant';
import { getMerchantShowData } from '@/api/merchant/showData';
import { updateMerchantProductList, getMerchantProductList } from '@/api/merchant/product';

export const useMerchantStore = defineStore('merchant', {
  state: () => ({
    merchantInfo: {} as merchantInfo,//部分用户及店铺数据
    showData: {} as merchantShowData,//展示数据
    productList: [] as productList[],//商品列表
    pagination: {} as pagination,//分页信息
    categoryList: [] as productCategory[],//商品分类列表
  }),
  actions: {
    async getMerchantInfo() {
      const info = await getMerchantInfo();
      this.merchantInfo = info.data;
    },

    async setMerchantInfo(info: merchantInfo, operation: string) {
      const res = await createShop(info, operation);
      this.merchantInfo = res.data;
      return res;
    },

    async getShowData() {
      const res = await getMerchantShowData();
      this.showData = res.data;
      return res;
    },

    async getProductList(params: productCondition = {}, page: number = 1, pageSize: number = 10) {
      const res = await getMerchantProductList(params, page, pageSize);
      this.productList = res.data.productList;
      this.pagination = res.data.pagination;
      this.categoryList = res.data.categoryList;
      console.log("商家获取商品分类列表:", this.categoryList)
      console.log("商家获取商品列表:", this.productList)
      console.log("商家获取商品分页信息:", this.pagination)
      return res;
    },

    async updateProductList(data: productOperation) {
      const res = await updateMerchantProductList(data);
      return res;
    },
  },
  getters: {
  }
})
