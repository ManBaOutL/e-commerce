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
      page: 1,            // 当前页码（存在store里）
      pageSize: 10,       // 每页数量
      loading: false,     // 加载状态
      finished: false,    // 是否加载完
    };
  },
  actions: {
    // 测试数据
    init() {
      this.productList = []        // 清空旧数据
      this.page = 1         // 重置页码为1（核心！）
      this.loading = false
      this.finished = false
      this.loadList()       // 加载第一页
    },
    // 加载当前页数据（根据 page 加载）
    loadList() {
      this.loading = true
      
      // 你这里用的是本地测试数据，所以直接slice
      const start = 0
      const end = this.page * this.pageSize
      const data = this.mockData.slice(start, end)

      this.productList = data as Product[]
      this.loading = false

      if (data.length >= this.mockData.length) {
        this.finished = true
      }
    },

    // 滚动加载下一页
    loadMore() {
      if (this.loading || this.finished) return
      this.page++
      this.loadList()
    },
    // 统一的商品搜索/筛选 Action
    async getProductList(params: ProductQueryParams, append = false) {
      try {
        const res = await reqGetProducts(params);
        
        // 提取列表数据（适配你之前的兼容性处理）
        let newList = [];
        if (res && res.data && Array.isArray(res.data)) {
          newList = res.data;
        } else if (Array.isArray(res)) {
          newList = res;
        }
  
        if (append) {
          // 滚动加载模式：追加数据
          this.productList = [...this.productList, ...newList];
        } else {
          // 普通搜索模式：重置数据
          this.productList = newList;
        }
      } catch (error) {
        console.error('请求失败:', error);
      }
    },
    
    // 获取分类列表
    async getCategoryList() {
      try {
        const res = await reqGetCategories();
        // console.log("用戶端获取分类列表成功: ", res);
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