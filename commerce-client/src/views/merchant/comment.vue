<template>
  <div>
    <h2>评价管理</h2>
    <!-- 筛选 + 排序区域 -->
    <div class="filter-box" style="margin-bottom: 16px; display: flex; gap: 16px; align-items: center;">
      <el-input
        v-model="commentList.goodsName"
        placeholder="请输入商品名称筛选"
        style="width: 200px"
        clearable
      />

      <!-- 评分排序按钮 -->
      <el-button type="success" size="small" @click="toggleSort">
        按评分 {{ sortOrder === 'desc' ? '从高到低' : '从低到高' }}
      </el-button>

      <!-- 是否追评筛选 -->
      <el-select v-model="isAppendedFilter" placeholder="是否追评" style="width:150px" clearable>
        <el-option label="仅看有追评" :value="1" />
        <el-option label="仅看无追评" :value="0" />
      </el-select>

      <!-- 清空按钮 -->
      <el-button type="default" size="small" @click="clearAll">
        清空筛选与排序
      </el-button>

      <el-button type="primary" size="small" @click="printFilterConditions">
        筛选
      </el-button>
    </div>

    <el-table :data="filteredCommentList" border style="width:100%;table-layout:fixed">
      <el-table-column prop="orderId" label="订单号" width="160" />
      <el-table-column prop="username" label="用户昵称" width="120" />
      <el-table-column prop="goodsName" label="商品名称" width="180" />
      <el-table-column prop="score" label="评分" width="160">
        <template #default="scope">
          <el-rate v-model="scope.row.score" disabled style="display:flex;justify-content:center" />
        </template>
      </el-table-column>
      <el-table-column label="评价内容" min-width="220">
        <template #default="scope">
          <div class="content-text">{{ scope.row.content.length>15 ? scope.row.content.slice(0,15)+'...' : scope.row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="评价时间" width="180" />
      <el-table-column prop="status" label="评论状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280">
        <template #default="scope">
          <el-button type="info" plain size="small" @click="openDetail(scope.row)">详情</el-button>
          <el-button v-if="scope.row.isAppended"  type="warning" plain size="small" @click="openAppendDetail(scope.row)">追评详情</el-button>
          <el-button v-if="scope.row.isNotReply" type="primary" plain size="small" @click="openReply(scope.row)">回复</el-button>
          <el-button v-if="scope.row.status === '正常'" type="danger" plain size="small" @click="reportComment(scope.row)">举报</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 评价详情弹窗 + 购买数量 + 评分数字显示 + 媒体展示 -->
    <el-dialog v-model="detailVisible" title="评价详情" width="650px" append-to-body>
      <div class="detail-box">
        <div class="detail-item"><span class="label">订单号：</span>{{ detailRow.orderId }}</div>
        <div class="detail-item"><span class="label">用户：</span>{{ detailRow.username }}</div>
        <div class="detail-item"><span class="label">商品：</span>{{ detailRow.goodsName }}</div>
        <div class="detail-item"><span class="label">购买数量：</span>{{ detailRow.buyNumber }} 件</div>
        <div class="detail-item"><span class="label">评价时间：</span>{{ detailRow.createTime }}</div>
        
        <!-- 评分改为数字显示 -->
        <div class="detail-item"><span class="label">评分：</span>{{ detailRow.score }} 分</div>

        <div class="detail-item"><span class="label">状态：</span>
          <el-tag :type="getStatusTagType(detailRow.status)">
            {{ getStatusText(detailRow.status) }}
          </el-tag>
        </div>
        <div class="detail-item"><span class="label">内容：</span>
          <div class="content-detail">{{ detailRow.content }}</div>
        </div>

        <!-- 新增：评论图片/视频展示区域 -->
        <div v-if="detailRow.mediaUrls && detailRow.mediaUrls.length" class="detail-item">
          <span class="label">评论媒体：</span>
          <div class="media-container">
            <div 
              v-for="(url, index) in detailRow.mediaUrls" 
              :key="index" 
              class="media-item"
            >
              <!-- 图片判断（简单通过后缀判断，可根据实际情况优化） -->
              <template v-if="isImage(url)">
                <el-image
                  :src="url"
                  :preview-src-list="detailRow.mediaUrls.filter(u => isImage(u))"
                  :preview-index="detailRow.mediaUrls.filter(u => isImage(u)).indexOf(url)"
                  fit="cover"
                  class="media-img"
                />
              </template>
              <!-- 视频判断 -->
              <template v-else-if="isVideo(url)">
                <video
                  :src="url"
                  controls
                  class="media-video"
                  controlsList="nodownload"
                >
                  您的浏览器不支持视频播放
                </video>
              </template>
              <!-- 其他类型 -->
              <template v-else>
                <div class="media-other">
                  <el-icon><Document /></el-icon>
                  <div class="media-name">{{ url.split('/').pop() }}</div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible=false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 追评详情弹窗 -->
    <el-dialog v-model="appendDetailVisible" title="追加评论详情" width="650px" append-to-body>
      <div class="detail-box">
        <div class="detail-item"><span class="label">订单号：</span>{{ appendDetailRow.orderId }}</div>
        <div class="detail-item"><span class="label">用户：</span>{{ appendDetailRow.username }}</div>
        <div class="detail-item"><span class="label">商品：</span>{{ appendDetailRow.goodsName }}</div>
        <div class="detail-item">
          <span class="label">追评时间：</span>
          {{ formatAppendTime(appendDetailRow) }}
        </div>

        <div class="detail-item"><span class="label">追评内容：</span>
          <div class="content-detail">{{ appendDetailRow.appendContent }}</div>
        </div>

        <!-- 追评图片/视频 -->
        <div v-if="appendDetailRow.appendMediaUrls && appendDetailRow.appendMediaUrls.length" class="detail-item">
          <span class="label">追评媒体：</span>
          <div class="media-container">
            <div v-for="(url, index) in appendDetailRow.appendMediaUrls" :key="index" class="media-item">
              <el-image v-if="isImage(url)" :src="url" class="media-img" />
              <video v-else-if="isVideo(url)" :src="url" controls class="media-video"></video>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="appendDetailVisible=false">关闭</el-button>
      </template>
    </el-dialog>


    <ReplyComment 
      v-model:model-value="dialogVisible"
      :comment="currentRow"
      @submit="handleReplySubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ReplyComment from '@/components/replyComment/replyComment.vue'
import { useMerchantStore } from '@/stores/modules/merchantStore'
import { Document } from '@element-plus/icons-vue' // 引入文档图标

const merchantStore = useMerchantStore()

onMounted(async () => {
  await merchantStore.getCommentList()
  commentList.value = merchantStore.commentList
  pagination.value = merchantStore.pagination
})

const pagination = ref({})

// 评论数据（新增mediaUrls媒体URL数组字段）
const commentList = ref([
  {
    orderId: 'ORDER001',
    username: '小明',
    goodsName: 'iPhone 15 Pro',
    score: 5,
    buyNumber: 1,
    content: '非常好！',
    createTime: '2025-04-01 14:30',
    status: '正常',
    mediaUrls: ['https://picsum.photos/200/200'],
    // 追评内容
    isAppended: 1,
    appendContent: '用了几天，续航真的强！',
    appendTime: '2025-04-03 10:20',
    appendMediaUrls: ['https://picsum.photos/200/200?random=2']
  },
  {
    orderId: 'ORDER002',
    username: '小红',
    goodsName: '耳机',
    score: 4,
    buyNumber: 1,
    content: '音质不错',
    createTime: '2025-04-02 11:11',
    status: '正常',
    mediaUrls: [],
    // 无追评
    isAppended: 0,
    appendContent: null,
    appendTime: null,
    appendMediaUrls: []
  }
])

const goodsNameFilter = ref('')

// 排序控制：null = 不排序
const sortOrder = ref(null)

const detailVisible = ref(false)
const dialogVisible = ref(false)
const detailRow = ref({})
const currentRow = ref({})

const operation = ref({
  comment_id: '',
  operation: '',
  replyComment: {}
})

// 打开详情
const openDetail = (row) => {
  detailRow.value = { ...row }
  detailVisible.value = true
}

const openReply = (row) => {
  currentRow.value = row
  dialogVisible.value = true
  console.log('打开回复弹窗，当前行数据：', currentRow.value)
}

const reportComment = async (row) => {
  ElMessageBox.confirm('确定要举报该评论吗？', '提示').then(async () => {
    row.status = '待审核'
    operation.value.comment_id = row.comment_id
    operation.value.operation = 'report'
    ElMessage.success('举报成功')
    await merchantStore.updateCommentList(operation.value)
  })
}

const getStatusTagType = (status) => {
  return status === '正常' ? 'success' : 
  status === '待审核' ? 'warning' : 'danger'
}
const getStatusText = (status) => {
  return status
}

// 点击排序（第一次点击默认从高到低）
const toggleSort = async () => {
  if (sortOrder.value === null) {
    sortOrder.value = 'desc'
  } else {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  }
  const operation = {
    goodsName: goodsNameFilter.value || '',
    orderBy: sortOrder.value === 'desc' ? 'desc' : 'asc',
    isAppended: isAppendedFilter.value
  }
  await merchantStore.getCommentList(operation)
  commentList.value = merchantStore.commentList
  pagination.value = merchantStore.pagination
}

// 是否追评筛选
const isAppendedFilter = ref('')
// 是否追评筛选
if (isAppendedFilter.value !== '') {
  result = result.filter(item => item.isAppended === isAppendedFilter.value)
}

// 清空所有筛选和排序
const clearAll = async () => {
  goodsNameFilter.value = ''
  sortOrder.value = null
  isAppendedFilter.value = ''
  await merchantStore.getCommentList()
  commentList.value = merchantStore.commentList
  pagination.value = merchantStore.pagination
  ElMessage.success('已清空筛选与排序')
}

// 筛选 + 排序（默认不排序）
const filteredCommentList = computed(() => {
  let result = [...commentList.value]

  // 筛选
  result = result.filter(item => {
    return goodsNameFilter.value
      ? item.goodsName.includes(goodsNameFilter.value)
      : true
  })

  // 只有点击过排序才执行排序
  if (sortOrder.value !== null) {
    result.sort((a, b) => {
      if (sortOrder.value === 'desc') {
        return b.score - a.score
      } else {
        return a.score - b.score
      }
    })
  }

  return result
})

// 输出条件
const printFilterConditions = async () => {
  console.log('当前条件：', {
    goodsName: goodsNameFilter.value || '',
    orderBy: sortOrder.value === null
      ? '未排序'
      : sortOrder.value === 'desc'
        ? 'desc'
        : 'asc',
        isAppended: isAppendedFilter.value
  })
  await merchantStore.getCommentList({
    goodsName: goodsNameFilter.value || '',
    orderBy: sortOrder.value === null
      ? null
      : sortOrder.value === 'desc'
        ? 'desc'
        : 'asc',
    isAppended: isAppendedFilter.value
  })
    commentList.value = merchantStore.commentList
    pagination.value = merchantStore.pagination
  ElMessage.success('已在控制台输出')
}

const handleReplySubmit =  async (replyData) => {
  // 回复需要的参数（你要的全部字段）
  const params = {
    orderId: currentRow.value.orderId, // 订单ID
    comment: replyData.content,        // 回复内容
    comment_status: '正常',           // 默认正常
    parent_id: currentRow.value.comment_id, // 父评论ID
  }

  operation.value.comment_id = currentRow.value.comment_id
  operation.value.operation = 'reply'
  operation.value.replyComment = params

  console.log('回复提交参数：', params)

  // 模拟提交成功
  ElMessage.success('回复成功')
  dialogVisible.value = false

  // 如果你需要在这里调用接口：
  await merchantStore.updateCommentList(operation.value)
}

// 新增：判断是否为图片
const isImage = (url) => {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
  const ext = url.split('.').pop().toLowerCase()
  return imageExts.includes(ext)
}

// 新增：判断是否为视频
const isVideo = (url) => {
  const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
  const ext = url.split('.').pop().toLowerCase()
  return videoExts.includes(ext)
}

// 追评弹窗
const appendDetailVisible = ref(false)
const appendDetailRow = ref({})

// 打开追评详情
const openAppendDetail = (row) => {
  appendDetailRow.value = { ...row }
  appendDetailVisible.value = true
}

// 智能时间：刚刚/分钟/小时/7天内/日期
const timeAgo = (timeStr) => {
  if (!timeStr) return ""
  const now = new Date()
  const time = new Date(timeStr)
  const sec = (now - time) / 1000

  if (sec < 60) return "刚刚"
  if (sec < 3600) return `${Math.floor(sec / 60)}分钟前`
  if (sec < 86400) return `${Math.floor(sec / 3600)}小时前`
  if (sec < 7 * 86400) return `${Math.floor(sec / 86400)}天前`

  return timeStr.split(" ")[0]
}

// 追评时间显示（完全自然）
const formatAppendTime = (row) => {
  if (!row.appendTime) return "无追评"

  const create = new Date(row.createTime)
  const append = new Date(row.appendTime)
  const diffDays = Math.floor((append - create) / (1000 * 60 * 60 * 24))

  const agoText = timeAgo(row.appendTime)
  let diffText = ""

  if (diffDays <= 0) {
    diffText = "当天评价"
  } else if (diffDays === 1) {
    diffText = "1天后评价"
  } else {
    diffText = `${diffDays}天后评价`
  }

  return `${agoText} - ${diffText}`
}


</script>



<style scoped>
.detail-box {
  line-height: 2.2;
}
.detail-item {
  margin-bottom: 8px;
}
.label {
  font-weight: bold;
  width: 90px;
  display: inline-block;
}
.content-detail {
  white-space: pre-wrap;
  word-break: break-all;
}

/* 新增：媒体展示样式 */
.media-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  padding: 8px 0;
}
.media-item {
  flex-shrink: 0;
}
.media-img {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  cursor: pointer;
}
.media-video {
  width: 200px;
  height: 150px;
  border-radius: 4px;
}
.media-other {
  width: 120px;
  height: 120px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  padding: 8px;
  text-align: center;
}
.media-name {
  font-size: 12px;
  margin-top: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.append-content {
  margin-top: 8px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  color: #666;
}
</style>