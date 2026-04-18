import { defineStore} from 'pinia';
import { reqGetProducts, reqGetProductDetail, reqGetProductComments } from '@/api/product';
import type { ProductState } from '../../types';
import type { ProductDetail, CommentItem } from '@/api/product/types';

export const useProductStore = defineStore('product', {
  state: () : ProductState => {
    return {
      productList: [],
      total: 0,
      loading: false,     // 加载状态
      finished: false,    // 是否加载完
      // 我们将当前的搜索参数存在 store 里，方便各种组件共用
      currentParams: {} as any,
      // 🌟 详情页专属 State
      currentProduct: {} as ProductDetail,
      currentComments: []
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
          
          // 🌟 核心修复方案：根据页码决定是【替换】还是【追加】
          if (this.currentParams.page === 1) {
            // 场景 1：如果是第一页（切换分类、重置筛选、点击排序等）
            // 直接覆盖掉旧数组，抛弃原有的数据
            this.productList = list;
          } else {
            // 场景 2：如果是翻页（向下滚动触发了 loadMore）
            // 将新数据拼接到旧数据后面
            this.productList = [...this.productList, ...list];
          }

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
  
    // 🌟 1. 获取商品详情
    async fetchProductDetail(id: number) {
      try {
        const res = await reqGetProductDetail(id);
        if (res.success) {
          // 由于 API 已经声明了泛型，这里的 res.data 会被 TS 自动推导为 ProductDetail 类型
          this.currentProduct = res.data;
          return true; 
        }
        return false;
      } catch (error) {
        console.error('获取商品详情失败', error);
        return false;
      }
    },

    // 🌟 2. 获取商品评价
    async fetchProductComments(id: number) {
      try {
        const res = await reqGetProductComments(id);
        if (res.success) {
          // res.data 会被推导为 CommentItem[]
          this.currentComments = res.data;
        }
      } catch (error) {
        console.error('获取评价失败', error);
      }
    },

    // 🌟 3. 清理当前商品数据 (离开页面时调用)
    clearCurrentProduct() {
      // 恢复为空对象，按照 ProductDetail 类型强制断言
      this.currentProduct = {} as ProductDetail;
      this.currentComments = [];
    }
  },
  getters :{
  }
});