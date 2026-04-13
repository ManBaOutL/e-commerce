<template>
  <div>
    <h3>用户管理</h3>
    <!-- 筛选区域 -->
    <div style="margin-bottom: 10px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
      <el-input v-model="filterForm.username" placeholder="请输入账号" style="width: 200px;" />
      <el-select v-model="filterForm.type" placeholder="请选择角色">
        <el-option label="管理员" value="管理员" />
        <el-option label="商家" value="商家" />
        <el-option label="普通用户" value="普通用户" />
        <el-option label="VIP用户" value="VIP用户" />
      </el-select>
      <el-select v-model="filterForm.status" placeholder="账号状态">
        <el-option label="正常" value="正常" />
        <el-option label="禁用" value="禁用" />
      </el-select>
      <el-button type="primary" @click="handleFilter">筛选</el-button>
      <el-button @click="resetFilter">清空筛选</el-button>
      <!-- 一键操作：批量删除普通用户 -->
      <el-button type="danger" @click="batchDeleteUser" v-if="hasNormalUser">批量删除普通用户</el-button>
    </div>
    
    <el-table :data="filteredUserList" border>
      <el-table-column prop="user_id" label="用户ID" />
      <el-table-column prop="username" label="账号" />
      <el-table-column prop="type" label="角色">
        <template #default="scope">
          <el-tag :type="scope.row.type === 'VIP用户' ? 'success' : 'info'">
            {{ scope.row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="status" label="账号状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="300px">
        <template #default="scope">
          <el-button text @click="editUser(scope.row)">编辑</el-button>
          <el-button text type="warning" @click="assignRole(scope.row)">分配角色</el-button>
          <el-button 
            text 
            :type="scope.row.status === '正常' ? 'danger' : 'success'" 
            @click="toggleUserStatus(scope.row)"
          >
            {{ scope.row.status === '正常' ? '禁用' : '启用' }}
          </el-button>
          <el-button text type="danger" @click="deleteUser(scope.row)" v-if="scope.row.status !== '禁用'">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAdminStore } from '@/stores/modules/adminStore'
import { storeToRefs } from 'pinia'
const adminStore = useAdminStore()

const { userList } = storeToRefs(adminStore)

// 筛选表单：新增status（账号状态）筛选
const filterForm = ref({
  username: '',
  type: '',
  status: ''
})

// 筛选后的用户列表：兼容角色和状态筛选
const filteredUserList = computed(() => {
  return userList.value.filter(item => {
    const matchName = item.username.includes(filterForm.value.username)
    const matchType = filterForm.value.type ? item.type === filterForm.value.type : true
    const matchStatus = filterForm.value.status ? item.status === filterForm.value.status : true
    return matchName && matchType && matchStatus
  })
})

// 是否有普通用户（控制批量操作按钮显示）
const hasNormalUser = computed(() => {
  return userList.value.some(item => item.type === '普通用户')
})

// 筛选
const handleFilter = () => {
  ElMessage.info('筛选条件已生效')
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    username: '',
    type: '',
    status: ''
  }
  ElMessage.info('筛选条件已清空')
}

// 批量删除普通用户
const batchDeleteUser = () => {
  ElMessageBox.confirm('确定批量删除所有普通用户？').then(() => {
    userList.value = userList.value.filter(item => item.type !== '普通用户')
    ElMessage.success('批量删除普通用户完成')
  })
}

// 编辑用户名
const editUser = async (row) => {
  // 禁用账号不允许编辑
  if (row.status === '禁用') {
    ElMessage.warning('禁用账号无法编辑，请先启用')
    return
  }
  const newName = await ElMessageBox.prompt('请输入新用户名', '编辑用户', {
    inputValue: row.username
  })
  row.username = newName.value
  ElMessage.success('修改成功')
}

// 删除用户：禁用账号不允许删除（可选逻辑，可根据需求调整）
const deleteUser = (row) => {
  ElMessageBox.confirm('确定删除该用户？').then(() => {
    userList.value = userList.value.filter(item => item.user_id !== row.user_id)
    ElMessage.success('删除成功')
  })
}

// 分配用户角色（普通用户/VIP用户）
const assignRole = async (row) => {
  // 管理员/商家角色不允许修改（权限管控）
  if (['管理员', '商家'].includes(row.type)) {
    ElMessage.warning('仅支持修改普通用户/VIP用户的角色')
    return
  }
  // 禁用账号不允许分配角色
  if (row.status === '禁用') {
    ElMessage.warning('禁用账号无法分配角色，请先启用')
    return
  }

  const newRole = await ElMessageBox.confirm(
    `当前角色：${row.type}\n是否切换为${row.type === '普通用户' ? 'VIP用户' : '普通用户'}？`,
    '分配用户角色',
    {
      confirmButtonText: '确认切换',
      cancelButtonText: '取消'
    }
  )

  if (newRole) {
    row.type = row.type === '普通用户' ? 'VIP用户' : '普通用户'
    ElMessage.success(`角色已切换为${row.type}`)
  }
}

// 禁用/启用账号（管控违规账号）
const toggleUserStatus = async (row) => {
  // 管理员账号不允许禁用（权限管控）
  if (row.type === '管理员') {
    ElMessage.warning('禁止禁用管理员账号')
    return
  }

  const action = row.status === '正常' ? '禁用' : '启用'
  const reason = row.status === '正常' 
    ? await ElMessageBox.prompt('请输入禁用原因（违规类型）', '禁用账号', {
        inputPlaceholder: '例如：发布违规内容、恶意刷单等'
      })
    : true

  if (reason) {
    row.status = row.status === '正常' ? '禁用' : '正常'
    // 记录禁用原因（可选，可扩展到数据存储）
    if (row.status === '禁用' && reason.value) {
      row.disableReason = reason.value
    }
    ElMessage.success(`${row.username}账号已${action}`)
  }
}
</script>