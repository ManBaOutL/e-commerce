<template>
  <div>
    <h2>评价管理</h2>
    <el-table :data="commentList" border style="margin-top:10px">
      <el-table-column prop="id" label="评价ID" width="100" />
      <el-table-column prop="username" label="用户昵称" width="120" />
      <el-table-column prop="goodsName" label="商品名称" width="180" />
      <el-table-column prop="score" label="评分" width="100">
        <template #default="scope">
          <el-rate v-model="scope.row.score" disabled />
        </template>
      </el-table-column>
      <el-table-column prop="content" label="评价内容" min-width="220" />
      <el-table-column prop="createTime" label="评价时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <!-- 按钮：打开回复弹窗 -->
          <el-button type="primary" plain size="small" @click="openReply(scope.row)">
            回复
          </el-button>
          <el-button type="danger" plain size="small" @click="delComment(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 回复弹窗 -->
    <el-dialog v-model="dialogVisible" title="回复用户评价" width="500px" append-to-body>
      <div class="reply-box">
        <div class="user-comment">
          <p><strong>用户评价：</strong>{{ currentRow.content }}</p>
        </div>
        <el-input
          v-model="replyContent"
          type="textarea"
          :rows="4"
          placeholder="请输入回复内容"
          style="margin-top:10px"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReply">确认回复</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 评价数据
const commentList = ref([
  {
    id: 1001,
    username: '小明',
    goodsName: 'iPhone 15 Pro',
    score: 5,
    content: '商品质量很好，物流快，商家服务态度超棒！',
    createTime: '2025-04-01 14:30'
  },
  {
    id: 1002,
    username: '小红',
    goodsName: '男士休闲夹克',
    score: 4,
    content: '衣服面料不错，尺码标准，值得购买。',
    createTime: '2025-04-02 10:15'
  },
  {
    id: 1003,
    username: '小李',
    goodsName: 'iPhone 15 Pro',
    score: 3,
    content: '一般般，发货速度有点慢，希望改进。',
    createTime: '2025-04-03 16:20'
  }
])

// 弹窗控制
const dialogVisible = ref(false)
const currentRow = ref({})
const replyContent = ref('')

// 打开回复弹窗
const openReply = (row) => {
  currentRow.value = row
  replyContent.value = ''
  dialogVisible.value = true
}

// 提交回复
const submitReply = () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  ElMessage.success(`已回复【${currentRow.value.username}】：${replyContent.value}`)
  dialogVisible.value = false
}

// 删除评价（带确认）
const delComment = async (row) => {
  await ElMessageBox.confirm('确定要删除该评价吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  commentList.value = commentList.value.filter(item => item.id !== row.id)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.reply-box {
  padding: 5px;
}
.user-comment {
  padding: 10px;
  background: #f7f8fa;
  border-radius: 6px;
}
</style>