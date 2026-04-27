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

      <!-- 右侧主内容 -->
      <div class="content">
        <!-- 默认面板：数据概览 -->
        <div v-if="activeMenu === 'showData'">
          <h2>店铺数据概览</h2>
          <el-row :gutter="20" class="data-cards">
            <el-col :span="6">
              <div class="card">
                <div class="label">今日订单</div>
                <div class="value">24</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="card">
                <div class="label">今日销售额</div>
                <div class="value">¥ 3289</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="card">
                <div class="label">商品总数</div>
                <div class="value">68</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="card">
                <div class="label">待发货</div>
                <div class="value">9</div>
              </div>
            </el-col>
          </el-row>

          <h3>快捷操作</h3>
          <el-button type="primary" @click="toAddGoods">发布新商品</el-button>
          <el-button @click="toOrderList">订单管理</el-button>
          <el-button @click="toGoodsList">商品管理</el-button>
        </div>

        <!-- 商品管理 -->
        <div v-if="activeMenu === 'goods'">
          <h2>商品管理</h2>
          <el-button type="primary" size="small">新增商品</el-button>
          <el-table :data="goodsList" border style="margin-top:10px">
            <el-table-column prop="product_id" label="商品ID" />
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="price" label="价格" />
            <el-table-column prop="stock" label="库存" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="text" @click="editGoods(scope.row)">编辑</el-button>
                <el-button type="text" danger>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 订单管理 -->
        <div v-if="activeMenu === 'order'">
          <h2>订单管理</h2>
          <el-table :data="orderList" border>
            <el-table-column prop="order_id" label="订单号" />
            <el-table-column prop="total_amount" label="金额" />
            <el-table-column prop="status" label="状态" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="text">查看</el-button>
                <el-button type="text" v-if="scope.row.status === '待发货'">发货</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeMenu = ref('showData')

const menuList = ref([
  { key: 'showData', label: '数据概览' },
  { key: 'goods', label: '商品管理' },
  { key: 'order', label: '订单管理' },
  { key: 'comment', label: '评价管理' },
])

// 模拟商品列表（和你的数据库结构一致）
const goodsList = ref([
  { product_id: 10001, name: 'iPhone 15 Pro', price: 8999, stock: 50 },
  { product_id: 10008, name: '男士休闲夹克', price: 399, stock: 200 },
])

// 模拟订单
const orderList = ref([
  { order_id: '2024001', total_amount: 10898, status: '已完成' },
  { order_id: '2024006', total_amount: 399, status: '待发货' },
])

// 菜单切换
const switchMenu = (key) => {
  activeMenu.value = key
}

// 退出登录
const logout = () => {
  ElMessage.success('退出成功')
  router.push('/login')
}

// 去发布商品
const toAddGoods = () => {
  ElMessage.info('跳转到发布商品')
}
const toOrderList = () => { activeMenu.value = 'order' }
const toGoodsList = () => { activeMenu.value = 'goods' }
const editGoods = (row) => {
  ElMessage.info('编辑商品：' + row.name)
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
.data-cards {
  margin: 20px 0;
}
.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
.card .label {
  color: #999;
  font-size: 14px;
}
.card .value {
  font-size: 22px;
  font-weight: bold;
  margin-top: 10px;
}
</style>