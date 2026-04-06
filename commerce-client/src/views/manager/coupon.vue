<template>
  <div>
    <h3>优惠券管理 & 发放</h3>
    <el-button type="primary" size="small" @click="addCoupon">新增优惠券</el-button>
    <el-table :data="couponList" border style="margin-top:10px">
      <el-table-column prop="coupon_id" label="券ID" />
      <el-table-column prop="name" label="券名称" />
      <el-table-column prop="type" label="类型" />
      <el-table-column label="面额/折扣">
        <template #default="scope">
          {{ scope.row.type === '折扣' ? scope.row.value + '%' : '¥' + scope.row.value }}
        </template>
      </el-table-column>
      <el-table-column prop="min" label="最低使用金额" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button text @click="sendCoupon(scope.row)">发放</el-button>
          <el-button text type="danger" @click="deleteCoupon(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const couponList = ref([
  { coupon_id: 1, name: '满500减50', type: '满减', value: 50, min: 500 },
  { coupon_id: 2, name: '9折券', type: '折扣', value: 90, min: 100 },
  { coupon_id: 3, name: '20元无门槛', type: '无门槛', value: 20, min: 0 },
])

const addCoupon = async () => {
  const name = await ElMessageBox.prompt('券名')
  couponList.value.push({ coupon_id: Date.now(), name: name.value, type: '满减', value: 20, min: 100 })
  ElMessage.success('新增成功')
}
const sendCoupon = async (row) => {
  const val = await ElMessageBox.prompt('发放给用户ID（逗号分隔）')
  ElMessage.success(`已发放给：${val.value}`)
}
const deleteCoupon = (row) => {
  ElMessageBox.confirm('确定删除？').then(() => {
    couponList.value = couponList.value.filter(x => x.coupon_id !== row.coupon_id)
    ElMessage.success('删除成功')
  })
}
</script>