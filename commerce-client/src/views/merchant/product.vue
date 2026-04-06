<template>
  <div>
    <h2>商品管理</h2>
    <el-button type="primary" size="small">新增商品</el-button>
    <el-table :data="goodsList" border style="margin-top:10px">
      <el-table-column prop="product_id" label="商品ID" />
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="stock" label="库存" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="text" @click="editGoods(scope.row)">编辑</el-button>
          <el-button type="text" danger>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟商品列表
const goodsList = ref([
  { product_id: 10001, name: 'iPhone 15 Pro', price: 8999, stock: 50 },
  { product_id: 10008, name: '男士休闲夹克', price: 399, stock: 200 },
])

const editGoods = (row) => {
  ElMessage.info('编辑商品：' + row.name)
}
</script>