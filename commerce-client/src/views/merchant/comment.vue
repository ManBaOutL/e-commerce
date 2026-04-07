<template>
  <div>
    <h2>评价管理</h2>
    <ScoreFilter v-model="scoreFilter" />
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
      <el-table-column label="操作" width="280">
        <el-button type="info" plain size="small" @click="openDetail(scope.row)">详情</el-button>
        <el-button type="primary" plain size="small" @click="openReply(scope.row)">回复</el-button>
        <el-button type="danger" plain size="small" @click="delComment(scope.row)">删除</el-button>
      </el-table-column>
    </el-table>

    <el-dialog v-model="detailVisible" title="评价详情" width="500px" append-to-body>
      <div class="detail-box">
        <div class="detail-item"><span class="label">订单号：</span>{{ detailRow.orderId }}</div>
        <div class="detail-item"><span class="label">用户：</span>{{ detailRow.username }}</div>
        <div class="detail-item"><span class="label">商品：</span>{{ detailRow.goodsName }}</div>
        <div class="detail-item"><span class="label">评分：</span><el-rate v-model="detailRow.score" disabled /></div>
        <div class="detail-item"><span class="label">内容：</span><div class="content-detail">{{ detailRow.content }}</div></div>
      </div>
      <template #footer><el-button @click="detailVisible=false">关闭</el-button></template>
    </el-dialog>

    <el-dialog v-model="dialogVisible" title="回复" width="500px" append-to-body>
      <div class="user-comment">{{ currentRow.content }}</div>
      <el-input v-model="replyContent" type="textarea" rows="4" style="margin-top:10px" />
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submitReply">回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ScoreFilter from '@/components/Filter/ScoreFilter.vue'

const commentList = ref([
  { orderId:'ORDER001', username:'小明', goodsName:'iPhone 15 Pro', score:5, content:'质量很好，物流快，服务超棒！', createTime:'2025-04-01 14:30' },
  { orderId:'ORDER002', username:'小红', goodsName:'男士休闲夹克', score:4, content:'面料不错，尺码标准，值得购买。', createTime:'2025-04-02 10:15' },
  { orderId:'ORDER003', username:'小李', goodsName:'iPhone 15 Pro', score:3, content:'一般，发货慢，希望改进。', createTime:'2025-04-03 16:20' },
  { orderId:'ORDER004', username:'小张', goodsName:'AirPods Pro', score:5, content:'音质很好，降噪强，非常满意！', createTime:'2025-04-04 09:12' },
])

const scoreFilter = ref('')
const filteredCommentList = computed(() => {
  if (!scoreFilter.value) return commentList.value
  return commentList.value.filter(c => c.score === Number(scoreFilter.value))
})

const detailVisible = ref(false)
const detailRow = ref({})
const dialogVisible = ref(false)
const currentRow = ref({})
const replyContent = ref('')

const openDetail = (row) => { detailRow.value = row; detailVisible.value = true }
const openReply = (row) => { currentRow.value = row; replyContent.value = ''; dialogVisible.value = true }
const submitReply = () => { if(!replyContent.value) return ElMessage.warning('请输入内容'); ElMessage.success('回复成功'); dialogVisible.value = false }
const delComment = async (row) => { await ElMessageBox.confirm('确定删除？'); commentList.value = commentList.value.filter(x=>x.orderId!==row.orderId); ElMessage.success('删除成功') }
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

.reply-box {
  padding: 5px;
}

.user-comment {
  padding: 10px;
  background: #f7f8fa;
  border-radius: 6px;
}
</style>