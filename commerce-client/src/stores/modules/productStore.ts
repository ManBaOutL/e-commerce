import { defineStore} from 'pinia';
import translateTree from '@/utils/translateTree';
import { reqGetProducts, reqGetCategories } from '@/api/product';

import type { ProductState } from '../types';
import type { Product, ProductQueryParams } from '@/api/product/types';

export const useProductStore = defineStore('product', {
  state: () : ProductState => {
    return {
      categoryList: [],
      categoryTree: [],
      productList: [],
      total: 0,
      loading: false,     // 加载状态
      finished: false,    // 是否加载完

    // 我们将当前的搜索参数存在 store 里，方便各种组件共用
      currentParams: {} as any
    };
  },
  actions: {
    // 初始加载 (清空旧数据，带上新参数请求)
    async init(params: any = {}) {
      this.loading = true;
      this.finished = false;
      this.productList = []; // 清空列表
      this.currentParams = params; // 保存当前的筛选条件
      this.currentParams.page = 1;

      await this.getProductList();
    },
    // 滚动加载更多
    async loadMore() {
      if (this.loading || this.finished) return;
      this.loading = true;
      this.currentParams.page += 1; // 页码 +1
      
      await this.getProductList();
    },
    // 统一的商品搜索/筛选 Action
    async getProductList() {
      try {
        const res = await reqGetProducts(this.currentParams);
        console.log('商品列表', res);
        if (res.success) {
          const { list, total } = res.data;
          
          // 拼接新数据到旧数据后面 (无限滚动核心)
          this.productList = [...this.productList, ...list];
          this.total = total;

          // 判断是否已经加载完所有数据
          if (this.productList.length >= total || list.length === 0) {
            this.finished = true;
          }
        }
      } catch (error) {
        console.error('获取商品失败', error);
      } finally {
        this.loading = false;
      }
    },
    
    // 获取分类字典
    async getCategoryList() {
      const res = await reqGetCategories();
      if (res.success) {
        this.categoryTree = res.data;
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

    mockData: () => {
      return Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        name: `商品 ${i + 1}`,
        price: 199 + i,
        // 补全所有必填字段，和 types.ts 中的 Product 接口一一对应
        status: '通过', // 商品状态（必填，对应报错提示的 status）
        description: `这是商品 ${i + 1} 的描述`,
        image: `https://example.com/image${i + 1}.jpg`,
        stock: 100,
        sales: 0,
        category_id: 1,
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString(),
        // 其他你接口定义的必填字段，全部补全
      }))
    }
  }
});