// log . shop . active . user . 
import { defineStore } from 'pinia';
import type { managerShowData } from '@/api/manager/type'
import { getManagerShowData } from '@/api/manager/showData'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    token: '',
    userInfo: {},
    logList: [] as any[],
    shopList: [] as any[],
    actList: [] as any[],
    userList: [] as any[],
    categoryList: [] as any[],
    showData: {} as managerShowData,
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
    initAdminStore() {
      console.log('初始化管理员数据...')
      //初始化：默认为每个数据请求x条数据
      this.initLogList()
      this.initShopList()
      this.initActList()
      this.initUserList()
      console.log('管理员数据初始化完成')
    },

    initLogList() {
      this.logList = [
        { logId: 1001, username: 'user01', role: '普通用户', content: '修改登录密码', type: '修改密码', time: '2026-04-07 18:20:11', result: '成功' },
        { logId: 1002, username: 'user02', role: 'VIP用户', content: '删除订单评价', type: '删除评价', time: '2026-04-07 17:10:22', result: '成功' },
        { logId: 1003, username: 'admin', role: '管理员', content: '将 user03 改为 VIP用户', type: '分配角色', time: '2026-04-07 16:30:10', result: '成功' },
        { logId: 1004, username: 'admin', role: '管理员', content: '禁用违规账号 user05', type: '禁用账号', time: '2026-04-07 15:20:33', result: '成功' },
        { logId: 1005, username: 'admin', role: '管理员', content: '同意订单 2026005 退款', type: '退款审核', time: '2026-04-07 14:10:15', result: '成功' },
        { logId: 1006, username: 'user01', role: '普通用户', content: '尝试修改密码（原密码错误）', type: '修改密码', time: '2026-04-07 12:11:22', result: '失败' },
      ]
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
    initActList() {
      this.actList = [
        { actId: 1, actName: '满300减50', actType: '满减', goodsName: '无线耳机', rule: '满300减50', startTime: '2026-04-01', endTime: '2026-04-07', status: '进行中' },
        { actId: 2, actName: '耳机限时秒杀', actType: '秒杀', goodsName: '无线耳机', rule: '秒杀价 ¥199', startTime: '2026-04-08', endTime: '2026-04-09', status: '进行中' },
        { actId: 3, actName: '新用户优惠券', actType: '优惠券', goodsName: '机械键盘', rule: '¥50 无门槛', startTime: '2026-04-05', endTime: '2026-04-15', status: '未开始' },
      ]
    },
    initUserList() {
      this.userList = [
        { user_id: 1, username: 'admin', type: '管理员', phone: '13800138001', status: '正常' },
        { user_id: 2, username: 'seller1', type: '商家', phone: '13800138002', status: '正常' },
        { user_id: 3, username: 'user1', type: '普通用户', phone: '13800138003', status: '正常' },
        { user_id: 4, username: 'vip1', type: 'VIP用户', phone: '13800138004', status: '正常' },
        { user_id: 5, username: 'baduser', type: '普通用户', phone: '13800138005', status: '禁用' }, // 违规禁用示例
      ]
    },
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
