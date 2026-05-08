<template>
  <div class="admin-container">
    <div class="admin-header">
      <div class="logo">商城管理系统</div>
      <div class="user-info">
        <span>超级管理员</span>
        <el-button type="primary" link @click="logout">退出登录</el-button>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧菜单 -->
      <div class="sidebar">
        <div
          class="menu-item"
          :class="{ active: $route.path.includes(item.key) }"
          v-for="item in menuList"
          :key="item.key"
          @click="goMenu(item.key)"
        >
          {{ item.name }}
        </div>
      </div>

      <!-- 右侧二级路由出口 -->
      <div class="content-box">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAdminStore } from '@/stores/modules/adminStore'
import { onMounted } from 'vue'
const adminStore = useAdminStore()
const router = useRouter()
import {useLoginStore} from '@/stores/modules/common/loginStore'
const loginStore = useLoginStore()

const menuList = [
  { key: 'showdata', name: '数据概览' },
  { key: 'user', name: '用户管理' },
  { key: 'allProduct', name: '商品管理' },
  { key: 'allOrder', name: '订单管理' },
  { key: 'category', name: '分类管理' },
  { key: 'coupon', name: '优惠券管理' },
  { key: 'operationLog', name: '操作日志管理' },
  { key: 'activity', name: '营销活动管理' },
  { key: 'allComment', name: '评论管理' },
  // { key: 'allShop', name: '店铺监管' },
]

const goMenu = (key) => {
  router.push(`/manager/${key}`)
}

const logout = () => {
  loginStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}

onMounted(()=>{
  adminStore.initAdminStore() // 初始化数据
})
</script>

<style scoped>
/* 样式完全保留，不变 */
.admin-container {
  width: 100vw;
  height: 100vh;
  background: #f4f7fc;
  overflow: hidden;
}
.admin-header {
  height: 60px;
  background: #002140;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.logo { 
    font-size: 18px; 
    font-weight: bold; 
}
.user-info { 
    display: flex; 
    align-items: center; 
    gap: 15px; 
}
.main-content { display: flex; height: calc(100vh - 60px); }
.sidebar { width: 200px; background: #00315a; color: white; }
.menu-item { padding: 16px 20px; cursor: pointer; transition: 0.2s; }
.menu-item.active { background: #165DFF; font-weight: bold; }
.content-box { flex: 1; padding: 25px; overflow-y: auto; }
</style>