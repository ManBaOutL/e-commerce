<template>
  <div class="address-manage">
    <div class="header-actions">
      <h3>收货地址管理</h3>
      <el-button type="primary" icon="Plus" @click="openAddressDialog()">新增地址</el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="12" v-for="item in addressList" :key="item.id">
        <el-card shadow="hover" class="address-card" :class="{ 'is-default': item.is_default }">
          <div class="card-header">
            <span class="name">{{ item.recipient_name }}</span>
            <span class="phone">{{ item.phone }}</span>
            <el-tag v-if="item.is_default" type="danger" size="small" effect="dark">默认</el-tag>
          </div>
          <div class="address-detail">
            <p>{{ item.address_line1 }}</p>
          </div>
          <div class="card-footer">
            <el-button link type="primary" @click="openAddressDialog(item)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(item.id)">删除</el-button>
            <el-button 
              v-if="!item.is_default" 
              link 
              type="info" 
              @click="handleSetDefault(item.id)"
            >设为默认</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog 
      v-model="dialogVisible" 
      :title="formData.id ? '编辑地址' : '新增地址'" 
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
        <el-form-item label="选择地址" prop="address_line1" style="width: 100%;">
          <AmapSelect v-model="formData.address_line1" />
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

<script setup>
import AmapSelect from '@/components/address/AmapSelector.vue'
import { ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟初始数据 (后续对接 data.json)
const addressList = ref([
  { id: 1, recipient_name: '张三', phone: '13800000000', address_line1: '某某省某某市某某区 某某街道1号', is_default: true }
])

const dialogVisible = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  recipient_name: '',
  phone: '',
  address_line1: '',
  is_default: false
})

const rules = {
  recipient_name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  address_line1: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

// 打开弹窗（新增/编辑共用）
const openAddressDialog = (row = null) => {
  console.log('打开地址弹窗', row)
  if (row) {
    Object.assign(formData, JSON.parse(JSON.stringify(row)))
    console.log('编辑地址数据:', formData)
  } else {
    resetForm()
  }
  dialogVisible.value = true
}
// 地图弹窗初始化
// const handleDialogOpen = () => {
//   nextTick(() => {
//     // 如果是编辑地址，地图组件会自动加载并显示当前地址位置
//   })
// }

const resetForm = () => {
  formData.id = null
  formData.recipient_name = ''
  formData.phone = ''
  formData.address_line1 = ''
  formData.is_default = false
}

// 提交表单
const submitForm = async () => {
  await formRef.value.validate((valid) => {
    if (valid) {
      if (formData.id) {
        // 编辑逻辑
        const index = addressList.value.findIndex(i => i.id === formData.id)
        addressList.value[index] = { ...formData }
      } else {
        // 新增逻辑
        addressList.value.push({ ...formData, id: Date.now() })
      }
      
      // 如果设为默认，需取消其他默认
      if (formData.is_default) {
        handleSetDefault(formData.id || addressList.value[addressList.value.length - 1].id)
      }
      
      dialogVisible.value = false
      ElMessage.success('操作成功')
      console.log('地址表单数据:', formData)
      console.log('地址列表数据:', addressList.value)
    }
  })
}

// 设置默认地址
const handleSetDefault = (id) => {
  addressList.value.forEach(item => {
    item.is_default = (item.id === id)
  })
}

// 删除地址
const handleDelete = (id) => {
  ElMessageBox.confirm('确定删除该地址吗？', '提示', { type: 'warning' }).then(() => {
    addressList.value = addressList.value.filter(i => i.id !== id)
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