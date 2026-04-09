<template>
  <div class="address-manage">
    <div class="header-actions">
      <h3>收货地址管理</h3>
      <el-button type="primary" icon="Plus" @click="openAddressDialog()">新增地址</el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="12" v-for="item in userStore.addressList" :key="item.address_id">
        <el-card shadow="hover" class="address-card" :class="{ 'is-default': item.is_default }">
          <div class="card-header">
            <span class="name">{{ item.recipient_name }}</span>
            <span class="phone">{{ item.phone }}</span>
            <el-tag v-if="item.is_default" type="danger" size="small" effect="dark">默认</el-tag>
          </div>
          <div class="address-detail">
            <p>{{ item.address }}</p>
          </div>
          <div class="card-footer">
            <el-button link type="primary" @click="openAddressDialog(item)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(item.address_id)">删除</el-button>
            <el-button 
              v-if="item.is_default" 
              link 
              type="info" 
              @click="handleSetDefault(item.address_id)"
            >设为默认</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog 
      v-model="dialogVisible" 
      :title="formData.address_id ? '编辑地址' : '新增地址'" 
      width="800px"
    >
      <el-form :model="formData" label-width="80px" ref="formRef" :rules="rules">
        <el-form-item label="收货人" prop="recipient_name">
          <el-input v-model="formData.recipient_name" placeholder="姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="手机号码" />
        </el-form-item>
        <!-- 地图选择器 -->
        <el-form-item label="选择地址" prop="address" style="width: 100%;">
          <AmapSelect v-model="formData.address" />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="formData.is_default">设为默认收货地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import AmapSelect from '@/components/address/AmapSelector.vue'
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/modules/userStore'
import type { AddressItem } from '@/api/user/types'

const userStore = useUserStore()
userStore.init()

const dialogVisible = ref(false)
const formRef = ref(null)
// formData字段匹配接口
const formData = reactive<AddressItem>({
  address_id: 0,
  user_id: 1001, // 绑定当前用户
  recipient_name: '',
  phone: '',
  address: '', 
  lng: 0,
  lat: 0,
  province: '',
  city: '',
  district: '',
  street: '',
  streetNumber: '',
  is_default: false,
  type: 'delivery'
})

const rules = {
  recipient_name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

// 打开弹窗（新增/编辑共用）
const openAddressDialog = (row?: AddressItem) => {
  // console.log('打开地址弹窗', row)
  if (row) {
    Object.assign(formData, JSON.parse(JSON.stringify(row)))
    // console.log('编辑地址数据:', formData)
  } else {
    resetForm()
  }
  dialogVisible.value = true
}

const resetForm = () => {
  formData.address_id = 0
  formData.recipient_name = ''
  formData.phone = ''
  formData.address = ''
  formData.lng = 0
  formData.lat = 0
  formData.province = ''
  formData.city = ''
  formData.district = ''
  formData.street = ''
  formData.streetNumber = ''
  formData.is_default = false
  formData.type = 'delivery'
}

// 提交表单
const submitForm = async () => {
  await (formRef.value as any).validate((valid : boolean) => {
    if (valid) {
      if (formData.address_id) {
        // 调用store编辑方法
        userStore.editAddress(formData)
      } else {
        // 调用store新增方法
        userStore.addAddress(formData)
      }
      
      // 设置默认地址(在add/edit中完成)
      
      dialogVisible.value = false
      ElMessage.success('操作成功')
    }
  })
}

// 设置默认地址（调用store方法）
const handleSetDefault = (addressId : number) => {
  userStore.setDefaultAddress(addressId)
  ElMessage.success('默认地址设置成功')
}

// 删除地址（调用store方法）
const handleDelete = (addressId : number) => {
  ElMessageBox.confirm('确定删除该地址吗？', '提示', { type: 'warning' }).then(() => {
    userStore.deleteAddress(addressId)
    ElMessage.success('删除成功')
  })
}
</script>

<style scoped>
.address-manage {
  padding: 10px;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.address-card {
  margin-bottom: 20px;
  position: relative;
  transition: all 0.3s;
  border: 1px solid #eee;
}
.address-card.is-default {
  border-color: #ff5000;
  background-color: #fffcfb;
}
.card-header {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.name {
  font-weight: bold;
  font-size: 16px;
}
.phone {
  color: #666;
}
.address-detail {
  font-size: 14px;
  color: #333;
  height: 40px;
  line-height: 1.4;
}
.card-footer {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
  display: flex;
  justify-content: flex-end;
}
</style>