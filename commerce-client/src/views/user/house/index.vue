<template>
  <div style="padding: 40px 0">
    <!-- 统计商品 -->
    <el-row :span="24" :gutter="30">
      <!-- 交易状态部分 -->
      <el-col :span="12" style="margin-right: 50px">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>我的交易</span>
            </div>
          </template>
          <el-row>
            <el-col :span="6" class="status-item">
              <div class="num">2</div>
              <div class="label">待付款</div>
            </el-col>
            <el-col :span="6" class="status-item">
              <div class="num">1</div>
              <div class="label">待发货</div>
            </el-col>
            <el-col :span="6" class="status-item">
              <div class="num">0</div>
              <div class="label">待收货</div>
            </el-col>
            <el-col :span="6" class="status-item">
              <div class="num">12</div>
              <div class="label">待评价</div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card class="content-card">
          <template #header>
            <div>
              <span>我的收藏 ></span>
            </div>
          </template>
          <div class="status-item">
            <div class="num">2</div>
            <div class="label">收藏</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card class="content-card">
          <template #header>
            <div>
              <span>购物车 ></span>
            </div>
          </template>
          <div class="status-item">
            <div class="num">2</div>
            <div class="label">购物车商品</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="guess-you-like">
      <h3 class="section-title">猜你喜欢</h3>
      <el-row :gutter="15">
        <el-col
          v-for="item in recommendProducts"
          :key="item.id"
          :xs="12"
          :sm="8"
          :md="6"
          :lg="6"
        >
          <ProductCard :name="item.name" :price="item.price" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
const recommendProducts = [
  { id: 1, name: '智能运动手表', price: '599.00' },
  { id: 2, name: '人体工学办公椅', price: '1299.00' },
  { id: 3, name: '便携式咖啡机', price: '399.00' },
  { id: 4, name: '全棉亲肤床品四件套', price: '268.00' },
  { id: 5, name: '多功能料理机', price: '899.00' },
  { id: 6, name: '降噪头戴式耳机', price: '1599.00' },
  { id: 1, name: '智能运动手表', price: '599.00' },
  { id: 2, name: '人体工学办公椅', price: '1299.00' },
  { id: 3, name: '便携式咖啡机', price: '399.00' },
  { id: 4, name: '全棉亲肤床品四件套', price: '268.00' },
  { id: 5, name: '多功能料理机', price: '899.00' },
  { id: 6, name: '降噪头戴式耳机', price: '1599.00' },
  { id: 1, name: '智能运动手表', price: '599.00' },
  { id: 2, name: '人体工学办公椅', price: '1299.00' },
  { id: 3, name: '便携式咖啡机', price: '399.00' },
  { id: 4, name: '全棉亲肤床品四件套', price: '268.00' },
  { id: 5, name: '多功能料理机', price: '899.00' },
  { id: 6, name: '降噪头戴式耳机', price: '1599.00' },
]
</script>

<style scoped>
/* 右侧内容独立滚动 */
.scroll-content {
  /* 确保右侧内容不会因为左侧固定而产生布局塌陷 */
  min-height: 100%;
}

/* 覆盖原有错误样式 */
.breadcrumb {
  margin-bottom: 0;
  position: static;
}

/* 右侧内容样式 */
.content-card {
  margin-bottom: 30px;
}

.status-item {
  text-align: center;
  padding: 20px 0;
}

.status-item .num {
  font-size: 24px;
  color: #ff5000;
  font-weight: bold;
}

/* 猜你喜欢样式 */
.guess-you-like {
  margin-top: 10px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #ff5000;
}

.recommend-col {
  margin-bottom: 15px;
}
</style>
