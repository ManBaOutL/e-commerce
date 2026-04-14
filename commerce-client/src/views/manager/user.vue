<template>
  <div>
    <h3>用户管理</h3>
    <div style="margin-bottom: 10px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
      <el-input v-model="userCondition.username" placeholder="请输入账号" style="width: 200px;" />
      <el-select v-model="userCondition.type" placeholder="请选择角色">
        <el-option label="管理员" value="管理员" />
        <el-option label="商家" value="商家" />
        <el-option label="普通用户" value="普通用户" />
        <el-option label="VIP用户" value="VIP用户" />
      </el-select>
      <el-select v-model="userCondition.status" placeholder="账号状态">
        <el-option label="正常" value="正常" />
        <el-option label="禁用" value="禁用" />
      </el-select>
      <el-button type="primary" @click="handleFilter">筛选</el-button>
      <el-button @click="resetFilter">清空筛选</el-button>

      <!-- 批量操作按钮 -->
      <el-button type="danger" @click="batchDelete" v-if="selectedIds.length">批量删除</el-button>
      <el-button 
        type="warning" 
        @click="batchToggleVip" 
        v-if="selectedIds.length"
      >
        {{ hasNonVipSelected ? '批量设为VIP' : '批量设为普通用户' }}
      </el-button>
      <el-button type="info" @click="batchDisable" v-if="selectedIds.length">批量禁用</el-button>
      <el-button type="success" @click="batchEnable" v-if="selectedIds.length">批量启用</el-button>
    </div>

    <el-table 
      :data="userList" 
      border 
      @selection-change="handleSelectionChange"
    >
      <!-- 复选框选中列 -->
      <el-table-column type="selection" width="55" />

      <el-table-column prop="user_id" label="用户ID" width="80" />
      <el-table-column prop="username" label="账号" width="120" />
      <el-table-column prop="type" label="角色" width="100">
        <template #default="scope">
          <el-tag :type="getRoleTagType(scope.row.type)">
            {{ scope.row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="150" />
      <el-table-column prop="email" label="邮箱" width="200" :show-overflow-tooltip="true" />
      <el-table-column prop="status" label="账号状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="300">
        <template #default="scope">
          <el-button text @click="openDetail(scope.row)">详情</el-button>
          <el-button 
            text 
            :type="scope.row.type === 'VIP用户' ? 'info' : 'warning'" 
            @click="toggleVip(scope.row)"
          >
            {{ scope.row.type === 'VIP用户' ? '设为普通用户' : '设为VIP' }}
          </el-button>
          <el-button text 
            :type="scope.row.status === '正常' ? 'danger' : 'success'" 
            @click="toggleStatus(scope.row)">
            {{ scope.row.status === '正常' ? '禁用' : '启用' }}
          </el-button>
          <el-button text type="danger" @click="deleteUser(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="detailVisible" title="用户详情" width="500px">
      <div style="line-height: 2.2; padding: 10px 0;">
        <p><strong>用户ID：</strong>{{ currentRow.user_id }}</p>
        <p><strong>账号：</strong>{{ currentRow.username }}</p>
        <p><strong>角色：</strong>{{ currentRow.type }}</p>
        <p><strong>手机号：</strong>{{ currentRow.phone || '无' }}</p>
        <p><strong>邮箱：</strong>{{ currentRow.email || '无' }}</p>
        <p><strong>是否VIP：</strong>{{ currentRow.is_vip ? '是' : '否' }}</p>
        <p><strong>创建时间：</strong>{{ formatDate(currentRow.create_time) }}</p>
        <p><strong>账号状态：</strong>{{ currentRow.status }}</p>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @change="getPageData"  
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAdminStore } from '@/stores/modules/adminStore'
import { storeToRefs } from 'pinia'

const adminStore = useAdminStore()
const { userList, pagination } = storeToRefs(adminStore)

// 筛选
const userCondition = ref({
  username: '',
  type: '',
  status: ''
})

// 选中相关
const selectedRows = ref([])
const selectedIds = ref([])

// 计算属性：判断选中的是否有非VIP用户（用于批量按钮显示）
const hasNonVipSelected = computed(() => {
  return selectedRows.value.some(item => item.type !== 'VIP用户')
})

// 表格选中事件
const handleSelectionChange = (val) => {
  selectedRows.value = val
  selectedIds.value = val.map(item => item.user_id)
  console.log('选中用户ID：', selectedIds.value)
}

// 获取角色标签类型（不同角色不同颜色）
const getRoleTagType = (role) => {
  switch (role) {
    case '管理员':
      return 'primary' // 蓝色
    case '商家':
      return 'warning'  // 黄色
    case 'VIP用户':
      return 'success'  // 绿色
    case '普通用户':
      return 'info'     // 浅蓝
    default:
      return ''
  }
}

// 批量删除
const batchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择用户')
    return
  }
  console.log('批量删除参数：', selectedIds.value)
  adminStore.updateUserList({
    user_id: selectedIds.value,
    operation: 'delete'
  }, userCondition.value).then(res => {
    if (res.code === 200) {
      ElMessage.success('批量删除参数已输出')
    }
  })
}

// 批量切换VIP/普通用户
const batchToggleVip = () => {
  // 区分是批量设为VIP还是批量设为普通用户
  if (hasNonVipSelected.value) {
    // 批量设为VIP
    const validIds = selectedRows.value
      .filter(item => item.type !== 'VIP用户')
      .map(item => item.user_id)
    
    if (validIds.length === 0) {
      ElMessage.warning('选中的用户已是VIP')
      return
    }
    console.log('批量设置VIP参数：', validIds)
    adminStore.updateUserList({
      user_id: validIds,
      operation: 'setVip'
    }, userCondition.value).then(res => {
      if (res.code === 200) {
        ElMessage.success('批量设置VIP参数已输出')
      }
    })
  } else {
    // 批量设为普通用户
    const validIds = selectedRows.value
      .filter(item => item.type === 'VIP用户')
      .map(item => item.user_id)
    
    if (validIds.length === 0) {
      ElMessage.warning('选中的用户已是普通用户')
      return
    }
    console.log('批量设置普通用户参数：', validIds)
    adminStore.updateUserList({
      user_id: validIds,
      operation: 'cancelVip'
    }, userCondition.value).then(res => {
      if (res.code === 200) {
        ElMessage.success('批量设置普通用户参数已输出')
      }
    })
  }
}

// 单个切换VIP/普通用户
const toggleVip = (row) => {
  const ids = [row.user_id]
  if (row.type === 'VIP用户') {
    // 设为普通用户
    console.log('单个设置普通用户参数：', ids)
    adminStore.updateUserList({
      user_id: ids,
      operation: 'cancelVip'
    }, userCondition.value).then(res => {
      if (res.code === 200) {
        ElMessage.success('单个设置普通用户参数已输出')
      }
    })
  } else {
    // 设为VIP
    console.log('单个设置VIP参数：', ids)
    adminStore.updateUserList({
      user_id: ids,
      operation: 'setVip'
    }, userCondition.value).then(res => {
      if (res.code === 200) {
        ElMessage.success('单个设置VIP参数已输出')
      }
    })
  }
}

// 批量禁用
const batchDisable = () => {
  const validIds = selectedRows.value
    .filter(item => item.status === '正常')
    .map(item => item.user_id)
  
  if (validIds.length === 0) {
    ElMessage.warning('选中的用户已禁用')
    return
  }
  console.log('批量禁用参数：', validIds)
  adminStore.updateUserList({
    user_id: validIds,
    operation: 'disable'
  }, userCondition.value).then(res => {
    if (res.code === 200) {
      ElMessage.success('批量禁用参数已输出')
    }
  })
}

// 批量启用
const batchEnable = () => {
  const validIds = selectedRows.value
    .filter(item => item.status === '禁用')
    .map(item => item.user_id)
  
  if (validIds.length === 0) {
    ElMessage.warning('选中的用户已启用')
    return
  }
  console.log('批量启用参数：', validIds)
  adminStore.updateUserList({
    user_id: validIds,
    operation: 'enable'
  }, userCondition.value).then(res => {
    if (res.code === 200) {
      ElMessage.success('批量启用参数已输出')
    }
  })
}

// 单个删除
const deleteUser = (row) => {
  const ids = [row.user_id]
  console.log('单个删除参数：', ids)
  adminStore.updateUserList({
    user_id: ids,
    operation: 'delete'
  }, userCondition.value).then(res => {
    if (res.code === 200) {
      ElMessage.success('单个删除参数已输出')
    }
  })
}

// 单个启用/禁用
const toggleStatus = (row) => {
  if (row.type === '管理员') {
    ElMessage.warning('不可操作管理员')
    return
  }

  const isNormal = row.status === '正常'
  const ids = [row.user_id]
  if (isNormal) {
    // 禁用

    console.log('单个禁用参数：', ids)
  } else {
    // 启用
    console.log('单个启用参数：', ids)
  }
  adminStore.updateUserList({
    user_id: ids,
    operation: isNormal ? 'disable' : 'enable'
  }, userCondition.value).then(res => {
    if (res.code === 200) {
      ElMessage.success('状态参数已输出')
    }
  })
}

// 详情
const detailVisible = ref(false)
const currentRow = ref({})
const openDetail = (row) => {
  currentRow.value = { ...row }
  detailVisible.value = true
}

// 时间格式化
const formatDate = (timeStr) => {
  if (!timeStr) return ''
  const d = new Date(timeStr)
  return `${d.getFullYear()}-${(d.getMonth()+1+'').padStart(2,'0')}-${(d.getDate()+'').padStart(2,'0')}`
}

// 筛选、分页、重置
const handleFilter = async () => {
  await adminStore.getUserListbyPage(userCondition.value, 1)
  ElMessage.success('筛选完成')
}
const resetFilter = () => {
  userCondition.value = { username: '', type: '', status: '' }
  adminStore.initUserList({ page:1, pageSize:pagination.value.pageSize })
  ElMessage.info('已清空筛选')
}
const getPageData = (currentPage, pageSize) => {
  adminStore.getUserListbyPage(userCondition.value, currentPage, pageSize)
}
</script>