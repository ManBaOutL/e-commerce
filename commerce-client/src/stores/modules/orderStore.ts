//管理员订单管理状态管理
import { defineStore } from 'pinia';
import type { orderList, pagination, orderCondition, orderOperation } from '@/api/manager/type';
import { getManagerOrderList, updateManagerOrderList } from '@/api/manager/order';



export const useOrderStore = defineStore('order', {
  state: () => ({
    token: '',
    orderList: [] as orderList[], // 订单列表
    pagination: {} as pagination, // 分页信息
  }),
  actions: {
    async initOrderList() {
      const res = await getManagerOrderList();
      console.log("管理员订单数据初始化成功res", res);
      this.orderList = res.data.orderList;
      console.log("管理员订单数据初始化成功orderList", this.orderList);
      this.pagination = res.data.pagination;
    },
    async getOrderListByPage(params: orderCondition, page: number, pageSize: number) {
      console.log("筛选条件:", params)
      console.log("当前页:", page, "每页数量:", pageSize)
      const res = await getManagerOrderList(params, page, pageSize);
      this.orderList = res.data.orderList;
      this.pagination = res.data.pagination;
    },
    async postOrder(orderOperation: orderOperation) {
      const res = await updateManagerOrderList(orderOperation);
      console.log("管理员订单操作成功res", res);
      this.initOrderList();
    }
  },
  getters: {
  }
})
