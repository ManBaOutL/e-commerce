<template>
  <div class="comment-page">
    <main class="comment-container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/user/orders' }">我的订单</el-breadcrumb-item>
        <el-breadcrumb-item>订单评价</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 商品信息 -->
      <div class="card goods-card" v-if="order">
        <div class="goods-item">
          <div class="goods-img"></div>
          <div class="goods-info">
            <div class="name">{{ order.details[0]?.product_name }}</div>
            <div class="spec">规格：默认</div>
          </div>
        </div>
      </div>

      <!-- 评分区域 -->
      <div class="card">
        <div class="title">商品评分</div>
        <div class="star-row">
          <el-rate
            v-model="score"
            :max="5"
            allow-half
            text-color="#ff9f00"
            score-template="{value}分"
          />
        </div>
      </div>

      <!-- 评价内容 -->
      <div class="card">
        <div class="title">评价内容</div>
        <el-input
          v-model="content"
          type="textarea"
          :rows="4"
          placeholder="请输入您的评价，不少于10个字"
        />
      </div>

      <!-- 图片上传（预留） -->
      <div class="card">
        <div class="title">图片/视频（可选）</div>
        <el-upload
          class="uploader"
          :limit="3"
          list-type="picture"
          accept="image/*"
        >
          <el-button type="primary" size="small">上传图片</el-button>
          <template #tip>
            <div class="el-upload__tip">最多上传3张</div>
          </template>
        </el-upload>
      </div>

      <!-- 提交 -->
      <div class="action-bar">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" @click="submitComment" :loading="loading">
          提交评价
        </el-button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const order = ref(null)
const score = ref(5)
const content = ref('')
const loading = ref(false)

// 模拟订单数据（和你项目一致）
const orderList = [
  {
    order_id: 2024001,
    total_amount: 10698.0,
    status: '已完成',
    create_time: '2024-02-10 10:30:00',
    address: { recipient_name: '张伟', phone: '13800138002', address_line1: '阳光新城12栋301室', city: '北京市', state: '朝阳区' },
    coupon: { name: '满10000减200', discount: 200 },
    details: [{ product_id: 10001, product_name: 'iPhone 15 Pro', price: 8999, quantity: 1 }]
  },
  {
    order_id: 2024002,
    status: '已完成',
    details: [{ product_name: '华为 Mate 60 Pro' }]
  }
]

onMounted(() => {
  const orderId = route.query.orderId
  if (orderId) {
    order.value = orderList.find(o => o.order_id == orderId)
  }
})

const submitComment = () => {
  if (!score.value) return ElMessage.warning('请打星')
  if (!content.value || content.value.length < 10) return ElMessage.warning('评价不少于10字')

  loading.value = true
  setTimeout(() => {
    ElMessage.success('评价成功！感谢您的反馈')
    router.push('/user/orders')
  }, 800)
}

const goBack = () => router.go(-1)
</script>

<style scoped>
.comment-page {
  background: #f5f5f5;
  padding: 20px;
  min-height: 100vh;
}
.comment-container {
  max-width: 900px;
  margin: 0 auto;
}
.breadcrumb {
  margin-bottom: 16px;
}
.card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.title {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 12px;
}
.star-row {
  font-size: 28px;
}

/* 商品展示 */
.goods-item {
  display: flex;
  align-items: center;
}
.goods-img {
  width: 70px;
  height: 70px;
  background: #f2f2f2;
  border-radius: 6px;
  margin-right: 12px;
}
.goods-info .name {
  font-weight: 500;
  margin-bottom: 4px;
}
.goods-info .spec {
  color: #999;
  font-size: 13px;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>