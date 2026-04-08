<template>
  <div style="padding: 20px">
    <h2>管理员 - 评论管理</h2>

    <!-- 搜索筛选 -->
    <div style="margin: 20px 0; display: flex; gap: 15px; flex-wrap: wrap">
      <el-input
        v-model="search.goodsName"
        placeholder="商品名称"
        style="width: 200px"
        clearable
      />
      <el-input
        v-model="search.username"
        placeholder="用户名"
        style="width: 200px"
        clearable
      />
      <el-select v-model="search.status" placeholder="评论状态" style="width: 160px">
        <el-option label="全部" value="" />
        <el-option label="正常" value="normal" />
        <el-option label="已举报" value="reported" />
        <el-option label="已屏蔽" value="blocked" />
      </el-select>
      <el-button type="primary" @click="searchComment">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 评论列表 -->
    <el-table :data="filteredList" border stripe>
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="用户名" prop="username" width="130" />
      <el-table-column label="商品名称" prop="goodsName" width="200" />
      
      <!-- 加长星级，完整显示 5 颗星 -->
      <el-table-column label="评分" width="160">
        <template #default="scope">
          <el-rate 
            v-model="scope.row.score" 
            disabled 
            style="transform: scale(1); width: 100%" 
          />
        </template>
      </el-table-column>

      <el-table-column label="评论内容" min-width="180">
        <template #default="scope">
          <span style="font-size: 13px">{{ scope.row.content }}</span>
        </template>
      </el-table-column>

      <el-table-column label="评论时间" prop="createTime" width="180" />
      
      <el-table-column label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusTag(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="280">
        <template #default="scope">
          <el-button text size="small" @click="openDetail(scope.row)">
            详情
          </el-button>
          <el-button text type="primary" size="small" @click="openReply(scope.row)">
            回复
          </el-button>

          <el-button
            text
            type="success"
            size="small"
            v-if="scope.row.status === 'reported'"
            @click="handleReport(scope.row, 'normal')"
          >
            通过
          </el-button>
          <el-button
            text
            type="danger"
            size="small"
            v-if="scope.row.status === 'reported'"
            @click="handleReport(scope.row, 'blocked')"
          >
            屏蔽
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="评论详情" width="600px">
      <div v-if="currentRow" style="line-height: 2.2">
        <p><b>用户：</b>{{ currentRow.username }}</p>
        <p><b>商品：</b>{{ currentRow.goodsName }}</p>
        <p><b>评分：</b><el-rate v-model="currentRow.score" disabled /></p>
        <p><b>评论：</b>{{ currentRow.content }}</p>
        <p><b>时间：</b>{{ currentRow.createTime }}</p>
        <p><b>状态：</b>
          <el-tag :type="getStatusTag(currentRow.status)">
            {{ getStatusText(currentRow.status) }}
          </el-tag>
        </p>
      </div>
    </el-dialog>

    <!-- 回复评论组件 -->
    <ReplyComment
      v-model:model-value="replyVisible"
      :comment="currentRow"
      @submit="submitReply"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ReplyComment from '@/components/replyComment/replyComment.vue'

// 搜索条件
const search = ref({
  goodsName: '',
  username: '',
  status: ''
})

// 评论数据
const commentList = ref([
  {
    id: 1,
    username: '张三',
    goodsName: 'iPhone 15',
    score: 5,
    content: '非常好，正品',
    createTime: '2025-04-08 10:00',
    status: 'normal',
  },
  {
    id: 2,
    username: '李四',
    goodsName: '无线耳机',
    score: 1,
    content: '垃圾产品，用了一天就坏',
    createTime: '2025-04-08 11:00',
    status: 'reported',
  },
  {
    id: 3,
    username: '王五',
    goodsName: '手表',
    score: 5,
    content: '很喜欢，物流快',
    createTime: '2025-04-08 14:00',
    status: 'normal',
  },
  {
    id: 4,
    username: '赵六',
    goodsName: '键盘',
    score: 2,
    content: '按键失灵，不推荐',
    createTime: '2025-04-08 15:00',
    status: 'reported',
  }
])

// 筛选功能（已启用）
const filteredList = computed(() => {
  return commentList.value.filter(item => {
    const matchGoods = item.goodsName.includes(search.value.goodsName)
    const matchUser = item.username.includes(search.value.username)
    const matchStatus = !search.value.status || item.status === search.value.status
    return matchGoods && matchUser && matchStatus
  })
})

// 搜索 & 重置
const searchComment = () => {}
const resetSearch = () => {
  search.value = { goodsName: '', username: '', status: '' }
}

// 详情
const detailVisible = ref(false)
const currentRow = ref(null)
const openDetail = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

// 回复
const replyVisible = ref(false)
const openReply = (row) => {
  currentRow.value = row
  replyVisible.value = true
}
const submitReply = (data) => {
  ElMessage.success('管理员回复成功：' + data.content)
}

// 处理举报
const handleReport = async (row, result) => {
  const msg = result === 'normal' ? '确定通过该评论？' : '确定屏蔽该评论？'
  await ElMessageBox.confirm(msg, '提示')
  row.status = result
  ElMessage.success('操作成功')
}

// 状态显示
const getStatusTag = (status) => {
  if (status === 'normal') return 'success'
  if (status === 'reported') return 'warning'
  if (status === 'blocked') return 'danger'
  return ''
}
const getStatusText = (status) => {
  if (status === 'normal') return '正常'
  if (status === 'reported') return '已举报'
  if (status === 'blocked') return '已屏蔽'
  return '未知'
}
</script>