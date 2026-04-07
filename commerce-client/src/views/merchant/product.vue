<template>
  <div>
    <h2>商品管理</h2>
    <div style="margin-bottom: 10px; display: flex; gap: 10px; flex-wrap: wrap;">
      <el-button type="primary" size="small" @click="openAdd">新增商品</el-button>
    </div>

    <el-table :data="goodsList" border style="width: 100%; margin-top: 10px;">
      <el-table-column prop="product_id" label="商品ID" />
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="stock" label="总库存" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button text @click="openDetail(scope.row)">详情</el-button>
          <el-button text @click="openEdit(scope.row)">编辑</el-button>
          <el-button text type="success" @click="openStock(scope.row)">补货</el-button>
          <el-button text danger @click="deleteGoods(scope.row.product_id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 详情弹窗（只读） -->
    <el-dialog v-model="showDetail" title="商品详情" width="550px">
      <div style="text-align: center;">
        <div class="img-block" :style="{ background: currentGoods.img }"></div>
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

    <!-- 编辑 / 新增弹窗 -->
    <el-dialog v-model="showEdit" title="商品编辑" width="600px">
      <el-input v-model="form.name" placeholder="商品名称" class="mb-10" />
      <el-input v-model="form.price" placeholder="基础价格" class="mb-10" />
      <el-input v-model="form.stock" placeholder="总库存" class="mb-10" />
      <el-input v-model="form.desc" type="textarea" rows="3" placeholder="商品详情" class="mb-10" />

      <div style="font-weight: bold; margin: 15px 0 10px;">商品规格（可增删）</div>
      <div v-for="(item, i) in form.specs" :key="i" style="display: flex; gap: 10px; margin-bottom: 8px;">
        <el-input v-model="item.name" placeholder="规格名" style="width: 140px" />
        <el-input v-model="item.price" placeholder="规格价" style="width: 120px" />
        <el-input v-model="item.stock" placeholder="库存" style="width: 100px" />
        <el-button text danger @click="form.specs.splice(i, 1)">删除</el-button>
      </div>
      <el-button size="small" @click="form.specs.push({ name: '', price: '', stock: '' })">+ 添加规格</el-button>

      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" @click="saveGoods">保存</el-button>
      </template>
    </el-dialog>

    <!-- ================== 补货弹窗（核心功能） ================== -->
    <el-dialog v-model="showStock" title="商品补货" width="500px">
      <div style="margin-bottom:15px;">
        <div>商品：{{ stockGoods.name }}</div>
        <div>当前总库存：{{ stockGoods.stock }}</div>
      </div>

      <!-- 全部规格一起补货 -->
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
        <el-input v-model.number="stockAllNum" placeholder="输入补货数量" style="width:160px" />
        <el-button type="success" size="small" @click="stockAll">全部规格一起补货</el-button>
      </div>

      <!-- 按单个规格补货 -->
      <div style="font-weight:500; margin-bottom:8px;">按规格补货：</div>
      <div v-for="(item,i) in stockSpecs" :key="i" style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <span style="width:140px;">{{ item.name }}</span>
        <span style="width:80px;">库存：{{ item.stock }}</span>
        <el-input v-model.number="item.addNum" placeholder="补货数" style="width:100px" />
        <el-button type="primary" size="small" @click="stockOne(i)">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 商品列表（自带多规格）
const goodsList = ref([
  {
    product_id: 10001,
    name: 'iPhone 15 Pro',
    price: 8999,
    stock: 50,
    desc: '苹果最新旗舰手机',
    img: '#409EFF',
    specs: [
      { name: '黑色 128G', price: '8999', stock: 20 },
      { name: '白色 256G', price: '9999', stock: 15 }
    ]
  },
  {
    product_id: 10008,
    name: '男士休闲夹克',
    price: 399,
    stock: 200,
    desc: '纯棉春秋款',
    img: '#67C23A',
    specs: [
      { name: '黑色 M', price: '399', stock: 50 },
      { name: '蓝色 L', price: '399', stock: 40 }
    ]
  }
])

// 详情
const showDetail = ref(false)
const currentGoods = ref({})
const openDetail = (row) => {
  currentGoods.value = row
  showDetail.value = true
}

// 编辑/新增
const showEdit = ref(false)
const form = ref({
  product_id: null, name: '', price: '', stock: '', desc: '', img: '#409EFF', specs: []
})
const openEdit = (row) => {
  form.value = JSON.parse(JSON.stringify(row))
  showEdit.value = true
}
const openAdd = () => {
  form.value = {
    product_id: Date.now(),
    name: '', price: '', stock: '', desc: '', img: '#F56C6C',
    specs: [{ name: '', price: '', stock: '' }]
  }
  showEdit.value = true
}
const saveGoods = () => {
  const hasId = goodsList.value.some(i => i.product_id === form.value.product_id)
  if (hasId) {
    goodsList.value = goodsList.value.map(i => i.product_id === form.value.product_id ? form.value : i)
  } else {
    goodsList.value.push(form.value)
  }
  showEdit.value = false
  ElMessage.success('保存成功')
}

// 删除商品
const deleteGoods = (id) => {
  goodsList.value = goodsList.value.filter(i => i.product_id !== id)
  ElMessage.success('删除成功')
}

// ================== 补货功能（你要的核心） ==================
const showStock = ref(false)
const stockGoods = ref({})
const stockSpecs = ref([])
const stockAllNum = ref(0)

// 打开补货弹窗
const openStock = (row) => {
  stockGoods.value = row
  // 复制规格并添加补货数字段
  stockSpecs.value = row.specs.map(s => ({
    ...s, addNum: 0
  }))
  stockAllNum.value = 0
  showStock.value = true
}

// 单个规格补货
const stockOne = (i) => {
  const item = stockSpecs.value[i]
  if (!item.addNum || item.addNum <= 0) {
    ElMessage.warning('请输入有效补货数量')
    return
  }
  // 找到原商品并更新库存
  const goods = goodsList.value.find(g => g.product_id === stockGoods.value.product_id)
  const spec = goods.specs[i]
  spec.stock = Number(spec.stock) + Number(item.addNum)
  // 更新总库存
  goods.stock = goods.specs.reduce((sum, s) => sum + Number(s.stock), 0)

  item.addNum = 0
  ElMessage.success('单个规格补货成功')
}

// 全部规格一起补货
const stockAll = () => {
  const num = stockAllNum.value
  if (!num || num <= 0) {
    ElMessage.warning('请输入有效补货数量')
    return
  }
  const goods = goodsList.value.find(g => g.product_id === stockGoods.value.product_id)
  goods.specs.forEach(s => {
    s.stock = Number(s.stock) + num
  })
  goods.stock = goods.specs.reduce((sum, s) => sum + Number(s.stock), 0)
  stockAllNum.value = 0
  ElMessage.success('全部规格补货完成')
}
</script>

<style scoped>
.img-block {
  width: 130px;
  height: 130px;
  border-radius: 8px;
  margin: 0 auto;
}
.mb-10 {
  margin-bottom: 10px;
}
</style>