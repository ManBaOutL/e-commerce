<template>
  <div class="comment-page">
    <main class="comment-container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/user/orders' }">我的订单</el-breadcrumb-item>
        <el-breadcrumb-item>发表评价</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="card goods-card">
        <div class="goods-item">
          <div class="goods-img"></div>
          <div class="goods-info">
            <div class="name">{{ targetProductName }}</div>
            <div class="spec">请对您购买的商品进行评价</div>
          </div>
        </div>
      </div>

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

      <div class="card">
        <div class="title">评价内容</div>
        <el-input
          v-model="content"
          type="textarea"
          :rows="4"
          placeholder="请输入您的评价，不少于5个字"
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
          提交评价
        </el-button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/modules/user/userStore' 
import getFullUrl from '@/utils/getFullUrl'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const score = ref(5)
const content = ref('')
const loading = ref(false)

// 页面状态参数
const targetOrderId = ref<string>('')
const targetProductId = ref<number | null>(null)
const targetProductName = ref<string>('您购买的商品')

// 页面初始化时，提取路由参数
onMounted(() => {
  targetOrderId.value = route.query.orderId as string;
  targetProductId.value = Number(route.query.productId);
  if (route.query.productName) {
    targetProductName.value = route.query.productName as string;
  }

  // 严格拦截：没带订单ID或商品ID，直接踢回上一页
  if (!targetOrderId.value || !targetProductId.value) {
    ElMessage.error('缺少必要的订单或商品信息');
    setTimeout(() => { goBack() }, 1500);
  }
})

// 🌟 媒体上传相关状态
const fileList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogImageUrl = ref('')

// 🌟 核心修复：提取并清理 Token，去除首尾烦人的双引号
const rawToken = localStorage.getItem('token') || ''
const cleanToken = rawToken.replace(/(^"|"$)/g, '') 

// 🌟 组装专属的上传请求头
const uploadHeaders = ref({
  Authorization: `Bearer ${cleanToken}`,
  token: cleanToken // 加上这个以防你的后端 auth 中间件取的是小写的 token
})

// 上传前校验格式和大小
const beforeMediaUpload = (file: any) => {
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('上传媒体大小不能超过 5MB!');
    return false;
  }
  return true;
}

// 上传成功时的钩子
const handleUploadSuccess = (response: any, uploadFile: any) => {
  if (response.success) {
    // 🌟 核心修复：给 UI 预览用的 url 拼上完整的后端域名前缀 (http://127.0.0.1:8888/...)
    uploadFile.url = getFullUrl(response.data.url); 
  } else {
    ElMessage.error('图片上传失败');
  }
}

// 点击缩略图预览
const handlePreview = (uploadFile: any) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

// 🌟 核心：重写 submitComment，提取图片/视频路径
const submitComment = async () => {
  if (!score.value) return ElMessage.warning('请为商品打个分数吧')
  if (!content.value || content.value.trim().length < 5) return ElMessage.warning('评价内容不能少于5个字哦')

  try {
    loading.value = true;
    
    // 1. 从 fileList 中提取真正的图片和视频路径
    const uploadedImages: string[] = [];
    let uploadedVideo = '';

    fileList.value.forEach(file => {
      // 这里的 file.url 应该是上传成功后得到的相对路径
      const path = file.response?.data?.url || file.url; 
      if (path && path.endsWith('.mp4')) {
        uploadedVideo = path;
      } else if (path) {
        uploadedImages.push(path);
      }
    });
    
    // 2. 组装数据
    const payload = {
      order_id: targetOrderId.value,
      product_id: targetProductId.value as number,
      rating: score.value,
      content: content.value,
      images: uploadedImages.length > 0 ? uploadedImages.join(',') : undefined,
      video: uploadedVideo || undefined
    };

    // 3. 调用 Store 的 action
    const res = await userStore.submitProductComment(payload);

    if (res.success) {
      ElMessage.success('评价成功！感谢您的反馈');
      setTimeout(() => {
        router.push('/user/orders');
      }, 1000);
    } else {
      ElMessage.error(res.message || '评价失败，请稍后再试');
    }
  } catch (error) {
    ElMessage.error('程序异常');
  } finally {
    loading.value = false;
  }
}

const goBack = () => router.go(-1)
</script>

<style scoped>
/* 保持你原本的 CSS 样式不变 */
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