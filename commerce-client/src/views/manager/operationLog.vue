<template>
  <div>
    <h3>操作日志管理（敏感操作记录）</h3>

    <!-- 筛选区域：拆分为3个独立筛选框 + 筛选按钮 + 清空按钮 -->
    <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
      <el-input
        v-model="condition.username"
        placeholder="筛选操作人"
        style="width: 160px"
        clearable
      />
      <el-input
        v-model="condition.content"
        placeholder="筛选操作内容"
        style="width: 200px"
        clearable
      />
      <el-select
        v-model="condition.type"
        placeholder="操作类型"
        style="width: 160px"
        clearable
      >
        <el-option label="全部" value="" />
        <!-- 操作类型选项从字符串数组渲染 -->
        <el-option
          v-for="type in operationTypes"
          :key="type"
          :label="type"
          :value="type"
        />
      </el-select>

      <!-- 新增筛选按钮 -->
      <el-button type="primary" @click="showSearchCondition">筛选</el-button>
      <el-button @click="resetSearch">清空</el-button>
    </div>

    <!-- 日志列表 -->
    <el-table :data="logList" border>
      <el-table-column label="日志ID" prop="logId" />
      <el-table-column label="操作人" prop="username" />
      <el-table-column label="身份" prop="role" />
      <el-table-column label="操作内容" prop="content" />
      <el-table-column label="操作类型" prop="type">
        <template #default="scope">
          <el-tag type="warning">{{ scope.row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作时间" prop="time" />
      <el-table-column label="操作结果" prop="result">
        <template #default="scope">
          <el-tag :type="scope.row.result === '成功' ? 'success' : 'danger'">
            {{ scope.row.result }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @change="getPageData"  
    />
</template>

<script setup>
import { ref ,onMounted} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAdminStore } from '@/stores/modules/adminStore' 

const adminStore = useAdminStore()

onMounted(async () => {
  await adminStore.initLogList()
  console.log("日志列表:", adminStore.logList)
  logList.value = adminStore.logList
  operationTypes.value = adminStore.logTypeList
  console.log("操作类别:", adminStore.logTypeList)
  pagination.value = adminStore.pagination
})

// 初始化日志数据
const logList = ref([
  { logId: 1, username: 'admin', role: '超级管理员', content: '修改了admin账号密码', type: '修改密码', time: '2024-05-01 10:20:30', result: '成功' },
  { logId: 2, username: 'operator', role: '运营', content: '删除了用户123的差评', type: '删除评价', time: '2024-05-01 11:15:20', result: '成功' },
  { logId: 3, username: 'admin', role: '超级管理员', content: '给user001分配客服角色', type: '分配角色', time: '2024-05-01 14:00:00', result: '成功' },
  { logId: 4, username: 'admin', role: '超级管理员', content: '禁用违规账号user999', type: '禁用账号', time: '2024-05-02 09:30:15', result: '成功' },
  { logId: 5, username: 'admin', role: '超级管理员', content: '启用解封账号user888', type: '启用账号', time: '2024-05-02 10:10:00', result: '成功' },
  { logId: 6, username: 'finance', role: '财务', content: '审核用户退款申请（订单NO:123456）', type: '退款审核', time: '2024-05-03 15:20:50', result: '失败' },
])

// 操作类型字符串数组
const operationTypes = ref([])

// 筛选条件
const condition = ref({
  username: '',
  content: '',
  type: ''
})

// 新增：展示筛选条件（不执行筛选逻辑）
const showSearchCondition = async () => {
  // 构造条件展示文本
  const conditionText = [
    condition.value.username ? `操作人：${condition.value.username}` : '',
    condition.value.content ? `操作内容：${condition.value.content}` : '',
    condition.value.type ? `操作类型：${condition.value.type}` : ''
  ].filter(Boolean).join('，') || '未设置任何筛选条件';

  await adminStore.getLogListbyPage(condition.value,1,10)
  logList.value = adminStore.logList
  pagination.value = adminStore.pagination
  operationTypes.value = adminStore.logTypeList
  
  // 控制台也输出筛选条件（便于调试）
  console.log('当前筛选条件：', condition.value);
}

// 清空筛选条件
const resetSearch = () => {
  condition.value = {
    username: '',
    content: '',
    type: ''
  }
  ElMessage.success('已清空筛选条件')
  getPageData(1,10)
}

const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 分页获取数据
const getPageData = async (currentPage,pageSize) => {
  await adminStore.getLogListbyPage(condition.value,currentPage,pageSize)
  pagination.value = adminStore.pagination
  logList.value = adminStore.logList
  operationTypes.value = adminStore.logTypeList
}
</script>