<template>
  <div>
    <h3>商品分类管理</h3>
    <!-- 筛选区域 -->
    <div style="margin-bottom: 10px; display: flex; gap: 10px; align-items: center;">
      <el-input v-model="filterForm.name" placeholder="请输入分类名称" style="width: 200px;" />
      <el-select v-model="filterForm.parentId" placeholder="请选择父分类" clearable>
        <el-option label="全部" value="" />
        <el-option 
          v-for="item in cateList" 
          :key="item.category_id" 
          :label="item.name" 
          :value="item.category_id.toString()"
        />
      </el-select>
      <el-button type="primary" @click="handleFilter">筛选</el-button>
      <el-button @click="resetFilter">清空筛选</el-button>
      <!-- 一键操作：批量删除子分类 -->
      <el-button type="danger" @click="batchDeleteSubCate" v-if="hasSubCate">批量删除子分类</el-button>
    </div>
    
    <el-button type="primary" size="small" @click="addCategory">新增分类</el-button>
    <el-table :data="filteredCateList" border style="margin-top:10px">
      <el-table-column prop="category_id" label="分类ID" />
      <el-table-column prop="parent_id" label="父分类ID">
        <template #default="scope">
          {{ scope.row.parent_id || '0（顶级）' }}
        </template>
      </el-table-column>
      <el-table-column prop="parent_name" label="父分类名称">
        <template #default="scope">
          {{ scope.row.parent_name || '无' }}
        </template>
      </el-table-column>
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
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 新增父子分类结构
const cateList = ref([
  { category_id: 1, name: '电子产品', parent_id: 0, parent_name: '' },
  { category_id: 2, name: '服装鞋包', parent_id: 0, parent_name: '' },
  { category_id: 3, name: '手机', parent_id: 1, parent_name: '电子产品' },
  { category_id: 4, name: 'T恤', parent_id: 2, parent_name: '服装鞋包' },
  { category_id: 5, name: '笔记本', parent_id: 1, parent_name: '电子产品' },
  { category_id: 6, name: '鞋子', parent_id: 2, parent_name: '服装鞋包' },
  { category_id: 7, name: '昂贵的T恤', parent_id: 4, parent_name: 'T恤' },
  { category_id: 8, name: '便宜的T恤', parent_id: 4, parent_name: 'T恤' },
])

// 筛选表单
const filterForm = ref({
  name: '',
  parentId: ''
})

// 筛选后的分类列表
const filteredCateList = computed(() => {
  return cateList.value.filter(item => {
    const matchName = item.name.includes(filterForm.value.name)
    const matchParent = filterForm.value.parentId 
      ? item.parent_id === Number(filterForm.value.parentId) 
      : true
    return matchName && matchParent
  })
})

// 是否有子分类（控制批量操作按钮显示）
const hasSubCate = computed(() => {
  return cateList.value.some(item => item.parent_id !== 0)
})

// 筛选
const handleFilter = () => {
  ElMessage.info('筛选条件已生效')
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    name: '',
    parentId: ''
  }
  ElMessage.info('筛选条件已清空')
}

// 批量删除子分类
const batchDeleteSubCate = () => {
  ElMessageBox.confirm('确定批量删除所有子分类？').then(() => {
    cateList.value = cateList.value.filter(item => item.parent_id === 0)
    ElMessage.success('批量删除子分类完成')
  })
}

const addCategory = async () => {
  // 新增时选择父分类
  const parentId = await ElMessageBox.prompt(
    '请输入父分类ID（0为顶级分类）', 
    '选择父分类',
    { inputValue: '0' }
  )
  const name = await ElMessageBox.prompt('分类名称')
  
  const parentCate = cateList.value.find(item => item.category_id === Number(parentId.value))
  cateList.value.push({ 
    category_id: Date.now(), 
    name: name.value, 
    parent_id: Number(parentId.value),
    parent_name: parentCate ? parentCate.name : ''
  })
  ElMessage.success('新增成功')
}

const editCategory = async (row) => {
  const newName = await ElMessageBox.prompt('新名称', { inputValue: row.name })
  row.name = newName.value
  
  // 如果是子分类，同步更新父分类名称（可选）
  if (row.parent_id !== 0) {
    const parentCate = cateList.value.find(item => item.category_id === row.parent_id)
    row.parent_name = parentCate ? parentCate.name : ''
  }
  
  ElMessage.success('修改成功')
}

const deleteCategory = (row) => {
  ElMessageBox.confirm('确定删除？删除后其子分类也会被删除！').then(() => {
    // 删除当前分类 + 其子分类
    const deleteIds = [row.category_id]
    const subCates = cateList.value.filter(item => item.parent_id === row.category_id)
    subCates.forEach(item => deleteIds.push(item.category_id))
    
    cateList.value = cateList.value.filter(x => !deleteIds.includes(x.category_id))
    ElMessage.success('删除成功')
  })
}
</script>