<template>
  <div class="merchant-page">
    <div class="header">
      <div class="title">商家管理中心</div>
      <div class="user-info">
        <span>欢迎，{{ userInfo.nickname }}</span>
        <el-button type="text" @click="logout">退出</el-button>
      </div>
    </div>

    <div class="container">
      <!-- 无店铺 → 显示创建页面 -->
      <div v-if="!userInfo.hasShop" class="no-shop-box">
        <el-icon size="50" color="#1ab394"><Shop /></el-icon>
        <h3>您尚未创建店铺</h3>
        <p>创建后即可使用商品管理、订单管理等功能</p>
        <el-button type="primary" size="default" @click="openCreateDialog">立即创建店铺</el-button>
      </div>

      <!-- 有店铺 → 正常显示菜单 + 内容 -->
      <template v-else>
        <div class="sidebar">
          <div
            class="menu-item"
            :class="{ active: activeMenu === item.key }"
            v-for="item in menuList"
            :key="item.key"
            @click="goPage(item.key)"
          >
            {{ item.label }}
          </div>
        </div>

        <div class="main-content">
          <router-view />
        </div>
      </template>
    </div>

    <!-- 新建店铺弹窗 -->
    <el-dialog v-model="showCreate" title="创建我的店铺" width="550px">
      <el-form :model="shopForm" :rules="rules" ref="formRef" label-width="110px">
        <el-form-item label="店铺名称" prop="shopName">
          <el-input v-model="shopForm.shopName" placeholder="请输入店铺名称" />
        </el-form-item>

        <el-form-item label="店铺描述" prop="description">
          <el-input
            v-model="shopForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入店铺简介"
          />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input
            v-model="shopForm.phone"
            :disabled="!!userInfo.phone"
            placeholder="请输入联系电话"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">确认创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Shop } from '@element-plus/icons-vue'

const router = useRouter()

// ==============================================
// ✅ 优化后标准用户数据格式（4种角色，任选一个打开）
// ==============================================

// 1. 手机登录 + 有店铺（带完整店铺数据）
// const userInfo = reactive({
//   id: 1001,
//   nickname: '手机商家',
//   phone: '13812345678',
//   email: '',
//   hasShop: true,
//   shopInfo: {
//     shopName: 'Apple精品店',
//     description: '主营苹果全系列产品',
//     phone: '13812345678'
//   }
// })

//2. 手机登录 + 无店铺
const userInfo = reactive({
  id: 1002,
  nickname: '手机商家(无店)',
  phone: '13899887766',
  email: '',
  hasShop: false,
  shopInfo: null
})

// 3. 邮箱登录 + 有店铺（带完整店铺数据）
// const userInfo = reactive({
//   id: 1003,
//   nickname: '邮箱商家',
//   phone: '',
//   email: 'shop@qq.com',
//   hasShop: true,
//   shopInfo: {
//     shopName: '华为数码店',
//     description: '华为手机、电脑专卖',
//     phone: '13900001111'
//   }
// })

// 4. 邮箱登录 + 无店铺
// const userInfo = reactive({
//   id: 1004,
//   nickname: '邮箱商家(无店)',
//   phone: '',
//   email: 'new@163.com',
//   hasShop: false,
//   shopInfo: null
// })

// ==============================================

const activeMenu = ref('showData')
const showCreate = ref(false)
const formRef = ref(null)

const menuList = ref([
  { key: 'showData', label: '数据概览' },
  { key: 'product', label: '商品管理' },
  { key: 'order', label: '订单管理' },
  { key: 'comment', label: '评论管理' },
  { key: 'merchantCenter', label: '店铺中心' },
])

// 表单初始化
const shopForm = reactive({
  shopName: '',
  description: '',
  phone: userInfo.phone || ''
})

const rules = reactive({
  shopName: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入店铺描述', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' }
  ]
})

// 打开创建
const openCreateDialog = () => {
  showCreate.value = true
}

// 提交创建
const submitCreate = async () => {
  await formRef.value.validate()
  userInfo.hasShop = true
  userInfo.shopInfo = { ...shopForm }

  const operation = 'create'
  

  showCreate.value = false
  ElMessage.success('店铺创建成功！')
}

// 菜单跳转
const goPage = (key) => {
  activeMenu.value = key
  router.push(`/merchant/${key}`)
}

// 退出
const logout = () => {
  router.push('/login')
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  ElMessage.success('退出成功')
}
</script>

<style scoped>
.merchant-page {
  height: 100vh;
  background: #f5f7fa;
}
.header {
  height: 60px;
  background: #2f4050;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.container {
  display: flex;
  height: calc(100vh - 60px);
}
.sidebar {
  width: 200px;
  background: #2f4050;
  color: white;
}
.menu-item {
  padding: 15px 20px;
  cursor: pointer;
}
.menu-item.active {
  background: #1ab394;
}
.main-content {
  flex: 1;
  padding: 20px;
}
.no-shop-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.no-shop-box h3 {
  margin: 15px 0;
}
</style>