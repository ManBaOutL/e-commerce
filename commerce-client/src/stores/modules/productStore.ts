import { defineStore} from 'pinia';
import translateTree from '@/utils/translateTree';
import { reqGetProducts, reqGetCategories } from '@/api/product';

import type { ProductState } from '../types';
import type { ProductQueryParams } from '@/api/product/types';
import type { init } from 'echarts/types/src/echarts.all.js';

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
    // 测试数据
    init() {
      this.productList = [
        {
          "id": 1,
          "name": "极速开发笔记本 Pro 2026",
          "price": 12999,
          "image": "https://picsum.photos/seed/p1/400/400",
          "sales": 1502,
          "category_id": 1,
          "shop_id": 1,"create_time": "2026-04-01 10:00:00",
          "status": "通过"
        },
        {
          "id": 2,
          "name": "人体工学机械键盘 - 侧刻版",
          "price": 599,
          "image": "https://picsum.photos/seed/p2/400/400",
          "sales": 890,
          "category_id": 2,
          "shop_id": 1,"create_time": "2026-03-25 14:30:00",
          "status": "通过"
        },
        {
          "id": 3,
          "name": "4K 144Hz 极清显示器",
          "price": 2899,
          "image": "https://picsum.photos/seed/p3/400/400",
          "sales": 420,
          "category_id": 1,
          "shop_id": 1,"create_time": "2026-04-05 09:15:00",
          "status": "通过"
        },
        {
          "id": 4,
          "name": "无线降噪头戴式耳机",
          "price": 1699,
          "image": "https://picsum.photos/seed/p4/400/400",
          "sales": 2100,
          "category_id": 3,
          "shop_id": 1,"create_time": "2026-02-10 18:00:00",
          "status": "通过"
        },
        {
          "id": 5,
          "name": "全栈开发实战手册 (纸质版)",
          "price": 89,
          "image": "https://picsum.photos/seed/p5/400/400",
          "sales": 5600,
          "category_id": 4,
          "shop_id": 1,"create_time": "2026-04-08 11:20:00",
          "status": "通过"
        },
        {
          "id": 6,
          "name": "智能家居网关中心",
          "price": 299,
          "image": "https://picsum.photos/seed/p6/400/400",
          "sales": 120,
          "category_id": 5,
          "shop_id": 1,"create_time": "2026-01-20 08:00:00",
          "status": "通过"
        },
        {
          "id": 7,
          "name": "人体工学升降办公桌",
          "price": 2450,
          "image": "https://picsum.photos/seed/p7/400/400",
          "sales": 340,
          "category_id": 5,
          "shop_id": 1,"create_time": "2026-03-30 15:45:00",
          "status": "通过"
        },
        {
          "id": 8,
          "name": "大容量移动固态硬盘 2TB",
          "price": 1099,
          "image": "https://picsum.photos/seed/p8/400/400",
          "sales": 1100,
          "category_id": 2,
          "shop_id": 1,"create_time": "2026-04-02 12:00:00",
          "status": "通过"
        },
        {
          "id": 9,
          "name": "双肩电脑背包 - 防泼水系列",
          "price": 199,
          "image": "https://picsum.photos/seed/p9/400/400",
          "sales": 3200,
          "category_id": 4,
          "shop_id": 1,"create_time": "2025-12-15 10:00:00",
          "status": "通过"
        },
        {
          "id": 10,
          "name": "桌面级扩展坞 12-in-1",
          "price": 459,
          "image": "https://picsum.photos/seed/p10/400/400",
          "sales": 670,
          "category_id": 2,
          "shop_id": 1,"create_time": "2026-04-07 17:30:00",
          "status": "通过"
        },
        {
          "id": 11,
          "name": "高性能静音散热底座",
          "price": 129,
          "image": "https://picsum.photos/seed/p11/400/400",
          "sales": 150,
          "category_id": 2,
          "shop_id": 1,"create_time": "2026-03-10 14:00:00",
          "status": "通过"
        },
        {
          "id": 12,
          "name": "旗舰级 5G 智能手机",
          "price": 5499,
          "image": "https://picsum.photos/seed/p12/400/400",
          "sales": 850,
          "category_id": 1,
          "shop_id": 1,"create_time": "2026-04-04 10:00:00",
          "status": "通过"
        },
        {
          "id": 13,
          "name": "专业绘图手写板",
          "price": 1299,
          "image": "https://picsum.photos/seed/p13/400/400",
          "sales": 290,
          "category_id": 2,
          "shop_id": 1,"create_time": "2026-02-28 11:00:00",
          "status": "通过"
        },
        {
          "id": 14,
          "name": "真无线运动蓝牙耳机",
          "price": 399,
          "image": "https://picsum.photos/seed/p14/400/400",
          "sales": 4500,
          "category_id": 3,
          "shop_id": 1,"create_time": "2026-01-15 09:00:00",
          "status": "通过"
        },
        {
          "id": 15,
          "name": "超轻量化电竞鼠标",
          "price": 299,
          "image": "https://picsum.photos/seed/p15/400/400",
          "sales": 1800,
          "category_id": 2,
          "shop_id": 1,"create_time": "2026-03-20 16:20:00",
          "status": "通过"
        },
        {
          "id": 16,
          "name": "全画幅微单相机",
          "price": 14800,
          "image": "https://picsum.photos/seed/p16/400/400",
          "sales": 110,
          "category_id": 1,
          "shop_id": 1,"create_time": "2026-03-05 13:00:00",
          "status": "通过"
        },
        {
          "id": 17,
          "name": "便携式咖啡机",
          "price": 699,
          "image": "https://picsum.photos/seed/p17/400/400",
          "sales": 980,
          "category_id": 5,
          "shop_id": 1,"create_time": "2026-02-20 10:00:00",
          "status": "通过"
        },
        {
          "id": 18,
          "name": "Vue 3 核心源码解析 (电子书)",
          "price": 49,
          "image": "https://picsum.photos/seed/p18/400/400",
          "sales": 12000,
          "category_id": 4,
          "shop_id": 1,"create_time": "2026-04-09 10:00:00",
          "status": "通过"
        },
        {
          "id": 19,
          "name": "人体工学护脊网椅",
          "price": 1580,
          "image": "https://picsum.photos/seed/p19/400/400",
          "sales": 560,
          "category_id": 5,
          "shop_id": 1,"create_time": "2026-03-15 15:00:00",
          "status": "通过"
        },
        {
          "id": 20,
          "name": "智能运动手表 Pro",
          "price": 1899,
          "image": "https://picsum.photos/seed/p20/400/400",
          "sales": 2300,
          "category_id": 3,
          "shop_id": 1,"create_time": "2026-04-03 08:30:00",
          "status": "通过"
        },
        {
          "id": 21,
          "name": "立式无线充电支架",
          "price": 159,
          "image": "https://picsum.photos/seed/p21/400/400",
          "sales": 3400,
          "category_id": 2,
          "shop_id": 1,"create_time": "2026-03-28 11:00:00",
          "status": "通过"
        },
        {
          "id": 22,
          "name": "超薄平板电脑 11英寸",
          "price": 3299,
          "image": "https://picsum.photos/seed/p22/400/400",
          "sales": 670,
          "category_id": 1,
          "shop_id": 1,"create_time": "2026-04-06 14:00:00",
          "status": "通过"
        },
        {
          "id": 23,
          "name": "复古机械键盘 104键",
          "price": 459,
          "image": "https://picsum.photos/seed/p23/400/400",
          "sales": 1200,
          "category_id": 2,
          "shop_id": 1,"create_time": "2026-01-10 16:00:00",
          "status": "通过"
        },
        {
          "id": 24,
          "name": "专业级电容麦克风",
          "price": 899,
          "image": "https://picsum.photos/seed/p24/400/400",
          "sales": 430,
          "category_id": 3,
          "shop_id": 1,"create_time": "2026-02-15 09:30:00",
          "status": "通过"
        },
        {
          "id": 25,
          "name": "磁吸式车载支架",
          "price": 69,
          "image": "https://picsum.photos/seed/p25/400/400",
          "sales": 8900,
          "category_id": 2,
          "shop_id": 1,"create_time": "2026-03-22 13:00:00",
          "status": "通过"
        },
        {
          "id": 26,
          "name": "高性能外置显卡坞",
          "price": 3599,
          "image": "https://picsum.photos/seed/p26/400/400",
          "sales": 85,
          "category_id": 2,
          "shop_id": 1,"create_time": "2026-04-01 15:00:00",
          "status": "通过"
        },
        {
          "id": 27,
          "name": "智能语音遥控器",
          "price": 129,
          "image": "https://picsum.photos/seed/p27/400/400",
          "sales": 1500,
          "category_id": 5,
          "shop_id": 1,"create_time": "2026-02-05 10:00:00",
          "status": "通过"
        },
        {
          "id": 28,
          "name": "折叠式桌面三脚架",
          "price": 88,
          "image": "https://picsum.photos/seed/p28/400/400",
          "sales": 2700,
          "category_id": 2,
          "shop_id": 1,"create_time": "2026-03-12 11:30:00",
          "status": "通过"
        },
        {
          "id": 29,
          "name": "全铝合金笔记本支架",
          "price": 149,
          "image": "https://picsum.photos/seed/p29/400/400",
          "sales": 4200,
          "category_id": 2,
          "shop_id": 1,"create_time": "2026-04-08 16:00:00",
          "status": "通过"
        },
        {
          "id": 30,
          "name": "智能空气净化器",
          "price": 1280,
          "image": "https://picsum.photos/seed/p30/400/400",
          "sales": 1300,
          "category_id": 5,
          "shop_id": 1,"create_time": "2026-04-07 09:00:00",
          "status": "通过"
        }
      ]
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
        
        // 更新总数，用于判断是否加载完毕
        this.total = res.total || res.items || this.productList.length; 
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
  }
});