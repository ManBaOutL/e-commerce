<template>
  <div>
    <h3>商品管理</h3>

    <!-- 筛选框 UI 完全保留 → 但功能只输出，不执行筛选 -->
    <div style="margin-bottom: 10px; display: flex; gap: 10px; align-items: center;">
      <el-input v-model="filterForm.name" placeholder="请输入商品名称" style="width: 200px;" />
      <el-select v-model="filterForm.auditStatus" placeholder="请选择审核状态">
        <el-option label="待审核" value="待审核" />
        <el-option label="通过" value="通过" />
        <el-option label="已驳回" value="已驳回" />
      </el-select>
      <el-button type="primary" @click="handleFilter">筛选</el-button>
      <el-button @click="resetFilter">清空筛选</el-button>
      <el-button type="success" @click="batchAuditPass" v-if="hasPendingGoods">批量通过审核</el-button>
    </div>

    <!-- 商品表格 → 永远显示全部数据 -->
    <el-table :data="goodsList" border>
      <el-table-column prop="product_id" label="商品ID" />
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="stock" label="库存" />

      <!-- 评分 -->
      <el-table-column label="商品评分">
        <template #default="scope">
          <el-rate :model-value="scope.row.rate" disabled />
        </template>
      </el-table-column>

      <el-table-column prop="seller_name" label="商家名称" />
      <el-table-column prop="category_name" label="分类名称" />

      <el-table-column prop="auditStatus" label="审核状态">
        <template #default="scope">
          <el-tag :type="
            scope.row.auditStatus === '已通过' ? 'success' :
            scope.row.auditStatus === '待审核' ? 'warning' : 
            scope.row.auditStatus === '已驳回' ? 'danger' : 'info'
          ">
            {{ scope.row.auditStatus }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template #default="scope">
          <el-button text type="primary" @click="showGoodsDetail(scope.row)">详情</el-button>
          <el-button text type="danger" @click="deleteGoods(scope.row)">删除</el-button>

          <template v-if="scope.row.auditStatus === '待审核'">
            <el-button text type="success" @click="auditGoods(scope.row, '已通过')">通过</el-button>
            <el-button text type="danger" @click="auditGoods(scope.row, '已驳回')">驳回</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
    
     <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @change="getPageData"  
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox, ElRate } from 'element-plus'
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/modules/adminStore'
const adminStore = useAdminStore()

// 分页信息
const pagination = ref({})

onMounted(async () => {
  await adminStore.initProductList()
  goodsList.value = adminStore.productList
  pagination.value = adminStore.pagination
})



// 商品数据
const goodsList = ref([

])

// 筛选框绑定（保留，但不生效）
const filterForm = ref({
  name: '',
  auditStatus: ''
})

// 只输出筛选内容，不做真实筛选
const handleFilter = async () => {
  console.log("【筛选功能输出】", filterForm.value)
  await adminStore.getProductListbyPage(filterForm.value, 1, 10)
  goodsList.value = adminStore.productList
}

// 清空只重置表单，不影响数据
const resetFilter = () => {
  filterForm.value = { name: '', auditStatus: '' }
  handleFilter()
  ElMessage.info("已清空筛选条件")
}

const batchAuditPass = async () => {
  // 筛选出待审核商品ID
  const pendingIds = goodsList.value
    .filter(item => item.auditStatus === '待审核')
    .map(item => item.product_id);
  
  // 构造输出结构（匹配productOperation接口）
  const operationData = {
    product_id: [],// 待审核商品ID列表,空代表所有待审核商品
    operation: 'pass'
  };
  
  // 输出操作信息
  const res = await adminStore.updateProductList(operationData)
  if(res){
    ElMessage.success(`批量通过成功`);
    // 刷新商品列表
    await getPageData(1,10)
  }else{
    ElMessage.error(`批量通过失败`);
  }
  
};

const hasPendingGoods = ref(true)

// 商品详情
const showGoodsDetail = (row) => {
  const html = `
    <div style="line-height:2.2; padding:5px;">
      <p><b>商品ID：</b>${row.product_id}</p>
      <p><b>商品名称：</b>${row.name}</p>
      <p><b>价格：</b>¥${row.price}</p>
      <p><b>库存：</b>${row.stock} 件</p>
      <p><b>评分：</b>${row.rate} 分</p>
      <p><b>商家：</b>${row.seller_name}</p>
      <p><b>分类：</b>${row.category_name}</p>
      <p><b>状态：</b>${row.auditStatus}</p>
      <p><b>描述：</b><br>${row.description || '无描述'}</p>
    </div>
  `
  ElMessageBox.alert(html, '商品详情', { dangerouslyUseHTMLString: true }).catch(() => {})
}

// 删除商品（改为输出，不真实删除）
const deleteGoods = async (row) => {
  ElMessageBox.confirm('确定删除该商品？')
    .then(async () => {
      // 构造输出结构（匹配productOperation接口）
      const operationData = {
        product_id: [row.product_id],
        operation: 'delete'
      };
      
      // 输出操作信息
      const res = await adminStore.updateProductList(operationData)
      if(res){
        ElMessage.success(`删除成功，商品ID：${row.product_id}`);
        // 刷新商品列表
        await getPageData(1,10)
      }else{
        ElMessage.error(`删除失败`);
      }
      
      // 注释原有删除逻辑，仅保留输出
      // goodsList.value = goodsList.value.filter(x => x.product_id !== row.product_id);
    })
    .catch(() => {});
};

// 审核
const auditGoods = async (row, status) => {
  // 构造输出结构（匹配productOperation接口）
  const operationData = {
    product_id: [row.product_id],
    operation: status === '已通过' ? 'pass' : 'reject'
  };
  
  // 输出操作信息
  //console.log(`【${status}审核】操作数据：`, operationData);
  //ElMessage.info(`已触发${status}操作，商品ID：${row.product_id}`);

  const res = await adminStore.updateProductList(operationData)
  if(res){
    ElMessage.success(`审核成功，商品ID：${row.product_id}`);
    // 刷新商品列表
    await getPageData(1,10)
  }else{
    ElMessage.error(`审核失败`);
  }
  
  // 注释原有真实逻辑，仅保留输出
  // if (status === '已驳回') {
  //   await adminStore.rejectProduct(row.product_id);
  // } else {
  //   row.auditStatus = status;
  //   ElMessage.success('审核通过');
  // }
};

const getPageData = async (currentPage, pageSize) => {
  await adminStore.getProductListbyPage(filterForm.value, currentPage, pageSize)
  goodsList.value = adminStore.productList
  pagination.value = adminStore.pagination
  console.log("列表:", goodsList.value)
}
</script>