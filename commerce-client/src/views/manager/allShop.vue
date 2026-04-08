<template>
  <div style="padding: 20px">
    <h2>管理员 - 店铺管理</h2>

    <!-- 筛选栏 -->
    <div style="margin: 20px 0; display: flex; gap: 15px; flex-wrap: wrap">
      <el-input
        v-model="search.shopName"
        placeholder="店铺名称"
        style="width: 200px"
        clearable
      />
      <el-input
        v-model="search.ownerName"
        placeholder="店主用户名"
        style="width: 200px"
        clearable
      />
      <el-select v-model="search.status" placeholder="店铺状态" style="width: 160px">
        <el-option label="全部" value="" />
        <el-option label="正常营业" value="normal" />
        <el-option label="已禁用" value="forbidden" />
      </el-select>
      <el-button type="primary" @click="searchShop">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 店铺列表 -->
    <el-table :data="filteredList" border stripe>
      <el-table-column label="店铺ID" prop="shopId" width="120" />
      <el-table-column label="店铺名称" prop="shopName" width="220" />
      <el-table-column label="店主" prop="ownerName" width="130" />
      <el-table-column label="联系电话" prop="phone" width="150" />
      <el-table-column label="创建时间" prop="createTime" width="180" />
      
      <el-table-column label="状态" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'normal' ? 'success' : 'danger'">
            {{ scope.row.status === 'normal' ? '正常营业' : '已禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="280">
        <template #default="scope">
          <el-button text size="small" @click="openDetail(scope.row)">
            详情
          </el-button>

          <el-button
            text
            type="warning"
            size="small"
            @click="changeStatus(scope.row)"
          >
            {{ scope.row.status === 'normal' ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="店铺详情" width="600px">
      <div v-if="currentShop" style="line-height: 2.2">
        <p><b>店铺ID：</b>{{ currentShop.shopId }}</p>
        <p><b>店铺名称：</b>{{ currentShop.shopName }}</p>
        <p><b>店主：</b>{{ currentShop.ownerName }}</p>
        <p><b>联系电话：</b>{{ currentShop.phone }}</p>
        <p><b>店铺地址：</b>{{ currentShop.address }}</p>
        <p><b>店铺简介：</b>{{ currentShop.intro }}</p>
        <p><b>创建时间：</b>{{ currentShop.createTime }}</p>
        <p><b>状态：</b>
          <el-tag :type="currentShop.status === 'normal' ? 'success' : 'danger'">
            {{ currentShop.status === 'normal' ? '正常营业' : '已禁用' }}
          </el-tag>
        </p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索
const search = ref({
  shopName: '',
  ownerName: '',
  status: ''
})

// 店铺数据
const shopList = ref([
  {
    shopId: 1001,
    shopName: 'Apple官方旗舰店',
    ownerName: '张店主',
    phone: '13800138000',
    address: '北京市朝阳区科技园区',
    intro: '主营苹果全系列产品',
    createTime: '2025-01-10 10:00',
    status: 'normal'
  },
  {
    shopId: 1002,
    shopName: '华为数码专营店',
    ownerName: '李店主',
    phone: '13900139000',
    address: '上海市浦东新区软件园',
    intro: '华为手机、平板、电脑专卖',
    createTime: '2025-02-15 14:20',
    status: 'normal'
  },
  {
    shopId: 1003,
    shopName: '小米之家专卖店',
    ownerName: '王店主',
    phone: '13700137000',
    address: '广州市天河区购物中心',
    intro: '小米全品类官方授权',
    createTime: '2025-03-01 09:30',
    status: 'forbidden'
  },
  {
    shopId: 1004,
    shopName: 'OPPO体验店',
    ownerName: '赵店主',
    phone: '13600136000',
    address: '深圳市南山区科技园',
    intro: 'OPPO手机、IoT产品专卖',
    createTime: '2025-03-10 11:10',
    status: 'normal'
  }
])

// 筛选
const filteredList = computed(() => {
  return shopList.value.filter(item => {
    const matchName = item.shopName.includes(search.value.shopName)
    const matchOwner = item.ownerName.includes(search.value.ownerName)
    const matchStatus = !search.value.status || item.status === search.value.status
    return matchName && matchOwner && matchStatus
  })
})

const searchShop = () => {}
const resetSearch = () => {
  search.value = { shopName: '', ownerName: '', status: '' }
}

// 详情
const detailVisible = ref(false)
const currentShop = ref(null)
const openDetail = (row) => {
  currentShop.value = row
  detailVisible.value = true
}

// 启用/禁用店铺
const changeStatus = async (row) => {
  const tip = row.status === 'normal' ? '确定要禁用该店铺吗？' : '确定要启用该店铺吗？'
  await ElMessageBox.confirm(tip, '提示')
  row.status = row.status === 'normal' ? 'forbidden' : 'normal'
  ElMessage.success('状态修改成功')
}
</script>