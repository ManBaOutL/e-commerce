<template>
  <div>
    <h3>管理员 - 营销活动管理</h3>

    <!-- 筛选 + 新建 -->
    <div style="display: flex; gap: 10px; margin-bottom: 15px; align-items: center; flex-wrap: wrap;">
      <el-input v-model="searchKey" placeholder="搜索活动名称/商品" style="width: 200px" clearable />
      
      <el-select v-model="typeFilter" placeholder="活动类型" style="width: 140px">
        <el-option label="全部" value="" />
        <el-option label="满减" value="满减" />
        <el-option label="秒杀" value="秒杀" />
        <el-option label="优惠券" value="优惠券" />
      </el-select>

      <el-select v-model="statusFilter" placeholder="活动状态" style="width: 140px">
        <el-option label="全部" value="" />
        <el-option label="未开始" value="未开始" />
        <el-option label="进行中" value="进行中" />
        <el-option label="已结束" value="已结束" />
      </el-select>

      <el-button type="primary" @click="showAddDialog = true">新建活动</el-button>
    </div>

    <!-- 活动列表 -->
    <el-table :data="filterList" border>
      <el-table-column label="活动ID" prop="actId" />
      <el-table-column label="活动名称" prop="actName" />
      <el-table-column label="活动类型" prop="actType">
        <template #default="scope">
          <el-tag :type="
            scope.row.actType === '满减' ? 'success' :
            scope.row.actType === '秒杀' ? 'warning' : 'primary'
          ">
            {{ scope.row.actType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="绑定商品" prop="goodsName" />
      <el-table-column label="活动规则" prop="rule" />
      <el-table-column label="开始时间" prop="startTime" />
      <el-table-column label="结束时间" prop="endTime" />
      <el-table-column label="状态" prop="status">
        <template #default="scope">
          <el-tag :type="
            scope.row.status === '进行中' ? 'success' :
            scope.row.status === '未开始' ? 'info' : 'danger'
          ">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <el-button text @click="viewDetail(scope.row)">查看</el-button>
        <el-button text type="danger" @click="deleteAct(scope.row)">删除</el-button>
      </el-table-column>
    </el-table>

    <!-- 新建活动弹窗 -->
    <el-dialog v-model="showAddDialog" title="创建营销活动" width="650px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="活动类型">
          <el-select v-model="form.actType" placeholder="请选择">
            <el-option label="满减活动" value="满减" />
            <el-option label="秒杀活动" value="秒杀" />
            <el-option label="优惠券活动" value="优惠券" />
          </el-select>
        </el-form-item>

        <el-form-item label="活动名称">
          <el-input v-model="form.actName" placeholder="输入活动名称" />
        </el-form-item>

        <el-form-item label="绑定商品">
          <el-select v-model="form.goodsId" placeholder="选择商品">
            <el-option v-for="item in goodsList" :key="item.goodsId" :label="item.goodsName" :value="item.goodsId" />
          </el-select>
        </el-form-item>

        <!-- 满减配置 -->
        <el-form-item label="满减条件" v-if="form.actType === '满减'">
          <el-input v-model="form.fullMoney" placeholder="满多少元" style="width:120px" />
          <span style="margin:0 10px">减</span>
          <el-input v-model="form.minusMoney" placeholder="减多少元" style="width:120px" />
        </el-form-item>

        <!-- 秒杀配置 -->
        <el-form-item label="秒杀价格" v-if="form.actType === '秒杀'">
          <el-input v-model="form.seckillPrice" placeholder="秒杀价" />
        </el-form-item>

        <!-- 优惠券配置 -->
        <el-form-item label="优惠券面额" v-if="form.actType === '优惠券'">
          <el-input v-model="form.couponPrice" placeholder="面额" />
        </el-form-item>

        <el-form-item label="开始时间">
          <el-input v-model="form.startTime" placeholder="例：2026-04-08 10:00" />
        </el-form-item>

        <el-form-item label="结束时间">
          <el-input v-model="form.endTime" placeholder="例：2026-04-10 23:59" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="createActivity">确认创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchKey = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const showAddDialog = ref(false)

// 商品列表（绑定用）
const goodsList = ref([
  { goodsId: 1, goodsName: '苹果手机' },
  { goodsId: 2, goodsName: '华为平板' },
  { goodsId: 3, goodsName: '无线耳机' },
  { goodsId: 4, goodsName: '机械键盘' },
])

// 活动表单
const form = ref({
  actType: '',
  actName: '',
  goodsId: '',
  fullMoney: '',
  minusMoney: '',
  seckillPrice: '',
  couponPrice: '',
  startTime: '',
  endTime: ''
})

// 活动数据
const actList = ref([
  { actId: 1, actName: '满300减50', actType: '满减', goodsName: '无线耳机', rule: '满300减50', startTime: '2026-04-01', endTime: '2026-04-07', status: '进行中' },
  { actId: 2, actName: '耳机限时秒杀', actType: '秒杀', goodsName: '无线耳机', rule: '秒杀价 ¥199', startTime: '2026-04-08', endTime: '2026-04-09', status: '进行中' },
  { actId: 3, actName: '新用户优惠券', actType: '优惠券', goodsName: '机械键盘', rule: '¥50 无门槛', startTime: '2026-04-05', endTime: '2026-04-15', status: '未开始' },
])

// 筛选
const filterList = computed(() => {
  return actList.value.filter(item => {
    const matchSearch = item.actName.includes(searchKey.value) || item.goodsName.includes(searchKey.value)
    const matchType = !typeFilter.value || item.actType === typeFilter.value
    const matchStatus = !statusFilter.value || item.status === statusFilter.value
    return matchSearch && matchType && matchStatus
  })
})

// 创建活动
const createActivity = () => {
  const goods = goodsList.value.find(g => g.goodsId === form.value.goodsId)
  let rule = ''
  if (form.value.actType === '满减') rule = `满${form.value.fullMoney}减${form.value.minusMoney}`
  if (form.value.actType === '秒杀') rule = `秒杀价 ¥${form.value.seckillPrice}`
  if (form.value.actType === '优惠券') rule = `¥${form.value.couponPrice} 优惠券`

  actList.value.push({
    actId: Date.now(),
    actName: form.value.actName,
    actType: form.value.actType,
    goodsName: goods?.goodsName || '未绑定',
    rule,
    startTime: form.value.startTime,
    endTime: form.value.endTime,
    status: '未开始'
  })
  showAddDialog.value = false
  ElMessage.success('活动创建成功！')
}

// 查看详情
const viewDetail = (row) => {
  ElMessage.info(`查看活动：${row.actName}`)
}

// 删除活动
const deleteAct = async (row) => {
  await ElMessageBox.confirm('确定删除该活动？')
  actList.value = actList.value.filter(item => item.actId !== row.actId)
  ElMessage.success('删除成功')
}
</script>