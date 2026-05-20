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

    <!-- 商品详情弹窗 -->
    <el-dialog v-model="showDetail" title="商品详情" width="600px">
      <div style="text-align: center;">
        <img 
          v-if="currentGoods.img" 
          :src="getFullUrl(getImageUrl(currentGoods.img))" 
          style="width:150px;height:150px;object-fit:cover;border-radius:8px" 
        />
        <div v-else class="img-block"></div>
        <!-- 查看大图按钮 -->
        <div style="margin-top: 8px;">
          <el-button 
            size="small" 
            type="primary" 
            @click="openImageViewer"
            :disabled="!currentGoods.allImg || currentGoods.allImg.length === 0"
          >查看大图</el-button>
        </div>
      </div>

      <div style="margin-top: 15px; line-height: 1.8;">
        <p><b>商品ID：</b>{{ currentGoods.product_id }}</p>
        <p><b>商品名称：</b>{{ currentGoods.name }}</p>
        <p><b>价格：</b>¥{{ currentGoods.price }}</p>
        <p><b>库存：</b>{{ currentGoods.stock }} 件</p>
        <p><b>评分：</b>{{ currentGoods.rate }} 分</p>
        <p><b>商家：</b>{{ currentGoods.seller_name }}</p>
        <p><b>分类：</b>{{ currentGoods.category_name }}</p>
        <p><b>状态：</b>{{ currentGoods.auditStatus }}</p>
        <p><b>描述：</b></p>
        <p style="padding-left: 20px;">{{ currentGoods.description || '无描述' }}</p>
      </div>
    </el-dialog>

    <!-- 大图预览弹窗 -->
    <div v-if="showViewer" class="image-viewer-modal">
      <div class="viewer-mask" @click="closeViewer"></div>
      <div class="viewer-content">
        <button class="viewer-close" @click="closeViewer">×</button>
        <button v-if="viewerImages.length > 1" class="viewer-nav viewer-nav-left" @click="prevImage">‹</button>
        <img :src="getFullUrl(viewerImages[viewerIndex])" class="viewer-img" />
        <button v-if="viewerImages.length > 1" class="viewer-nav viewer-nav-right" @click="nextImage">›</button>
        <div class="viewer-counter">{{ viewerIndex + 1 }} / {{ viewerImages.length }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox, ElRate } from 'element-plus'
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/modules/adminStore'
import getFullUrl from '@/utils/getFullUrl'
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
const showDetail = ref(false)
const currentGoods = ref({})
const showViewer = ref(false)
const viewerIndex = ref(0)

// 获取商品所有图片
const viewerImages = computed(() => {
  const goods = currentGoods.value
  if (!goods) return []
  
  // 优先使用后端返回的 allImg 数组
  if (goods.allImg && Array.isArray(goods.allImg) && goods.allImg.length > 0) {
    return goods.allImg.filter(img => img)
  }
  
  // 兼容旧数据格式
  const images = []
  if (goods.img) {
    images.push(getImageUrl(goods.img))
  }
  return images
})

// 智能获取图片URL
const getImageUrl = (imgPath) => {
  if (!imgPath) return ''
  const ext = imgPath.split('.').pop()
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext.toLowerCase())) {
    return imgPath
  }
  return imgPath + '/1.png'
}

const showGoodsDetail = (row) => {
  currentGoods.value = row
  showDetail.value = true
}

// 打开大图查看器
const openImageViewer = () => {
  viewerIndex.value = 0
  showViewer.value = true
}

// 关闭大图查看器
const closeViewer = () => {
  showViewer.value = false
}

// 上一张
const prevImage = () => {
  if (viewerIndex.value > 0) {
    viewerIndex.value--
  } else {
    viewerIndex.value = viewerImages.value.length - 1
  }
}

// 下一张
const nextImage = () => {
  if (viewerIndex.value < viewerImages.value.length - 1) {
    viewerIndex.value++
  } else {
    viewerIndex.value = 0
  }
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

<style scoped>
.img-block {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  background: #eee;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

/* 大图查看器模态框 */
.image-viewer-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
}

.viewer-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  z-index: 1;
}

.viewer-close {
  position: absolute;
  top: -50px;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.viewer-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 36px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.viewer-nav-left {
  left: -60px;
}

.viewer-nav-right {
  right: -60px;
}

.viewer-img {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.viewer-counter {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 16px;
  background: rgba(0, 0, 0, 0.6);
  padding: 6px 16px;
  border-radius: 20px;
}
</style>