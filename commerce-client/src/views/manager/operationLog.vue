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
import { storeToRefs } from 'pinia'
import { useAdminStore } from '@/stores/modules/adminStore' 
const adminStore = useAdminStore()


const searchKey = ref('')
const typeFilter = ref('')

// 日志数据（内存版，无存储）
const logList = storeToRefs(adminStore).logList

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