<template>
  <div>
    <h3>商品分类管理</h3>
    <el-button type="primary" size="small" @click="addCategory">新增分类</el-button>
    <el-table :data="cateList" border style="margin-top:10px">
      <el-table-column prop="category_id" label="分类ID" />
      <el-table-column prop="name" label="分类名称" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button text @click="editCategory(scope.row)">编辑</el-button>
          <el-button text type="danger" @click="deleteCategory(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const cateList = ref([
  { category_id: 1, name: '电子产品' },
  { category_id: 2, name: '服装鞋包' },
])

const addCategory = async () => {
  const name = await ElMessageBox.prompt('分类名称')
  cateList.value.push({ category_id: Date.now(), name: name.value })
  ElMessage.success('新增成功')
}
const editCategory = async (row) => {
  const newName = await ElMessageBox.prompt('新名称', { inputValue: row.name })
  row.name = newName.value
  ElMessage.success('修改成功')
}
const deleteCategory = (row) => {
  ElMessageBox.confirm('确定删除？').then(() => {
    cateList.value = cateList.value.filter(x => x.category_id !== row.category_id)
    ElMessage.success('删除成功')
  })
}
</script>