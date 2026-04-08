<template>
  <div>
    <h2>评价管理</h2>
    <!-- 筛选区域：新增商品名称筛选 -->
    <div class="filter-box" style="margin-bottom: 16px; display: flex; gap: 16px; align-items: center;">
      <ScoreFilter v-model="scoreFilter" />
      <el-input
        v-model="goodsNameFilter"
        placeholder="请输入商品名称筛选"
        style="width: 200px"
        clearable
      />
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
      <!-- 新增评论状态列 -->
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
          <el-button type="primary" plain size="small" @click="openReply(scope.row)">回复</el-button>
          <!-- 删除按钮改为举报按钮 -->
          <el-button type="danger" plain size="small" @click="reportComment(scope.row)">举报</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 评价详情弹窗 -->
    <el-dialog v-model="detailVisible" title="评价详情" width="500px" append-to-body>
      <div class="detail-box">
        <div class="detail-item"><span class="label">订单号：</span>{{ detailRow.orderId }}</div>
        <div class="detail-item"><span class="label">用户：</span>{{ detailRow.username }}</div>
        <div class="detail-item"><span class="label">商品：</span>{{ detailRow.goodsName }}</div>
        <div class="detail-item"><span class="label">评分：</span><el-rate v-model="detailRow.score" disabled /></div>
        <div class="detail-item"><span class="label">状态：</span>
          <el-tag :type="getStatusTagType(detailRow.status)">
            {{ getStatusText(detailRow.status) }}
          </el-tag>
        </div>
        <div class="detail-item"><span class="label">内容：</span><div class="content-detail">{{ detailRow.content }}</div></div>
      </div>
      <template #footer><el-button @click="detailVisible=false">关闭</el-button></template>
    </el-dialog>

    <!-- 引入修复后的回复评论组件 -->
    <ReplyComment 
      v-model:model-value="dialogVisible"
      :comment="currentRow"
      @submit="handleReplySubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ScoreFilter from '@/components/Filter/ScoreFilter.vue'
// 引入回复组件（路径根据实际位置调整）
import ReplyComment from '@/components/replyComment/replyComment.vue'

// 评论列表：新增status字段（normal-正常，reported-待处理）
const commentList = ref([
  { orderId:'ORDER001', username:'小明', goodsName:'iPhone 15 Pro', score:5, content:'质量很好，物流快，服务超棒！', createTime:'2025-04-01 14:30', status: 'normal' },
  { orderId:'ORDER002', username:'小红', goodsName:'男士休闲夹克', score:4, content:'面料不错，尺码标准，值得购买。', createTime:'2025-04-02 10:15', status: 'normal' },
  { orderId:'ORDER003', username:'小李', goodsName:'iPhone 15 Pro', score:3, content:'一般，发货慢，希望改进。', createTime:'2025-04-03 16:20', status: 'normal' },
  { orderId:'ORDER004', username:'小张', goodsName:'AirPods Pro', score:5, content:'音质很好，降噪强，非常满意！', createTime:'2025-04-04 09:12', status: 'normal' },
])

// 筛选条件
const scoreFilter = ref('')
const goodsNameFilter = ref('') // 商品名称筛选

// 计算筛选后的列表（多条件筛选）
const filteredCommentList = computed(() => {
  return commentList.value.filter(item => {
    // 评分筛选
    const scoreMatch = !scoreFilter.value || item.score === Number(scoreFilter.value)
    // 商品名称模糊筛选
    const goodsNameMatch = !goodsNameFilter.value || item.goodsName.includes(goodsNameFilter.value)
    return scoreMatch && goodsNameMatch
  })
})

// 详情弹窗相关
const detailVisible = ref(false)
const detailRow = ref({})

// 回复弹窗相关
const dialogVisible = ref(false)
const currentRow = ref({})

// 打开详情
const openDetail = (row) => { 
  detailRow.value = row; 
  detailVisible.value = true 
}

// 打开回复弹窗
const openReply = (row) => { 
  currentRow.value = row; 
  dialogVisible.value = true 
}

// 提交回复
const handleReplySubmit = (reply) => {
  ElMessage.success(`回复订单${reply.commentId}成功：${reply.content}`)
  // 实际项目中替换为接口调用：axios.post('/api/comment/reply', reply)
}

// 举报评论（替换删除逻辑）
const reportComment = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定举报该评论吗？举报后将等待管理员处理', 
      '举报确认', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // 更新评论状态为待处理
    const targetRow = commentList.value.find(item => item.orderId === row.orderId)
    if (targetRow) {
      targetRow.status = 'reported'
    }
    ElMessage.success('举报成功，等待管理员处理')
  } catch (err) {
    ElMessage.info('已取消举报')
  }
}

// 获取状态标签类型（视觉区分）
const getStatusTagType = (status) => {
  switch(status) {
    case 'normal': return 'success' // 正常-绿色
    case 'reported': return 'warning' // 待处理-黄色
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch(status) {
    case 'normal': return '正常'
    case 'reported': return '待处理'
    default: return '未知'
  }
}
</script>

<style scoped>
.content-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-box {
  padding: 10px 0;
}

.detail-item {
  margin-bottom: 12px;
  line-height: 1.6;
}

.label {
  width: 80px;
  color: #666;
  font-weight: 500;
  display: inline-block;
}

.content-detail {
  background: #f7f8fa;
  padding: 10px;
  border-radius: 6px;
  margin-top: 5px;
}

.user-comment {
  padding: 10px;
  background: #f7f8fa;
  border-radius: 6px;
}
</style>