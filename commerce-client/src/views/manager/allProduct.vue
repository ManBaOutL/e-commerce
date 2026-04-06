<template>
  <div>
    <h3>商品管理</h3>
    <el-table :data="goodsList" border>
      <el-table-column prop="product_id" label="商品ID" />
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="stock" label="库存" />
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
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const goodsList = ref([
  { product_id: 10001, name: 'iPhone 15 Pro', price: 8999, stock: 50, auditStatus: '待审核' },
  { product_id: 10002, name: '华为Mate60', price: 6999, stock: 30, auditStatus: '已通过' },
])

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