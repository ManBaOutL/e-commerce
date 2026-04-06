import { defineStore} from 'pinia';
import translateTree from '@/utils/translateTree';
import { reqGetProducts, reqGetCategories } from '@/api/product';

import type { ProductState } from '../types';

export const useProductStore = defineStore('product', {
  state: () : ProductState => {
    return {
      categoryList: [],
      categoryTree: [],
      productList: [],
      total: 0,
    };
  },
  actions: {
    // 统一的商品搜索/筛选 Action
    // product.ts 中的 action 修改
    async getProductList(params?: any) {
      try {
        const res = await reqGetProducts(params);
        // console.log("用戶端获取商品列表成功: ", res);
        // 兼容性处理：如果 res.data 存在则取 data，否则取 res 本身
        if (res && res.data && Array.isArray(res.data)) {
          this.productList = res.data;
          this.total = res.items || res.data.length;
        } else if (Array.isArray(res)) {
          this.productList = res;
          this.total = res.length;
        } else {
          this.productList = [];
        }
      } catch (error) {
        this.productList = [];
        console.error('请求失败:', error);
      }
    },
    
    // 获取分类列表
    async getCategoryList() {
      try {
        const res = await reqGetCategories();
        this.categoryList = res;
        this.categoryTree = translateTree(res);
      } catch (error) {
        console.error('获取分类列表失败:', error);
        this.categoryList = [];
        this.categoryTree = [];
      }
    },
  },
  getters :{
    // 获取当前选中的分类对象（包含子分类）
    getCategoryById: (state) => (id: number) => {
      const findNode = (tree: any[]): any => {
        for (const node of tree) {
          if (node.id === id) return node;
          if (node.children) {
            const result = findNode(node.children);
            if (result) return result;
          }
        }
      };
      return findNode(state.categoryTree);
    },
  }
});