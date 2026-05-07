<template>
  <div>
    <h2>商品管理</h2>
    <div style="margin-bottom: 10px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
      <el-button type="primary" size="small" @click="openAdd">新增商品</el-button>

      <el-select
        v-model="filterForm.categoryName"
        placeholder="商品种类"
        size="small"
        style="width: 130px"
        clearable
      >
        <el-option
          v-for="item in categoryList"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>

      <el-input
        v-model="filterForm.name"
        placeholder="商品名称"
        size="small"
        style="width: 160px"
        clearable
      />
      <el-input
        v-model.number="filterForm.stock"
        placeholder="库存小于"
        size="small"
        style="width: 130px"
        clearable
      />

      <el-button size="small" type="primary" @click="handleFilter">筛选</el-button>
      <el-button size="small" @click="clearFilter">清空</el-button>
    </div>

    <el-table :data="goodsList" border style="width: 100%; margin-top: 10px;">
      <el-table-column prop="product_id" label="商品ID" />
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="categoryName" label="商品种类" />
      <el-table-column prop="rate" label="商品评分" width="140"/>
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="stock" label="总库存" />
      <el-table-column label="商品状态">
        <template #default="scope">
          <el-tag :type="scope.row.auditStatus === '通过' ? 'success' : 'danger'">
            {{ scope.row.auditStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button text @click="openDetail(scope.row)">详情</el-button>
          <el-button text @click="openEdit(scope.row)">编辑</el-button>
          <el-button text type="success" @click="openStock(scope.row)">补货</el-button>
          <el-button 
            text 
            :type="scope.row.auditStatus === '通过' ? 'warning' : 'primary'" 
            v-if="scope.row.auditStatus !== '待审核'"
            @click="toggleStatus(scope.row)">
            {{ scope.row.auditStatus === '通过' ? '下架' : '通过' }}
            
          </el-button>
          <!-- <el-button text danger @click="deleteGoods(scope.row.product_id)">删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showDetail" title="商品详情" width="550px">
      <div style="text-align: center;">
        <img v-if="currentGoods.img" :src="currentGoods.img" style="width:130px;height:130px;object-fit:cover;border-radius:8px" />
        <div v-else class="img-block" style="background:#eee"></div>
        <div style="margin-top: 10px;">商品名称：{{ currentGoods.name }}</div>
        <div>价格：{{ currentGoods.price }} 元</div>
        <div>总库存：{{ currentGoods.stock }}</div>
        <div style="margin-top: 10px; text-align: left;">
          <div style="font-weight: bold;">商品详情：</div>
          <div style="margin-top: 5px;">{{ currentGoods.desc }}</div>
        </div>
        <div style="margin-top: 15px; text-align: left;">
          <div style="font-weight: bold;">商品规格：</div>
          <div v-for="(item, i) in currentGoods.specs" :key="i" style="margin-top: 5px;">
            • {{ item.name }} ｜ 价格：{{ item.price }} 元 ｜ 库存：{{ item.stock }}
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 新增 / 编辑弹窗 → 新增下拉分类，编辑隐藏分类 -->
    <el-dialog v-model="showEdit" title="商品编辑" width="600px">
      <div style="margin-bottom:8px; font-weight:500">商品名称</div>
      <el-input v-model="form.name" placeholder="请输入商品名称" class="mb-10" />

      <!-- 新增时显示下拉分类，编辑时隐藏 -->
      <div v-if="!form.product_id" style="margin-bottom:8px; font-weight:500">商品种类</div>
      <el-cascader
        v-if="!form.product_id"
        v-model="form.categoryName"
        :options="categoryAllList"
        :props="{ 
          label: 'name', 
          value: 'name', 
          children: 'children',
          emitPath: false
        }"
        placeholder="请选择多级商品种类"
        size="small"
        class="mb-10"
        style="width:100%"
      />

      <div style="margin-bottom:8px; font-weight:500">商品图片（可选）</div>
      <el-form-item label="" prop="imgUrl">
        <el-upload
          class="avatar-uploader"
          action="/api/user/media/upload"
          :headers="uploadHeaders"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
        >
          <div v-if="form.img" class="upload-preview-wrapper">
            <img :src="getFullUrl(form.img)" class="upload-preview" />
            <div class="hover-mask"><el-icon color="#fff" :size="24"><Camera /></el-icon></div>
          </div>
          <div v-else class="upload-placeholder">
            <el-icon><Plus /></el-icon>
            <div>点击上传商品图片</div>
          </div>
        </el-upload>
        <div class="upload-tip">建议尺寸比例 1:1，支持JPG/PNG，不超过5MB</div>
      </el-form-item>

      <div style="margin-bottom:8px; font-weight:500">商品价格</div>
      <el-input v-model="form.price" placeholder="请输入基础价格" class="mb-10" />

      <div style="margin-bottom:8px; font-weight:500">总库存（自动计算）</div>
      <el-input :value="autoStock" disabled placeholder="根据SKU自动计算" class="mb-10" />

      <div style="margin-bottom:8px; font-weight:500">商品详情</div>
      <el-input v-model="form.desc" type="textarea" rows="3" placeholder="请输入商品详情" class="mb-10" />

      <div style="font-weight: bold; margin: 15px 0 10px;">商品规格（可增删）</div>
      <div v-for="(item, i) in form.specs" :key="i" style="display: flex; gap: 10px; margin-bottom: 8px;align-items:center">
        <span style="width:60px">规格名</span>
        <el-input v-model="item.name" placeholder="规格名" style="width: 140px" />
        <span style="width:60px">价格</span>
        <el-input v-model="item.price" placeholder="规格价" style="width: 120px" />
        <span style="width:60px">库存</span>
        <el-input v-model="item.stock" placeholder="库存" style="width: 100px" @input="calcAutoStock" />
        <el-button text danger @click="form.specs.splice(i, 1); calcAutoStock()">删除</el-button>
      </div>

      <el-button size="small" @click="form.specs.push({ name: '', price: '', stock: '' }); calcAutoStock()">+ 添加规格</el-button>

      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" @click="saveGoods">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showStock" title="商品补货" width="500px">
      <div style="margin-bottom:15px;">
        <div>商品：{{ stockGoods.name }}</div>
        <div>当前总库存：{{ stockGoods.stock }}</div>
      </div>
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
        <el-input v-model.number="stockAllNum" placeholder="输入补货数量" style="width:160px" />
        <el-button type="success" size="small" @click="stockAll">全部规格一起补货</el-button>
      </div>
      <div style="font-weight:500; margin-bottom:8px;">按规格补货：</div>
      <div v-for="(item,i) in stockSpecs" :key="i" style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <span style="width:140px;">{{ item.name }}</span>
        <span style="width:80px;">库存：{{ item.stock }}</span>
        <el-input v-model.number="item.addNum" placeholder="补货数" style="width:100px" />
        <el-button type="primary" size="small" @click="stockOne(i)">确认</el-button>
      </div>
    </el-dialog>

        <!-- 分页 -->
    <!-- <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top:15px; text-align:right;"
      @change="getPageData"  
    /> -->
  </div>
  
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useMerchantStore } from '@/stores/modules/merchantStore'
import { useCategoryStore } from '@/stores/modules/common/categoryStore'
import { useLoginStore } from '@/stores/modules/common/loginStore' // 新增引入
import { Plus, Camera } from '@element-plus/icons-vue' // 新增图标引入
import getFullUrl from '@/utils/getFullUrl' // 新增路径工具引入

// 原有逻辑不变，新增上传相关逻辑
const merchantStore = useMerchantStore()
const categoryStore = useCategoryStore()
const loginStore = useLoginStore() // 新增登录store

// 新增上传headers计算属性
const uploadHeaders = computed(() => {
  const cleanToken = (loginStore.token || '').replace(/(^"|"$)/g, '')
  return { Authorization: `Bearer ${cleanToken}` }
})

const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

onMounted(async () => {
  await categoryStore.getCategoryList()
  categoryAllList.value = categoryStore.categoryTree
  console.log("categoryAllList.value:", categoryAllList.value)
  await merchantStore.getProductList()
  categoryList.value = merchantStore.categoryList
  //console.log("categoryList.value:", categoryList.value)
  goodsList.value = merchantStore.productList
  console.log("页面渲染的goodsList.value:", goodsList.value)
  pagination.value = merchantStore.pagination
})

// 模拟从store获取的分类列表（你之后可直接对接pinia）
const categoryList = ref([])    // 商家已有的商品分类列表
const categoryAllList = ref([]) // 所有分类列表

const goodsList = ref([
  {
    product_id: 10001,
    name: 'iPhone 15 Pro',
    categoryName: '数码电子',
    price: 8999,
    stock: 35,
    desc: '苹果最新旗舰手机',
    img: '',
    rate: 4.5,
    status: '通过',
    specs: [
      { name: '黑色 128G', price: '8999', stock: 20 },
      { name: '白色 256G', price: '9999', stock: 15 }
    ]
  },
  {
    product_id: 10008,
    name: '男士休闲夹克',
    categoryName: '服饰鞋包',
    price: 399,
    stock: 90,
    desc: '纯棉春秋款',
    img: '',
    rate: 4.0,
    status: '通过',
    specs: [
      { name: '黑色 M', price: '399', stock: 50 },
      { name: '蓝色 L', price: '399', stock: 40 }
    ]
  }
])

const filterForm = ref({ categoryName: undefined, name: undefined, stock: undefined })
const handleFilter = () => {
  const condition = {
    categoryName: filterForm.value.categoryName?.trim() || undefined,
    name: filterForm.value.name?.trim() || undefined,
    stock: filterForm.value.stock ?? undefined
  }
  console.log('筛选条件：', condition)
  ElMessage.success('已输出筛选条件')
}
const clearFilter = () => {
  filterForm.value = { categoryName: undefined, name: undefined, stock: undefined }
  ElMessage.info('已清空')
}

const toggleStatus = async (row) => {
  row.auditStatus = row.auditStatus === '通过' ? '下架' : '通过'
  ElMessage.success(`已${row.auditStatus}`)
  const operation = {
    product_id: row.product_id,
    operation: row.auditStatus === '通过' ? 'pass' : 'delete'
  }
  await merchantStore.updateProductList(operation)
  ElMessage.success('操作成功')
}

const showDetail = ref(false)
const currentGoods = ref({})
const openDetail = (row) => {
  currentGoods.value = row
  showDetail.value = true
}

const showEdit = ref(false)
const form = ref({
  product_id: null,
  name: '',
  categoryName: '',
  img: '',
  price: '',
  stock: 0,
  desc: '',
  status: '通过',
  specs: []
})

// 自动计算总库存
const autoStock = computed(() => {
  return form.value.specs.reduce((sum, item) => {
    return sum + (Number(item.stock) || 0)
  }, 0)
})
const calcAutoStock = () => {
  form.value.stock = autoStock.value
}

// 图片选择（可用）
const handleImgChange = ({ raw }) => {
  form.value.img = URL.createObjectURL(raw)
}

const openEdit = (row) => {
  form.value = JSON.parse(JSON.stringify(row))
  calcAutoStock()
  showEdit.value = true
}
const openAdd = () => {
  //console.log("打开新增商品弹窗")
  form.value = {
    product_id: null,
    name: '',
    categoryName: '',
    img: '',
    price: '',
    stock: 0,
    desc: '',
    rate: 0,
    status: '待审核',
    specs: [{ name: '', price: '', stock: '' }]
  }
  calcAutoStock()
  showEdit.value = true
}
const saveGoods = async () => {
  calcAutoStock()
  // const hasId = goodsList.value.some(i => i.product_id === form.value.product_id)
  // if (hasId) {
  //   goodsList.value = goodsList.value.map(i => i.product_id === form.value.product_id ? form.value : i)
  // } else {
  //   form.value.product_id = Date.now()
  //   goodsList.value.push(form.value)
  // }
  showEdit.value = false
  console.log("保存商品后:", form.value)
  const operation = {
    ...form.value,
    operation: form.value.product_id ? 'edit' : 'add'
  }

  await merchantStore.updateProductList(operation)
  await merchantStore.getProductList()
  ElMessage.success('保存成功')
}

const deleteGoods = (id) => {
  goodsList.value = goodsList.value.filter(i => i.product_id !== id)
  ElMessage.success('删除成功')
}

const showStock = ref(false)
const stockGoods = ref({})
const stockSpecs = ref([])
const stockAllNum = ref(0)
const openStock = (row) => {
  stockGoods.value = row
  stockSpecs.value = row.specs.map(s => ({ ...s, addNum: 0 }))
  stockAllNum.value = 0
  showStock.value = true
}
// 单个规格补货
const stockOne = async (i) => {
  const item = stockSpecs.value[i]
  if (!item.addNum || item.addNum <= 0) return ElMessage.warning('请输入有效数量')

  // 1. 先更新弹窗内的本地数据（实现前端即时反馈）
  const goods = goodsList.value.find(g => g.product_id === stockGoods.value.product_id)
  const spec = goods.specs[i]
  spec.stock = Number(spec.stock) + Number(item.addNum)
  goods.stock = goods.specs.reduce((sum, s) => sum + Number(s.stock), 0)

  // 同步更新弹窗内的显示数据
  stockSpecs.value[i].stock = spec.stock
  stockGoods.value.stock = goods.stock
  item.addNum = 0

  // 2. 调用后端接口
  await merchantStore.updateProductList({
    product_id: goods.product_id,
    operation: 'stock',
    ...goods
  })

  ElMessage.success('补货成功')
}

// 全部规格一起补货
const stockAll = async () => {
  const num = stockAllNum.value
  if (!num || num <= 0) return ElMessage.warning('请输入有效数量')

  // 1. 先更新弹窗内的本地数据（实现前端即时反馈）
  const goods = goodsList.value.find(g => g.product_id === stockGoods.value.product_id)
  goods.specs.forEach((s, idx) => {
    s.stock = Number(s.stock) + num
    // 同步更新弹窗内的规格库存
    stockSpecs.value[idx].stock = s.stock
  })
  goods.stock = goods.specs.reduce((sum, s) => sum + Number(s.stock), 0)
  // 同步更新弹窗内的总库存
  stockGoods.value.stock = goods.stock

  // 2. 调用后端接口
  await merchantStore.updateProductList({
    product_id: goods.product_id,
    operation: 'stock',
    ...goods
  })

  stockAllNum.value = 0
  ElMessage.success('全部补货完成')
}



// 新增上传前校验方法
const beforeUpload = (file) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isImage) {
    ElMessage.error('只能上传JPG/PNG格式的图片！')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 5
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过5MB！')
    return false
  }
  return true
}

// 新增上传成功处理
const handleUploadSuccess = (res, file) => {
  if (res.success || res.code === 200) {
    // 保存后端返回的路径 (例如 /upload/temp/xxx.png)
    form.value.img = res.data.url || res.data 
    ElMessage.success('图片上传成功！')
  } else {
    ElMessage.error(res.message || '图片上传失败')
  }
}

// 新增上传失败处理
const handleUploadError = () => {
  ElMessage.error('网络异常，图片上传失败！')
}


// 新增路径拼接方法
// const getFullUrl = (url) => {
//   if (!url) return ''
//   if (url.startsWith('http')) return url
//   return import.meta.env.VITE_BASE_API + url // 根据实际环境变量调整
// }
</script>

<style scoped>
/* 基础样式 */
.img-block {
  width: 130px;
  height: 130px;
  border-radius: 8px;
  margin: 0 auto;
}
.mb-10 {
  margin-bottom: 10px;
}

/* 上传组件容器 */
.avatar-uploader {
  display: block;
  cursor: pointer;
}

/* 预览图 */
.upload-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

/* 上传占位框 */
.upload-placeholder {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  cursor: pointer;
}

/* 加号图标 */
.el-icon--plus {
  font-size: 28px;
  color: #999;
  margin-bottom: 8px;
}

/* 上传提示 */
.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

/* 预览图外层 */
.upload-preview-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

/* hover 遮罩 */
.hover-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
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