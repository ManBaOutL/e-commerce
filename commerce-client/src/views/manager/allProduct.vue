<template>
  <div>
    <h3>商品管理</h3>
    <!-- 筛选区域 -->
    <div style="margin-bottom: 10px; display: flex; gap: 10px; align-items: center;">
      <el-input v-model="filterForm.productName" placeholder="请输入商品名称" style="width: 200px;" />
      <el-select v-model="filterForm.auditStatus" placeholder="请选择审核状态">
        <el-option label="待审核" value="待审核" />
        <el-option label="已通过" value="已通过" />
        <el-option label="已驳回" value="已驳回" />
      </el-select>
      <el-button type="primary" @click="handleFilter">筛选</el-button>
      <el-button @click="resetFilter">清空筛选</el-button>
      <!-- 一键操作：批量通过待审核商品 -->
      <el-button type="success" @click="batchAuditPass" v-if="hasPendingGoods">批量通过审核</el-button>
    </div>
    
    <el-table :data="filteredGoodsList" border>
      <el-table-column prop="product_id" label="商品ID" />
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="stock" label="库存" />
      <!-- 新增商家相关字段（和商家界面对齐） -->
      <el-table-column prop="seller_id" label="商家ID" />
      <el-table-column prop="seller_name" label="商家名称" />
      <el-table-column prop="category_id" label="分类ID" />
      <el-table-column prop="category_name" label="分类名称" />
      <el-table-column prop="auditStatus" label="审核状态">
        <template #default="scope">
          <el-tag :type="scope.row.auditStatus === '已通过' ? 'success' : scope.row.auditStatus === '待审核' ? 'warning' : 'danger'">
            {{ scope.row.auditStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button text @click="viewGoods(scope.row)">查看</el-button>
          <el-button text type="warning" @click="editGoods(scope.row)">编辑</el-button>
          <el-button text type="danger" @click="deleteGoods(scope.row)">删除</el-button>
          <template v-if="scope.row.auditStatus === '待审核'">
            <el-button text type="success" @click="auditGoods(scope.row, '已通过')">通过</el-button>
            <el-button text type="danger" @click="auditGoods(scope.row, '已驳回')">驳回</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 扩展数据格式（保留原有字段，新增商家/分类相关字段）
const goodsList = ref([
  { 
    product_id: 10001, 
    name: 'iPhone 15 Pro', 
    price: 8999, 
    stock: 50, 
    auditStatus: '待审核',
    seller_id: 2,          // 新增商家ID
    seller_name: 'seller1',// 新增商家名称
    category_id: 3,        // 新增分类ID
    category_name: '手机'  // 新增分类名称
  },
  { 
    product_id: 10002, 
    name: '华为Mate60', 
    price: 6999, 
    stock: 30, 
    auditStatus: '已通过',
    seller_id: 2,
    seller_name: 'seller1',
    category_id: 3,
    category_name: '手机'
  },
])

// 筛选表单
const filterForm = ref({
  productName: '',
  auditStatus: ''
})

// 筛选后的商品列表
const filteredGoodsList = computed(() => {
  return goodsList.value.filter(item => {
    const matchName = item.name.includes(filterForm.value.productName)
    const matchAudit = filterForm.value.auditStatus ? item.auditStatus === filterForm.value.auditStatus : true
    return matchName && matchAudit
  })
})

// 是否有待审核商品（控制批量操作按钮显示）
const hasPendingGoods = computed(() => {
  return goodsList.value.some(item => item.auditStatus === '待审核')
})

// 筛选
const handleFilter = () => {
  ElMessage.info('筛选条件已生效')
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    productName: '',
    auditStatus: ''
  }
  ElMessage.info('筛选条件已清空')
}

// 批量通过审核
const batchAuditPass = () => {
  ElMessageBox.confirm('确定批量通过所有待审核商品？').then(() => {
    goodsList.value.forEach(item => {
      if (item.auditStatus === '待审核') {
        item.auditStatus = '已通过'
      }
    })
    ElMessage.success('批量通过审核完成')
  })
}

const viewGoods = (row) => {
  ElMessage.info(`商品：${row.name}，价格：${row.price}，库存：${row.stock}`)
}

const editGoods = async (row) => {
  const newPrice = await ElMessageBox.prompt('请输入新价格', '编辑商品', { inputValue: String(row.price) })
  row.price = Number(newPrice.value)
  ElMessage.success('商品价格已修改')
}

const deleteGoods = (row) => {
  ElMessageBox.confirm('确定删除该商品？').then(() => {
    goodsList.value = goodsList.value.filter(x => x.product_id !== row.product_id)
    ElMessage.success('删除成功')
  })
}

const auditGoods = async (row, status) => {
  const reason = status === '已驳回' ? await ElMessageBox.prompt('驳回理由') : null
  row.auditStatus = status
  ElMessage.success(`审核${status}`)
  if (reason) ElMessage.info('理由：' + reason.value)
}
</script>