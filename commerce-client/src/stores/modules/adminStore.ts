// log . shop . active . user . 
import { defineStore } from 'pinia';
import type { managerShowData } from '@/api/manager/type'
import { getManagerShowData } from '@/api/manager/showData'
import type {
  pagination,
  userList, userCondition, userOperation,
  productList, productCondition, productOperation,
  category, categoryOperation,
  couponList, couponOperation, couponCondition,
  activityList, activityOperation, activityCondition,
  commentList, commentOperation, commentCondition,
  logList, logCondition,
} from '@/api/manager/type'
import { getManagerUserList, updateManagerUserList } from '@/api/manager/user'
import { getManagerProductList, updateManagerProductList } from '@/api/manager/product'
import { getManagerCategoryList, updateManagerCategoryList } from '@/api/manager/category'
import { getManagerCouponList, updateManagerCouponList } from '@/api/manager/coupon'
import { getActList, updateActList } from '@/api/manager/activity'
import { getManagerCommentList, updateManagerCommentList } from '@/api/manager/comment'
import { getLogList } from '@/api/manager/log'



export const useAdminStore = defineStore('admin', {
  state: () => ({
    logList: [] as any[],
    logTypeList: [] as string[],
    shopList: [] as any[],
    actList: [] as any[],
    userList: [] as userList[],
    productList: [] as productList[],
    categoryList: [] as category[],
    templateCouponList: [] as couponList[],
    userCouponList: [] as couponList[],
    showData: {} as managerShowData,
    pagination: {} as pagination,
    commentList: [] as commentList[],
  }),
  actions: {
    // 初始化管理员数据
    async initShowData() {
      console.log('初始化管理员展示数据...')
      const res = await getManagerShowData()
      console.log("展示数据res:", res)
      this.showData = res.data
      console.log("展示数据:", this.showData)
    },
    async initAdminStore() {
      console.log('初始化管理员数据...')
      await this.initUserList()
      console.log('管理员数据初始化完成')
    },
    async initLogList() {
      const res = await getLogList()
      this.logList = res.data.log
      this.logTypeList = res.data.allType
      this.pagination = res.data.pagination
      console.log("日志列表:", this.logList)
    },
    initShopList() {
      this.shopList = [
        {
          shopId: 1001,
          shopName: 'Apple官方旗舰店',
          ownerName: '张店主',
          phone: '13800138000',
          address: '北京市朝阳区科技园区',
          intro: '主营苹果全系列产品',
          createTime: '2025-01-10 10:00',
          status: 'normal'
        },
        {
          shopId: 1002,
          shopName: '华为数码专营店',
          ownerName: '李店主',
          phone: '13900139000',
          address: '上海市浦东新区软件园',
          intro: '华为手机、平板、电脑专卖',
          createTime: '2025-02-15 14:20',
          status: 'normal'
        },
        {
          shopId: 1003,
          shopName: '小米之家专卖店',
          ownerName: '王店主',
          phone: '13700137000',
          address: '广州市天河区购物中心',
          intro: '小米全品类官方授权',
          createTime: '2025-03-01 09:30',
          status: 'forbidden'
        },
        {
          shopId: 1004,
          shopName: 'OPPO体验店',
          ownerName: '赵店主',
          phone: '13600136000',
          address: '深圳市南山区科技园',
          intro: 'OPPO手机、IoT产品专卖',
          createTime: '2025-03-10 11:10',
          status: 'normal'
        }
      ]
    },
    async initProductList() {
      const res = await getManagerProductList()
      this.productList = res.data.productList
      this.pagination = res.data.pagination
      console.log("商品列表:", this.productList)
    },
    async initUserList() {
      const res = await getManagerUserList()
      console.log("用户列表res:", res)
      this.userList = res.data.userList
      console.log("用户列表:", this.userList)
      this.pagination = res.data.pagination
    },
    async initCategoryList() {
      const res = await getManagerCategoryList()
      this.categoryList = res.data
      console.log("分类列表:", this.categoryList)
    },
    async initTemplateCouponList() {
      console.log("初始化优惠券模板列表...")
      const res = await getManagerCouponList({}, 1, 10, true)
      this.templateCouponList = res.data.list
      this.pagination = res.data.pagination
      console.log("优惠券列表:", this.templateCouponList)
    },
    async initUserCouponList() {
      console.log("初始化用户优惠券列表...")
      const res = await getManagerCouponList({}, 1, 10, false)
      this.userCouponList = res.data.list
      this.pagination = res.data.pagination
      console.log("用户优惠券列表:", this.userCouponList)
    },
    async initActList() {
      const res = await getActList()
      this.actList = res.data.actList
      this.pagination = res.data.pagination
      console.log("活动列表:", this.actList)
    },
    async initCommentList() {
      const res = await getManagerCommentList()
      this.commentList = res.data.commentList
      this.pagination = res.data.pagination
      console.log("评价列表:", this.commentList)
    },

    async getUserListbyPage(params: userCondition, page: number, pageSize: number) {
      console.log("传如参数:", params, page, pageSize)
      const res = await getManagerUserList(params, page, pageSize)
      this.userList = res.data.userList
      this.pagination = res.data.pagination
    },
    async getProductListbyPage(params: productCondition, page: number, pageSize: number) {
      console.log("获取商品传如参数:", params, page, pageSize)
      const res = await getManagerProductList(params, page, pageSize)
      this.productList = res.data.productList
      this.pagination = res.data.pagination
      // console.log("商品列表:", this.productList)
      // console.log("分页信息:", this.pagination)
    },
    async getTemplateCouponList(params: couponCondition, page: number, pageSize: number) {
      console.log("获取优惠券模板列表传如参数:", params, page, pageSize)
      const res = await getManagerCouponList(params, page, pageSize, true)
      this.templateCouponList = res.data.list
      this.pagination = res.data.pagination
      console.log("优惠券列表:", this.templateCouponList)
      console.log("分页信息:", this.pagination)
    },
    async getUserCouponList(params: couponCondition, page: number, pageSize: number) {
      console.log("获取用户优惠券列表传如参数:", params, page, pageSize)
      const res = await getManagerCouponList(params, page, pageSize, false)
      this.userCouponList = res.data.list
      this.pagination = res.data.pagination
      console.log("用户优惠券列表:", this.userCouponList)
      console.log("分页信息:", this.pagination)
    },
    async getActList(params: activityCondition, page: number, pageSize: number) {
      console.log("获取活动列表传如参数:", params, page, pageSize)
      const res = await getActList(params, page, pageSize)
      this.actList = res.data.actList
      this.pagination = res.data.pagination
      // console.log("活动列表:", this.actList)
      // console.log("分页信息:", this.pagination)
    },
    async getCommentList(params: commentCondition, page: number, pageSize: number) {
      console.log("获取评价列表传如参数:", params, page, pageSize)
      const res = await getManagerCommentList(params, page, pageSize)
      this.commentList = res.data.commentList
      this.pagination = res.data.pagination
      console.log("评价列表:", this.commentList)
      console.log("分页信息:", this.pagination)
    },
    async getLogListbyPage(params: logCondition, page: number, pageSize: number) {
      console.log("获取日志列表传如参数:", params, page, pageSize)
      const res = await getLogList(params, page, pageSize)
      this.logList = res.data.log
      this.logTypeList = res.data.allType
      this.pagination = res.data.pagination
      console.log("日志列表:", this.logList)
      console.log("分页信息:", this.pagination)
    },


    async updateUserList(params: userOperation, condition: userCondition) {
      const res = await updateManagerUserList(params)
      this.getUserListbyPage(condition, this.pagination.currentPage, this.pagination.pageSize);
      return res
    },

    async updateProductList(params: productOperation) {
      const res = await updateManagerProductList(params)
      return res
    },
    async updateCategoryList(params: categoryOperation) {
      console.log("==========================================================s")
      const res = await updateManagerCategoryList(params)
      console.log("更新分类列表res:", res)
      if (res.data) {
        console.log("更新分类列表:", res.data)
        await this.initCategoryList()
      }
      return res
    },
    async updateTemplateCouponList(params: couponOperation) {
      // 更新优惠券模板列表只有插入和删除
      const res = await updateManagerCouponList(params)
      if (res.data) {
        console.log("更新优惠券模板列表:", res.data)
        await this.initTemplateCouponList()
      }
      return res
    },
    async updateUserCouponList(params: couponOperation) {
      // 更新用户优惠券列表只有分配和删除
      const res = await updateManagerCouponList(params, false)
      if (res.data) {
        console.log("更新用户优惠券列表:", res.data)
        await this.initUserCouponList()
      }
      return res
    },
    async updateActivityList(params: activityOperation, condition: activityCondition) {
      console.log("更新活动列表传如参数:", params, condition)
      const res = await updateActList(params)
      console.log("更新活动列表res:", res)
      if (res.data) {
        console.log("更新活动列表:", res.data)
        // 刷新活动列表
        await this.getActList(condition, 1, 10);
      }
      return res
    },
    async updateCommentList(params: commentOperation, condition: commentCondition) {
      const res = await updateManagerCommentList(params)
      if (res.data) {
        console.log("更新评论列表:", res.data)
        // 刷新评论列表
        await this.getCommentList(condition, 1, 10);
      }
      return res
    }
  },
  getters: {
    // 统计用户数量
    userCount(state) {
      return state.userList.length
    },

    // 统计正常店铺数量
    normalShopCount(state) {
      return state.shopList.length
    },
  }
})

export default useAdminStore
