<template>
  <div class="category-page">
    <h3>商品分类管理</h3>

    <!-- 搜索 + 新增 一行 -->
    <div class="search-row">
      <el-input
        v-model="filterForm.name"
        placeholder="搜索分类名称"
        style="width: 240px"
        @keyup.enter="handleFilter"
      />

      <el-select
        v-model="filterForm.parentId"
        placeholder="按父分类筛选"
        clearable
        style="width: 220px"
      >
        <el-option label="全部" value="" />
        <el-option
          v-for="item in parentCateList"
          :key="item.category_id"
          :label="item.name"
          :value="item.category_id.toString()"
        />
      </el-select>

      <el-button type="primary" @click="handleFilter">搜索</el-button>
      <el-button @click="resetFilter">清空</el-button>

      <el-button
        type="primary"
        style="margin-left: auto"
        @click="openAddDialog"
      >
        + 新增分类
      </el-button>
    </div>

    <!-- 表格全屏 -->
    <el-table
      :data="filteredList"
      border
      style="width: 100%; margin-top: 12px"
      empty-text="暂无分类"
    >
      <el-table-column prop="category_id" label="分类ID" width="100" />
      <el-table-column prop="parent_id" label="父分类ID" width="120">
        <template #default="scope">
          {{ scope.row.parent_id || '0（顶级）' }}
        </template>
      </el-table-column>
      <el-table-column prop="parent_name" label="父分类名称" width="160" />
      <el-table-column prop="name" label="分类名称" min-width="200" />
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-button text @click="handleEdit(scope.row)">编辑</el-button>
          <el-button text type="danger" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增弹窗 -->
    <el-dialog title="新增分类" v-model="addVisible" width="460px">
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="父分类" prop="parentId">
          <el-select
            v-model="addForm.parentId"
            placeholder="输入文字搜索父分类"
            filterable
            style="width: 100%"
          >
            <el-option label="顶级分类（无父级）" value="0" />
            <el-option
              v-for="item in cateList"
              :key="item.category_id"
              :label="item.name"
              :value="item.category_id.toString()"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdd">确认新增</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {useAdminStore} from '@/stores/modules/adminStore'
//import { on } from 'events'

const adminStore = useAdminStore()

onMounted(async () => {
  await adminStore.initCategoryList()
  cateList.value = adminStore.categoryList
})




// 分类数据
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

// 搜索筛选
const filterForm = ref({
  name: '',
  parentId: ''
})

// 树形转换（判断哪些分类有子类）
const translateTree = (data) => {
  const map = {}
  const tree = []
  data.forEach(item => {
    map[item.category_id] = { ...item, children: [] }
  })
  data.forEach(item => {
    const node = map[item.category_id]
    if (item.parent_id !== 0 && map[item.parent_id]) {
      map[item.parent_id].children.push(node)
    } else {
      tree.push(node)
    }
  })
  return tree
}

// 筛选出【有子类】的父分类
const parentCateList = computed(() => {
  const tree = translateTree(cateList.value)
  const ids = []

  function find(node) {
    if (node.children && node.children.length > 0) {
      ids.push(node.category_id)
      node.children.forEach(find)
    }
  }
  tree.forEach(find)

  return cateList.value.filter(item => ids.includes(item.category_id))
})

// 表格筛选后数据
const filteredList = computed(() => {
  return cateList.value.filter(item => {
    const matchName = item.name.includes(filterForm.value.name)
    const matchParent = filterForm.value.parentId
      ? item.parent_id === Number(filterForm.value.parentId)
      : true
    return matchName && matchParent
  })
})

// 搜索
const handleFilter = () => {
  const res = {
    operation: '筛选',
    category_id: filteredList.value.map(i => i.category_id)
  }
  console.log('操作数据：', res)
  ElMessage.success('已输出筛选数据')
}

// 清空
const resetFilter = () => {
  filterForm.value = { name: '', parentId: '' }
  const res = {
    operation: '清空筛选',
    category_id: cateList.value.map(i => i.category_id)
  }
  console.log('操作数据：', res)
  ElMessage.success('已清空')
}

// 新增弹窗
const addVisible = ref(false)
const addFormRef = ref(null)
const addForm = reactive({ name: '', parentId: '0' })
const addRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  parentId: [{ required: true, message: '请选择父分类', trigger: 'change' }]
}

const openAddDialog = () => {
  addForm.name = ''
  addForm.parentId = '0'
  addFormRef.value?.resetFields()
  addVisible.value = true
}

// 提交新增
const submitAdd = async () => {
  await addFormRef.value.validate()
  const parentId = Number(addForm.parentId)
  const parent = cateList.value.find(x => x.category_id === parentId)

  const newCategory = {
    category_id: Date.now(),
    name: addForm.name,
    parent_id: parentId,
    parent_name: parent ? parent.name : ''
  }

  const res = {
    operation: 'add',
    category_id: [newCategory.category_id],
    newCategory
  }
  console.log('操作数据：', res)

  //cateList.value.push(newCategory)
  await adminStore.updateCategoryList(res)
  cateList.value = adminStore.categoryList
  addVisible.value = false
  ElMessage.success('新增成功')
}

// 编辑
const handleEdit = async (row) => {
  const { value } = await ElMessageBox.prompt('新分类名称', {
    inputValue: row.name
  })

  row.name = value
  cateList.value.forEach(x => {
    if (x.parent_id === row.category_id) x.parent_name = value
  })

  const res = {
    operation: 'update',
    category_id: [row.category_id],
    newCategory: row
  }
  try {
    await adminStore.updateCategoryList(res)
    cateList.value = adminStore.categoryList
    ElMessage.success('修改成功')
  } catch (error) {
    ElMessage.error('修改失败')
  }
  console.log('操作数据：', res)
  // ElMessage.success('修改成功')
}

// 删除
const handleDelete = async (row) => {
  ElMessageBox.confirm('确定删除？子分类会一起删除').then(async () => {
    const delIds = []
    function find(id) {
      delIds.push(id)
      cateList.value.filter(x => x.parent_id === id).forEach(x => find(x.category_id))
    }
    find(row.category_id)

    const res = {
      operation: 'delete',
      category_id: delIds
    }
    //console.log('操作数据：', res)

    //cateList.value = cateList.value.filter(x => !delIds.includes(x.category_id))
    await adminStore.updateCategoryList(res)
    cateList.value = adminStore.categoryList
    ElMessage.success('删除成功')
  })
}
</script>

<style>
.category-page {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.search-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
</style>