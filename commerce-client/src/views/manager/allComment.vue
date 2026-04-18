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
        <el-option label="正常" value="正常" />
        <el-option label="已举报" value="已举报" />
        <el-option label="已屏蔽" value="已屏蔽" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
      <el-button type="warning" @click="handleDelete">删除</el-button>
    </div>

    <!-- 评论列表 -->
    <el-table :data="commentList" border stripe>
      <el-table-column label="ID" prop="comment_id" width="80" />
      <el-table-column label="用户名" prop="username" width="130" />
      <el-table-column label="商品名称" prop="goodsName" width="200" />
      
      <!-- 评分列 -->
      <el-table-column label="评分" width="160">
        <template #default="scope">
          <el-rate 
            v-model="scope.row.score" 
            disabled 
            style="transform: scale(1); width: 100%" 
          />
        </template>
      </el-table-column>

      <!-- 评论内容（单行截断） -->
      <el-table-column label="评论内容" min-width="180">
        <template #default="scope">
          <div 
            style="
              font-size: 13px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            "
            :title="scope.row.content"
          >
            {{ scope.row.content }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="评论时间" prop="createTime" width="180" />
      
      <!-- 状态列（中文显示） -->
      <el-table-column label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="280">
        <template #default="scope">
          <el-button text size="small" @click="handleDetail(scope.row)">
            详情
          </el-button>

          <el-button
            text
            type="success"
            size="small"
            v-if="scope.row.status === '待审核'"
            @click="handleOperation(scope.row, '通过')"
          >
            通过
          </el-button>
          <el-button
            text
            type="danger"
            size="small"
            v-if="scope.row.status === '待审核'"
            @click="handleOperation(scope.row, '屏蔽')"
          >
            屏蔽
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top:15px; text-align:right;"
      @change="getPageData"  
    />

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="评论详情" width="600px">
      <div v-if="currentComment" style="line-height: 2.2">
        <p><b>用户：</b>{{ currentComment.username }}</p>
        <p><b>商品：</b>{{ currentComment.goodsName }}</p>
        <p><b>评分：</b><el-rate v-model="currentComment.score" disabled /></p>
        <p><b>评论：</b>{{ currentComment.content }}</p>
        <p><b>时间：</b>{{ currentComment.createTime }}</p>
        <p><b>最近更新时间：</b>{{ currentComment.updateTime }}</p>
        <p><b>状态：</b>
          <el-tag :type="getStatusTagType(currentComment.status)">
            {{ currentComment.status }}
          </el-tag>
        </p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {storeToRefs} from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import {useAdminStore} from '@/stores/modules/adminStore'

const adminStore = useAdminStore()
const {pagination} = storeToRefs(adminStore)

// 初始化评论列表
onMounted(async () => {
  await adminStore.initCommentList()
  commentList.value = adminStore.commentList
})



// 搜索条件
const search = ref({
  username: '',
  goodsName: '',
  status: ''
})

// 评论列表数据（使用中文状态值）
const commentList = ref([
  {
    comment_id: 1,
    username: '张三',
    goodsName: 'iPhone 15',
    score: 5,
    content: '非常好，正品',
    createTime: '2025-04-08 10:00',
    status: '正常',
  },
  {
    comment_id: 2,
    username: '李四',
    goodsName: '无线耳机',
    score: 1,
    content: '垃圾产品，用了一天就坏xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxs',
    createTime: '2025-04-08 11:00',
    status: '待审核',
  },
  {
    comment_id: 3,
    username: '王五',
    goodsName: '手表',
    score: 5,
    content: '很喜欢，物流快',
    createTime: '2025-04-08 14:00',
    status: '正常',
  },
  {
    comment_id: 4,
    username: '赵六',
    goodsName: '键盘',
    score: 2,
    content: '按键失灵，不推荐',
    createTime: '2025-04-08 15:00',
    status: '待审核',
  }
])

// 详情弹窗相关
const detailVisible = ref(false)
const currentComment = ref<any>({})

// 获取状态对应的标签类型
const getStatusTagType = (status: string): string => {
  switch (status) {
    case '正常':
      return 'success'
    case '待审核':
      return 'warning'
    case '屏蔽':
      return 'danger'
    default:
      return ''
  }
}

// 处理搜索（输出筛选条件）
const handleSearch = async () => {
  const condition = {
    username: search.value.username || undefined,
    goodsName: search.value.goodsName || undefined,
    status: search.value.status || undefined
  }

  //sconsole.log('当前筛选条件：', condition)
  await adminStore.getCommentList(condition, 1, 10)
  //console.log("筛选中:",adminStore.commentList)
  commentList.value = adminStore.commentList
  //console.log("筛选后：", commentList.value)
  //ElMessage.info(`筛选条件：${JSON.stringify(condition)}`)
}

// 重置搜索条件
const resetSearch = () => {
  search.value = {
    username: '',
    goodsName: '',
    status: ''
  }
  getPageData(1, 10)
  commentList.value = adminStore.commentList
  ElMessage.info('筛选条件已重置')
}

// 查看详情
const handleDetail = (row : any) => {
  currentComment.value = row
  detailVisible.value = true
  console.log('查看评论详情：', row)
}

// 处理操作（输出操作信息）
const handleOperation = async (row : any, operation: string) => {
  const msg = operation === '通过' ? '确定通过该评论？' : '确定屏蔽该评论？'
  await ElMessageBox.confirm(msg, '提示')
  
  // 构造操作对象
  const opData = {
    comment_id: [row.comment_id!],
    operation: operation === '通过' ? 'enable' : 'disable'
  }
  
  // 更新状态
  // row.status = operation === '通过' ? '正常' : '屏蔽'
  
  // 输出操作信息
  // console.log('评论操作：', opData)
  await adminStore.updateCommentList(opData, search.value)
  commentList.value = adminStore.commentList
  ElMessage.success(`操作成功：${JSON.stringify(opData)}`)
}

// 删除评论
const handleDelete = async () => {
  const msg = '确定删除所有已屏蔽的评论？'
  await ElMessageBox.confirm(msg, '提示')
  const opData = {
    comment_id: [],
    operation: 'delete'
  }
  await adminStore.updateCommentList(opData, search.value)
  commentList.value = adminStore.commentList
  ElMessage.success('删除成功')
}




const getPageData = async (currentPage: number,pageSize: number) => {
  await adminStore.getCommentList(search.value, currentPage, pageSize)
  commentList.value = adminStore.commentList
}
</script>