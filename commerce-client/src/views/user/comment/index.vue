<template>
  <div class="my-comments-page">
    <main class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/user' }">个人中心</el-breadcrumb-item>
        <el-breadcrumb-item>我的评价</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="comment-list" v-loading="loading">
        <el-empty v-if="!loading && commentList.length === 0" description="您还没有发表过任何评价哦~" />

        <div v-for="item in commentList" :key="item.review_id" class="comment-card card">
          <div class="product-info" @click="goToDetail(item.product_id)">
            <el-image 
              class="product-img" 
              :src="getFullUrl(item.product_image)" 
              fit="cover"
            />
            <div class="product-name">{{ item.product_name }}</div>
          </div>

          <div class="review-content">
            <div class="review-header">
              <el-rate v-model="item.rating" disabled text-color="#ff9f00" />
              <span class="time">{{ item.create_time }}</span>
            </div>

            <div class="text-content">{{ item.comment }}</div>
            <div class="image-list" v-if="item.images && item.images.length > 0">
              <el-image 
                v-for="(img, idx) in item.images" :key="'img_'+idx"
                class="review-img"
                :src="getFullUrl(img)"
                :preview-src-list="item.images.map(( i: string) => getFullUrl(i))"
                fit="cover"
              />
            </div>

            <div class="merchant-reply" v-if="item.merchant_reply">
              <span class="reply-label">商家回复：</span>
              <span>{{ item.merchant_reply }}</span>
            </div>

            <div class="append-review" v-if="item.is_appended === 1">
              <div class="append-header">
                <span class="append-badge">用户追评</span>
                <span class="append-time">{{ item.append_time }}</span>
              </div>
              <div class="text-content">{{ item.append_content }}</div>
              <div class="image-list" v-if="item.append_images && item.append_images.length > 0">
                <el-image 
                  v-for="(img, idx) in item.append_images" :key="'app_img_'+idx"
                  class="review-img"
                  :src="getFullUrl(img)"
                  :preview-src-list="item.append_images.map((i: string) => getFullUrl(i))"
                  fit="cover"
                />
              </div>
            </div>

            <div class="action-bar">
              <el-button 
                v-if="item.is_appended === 0" 
                type="primary" 
                plain 
                size="small" 
                @click="goAppend(item)"
              >
                追加评价
              </el-button>
              <el-button 
                type="danger" 
                link 
                size="small" 
                @click="handleDelete(item.review_id)"
              >
                删除评价
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/modules/user/userStore' 
import getFullUrl from '@/utils/getFullUrl'

const router = useRouter()
const userStore = useUserStore()

// 使用 storeToRefs 提取响应式状态，UI 会自动根据 loading 和 commentList 的变化而重新渲染
const { commentList, loading } = storeToRefs(userStore)

// 初始化加载数据
onMounted(() => {
  loadComments()
})

// 包装一层加载函数，方便后续复用
const loadComments = async () => {
  try {
    await userStore.fetchMyComments()
  } catch (error) {
    ElMessage.error('获取评价列表失败')
  }
}

// 🌟 2. 去追评 (复用我们之前写好的 order-comment.vue)
const goAppend = (item: any) => {
  router.push({
    path: '/user/orders/comment',
    query: {
      orderId: item.order_id,
      productId: item.product_id,
      productName: item.product_name,
      productImage: item.product_image,
      reviewId: item.review_id,
      mode: 'append'
    }
  })
}

// 🌟 3. 删除评价
const handleDelete = (reviewId: number) => {
  ElMessageBox.confirm(
    '确定要删除这条评价吗？删除后将无法恢复。',
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      // 触发 Store 中的删除方法
      const res = await userStore.deleteComment(reviewId)
      if (res.success) {
        ElMessage.success('评价已删除')
        loadComments() // 删除成功后，重新拉取最新列表
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      ElMessage.error('网络请求异常')
    }
  }).catch((err) => {
    if (err !== 'cancel') console.log(err) // 忽略用户点击取消带来的报错
  })
}

const goToDetail = (productId: number) => {
  router.push(`/goods/${productId}`)
}
</script>

<style scoped>
.my-comments-page { background: #f5f5f5; padding: 20px; min-height: 100vh; }
.container { max-width: 1000px; margin: 0 auto; }
.breadcrumb { margin-bottom: 20px; }
.card { background: #fff; border-radius: 8px; margin-bottom: 16px; padding: 20px; }

.comment-card { display: flex; gap: 24px; transition: all 0.3s; }
.comment-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

/* 左侧商品信息 */
.product-info { width: 140px; cursor: pointer; text-align: center; }
.product-img { width: 100px; height: 100px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #f0f0f0; }
.product-name { font-size: 13px; color: #333; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.product-info:hover .product-name { color: #ff5000; }

/* 右侧评价信息 */
.review-content { flex: 1; }
.review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.time { font-size: 13px; color: #999; }
.text-content { font-size: 14px; color: #333; line-height: 1.6; margin-bottom: 12px; }

.image-list { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
.review-img { width: 80px; height: 80px; border-radius: 4px; cursor: zoom-in; }

/* 商家回复 */
.merchant-reply { background: #f9f9f9; padding: 12px; border-radius: 6px; font-size: 13px; color: #666; margin-bottom: 12px; }
.reply-label { color: #ff5000; font-weight: 500; }

/* 追评区域 */
.append-review { margin-top: 16px; padding-top: 16px; border-top: 1px dashed #eee; }
.append-header { margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
.append-badge { font-size: 12px; color: #ff5000; border: 1px solid #ff5000; padding: 2px 6px; border-radius: 4px; }
.append-time { font-size: 13px; color: #999; }

/* 操作栏 */
.action-bar { display: flex; justify-content: flex-end; gap: 16px; margin-top: 16px; }
</style>