<template>
  <div>
    <h3>用户管理</h3>
    <el-table :data="userList" border>
      <el-table-column prop="user_id" label="用户ID" />
      <el-table-column prop="username" label="账号" />
      <el-table-column prop="type" label="角色" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button text @click="editUser(scope.row)">编辑</el-button>
          <el-button text type="danger" @click="deleteUser(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const userList = ref([
  { user_id: 1, username: 'admin', type: '管理员', phone: '13800138001' },
  { user_id: 2, username: 'seller1', type: '商家', phone: '13800138002' },
  { user_id: 3, username: 'user1', type: '普通用户', phone: '13800138003' },
])

const editUser = async (row) => {
  const newName = await ElMessageBox.prompt('请输入新用户名', '编辑用户', {
    inputValue: row.username
  })
  row.username = newName.value
  ElMessage.success('修改成功')
}

const deleteUser = (row) => {
  ElMessageBox.confirm('确定删除该用户？').then(() => {
    userList.value = userList.value.filter(item => item.user_id !== row.user_id)
    ElMessage.success('删除成功')
  })
}
</script>