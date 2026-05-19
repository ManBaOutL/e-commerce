<template>
  <div style="padding: 20px;">
    <h3>优惠券管理</h3>

    <el-tabs v-model="activeTab" type="card">
      <!-- 优惠券模板 -->
      <el-tab-pane label="优惠券模板" name="template">
        <div style="margin:15px 0; display:flex; gap:12px; flex-wrap:wrap;">
          <el-input v-model="filterTemplate.name" placeholder="优惠券名称" style="width:180px" clearable />
          <el-select v-model="filterTemplate.type" placeholder="优惠券类型" style="width:140px" clearable>
            <el-option label="满减" value="满减" />
            <el-option label="折扣" value="折扣" />
            <el-option label="秒杀" value="秒杀" />
          </el-select>
          <el-select v-model="filterTemplate.status" placeholder="状态" style="width:140px" clearable>
            <el-option label="已创建" value="已创建" />
          </el-select>

          <el-button type="primary" @click="searchTemplate">搜索</el-button>
          <el-button @click="resetTemplate">重置</el-button>
          <el-button style="margin-left:auto" type="primary" @click="openAddCoupon">+ 新建优惠券</el-button>
        </div>

        <!-- 表格：直接用你的数据，不做任何处理 -->
        <el-table :data="couponTemplateList" border style="width:100%;">
          <el-table-column label="券ID" prop="coupon_id" width="100" />
          <el-table-column label="优惠券名称" prop="name" min-width="180" />
          <el-table-column label="类型" prop="type" width="100" />
          <el-table-column label="面额/折扣" width="120">
            <template #default="scope">
              {{ scope.row.type === '折扣' ? scope.row.value + '%' : '¥' + scope.row.value }}
            </template>
          </el-table-column>
          <el-table-column label="最低消费" width="120">
            <template #default="scope">
              {{ scope.row.min === 0 ? '无门槛' : '¥' + scope.row.min }}
            </template>
          </el-table-column>
          <el-table-column label="有效期(天)" prop="valid_days" width="120" />
          <el-table-column label="创建时间" prop="create_time" width="180" />
          <el-table-column label="状态" width="110">
            <template #default="scope">
              <el-tag type="primary">已创建</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button text size="small" @click="openSendCoupon(scope.row)">发放</el-button>
              <el-button text size="small" type="danger" @click="deleteCouponTemplate(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

          <el-pagination
          v-model:current-page="templatePage.currentPage"
          v-model:page-size="templatePage.pageSize"
          :total="templatePage.total"
          layout="total, sizes, prev, pager, next, jumper"
          @change="getTemplatePageData"  
        />
      </el-tab-pane>

      <!-- 用户优惠券 -->
      <el-tab-pane label="用户优惠券" name="user">
        <div style="margin:15px 0; display:flex; gap:12px; flex-wrap:wrap;">
          <el-input v-model="filterUserCoupon.name" placeholder="优惠券名称" style="width:180px" clearable />
          <el-select v-model="filterUserCoupon.type" placeholder="优惠券类型" style="width:140px" clearable>
            <el-option label="满减" value="满减" />
            <el-option label="折扣" value="折扣" />
            <el-option label="秒杀" value="秒杀" />
          </el-select>
          <el-select v-model="filterUserCoupon.status" placeholder="状态" style="width:140px" clearable>
            <el-option label="未使用" value="未使用" />
            <el-option label="已使用" value="已使用" />
            <el-option label="已过期" value="已过期" />
          </el-select>

          <el-button type="primary" @click="searchUserCoupon">搜索</el-button>
          <el-button @click="resetUserCoupon">重置</el-button>

          <el-button
            type="danger"
            icon="el-icon-delete"
            @click="batchDeleteExpiredUserCoupons"
            style="margin-left: auto"
          >
            批量删除过期优惠券
          </el-button>
        </div>

        <!-- 表格：直接用你的数据，不做任何处理 -->
        <el-table :data="userCouponList" border style="width:100%;">
          <el-table-column label="记录ID" prop="coupon_id" width="120" />
          <el-table-column label="用户账号" prop="username" width="160" />
          <el-table-column label="优惠券名称" prop="name" min-width="180" />
          <el-table-column label="类型" prop="type" width="100" />
          <el-table-column label="面额/折扣" width="120">
            <template #default="scope">
              {{ scope.row.type === '折扣' ? scope.row.value + '%' : '¥' + scope.row.value }}
            </template>
          </el-table-column>
          <el-table-column label="最低消费" width="120">
            <template #default="scope">
              {{ scope.row.min === 0 ? '无门槛' : '¥' + scope.row.min }}
            </template>
          </el-table-column>
          <el-table-column label="领取时间" prop="create_time" width="180" />
          <el-table-column label="状态" width="110">
            <template #default="scope">
              <el-tag
                :type="
                  scope.row.status === '未使用' ? 'success' :
                  scope.row.status === '已使用' ? 'warning' : 'danger'
                "
              >
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

          <el-pagination
            v-model:current-page="userPage.currentPage"
            v-model:page-size="userPage.pageSize"
            :total="userPage.total"
            layout="total, sizes, prev, pager, next, jumper"
            @change="getUserPageData"  
          />
      </el-tab-pane>

    </el-tabs>

    <!-- 新建弹窗 -->
    <el-dialog title="新建优惠券" v-model="addCouponVisible" width="480px">
      <el-form :model="addCouponForm" label-width="120px">
        <el-form-item label="券名称" required>
          <el-input v-model="addCouponForm.name" placeholder="请输入优惠券名称" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="addCouponForm.type">
            <el-option label="满减" value="满减" />
            <el-option label="折扣" value="折扣" />
            <el-option label="秒杀" value="秒杀" />
          </el-select>
        </el-form-item>
        <el-form-item label="面额/折扣" required>
          <el-input v-model.number="addCouponForm.value" type="number" :min="addCouponForm.type === '折扣' ? 1 : 1" :max="addCouponForm.type === '折扣' ? 99 : undefined" :placeholder="addCouponForm.type === '折扣' ? '1-99' : '≥1'" />
          <div style="font-size:12px;color:#909399;margin-top:5px">
            {{ addCouponForm.type === '折扣' ? '折扣率范围：1-99（如90表示9折）' : '满减/秒杀金额范围：≥1' }}
          </div>
        </el-form-item>
        <el-form-item label="最低消费">
          <el-input v-model.number="addCouponForm.min" type="number" min="0" placeholder="≥0，0表示无门槛" />
        </el-form-item>
        <el-form-item label="有效期(天)" required>
          <el-input v-model.number="addCouponForm.valid_days" type="number" min="1" placeholder="≥1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addCouponVisible = false">取消</el-button>
        <el-button type="primary" @click="createCoupon">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- 发放弹窗 -->
    <el-dialog title="发放优惠券" v-model="sendCouponVisible" width="460px">
      <el-form :model="sendCouponForm" label-width="110px">
        <el-form-item label="发放给">
          <el-radio-group v-model="sendCouponForm.targetType">
            <el-radio label="全部用户">全部用户</el-radio>
            <el-radio label="指定用户ID">指定用户ID</el-radio>
            <el-radio label="VIP用户">VIP用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用户ID" v-if="sendCouponForm.targetType === '指定用户ID'">
          <el-input v-model="sendCouponForm.userIds" placeholder="逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sendCouponVisible = false">取消</el-button>
        <el-button type="primary" @click="sendCouponToUser">确认发放</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAdminStore } from '@/stores/modules/adminStore'

const adminStore = useAdminStore()

const couponTemplateList = ref([
  {
    coupon_id: 1,
    name: '满200减30',
    type: '满减',
    value: 30,
    min: 200,
    valid_days: 30,
    create_time: '2026-04-16 12:00:00',
    status: '已创建'
  },
  {
    coupon_id: 2,
    name: '9折券',
    type: '折扣',
    value: 90,
    min: 100,
    valid_days: 15,
    create_time: '2026-04-10 10:00:00',
    status: '已创建'
  },
])

const userCouponList = ref([
  { coupon_id: 1001, username: 'user01', name: '满200减30', type: '满减', value: 30, min: 200, create_time: '2026-04-16 14:00:00', status: '未使用' },
  { coupon_id: 1002, username: 'user02', name: '9折券', type: '折扣', value: 90, min: 100, create_time: '2026-04-11 11:20:00', status: '已过期' },
  { coupon_id: 1003, username: 'user03', name: '秒杀50元', type: '秒杀', value: 50, min: 99, create_time: '2026-04-02 10:10:00', status: '已过期' },
])

const templatePage = ref(1)
const userPage = ref(1)



onMounted(async () => {
  await adminStore.initTemplateCouponList()
  templatePage.value = adminStore.pagination
  couponTemplateList.value = adminStore.templateCouponList
  console.log("优惠券模板列表:", couponTemplateList.value)
  await adminStore.initUserCouponList()
  userPage.value = adminStore.pagination
  userCouponList.value = adminStore.userCouponList
  console.log("用户优惠券列表:", userCouponList.value)
})

const formatDate = (date) => {
  const pad = n => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const activeTab = ref('template')


const filterTemplate = ref({ name: '', type: '', status: '已创建' })
const filterUserCoupon = ref({ name: '', type: '', status: '' })

// 只输出条件，不做任何数据处理
const searchTemplate = async () => {
  console.log("【模板搜索条件】", filterTemplate.value)
  await adminStore.getTemplateCouponList(filterTemplate.value, 1, 10)
  couponTemplateList.value = adminStore.templateCouponList
  templatePage.value = adminStore.pagination
  ElMessage.success("筛选条件已保存")
}
const resetTemplate = async () => {
  filterTemplate.value = { name: '', type: '', status: '已创建' }
  await adminStore.initTemplateCouponList()
  templatePage.value = adminStore.pagination
  couponTemplateList.value = adminStore.templateCouponList
}

const searchUserCoupon = async () => {
  console.log("【用户券搜索条件】", filterUserCoupon.value)
  await adminStore.getUserCouponList(filterUserCoupon.value, 1, 10)
  userCouponList.value = adminStore.userCouponList
  userPage.value = adminStore.pagination
  ElMessage.success("筛选条件已保存")
}
const resetUserCoupon = async () => {
  filterUserCoupon.value = { name: '', type: '', status: '' }
  await adminStore.initUserCouponList()
  userPage.value = adminStore.pagination
  userCouponList.value = adminStore.userCouponList
}

const addCouponVisible = ref(false)
const addCouponForm = ref({ name: '', type: '满减', value: 1, min: 1, valid_days: 30 })

const openAddCoupon = () => {
  addCouponForm.value = { name: '', type: '满减', value: 1, min: 1, valid_days: 30 }
  addCouponVisible.value = true
}

const opreationData = ref({})
const createCoupon = async () => {
  const f = addCouponForm.value
  
  // 基础验证
  if (!f.name || f.name.trim() === '') {
    ElMessage.warning('请填写优惠券名称')
    return
  }
  if (!f.type) {
    ElMessage.warning('请选择优惠券类型')
    return
  }
  if (f.valid_days < 1) {
    ElMessage.warning('有效期必须≥1天')
    return
  }

  // 根据类型验证 value
  if (f.type === '折扣') {
    if (f.value < 1 || f.value > 99) {
      ElMessage.warning('折扣券的折扣率必须在1-99之间')
      return
    }
  } else {
    if (f.value < 1) {
      ElMessage.warning('面额必须≥1')
      return
    }
  }

  // 验证最低消费
  if (f.min < 0) {
    ElMessage.warning('最低消费必须≥0')
    return
  }

  // 满减/秒杀券：面额必须≥最低消费金额（折扣券不需要此判断）
  if (f.type !== '折扣' && f.value < f.min) {
    ElMessage.warning('面额必须≥最低消费金额')
    return
  }

  const newCoupon={
    coupon_id: Date.now(),
    name: f.name,
    coupon_type: f.type,
    value: f.value,
    min_order_amount: f.min,
    start_time: formatDate(new Date()),
    end_time: formatDate(new Date(new Date().getTime() + f.valid_days * 24 * 60 * 60 * 1000)),
    create_time: formatDate(new Date()),
    coupon_status: '已创建'
  }
  opreationData.value = {
    operation: 'create',
    newCoupon: newCoupon,
  }
  addCouponVisible.value = false
  console.log("新创建的优惠券:", opreationData.value)

  await adminStore.updateTemplateCouponList(opreationData.value)
  couponTemplateList.value = adminStore.templateCouponList
  templatePage.value = adminStore.pagination

  ElMessage.success('创建成功')

}

const sendCouponVisible = ref(false)
const sendCouponForm = ref({ targetType: '全部用户', userIds: '' })
let currentTemplate = null


const openSendCoupon = (row) => {
  currentTemplate = row
  sendCouponForm.value = { targetType: '全部用户', userIds: '' }
  sendCouponVisible.value = true
}

const sendCouponToUser = async () => {
  if (sendCouponForm.value.targetType === '指定用户ID' && !sendCouponForm.value.userIds) {
    ElMessage.warning('请输入用户ID')
    return
  }
  if (sendCouponForm.value.targetType === '指定用户ID') {
    const userIdArray = sendCouponForm.value.userIds.split(',').map(id => id.trim()).filter(Boolean)
    opreationData.value = {
      operation: 'toUser',
      user_id: userIdArray,
      coupon_id: [currentTemplate.coupon_id]
    }
    //console.log("【发放优惠券】指定用户ID数组：", userIdArray)
  } else if (sendCouponForm.value.targetType === '全部用户') {
    opreationData.value = {
      operation: 'toAll',
      coupon_id: [currentTemplate.coupon_id]
    }
    //console.log("【发放优惠券】操作类型：toAll")
  } else if (sendCouponForm.value.targetType === 'VIP用户') {
    opreationData.value = {
      operation: 'toVip',
      coupon_id: [currentTemplate.coupon_id]
    }
    //console.log("【发放优惠券】操作类型：toVip")
  }

  console.log("【发放优惠券】目标信息：", opreationData.value)
  sendCouponVisible.value = false

  await adminStore.updateTemplateCouponList(opreationData.value)
  // 刷新用户优惠券列表
  await adminStore.initUserCouponList()
  userCouponList.value = adminStore.userCouponList
  userPage.value = adminStore.pagination



  ElMessage.success('发放成功')
}

const deleteCouponTemplate = async (row) => {
  await ElMessageBox.confirm('确认删除？')
  //couponTemplateList.value = couponTemplateList.value.filter(i => i.coupon_id !== row.coupon_id)
  opreationData.value = {
    operation: 'delete',
    coupon_id: [row.coupon_id]
  }
  console.log("【删除优惠券】删除的优惠券操作：", opreationData.value)

  await adminStore.updateTemplateCouponList(opreationData.value)
  couponTemplateList.value = adminStore.templateCouponList
  templatePage.value = adminStore.pagination

  // 刷新用户优惠券列表
  await adminStore.initUserCouponList()
  userCouponList.value = adminStore.userCouponList
  userPage.value = adminStore.pagination
  
  ElMessage.success('删除成功')
}

const batchDeleteExpiredUserCoupons = async () => {
  const expiredList = userCouponList.value.filter(item => item.status === '已过期')
  if (expiredList.length === 0) {
    ElMessage.info('暂无过期优惠券可删除')
    return
  }
  await ElMessageBox.confirm(`确定要删除【${expiredList.length}条】过期优惠券吗？`)
  
  // 输出删除的过期优惠券数组
  opreationData.value = {
    operation: 'delete',
    coupon_id: expiredList.map(item => item.coupon_id)
  }
  console.log("【批量删除过期优惠券】删除的数组：", opreationData.value)

  await adminStore.updateUserCouponList(opreationData.value)
  // 刷新用户优惠券列表
  userCouponList.value = adminStore.userCouponList
  userPage.value = adminStore.pagination

  //userCouponList.value = userCouponList.value.filter(item => item.status !== '已过期')
  ElMessage.success(`成功删除 ${expiredList.length} 条过期优惠券`)
}

const getTemplatePageData = async () => {
  await adminStore.getTemplateCouponList(filterTemplate.value, templatePage.value.currentPage, templatePage.value.pageSize)
  couponTemplateList.value = adminStore.templateCouponList
  templatePage.value = adminStore.pagination
}

const getUserPageData = async () => {
  await adminStore.getUserCouponList(filterUserCoupon.value, userPage.value.currentPage, userPage.value.pageSize)
  userCouponList.value = adminStore.userCouponList
  userPage.value = adminStore.pagination
}
</script>