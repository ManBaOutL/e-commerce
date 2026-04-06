<template>
  <div class="admin-container">
    <div class="admin-header">
      <div class="logo">商城管理系统</div>
      <div class="user-info">
        <span>超级管理员</span>
        <el-button type="primary" link @click="logout">退出登录</el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="sidebar">
        <div
          class="menu-item"
          :class="{ active: activeMenu === item.key }"
          v-for="item in menuList"
          :key="item.key"
          @click="switchMenu(item.key)"
        >
          {{ item.name }}
        </div>
      </div>

      <div class="content-box">
        <!-- 控制台 -->
        <div v-if="activeMenu === 'dashboard'">
          <h3>数据概览</h3>
          <el-row :gutter="20" class="data-row">
            <el-col :span="6"><div class="data-card">总用户：{{ userList.length }}</div></el-col>
            <el-col :span="6"><div class="data-card">总商品：{{ goodsList.length }}</div></el-col>
            <el-col :span="6"><div class="data-card">总订单：{{ orderList.length }}</div></el-col>
            <el-col :span="6"><div class="data-card">今日销售额：¥12860</div></el-col>
          </el-row>
        </div>

        <!-- 用户管理 -->
        <div v-if="activeMenu === 'user'">
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

        <!-- 商品管理（新增审核功能） -->
        <div v-if="activeMenu === 'goods'">
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

        <!-- 订单管理（新增退款审核功能） -->
        <div v-if="activeMenu === 'order'">
          <h3>全平台订单管理</h3>
          <el-table :data="orderList" border>
            <el-table-column prop="order_id" label="订单号" />
            <el-table-column prop="user_id" label="用户ID" />
            <el-table-column prop="total_amount" label="金额" />
            <el-table-column prop="status" label="订单状态" />
            <el-table-column prop="refundStatus" label="退款状态">
              <template #default="scope">
                <el-tag :type="scope.row.refundStatus === '已同意' ? 'success' : scope.row.refundStatus === '待审核' ? 'warning' : scope.row.refundStatus === '已拒绝' ? 'danger' : 'info'">
                  {{ scope.row.refundStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button text @click="viewOrder(scope.row)">查看详情</el-button>
                <template v-if="scope.row.refundStatus === '待审核'">
                  <el-button text type="success" @click="auditRefund(scope.row, '已同意')">同意退款</el-button>
                  <el-button text type="danger" @click="auditRefund(scope.row, '已拒绝')">拒绝退款</el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分类管理 -->
        <div v-if="activeMenu === 'category'">
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

        <!-- 优惠券管理 -->
        <div v-if="activeMenu === 'coupon'">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const activeMenu = ref('dashboard')

const menuList = ref([
  { key: 'dashboard', name: '控制台' },
  { key: 'user', name: '用户管理' },
  { key: 'goods', name: '商品管理' },
  { key: 'order', name: '订单管理' },
  { key: 'category', name: '分类管理' },
  { key: 'coupon', name: '优惠券管理' },
])

// =============== 模拟数据（新增审核/退款状态字段） ===============
const userList = ref([
  { user_id: 1, username: 'admin', type: '管理员', phone: '13800138001' },
  { user_id: 2, username: 'seller1', type: '商家', phone: '13800138002' },
  { user_id: 3, username: 'user1', type: '普通用户', phone: '13800138003' },
])

const goodsList = ref([
  { product_id: 10001, name: 'iPhone 15 Pro', price: 8999, stock: 50, auditStatus: '待审核' },
  { product_id: 10002, name: '华为Mate60', price: 6999, stock: 30, auditStatus: '已通过' },
])

const orderList = ref([
  { order_id: '2024001', user_id: 2, total_amount: 10898, status: '已完成', refundStatus: '无退款' },
  { order_id: '2024002', user_id: 3, total_amount: 399, status: '待发货', refundStatus: '待审核' },
])

const cateList = ref([
  { category_id: 1, name: '电子产品' },
  { category_id: 2, name: '服装鞋包' },
])

const couponList = ref([
  { coupon_id: 1, name: '满500减50', type: '满减', value: 50, min: 500 },
  { coupon_id: 2, name: '9折券', type: '折扣', value: 90, min: 100 },
  { coupon_id: 3, name: '20元无门槛', type: '无门槛', value: 20, min: 0 },
])

// =============== 菜单切换 ===============
const switchMenu = (key) => {
  activeMenu.value = key
}

// =============== 用户管理 ===============
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

// =============== 商品管理（新增审核方法） ===============
const viewGoods = (row) => {
  ElMessage.info(`商品：${row.name}，价格：${row.price}，库存：${row.stock}`)
}

const editGoods = async (row) => {
  const newPrice = await ElMessageBox.prompt('请输入新价格', '编辑商品', {
    inputValue: String(row.price)
  })
  row.price = Number(newPrice.value)
  ElMessage.success('商品价格已修改')
}

const deleteGoods = (row) => {
  ElMessageBox.confirm('确定删除该商品？').then(() => {
    goodsList.value = goodsList.value.filter(item => item.product_id !== row.product_id)
    ElMessage.success('删除成功')
  })
}

// 商品上架审核
const auditGoods = async (row, status) => {
  const reason = status === '已驳回' 
    ? await ElMessageBox.prompt('请输入驳回理由', '驳回商品审核', {
        inputPlaceholder: '请填写驳回原因'
      })
    : null

  row.auditStatus = status
  ElMessage.success(`商品【${row.name}】审核${status === '已通过' ? '通过' : '驳回'}成功`)
  if (reason) {
    ElMessage.info(`驳回理由：${reason.value}`)
  }
}

// =============== 订单管理（新增退款审核方法） ===============
const viewOrder = (row) => {
  ElMessage.info(`订单号：${row.order_id}，金额：${row.total_amount}，状态：${row.status}，退款状态：${row.refundStatus}`)
}

// 订单退款审核
const auditRefund = async (row, status) => {
  const reason = status === '已拒绝' 
    ? await ElMessageBox.prompt('请输入拒绝退款理由', '拒绝退款', {
        inputPlaceholder: '请填写拒绝原因'
      })
    : null

  row.refundStatus = status
  ElMessage.success(`订单【${row.order_id}】退款申请${status === '已同意' ? '同意' : '拒绝'}成功`)
  if (reason) {
    ElMessage.info(`拒绝理由：${reason.value}`)
  }
}

// =============== 分类管理 ===============
const addCategory = async () => {
  const name = await ElMessageBox.prompt('请输入分类名称', '新增分类')
  cateList.value.push({
    category_id: Date.now(),
    name: name.value
  })
  ElMessage.success('新增成功')
}

const editCategory = async (row) => {
  const newName = await ElMessageBox.prompt('请输入新分类名', '编辑分类', {
    inputValue: row.name
  })
  row.name = newName.value
  ElMessage.success('修改成功')
}

const deleteCategory = (row) => {
  ElMessageBox.confirm('确定删除该分类？').then(() => {
    cateList.value = cateList.value.filter(item => item.category_id !== row.category_id)
    ElMessage.success('删除成功')
  })
}

// =============== 优惠券管理 ===============
const addCoupon = async () => {
  const name = await ElMessageBox.prompt('输入优惠券名称', '新增')
  couponList.value.push({
    coupon_id: Date.now(),
    name: name.value,
    type: '满减',
    value: 20,
    min: 100
  })
  ElMessage.success('新增成功')
}

const sendCoupon = async (row) => {
  ElMessageBox.prompt('输入要发放的用户ID', '发放优惠券', {
    inputPlaceholder: '例如：1,2,3 或单个ID'
  }).then(({ value }) => {
    ElMessage.success(`已向用户【${value}】发放：${row.name}`)
  })
}

const deleteCoupon = (row) => {
  ElMessageBox.confirm('确定删除该优惠券？').then(() => {
    couponList.value = couponList.value.filter(i => i.coupon_id !== row.coupon_id)
    ElMessage.success('删除成功')
  })
}

// =============== 退出登录 ===============
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  ElMessage.success('退出成功')
  router.push('/login')
}
</script>

<style scoped>
.admin-container {
  width: 100vw;
  height: 100vh;
  background: #f4f7fc;
  overflow: hidden;
}
.admin-header {
  height: 60px;
  background: #002140;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.logo {
  font-size: 18px;
  font-weight: bold;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}
.main-content {
  display: flex;
  height: calc(100vh - 60px);
}
.sidebar {
  width: 200px;
  background: #00315a;
  color: white;
}
.menu-item {
  padding: 16px 20px;
  cursor: pointer;
  transition: 0.2s;
}
.menu-item.active {
  background: #165DFF;
  font-weight: bold;
}
.content-box {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
}
.data-row {
  margin-top: 20px;
}
.data-card {
  background: white;
  padding: 30px 20px;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 2px 5px #00000010;
}
</style>