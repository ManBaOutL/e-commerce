import { defineStore } from 'pinia';
import type { AddressItem } from '@/api/user/types';
import type { UserState } from '@/stores/types';

export const useUserStore = defineStore('user', {
  state: () : UserState => ({
    // 初始模拟数据（匹配接口定义的AddressItem格式）
    addressList: []
  }),
  getters: {

  },
  actions: {
    init(){
      this.addressList = [
        {
          address_id: 1,
          user_id: 1001, // 模拟当前用户ID
          recipient_name: '张三',
          phone: '13800000000',
          address: '某某省某某市某某区 某某街道1号',
          lng: 116.403963,
          lat: 39.915119,
          province: '某某省',
          city: '某某市',
          district: '某某区',
          street: '某某街道',
          streetNumber: '1号',
          is_default: true,
          type: 'delivery'
        }
      ]
    },
    // 新增地址
    addAddress(address : AddressItem) {
      const newAddress = {
        ...address,
        address_id: Date.now(), // 模拟自增ID
        user_id: 1001 // 绑定当前用户
      }
      this.addressList.push(newAddress)
      // 如果新增地址设置为默认，则更新其他地址的默认状态
      if (newAddress.is_default) {
        this.setDefaultAddress(newAddress.address_id)
      }
    },
    // 编辑地址
    editAddress(updatedAddress : AddressItem) {
      const index = this.addressList.findIndex(
        item => item.address_id === updatedAddress.address_id
      )
      if (index > -1) {
        this.addressList[index] = { ...this.addressList[index], ...updatedAddress }
        // 如果编辑后的地址设置为默认，则更新其他地址的默认状态
        if (updatedAddress.is_default) {
          this.setDefaultAddress(updatedAddress.address_id)
        }
      }
    },
    // 删除地址
    deleteAddress(addressId : number) {
      this.addressList = this.addressList.filter(item => item.address_id !== addressId)
      // 如果删除的地址为默认地址，则更新其他地址的默认状态
      if (this.addressList.some(item => item.is_default)) {
        this.setDefaultAddress((this.addressList[0] as AddressItem | null)?.address_id)
      }
    },
    setDefaultAddress(addressId ?: number) {
      if (!addressId) {
        return;
      }
      this.addressList = this.addressList.map(item => ({
        ...item,
        is_default: item.address_id === addressId
      }))
    }
  }
});
