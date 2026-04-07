<template>
  <div>
    <h3>操作日志管理（敏感操作记录）</h3>

    <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
      <el-input
        v-model="searchKey"
        placeholder="搜索操作人/内容"
        style="width: 220px"
        clearable
      />

      <el-select v-model="typeFilter" placeholder="操作类型" style="width: 160px">
        <el-option label="全部" value="" />
        <el-option label="修改密码" value="修改密码" />
        <el-option label="删除评价" value="删除评价" />
        <el-option label="分配角色" value="分配角色" />
        <el-option label="禁用账号" value="禁用账号" />
        <el-option label="启用账号" value="启用账号" />
        <el-option label="退款审核" value="退款审核" />
      </el-select>

      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">清空</el-button>
    </div>

    <el-table :data="filterList" border>
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const searchKey = ref('')
const typeFilter = ref('')

// 日志数据（内存版，无存储）
const logList = ref([
  { logId: 1001, username: 'user01', role: '普通用户', content: '修改登录密码', type: '修改密码', time: '2026-04-07 18:20:11', result: '成功' },
  { logId: 1002, username: 'user02', role: 'VIP用户', content: '删除订单评价', type: '删除评价', time: '2026-04-07 17:10:22', result: '成功' },
  { logId: 1003, username: 'admin', role: '管理员', content: '将 user03 改为 VIP用户', type: '分配角色', time: '2026-04-07 16:30:10', result: '成功' },
  { logId: 1004, username: 'admin', role: '管理员', content: '禁用违规账号 user05', type: '禁用账号', time: '2026-04-07 15:20:33', result: '成功' },
  { logId: 1005, username: 'admin', role: '管理员', content: '同意订单 2026005 退款', type: '退款审核', time: '2026-04-07 14:10:15', result: '成功' },
  { logId: 1006, username: 'user01', role: '普通用户', content: '尝试修改密码（原密码错误）', type: '修改密码', time: '2026-04-07 12:11:22', result: '失败' },
])

const filterList = computed(() => {
  return logList.value.filter(item => {
    const matchSearch = item.username.includes(searchKey.value) || item.content.includes(searchKey.value)
    const matchType = !typeFilter.value || item.type === typeFilter.value
    return matchSearch && matchType
  })
})

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const resetSearch = () => {
  searchKey.value = ''
  typeFilter.value = ''
  ElMessage.success('已清空')
}
</script>