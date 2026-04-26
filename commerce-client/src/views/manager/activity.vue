<template>
  <div>
    <h3>管理员 - 营销活动管理</h3>

    <!-- 筛选区域 -->
    <div style="display: flex; gap: 10px; margin-bottom: 15px; align-items: center; flex-wrap: wrap;">
      <el-input v-model="searchName" placeholder="活动名称" style="width: 180px" clearable />
      <el-input v-model="searchCategory" placeholder="商品种类" style="width: 180px" clearable />
      <el-select v-model="typeFilter" placeholder="活动类型" style="width: 140px">
        <el-option label="全部" value="" />
        <el-option label="满减" value="满减" />
        <el-option label="秒杀" value="秒杀" />
        <el-option label="折扣" value="折扣" />
      </el-select>
      <el-select v-model="statusFilter" placeholder="活动状态" style="width: 140px">
        <el-option label="全部" value="" />
        <el-option label="未开始" value="未开始" />
        <el-option label="进行中" value="进行中" />
        <el-option label="已结束" value="已结束" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="resetSearch">清空筛选</el-button>
      <el-button type="primary" @click="showAddDialog = true">新建活动</el-button>
    </div>

    <!-- 活动列表 -->
    <el-table :data="actList" border>
      <el-table-column label="活动ID" prop="actId" />
      <el-table-column label="活动名称" prop="actName" />
      <el-table-column label="活动类型" prop="actType">
        <template #default="scope">
          <el-tag :type="
            scope.row.actType === '满减' ? 'success' :
            scope.row.actType === '秒杀' ? 'warning' :
            scope.row.actType === '折扣' ? 'info' : 'danger'
          ">
            {{ scope.row.actType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="适用范围" prop="categoryName" />
      <el-table-column label="活动规则" prop="rule" />
      <el-table-column label="最低消费" prop="minOrderAmount">
        <template #default="scope">
          ¥{{ scope.row.minOrderAmount }}
        </template>
      </el-table-column>
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
        <template #default="scope">
          <el-button text @click="viewImage(scope.row)">查看图片</el-button>
          <el-button text type="danger" @click="deleteAct(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @change="getPageData"  
    />

    <!-- 新建弹窗 -->
    <el-dialog v-model="showAddDialog" title="创建营销活动" width="700px" draggable @close="resetForm">
      <el-form :model="form" label-width="110px" :rules="formRules" ref="formRef" status-icon>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动类型" prop="actType">
              <el-select v-model="form.actType" placeholder="请选择类型" style="width: 100%" @change="handleTypeChange">
                <el-option label="满减活动" value="满减" />
                <el-option label="秒杀活动" value="秒杀" />
                <el-option label="折扣活动" value="折扣" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动名称" prop="actName">
              <el-input v-model="form.actName" placeholder="如：双十一数码大促" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="适用商品种类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="选择商品种类" style="width: 100%">
            <el-option label="【全品类】所有商品" value="0" />
            <el-option 
              v-for="item in categoryList" 
              :key="item.categoryId" 
              :label="item.categoryName" 
              :value="item.categoryId + ''"  
            />
          </el-select>
        </el-form-item>

        <el-form-item label="活动时间" prop="activityTime">
          <el-date-picker
            v-model="form.activityTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          />
        </el-form-item>

        <el-card shadow="never" class="rule-card" v-if="form.actType">
          <template #header>
            <span style="font-weight: bold; color: #409EFF">活动规则设置</span>
          </template>

          <el-form-item label="满减条件" v-if="form.actType === '满减'" prop="discountRate">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span>消费满</span>
              <el-input-number v-model="form.minOrderAmount" :min="0" :precision="2" :controls="false" placeholder="0.00" style="width: 120px">
                <template #prefix>¥</template>
              </el-input-number>
              <span>，立减</span>
              <el-input-number v-model="form.discountRate" :min="0" :precision="2" :controls="false" placeholder="0.00" style="width: 120px">
                <template #prefix>¥</template>
              </el-input-number>
            </div>
          </el-form-item>

          <el-form-item label="秒杀价格" v-if="form.actType === '秒杀'" prop="discountRate">
            <el-input-number v-model="form.discountRate" :min="0" :precision="2" :controls="false" placeholder="0.00" style="width: 160px">
              <template #prefix>¥</template>
            </el-input-number>
          </el-form-item>

          <el-form-item label="折扣比例" v-if="form.actType === '折扣'" prop="discountRate">
            <el-input-number v-model="form.discountRate" :min="0.01" :max="0.99" :step="0.05" :precision="2" placeholder="如 0.85" style="width: 160px" />
            <span class="tip-text">（请输入 0.01 ~ 0.99 之间的小数，如 0.85 即为 85折）</span>
          </el-form-item>
        </el-card>

        <div style="height: 20px;"></div>

        <el-form-item label="活动海报" prop="imgUrl">
          <el-upload
            class="avatar-uploader"
            action="/api/user/media/upload"
            :headers="uploadHeaders"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
          >
            <div v-if="form.imgUrl" class="upload-preview-wrapper">
              <img :src="getFullUrl(form.imgUrl)" class="upload-preview" />
              <div class="hover-mask"><el-icon color="#fff" :size="24"><Camera /></el-icon></div>
            </div>
            <div v-else class="upload-placeholder">
              <el-icon><Plus /></el-icon>
              <div>点击上传海报</div>
            </div>
          </el-upload>
          <div class="upload-tip">建议尺寸比例 16:9，支持JPG/PNG，不超过2MB</div>
        </el-form-item>

      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="createActivity">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- 图片查看弹窗 -->
    <el-dialog v-model="showImageDialog" :title="imageTitle" width="800px">
      <div style="text-align: center">
        <img 
          v-if="imageUrl" 
          :src="getFullUrl(imageUrl)" 
          style="max-width: 100%; max-height: 600px" 
          alt="活动图片"
        />
        <div v-else class="no-image">暂无活动图片</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useAdminStore } from '@/stores/modules/adminStore'
import { Plus } from '@element-plus/icons-vue'
import { useLoginStore } from '@/stores/modules/common/loginStore' // 引入 loginStore 获取 Token
import getFullUrl from '@/utils/getFullUrl' // 引入路径拼接工具

const loginStore = useLoginStore()
const { token } = storeToRefs(loginStore)
const adminStore = useAdminStore()
const { actList, pagination } = storeToRefs(adminStore)

// 筛选条件
const searchName = ref('')
const searchCategory = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const showAddDialog = ref(false)

// 图片弹窗
const showImageDialog = ref(false)
const imageUrl = ref('') 
const imageTitle = ref('')

const uploadHeaders = computed(() => {
  const cleanToken = (token?.value || '').replace(/(^"|"$)/g, '')
  return { Authorization: `Bearer ${cleanToken}` }
})

// 商品分类
const categoryList = ref([
  { categoryId: 1, categoryName: '服饰鞋包' },
  { categoryId: 2, categoryName: '数码电子' },
  { categoryId: 3, categoryName: '家居日用' },
  { categoryId: 4, categoryName: '食品生鲜' },
  { categoryId: 5, categoryName: '美妆护肤' }
])

// 表单校验规则（精简，只保留必要字段）
const formRef = ref(null)
const formRules = ref({
  actType: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  actName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择适用商品种类', trigger: 'change' }],
  discountRate: [{ required: true, message: '请填写活动优惠数值', trigger: 'blur' }],
  activityTime: [{ required: true, message: '请选择活动生效时间段', trigger: 'change' }],
  imgUrl: [{ required: true, message: '请上传活动海报', trigger: 'change' }]
})


onMounted(async () => {
  await adminStore.initCategoryList()
  categoryList.value = [...adminStore.categoryList].map(item => ({
    categoryId: item.category_id,
    categoryName: item.name
  }))
  categoryList.value.unshift({ categoryId: 0, categoryName: '所有商品' })
  await adminStore.initActList()


  // 初始化默认数据（符合接口定义）
  if (!actList.value || actList.value.length === 0) {
    actList.value = [
      { 
        actId: 1, 
        actName: '618全品类满减', 
        actType: '满减', 
        categoryName: '所有商品', 
        rule: '满99减20',
        discountRate: 20,
        minOrderAmount: 99,
        startTime: '2026-06-01 00:00', 
        endTime: '2026-06-20 23:59', 
        status: '进行中', 
        img: 'https://picsum.photos/800/450?random=1' 
      },
      { 
        actId: 2, 
        actName: '数码秒杀活动', 
        actType: '秒杀', 
        categoryName: '数码电子', 
        rule: '秒杀价 ¥89',
        discountRate: 89,
        minOrderAmount: 0,
        startTime: '2026-05-10 10:00', 
        endTime: '2026-05-10 12:00', 
        status: '已结束', 
        img: 'https://picsum.photos/800/450?random=2' 
      },
      { 
        actId: 3, 
        actName: '家居用品折扣', 
        actType: '折扣', 
        categoryName: '家居日用', 
        rule: '8.5折',
        discountRate: 0.85,
        minOrderAmount: 0,
        startTime: '2026-07-01 00:00', 
        endTime: '2026-07-31 23:59', 
        status: '未开始', 
        img: 'https://picsum.photos/800/450?random=3' 
      }
    ]
  }
})

// 表单（只保留接口定义的核心字段）
const form = ref({
  actType: '',
  actName: '',
  categoryId: '',
  discountRate: 0,    // 满减=优惠金额 | 秒杀=秒杀价 | 折扣=折扣比例
  minOrderAmount: 0,  // 满减=最低消费 | 秒杀/折扣=0
  activityTime: [],
  imgUrl: ''          // 活动图片（必填）
})

const handleTypeChange = () => {
  form.value.discountRate = undefined
  form.value.minOrderAmount = undefined
}

// 查询
const handleSearch = () => {
  const searchCondition = {
    name: searchName.value,
    category_name: searchCategory.value,
    type: typeFilter.value,
    status: statusFilter.value
  }
  adminStore.getActList(searchCondition, 1, 10)
  actList.value = adminStore.actList
}

// 清空筛选
const resetSearch = () => {
  searchName.value = ''
  searchCategory.value = ''
  typeFilter.value = ''
  statusFilter.value = ''
  ElMessage.success('已清空筛选条件')
}

// 上传前校验
const beforeUpload = (file) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isImage) {
    ElMessage.error('只能上传JPG/PNG格式的图片！')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB！')
    return false
  }
  return true
}

// 替换为你个人信息里一样的真实上传成功逻辑
const handleUploadSuccess = (res, file) => {
  if (res.success || res.code === 200) {
    // 保存后端返回的路径 (例如 /upload/temp/xxx.png)
    form.value.imgUrl = res.data.url || res.data 
    ElMessage.success('图片上传成功！')
  } else {
    ElMessage.error(res.message || '图片上传失败')
  }
}

const handleUploadError = () => {
  ElMessage.error('网络异常，图片上传失败！')
}

// 重置表单
const resetForm = () => {
  form.value = {
    actType: '',
    actName: '',
    categoryId: '',
    discountRate: undefined,
    minOrderAmount: undefined,
    activityTime: [], // 清空时间
    imgUrl: ''
  }
  formRef.value?.clearValidate()
}

// 创建活动（核心逻辑优化）
const createActivity = async () => {
  const validate = await formRef.value.validate()
  if (!validate) return

  // 按活动类型处理规则
  let rule = ''
  switch (form.value.actType) {
    case '满减':
      if(!form.value.minOrderAmount) {
        return ElMessage.warning('请填写满减的最低消费条件')
      }
      rule = `满${form.value.minOrderAmount}减${form.value.discountRate}`
      break
    case '秒杀':
      form.value.minOrderAmount = 0 
      rule = `秒杀价 ¥${form.value.discountRate}`
      break
    case '折扣':
      form.value.minOrderAmount = 0 
      // 0.85 -> 8.5折
      rule = `${form.value.discountRate * 10}折`
      break
  }

  const newAct = {
    actId: Date.now(),
    actName: form.value.actName,
    actType: form.value.actType,
    categoryID: parseInt(form.value.categoryId),
    rule,
    discountRate: form.value.discountRate,
    minOrderAmount: form.value.minOrderAmount,
    // 🌟 从数组解构时间
    startTime: form.value.activityTime[0], 
    endTime: form.value.activityTime[1],
    status: '未开始',
    img: form.value.imgUrl
  }

  const result = {
    activity_id: [],
    newActivity: newAct,
    operation: 'create'
  }

  showAddDialog.value = false
  
  const searchCondition = {
    name: searchName.value,
    category_name: searchCategory.value,
    type: typeFilter.value,
    status: statusFilter.value
  }
  await adminStore.updateActivityList(result, searchCondition)
  resetForm()

  ElMessage.success('活动创建成功！')
}

// 查看活动图片
const viewImage = (row) => {
  imageTitle.value = row.actName
  imageUrl.value = row.img
  showImageDialog.value = true
}

// 删除活动
const deleteAct = async (row) => {
  await ElMessageBox.confirm('确定删除该活动吗？', '提示', {
    type: 'warning'
  })

  const result = {
    activity_id: [row.actId], // 把当前活动ID放数组
    operation: 'delete'
  }
  // actList.value = actList.value.filter(item => item.actId !== row.actId)
  console.log('【活动删除】', result)
  // 更新活动列表
  const searchCondition = {
    name: searchName.value,
    category_name: searchCategory.value,
    type: typeFilter.value,
    status: statusFilter.value
  }
  await adminStore.updateActivityList(result, searchCondition)
  ElMessage.success('删除成功')
}

// 分页获取数据
const getPageData = (currentPage, pageSize) => {
  const searchCondition = {
    name: searchName.value,
    category_name: searchCategory.value,
    type: typeFilter.value,
    status: statusFilter.value
  }
  adminStore.getActList(searchCondition, currentPage, pageSize)
}
</script>

<style scoped>
.avatar-uploader {
  display: block;
}
.upload-preview {
  width: 200px;
  height: 112px;
  object-fit: cover;
  border-radius: 4px;
}
.upload-placeholder {
  width: 200px;
  height: 112px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
}
.el-icon--plus {
  font-size: 28px;
  color: #999;
  margin-bottom: 8px;
}
.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}
.no-image {
  padding: 40px 0;
  color: #999;
  font-size: 16px;
}

.rule-card {
  background-color: #fcfcfc;
  border: 1px dashed #e4e7ed;
}
.tip-text {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}
.upload-preview-wrapper {
  position: relative;
  width: 200px;
  height: 112px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}
.hover-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}
.upload-preview-wrapper:hover .hover-mask {
  opacity: 1;
}
</style>