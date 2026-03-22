<template>
  <div class="cart-page">
    <div class="page-container">
      <div class="cart-navigation">
        <div class="nav-left">
          <el-button @click="goHome" :icon="HomeFilled" link>返回首页</el-button>
        </div>

        <div class="nav-right">
          <el-button @click="goUserCenter" type="warning" plain>用户中心</el-button>
        </div>
      </div>

      <div class="cart-header">
        <h2 class="title">购物车 (全部 {{ cartList.length }})</h2>
      </div>

      <div class="table-header">
        <el-row align="middle">
          <el-col :span="2">
            <el-checkbox v-model="isAllSelected" label="全选" />
          </el-col>
          <el-col :span="10">商品信息</el-col>
          <el-col :span="3">单价</el-col>
          <el-col :span="4">数量</el-col>
          <el-col :span="3">金额</el-col>
          <el-col :span="2">操作</el-col>
        </el-row>
      </div>

      <div class="cart-list">
        <div v-for="item in cartList" :key="item.id" class="cart-item">
          <el-row align="middle">
            <el-col :span="2">
              <el-checkbox v-model="item.selected" />
            </el-col>
            <el-col :span="10">
              <div class="product-info">
                <div class="img-box">图片</div>
                <div class="text-content">
                  <p class="p-name">{{ item.name }}</p>
                  <p class="p-desc">规格：{{ item.spec }}</p>
                </div>
              </div>
            </el-col>
            <el-col :span="3">
              <span class="unit-price">¥{{ item.price }}</span>
            </el-col>
            <el-col :span="4">
              <el-input-number v-model="item.count" :min="1" size="small" />
            </el-col>
            <el-col :span="3">
              <span class="total-price">¥{{ (item.price * item.count).toFixed(2) }}</span>
            </el-col>
            <el-col :span="2">
              <el-button type="danger" link>删除</el-button>
            </el-col>
          </el-row>
        </div>
      </div>

      <div class="footer-bar">
        <div class="left">
          <el-checkbox v-model="isAllSelected" label="全选" />
          <span class="action-btn">删除选中商品</span>
          <span class="action-btn">移入收藏夹</span>
        </div>
        <div class="right">
          <div class="summary">
            <span>已选商品 <em class="count">2</em> 件</span>
            <span>合计（不含运费）：<em class="total">¥ 2598.00</em></span>
          </div>
          <el-button type="primary" size="large" class="submit-btn">结 算</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isAllSelected = ref(false)

const goHome = () => {
  router.push('/')
}

const goUserCenter = () => {
  router.push('/center')
}

const cartList = ref([
  { id: 1, name: '2026新款 降噪无线蓝牙耳机', spec: '经典黑', price: 299.00, count: 1, selected: true },
  { id: 2, name: '机械键盘 104键 RGB版', spec: '青轴', price: 499.00, count: 1, selected: false },
  { id: 3, name: '超高性能 4K 显示器', spec: '27英寸', price: 1800.00, count: 1, selected: true },
])
</script>

<style scoped>
/* 顶部导航样式 */
.cart-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 让左、中、右分布 */
  padding: 15px 0;
  margin-bottom: 10px;
}

.cart-page {
  padding-top: 20px;
  padding-bottom: 100px; /* 为底部吸顶栏留出空间 */
  /* 居中 */
  max-width: 1200px;
  margin: 0 auto;
}

.cart-header {
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

/* 表头样式 */
.table-header {
  background: #fff;
  padding: 15px 20px;
  border-radius: 8px 8px 0 0;
  color: #666;
  font-size: 14px;
}

/* 列表样式 */
.cart-list {
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.cart-item {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.product-info {
  display: flex;
  align-items: center;
}

.img-box {
  width: 80px;
  height: 80px;
  background: #f5f5f5;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
}

.p-name {
  font-size: 14px;
  margin: 0 0 8px 0;
}

.p-desc {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.unit-price {
  font-size: 14px;
}

.total-price {
  color: #ff5000;
  font-weight: bold;
}

/* 底部工具栏 */
.footer-bar {
  position: fixed;
  bottom: 0;
  width: 1200px; /* 与 page-container 保持一致 */
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 -5px 15px rgba(0,0,0,0.05);
  box-sizing: border-box;
  z-index: 100;
}

.left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-btn {
  font-size: 14px;
  cursor: pointer;
}

.right {
  display: flex;
  align-items: center;
}

.summary {
  margin-right: 30px;
  font-size: 14px;
}

.summary em {
  font-style: normal;
  color: #ff5000;
  font-weight: bold;
  font-size: 18px;
  margin: 0 5px;
}

.submit-btn {
  width: 120px;
  height: 50px;
  font-size: 18px;
  background-color: #ff5000;
  border-color: #ff5000;
}
</style>