<template>
  <div>
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
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 去发布商品
const toAddGoods = () => {
  ElMessage.info('跳转到发布商品')
}
const toOrderList = () => {
  router.push('/merchant/order')
}
const toGoodsList = () => {
  router.push('/merchant/goods')
}
</script>

<style scoped>
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