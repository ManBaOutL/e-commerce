<template>
  <div class="merchant-page">
    <!-- 顶部栏 -->
    <div class="header">
      <div class="title">商家管理后台</div>
      <div class="user-info">
        <span>欢迎回来，商家账号</span>
        <el-button type="text" @click="logout">退出登录</el-button>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="container">
      <!-- 左侧菜单 -->
      <div class="sidebar">
        <div
          class="menu-item"
          :class="{ active: activeMenu === item.key }"
          v-for="item in menuList"
          :key="item.key"
          @click="switchMenu(item.key)"
        >
          {{ item.label }}
        </div>
      </div>

      <!-- 右侧主内容：二级路由出口 -->
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 初始化激活的菜单（匹配当前路由）
const activeMenu = ref(route.path.split('/').pop() || 'dashboard')

const menuList = ref([
  { key: 'showdata', label: '数据概览' },
  { key: 'product', label: '商品管理' },
  { key: 'order', label: '订单管理' },
  { key: 'comment', label: '评价管理' },
  { key: 'merchantCenter', label: '商家中心' },
])

// 菜单切换 -> 跳转对应二级路由
const switchMenu = (key) => {
  activeMenu.value = key
  router.push(`/merchant/${key}`)
}

// 退出登录
const logout = () => {
  ElMessage.success('退出成功')
  router.push('/login')
}
</script>

<style scoped>
.merchant-page {
  background: #f5f7fa;
  min-height: 100vh;
}
.header {
  background: #2f4050;
  color: white;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
.container {
  display: flex;
}
.sidebar {
  width: 200px;
  background: #2f4050;
  min-height: calc(100vh - 60px);
  color: white;
}
.menu-item {
  padding: 15px 20px;
  cursor: pointer;
}
.menu-item.active {
  background: #1ab394;
}
.content {
  flex: 1;
  padding: 20px;
}
</style>