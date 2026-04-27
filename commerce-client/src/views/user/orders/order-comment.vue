<template>
  <div class="comment-page">
    <main class="comment-container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/user/orders' }">我的订单</el-breadcrumb-item>
        <el-breadcrumb-item>{{ isAppendMode ? '追加评价' : '发表评价' }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div v-if="isAppendMode" class="append-notice" style="margin-bottom: 16px;">
        <el-alert title="您正在进行追加评价，追加内容将展示在原评价下方" type="warning" :closable="false" show-icon />
      </div>

      <div class="card goods-card">
        <div class="goods-item">
          <div class="goods-img">
            <el-image 
              v-if="targetProductImage"
              style="width: 100%; height: 100%; border-radius: 6px;"
              :src="getFullUrl(targetProductImage)" 
              fit="cover"
            />
          </div>
          <div class="goods-info">
            <div class="name">{{ targetProductName }}</div>
            <div class="spec">{{ isAppendMode ? '已经使用了一段时间，和大家分享一下追评心得吧' : '请对您购买的商品进行评价' }}</div>
          </div>
        </div>
      </div>

      <div class="card" v-if="!isAppendMode">
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
      <div class="card" v-else>
        <div class="title">商品评分</div>
        <p style="color: #999; font-size: 14px;">首评已打分，追评无需重新评分</p>
      </div>

      <div class="card">
        <div class="title">{{ isAppendMode ? '追评内容' : '评价内容' }}</div>
        <el-input
          v-model="content"
          type="textarea"
          :rows="4"
          :placeholder="isAppendMode ? '已经使用了一段时间，有更多心得？和大家分享一下吧 (不少于5个字)' : '请输入您的评价，不少于5个字'"
        />
      </div>

      <div class="card">
        <div class="title">图片/视频（可选）</div>
        <el-upload
          v-model:file-list="fileList"
          class="uploader"
          action="/api/user/media/upload" 
          :headers="uploadHeaders"
          :limit="3"
          list-type="picture-card"
          accept="image/*,video/mp4"
          :on-preview="handlePreview"
          :on-success="handleUploadSuccess"
          :before-upload="beforeMediaUpload"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <div class="upload-tip" style="font-size: 12px; color: #999; margin-top: 8px;">
          最多上传 3 张图片或视频，单张大小不超过 5MB
        </div>

        <el-dialog v-model="dialogVisible" title="媒体预览">
          <img w-full :src="dialogImageUrl" alt="Preview Image" style="width: 100%;" v-if="!dialogImageUrl.endsWith('.mp4')" />
          <video :src="dialogImageUrl" controls style="width: 100%;" v-else></video>
        </el-dialog>
      </div>

      <div class="action-bar">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" @click="submitComment" :loading="loading">
          {{ isAppendMode ? '提交追评' : '提交评价' }}
        </el-button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user/userStore' 
import request from '@/utils/request' // 🌟 引入你的 request 工具用来发追评请求
import getFullUrl from '@/utils/getFullUrl'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const score = ref(5)
const content = ref('')
const loading = ref(false)

// 🌟 页面状态参数
const isAppendMode = ref(false) // 是否为追评模式
const targetReviewId = ref<number | null>(null) // 追评目标ID
const targetOrderId = ref<string>('')
const targetProductId = ref<number | null>(null)
const targetProductName = ref<string>('您购买的商品')
const targetProductImage = ref<string>('')

// 页面初始化时，提取并严格校验路由参数
onMounted(async () => {
  const qOrderId = route.query.orderId;
  const qProductId = route.query.productId;
  const qMode = route.query.mode;
  const qReviewId = route.query.reviewId;

  // 🚨 第一道防线：参数完整性拦截
  if (!qOrderId || !qProductId) {
    ElMessage.error('非法访问：缺少核心商品或订单参数');
    // 🌟 核心技巧：用 replace 代替 push，不让这个非法URL留在浏览器的历史记录里
    return router.replace('/user/orders'); 
  }

  // 🚨 第二道防线：追评模式专属拦截
  if (qMode === 'append') {
    if (!qReviewId) {
      ElMessage.error('非法访问：缺少追评凭证');
      return router.replace('/user/orders');
    }
    isAppendMode.value = true;
    targetReviewId.value = Number(qReviewId);
  }

  // 参数安全，开始赋值渲染页面
  targetOrderId.value = qOrderId as string;
  targetProductId.value = Number(qProductId);
  if (route.query.productName) {
    targetProductName.value = route.query.productName as string;
  }
  if (route.query.productImage) {
    targetProductImage.value = route.query.productImage as string;
  }

  /* * 💡 高阶企业级防御（可选/建议）：
   * 即使参数全都有，万一这是用户随便瞎编的 orderId 怎么办？
   * 真正严谨的做法是：在这里立刻发一个请求给后端，问一下：
   * 1. 这个 order_id 属于当前登录的人吗？
   * 2. 这个订单的状态是“已完成”吗？
   * 3. (如果是首评) 它是不是还没被评价过？
   * 如果后端返回 false，立刻用 router.replace('/user/orders') 踢出去。
   */
})

// 媒体上传相关状态
const fileList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogImageUrl = ref('')

// 提取并清理 Token
const rawToken = localStorage.getItem('token') || ''
const cleanToken = rawToken.replace(/(^"|"$)/g, '') 

// 组装专属的上传请求头
const uploadHeaders = ref({
  Authorization: `Bearer ${cleanToken}`,
  token: cleanToken 
})

// 上传前校验
const beforeMediaUpload = (file: any) => {
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('上传媒体大小不能超过 5MB!');
    return false;
  }
  return true;
}

// 上传成功
const handleUploadSuccess = (response: any, uploadFile: any) => {
  if (response.success) {
    uploadFile.url = getFullUrl(response.data.url); 
  } else {
    ElMessage.error('图片上传失败');
  }
}

// 预览
const handlePreview = (uploadFile: any) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

// 🌟 提交评价核心逻辑 (双模式处理)
const submitComment = async () => {
  if (!isAppendMode.value && !score.value) return ElMessage.warning('请为商品打个分数吧')
  if (!content.value || content.value.trim().length < 5) return ElMessage.warning('评价内容不能少于5个字哦')

  try {
    loading.value = true;
    
    // 1. 提取媒体文件
    const uploadedImages: string[] = [];
    let uploadedVideo = '';

    fileList.value.forEach(file => {
      const path = file.response?.data?.url || file.url; 
      if (path && path.endsWith('.mp4')) {
        uploadedVideo = path;
      } else if (path) {
        uploadedImages.push(path);
      }
    });

    // 2. 根据模式调用不同接口
    if (isAppendMode.value) {
      // 🌟 模式 A：追加评价
      const res = await userStore.appendProductComment({
        review_id: targetReviewId.value as number,
        content: content.value,
        images: uploadedImages.length > 0 ? uploadedImages.join(',') : undefined,
        video: uploadedVideo || undefined
      });
      
      if (res.success) {
        ElMessage.success('追评成功！感谢您的分享');
        setTimeout(() => router.replace('/user/orders'), 1000);
      } else {
        ElMessage.error(res.message || '追评失败');
      }

    } else {
      // 🌟 模式 B：首次评价 (走原有的 userStore action)
      const payload = {
        order_id: targetOrderId.value,
        product_id: targetProductId.value as number,
        rating: score.value,
        content: content.value,
        images: uploadedImages.length > 0 ? uploadedImages.join(',') : undefined,
        video: uploadedVideo || undefined
      };

      const res = await userStore.submitProductComment(payload);
      if (res.success) {
        ElMessage.success('评价成功！感谢您的反馈');
        setTimeout(() => router.replace('/user/orders'), 1000);
      } else {
        ElMessage.error(res.message || '评价失败');
      }
    }

  } catch (error) {
    ElMessage.error('程序异常，请稍后再试');
  } finally {
    loading.value = false;
  }
}

const goBack = () => router.go(-1)
</script>

<style scoped>
.comment-page { background: #f5f5f5; padding: 20px; min-height: 100vh; }
.comment-container { max-width: 900px; margin: 0 auto; }
.breadcrumb { margin-bottom: 16px; }
.card { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; }
.title { font-weight: 500; font-size: 16px; margin-bottom: 12px; }
.star-row { font-size: 28px; }
.goods-item { display: flex; align-items: center; }
.goods-img { width: 70px; height: 70px; background: #f2f2f2; border-radius: 6px; margin-right: 12px; }
.goods-info .name { font-weight: 500; margin-bottom: 4px; }
.goods-info .spec { color: #999; font-size: 13px; }
.action-bar { display: flex; justify-content: flex-end; gap: 10px; }
</style>