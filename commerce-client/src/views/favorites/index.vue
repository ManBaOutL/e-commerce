<template>
  <div>
    <TheHeader />
    <div class="favorite-container">
      <div class="fav-header">
        <div class="left">
          <h3 class="title">我的收藏</h3>
          <span class="count">共 {{ userStore.favoriteList.length }} 个商品</span>
        </div>
        <div class="right-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索收藏商品"
            prefix-icon="Search"
            class="search-bar"
            clearable
          />
          <el-button 
            :type="isBatchMode ? 'primary' : 'default'" 
            plain
            @click="isBatchMode = !isBatchMode"
            class="batch-btn"
          >
            {{ isBatchMode ? '完成管理' : '批量管理' }}
          </el-button>
        </div>
      </div>

      <el-collapse-transition>
        <div v-if="isBatchMode" class="batch-bar">
          <el-checkbox v-model="allSelected" :indeterminate="isIndeterminate" @change="handleSelectAll">
            已选 <em class="orange-text">{{ selectedIds.length }}</em> 件
          </el-checkbox>
          <div class="actions">
            <el-button type="danger" plain size="small" icon="Delete" @click="handleBatchDelete">取消收藏</el-button>
          </div>
        </div>
      </el-collapse-transition>

      <div class="fav-grid">
        <div 
          v-for="item in filteredProducts" 
          :key="item.id" 
          class="fav-item"
          :class="{ 
            'is-selected': selectedIds.includes(item.id), 
            'is-invalid': item.status === 0 || item.stock === 0
          }"
        >
          <div v-if="isBatchMode" class="checkbox-wrapper">
            <el-checkbox :label="item.id" v-model="selectedIds">{{''}}</el-checkbox>
          </div>

          <div class="product-card">
            <div class="img-wrapper">
              <el-image :src="getFullUrl(item.image)" fit="cover" class="p-img">
                <template #error>
                  <div class="image-slot">
                    <el-icon :size="40" color="#ddd"><PictureFilled /></el-icon>
                    <p>暂无图片</p>
                  </div>
                </template>
              </el-image>
              
              <div v-if="item.status === 0" class="overlay-mask invalid">
                <el-icon class="mask-icon"><Warning /></el-icon>
                <span>商品已下架</span>
              </div>
              <div v-else-if="item.stock === 0" class="overlay-mask no-stock">
                <el-icon class="mask-icon"><CircleClose /></el-icon>
                <span>暂时无货</span>
              </div>
            </div>

            <div class="info-wrapper">
              <p class="name" @click="goDetail(item.id)">{{ item.name }}</p>
              <div class="price-row">
                <span class="price">¥{{ Number(item.price).toFixed(2) }}</span>
                <span v-if="item.oldPrice" class="old-price">¥{{ item.oldPrice.toFixed(2) }}</span>
              </div>
              <div class="tag-row">
                <el-tag v-if="item.tag" type="danger" size="small" effect="light" class="p-tag">{{ item.tag }}</el-tag>
              </div>
            </div>

            <div class="footer-actions">
              <el-tooltip content="加入购物车" placement="top" v-if="item.status !== 0 && item.stock > 0">
                <el-button 
                  type="warning" 
                  icon="ShoppingCart" 
                  circle 
                  class="cart-btn"
                  @click="addToCart(item)"
                />
              </el-tooltip>
              <el-tooltip content="找相似" placement="top" v-else>
                <el-button type="info" icon="Search" circle class="similar-btn" />
              </el-tooltip>
              
              <el-tooltip content="取消收藏" placement="top">
                <el-button type="info" icon="Delete" circle class="delete-btn" @click="handleRemove(item.id)" />
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-if="filteredProducts.length === 0" description="收藏夹是空的，快去首页转转吧" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/modules/user/userStore'
import { useCartStore } from '@/stores/modules/user/cartStore' 
import getFullUrl from '@/utils/getFullUrl' // 引入图片拼接工具

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const searchQuery = ref('')
const isBatchMode = ref(false)
const selectedIds = ref([])

// 🌟 1. 页面挂载时拉取真实收藏数据
onMounted(() => {
  userStore.fetchFavoriteList()
})

// 🌟 2. 动态过滤
const filteredProducts = computed(() => {
  if(!userStore.favoriteList) return [];
  return userStore.favoriteList.filter(p => p.name.includes(searchQuery.value))
})

// 批量全选逻辑
const allSelected = ref(false)
const isIndeterminate = computed(() => selectedIds.value.length > 0 && selectedIds.value.length < userStore.favoriteList.length)
const handleSelectAll = (val) => { selectedIds.value = val ? userStore.favoriteList.map(i => i.id) : [] }

// 🌟 3. 单条删除
const handleRemove = (id) => { 
  ElMessageBox.confirm('确定取消收藏该商品吗？', '提示', { type: 'warning' }).then(async () => {
    const success = await userStore.removeFavorite([id]);
    if (success) {
      ElMessage.success('已取消收藏');
      selectedIds.value = selectedIds.value.filter(selId => selId !== id);
    }
  }).catch(() => {})
}

// 🌟 4. 批量删除
const handleBatchDelete = () => { 
  if (selectedIds.value.length === 0) return ElMessage.warning('请先选择要取消收藏的商品')
  ElMessageBox.confirm(`确定要取消收藏这 ${selectedIds.value.length} 件商品吗？`, '批量操作', { type: 'warning' }).then(async () => {
    const success = await userStore.removeFavorite(selectedIds.value);
    if (success) {
      ElMessage.success('批量取消成功');
      selectedIds.value = [];
      allSelected.value = false;
      isBatchMode.value = false;
    }
  }).catch(() => {})
}

// 🌟 5. 一键加入购物车 (利用收藏的 sku_id)
const addToCart = async (item) => { 
  // 调用你已有的加入购物车逻辑
  const payload = { product_id: item.product_id, sku_id: item.id, quantity: 1 };
  const res = await cartStore.addCart(payload); 
  if (res.success) {
    ElMessage.success('已加购物车');
  } else {
    ElMessage.error(res.message || '加入失败');
  }
}

// 🌟 6. 跳转详情页
const goDetail = (item) => {
  router.push(`/goods/${item.product_id}`)
}
</script>

<style scoped>
.favorite-container {
  width: 1200px;
  margin: 24px auto;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
  min-height: 80vh;
}

.fav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.fav-header .title { margin: 0; font-size: 20px; font-weight: 600; color: #333; }
.fav-header .count { font-size: 13px; color: #999; margin-left: 12px; font-weight: normal; }

.right-actions { display: flex; align-items: center; gap: 12px; }
.search-bar { width: 220px; }
.batch-btn { border-radius: 20px; }

.batch-bar {
  background: #fffcfb;
  border: 1px solid #ffefe9;
  padding: 12px 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.orange-text { color: #ff5000; font-weight: bold; font-style: normal; }

/* 收藏列表网格 */
.fav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.fav-item {
  position: relative;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
}

/* Hover 时的视觉提升 */
.fav-item:hover {
  border-color: #ff5000;
  transform: translateY(-8px);
  box-shadow: 0 10px 30px rgba(255, 80, 0, 0.08);
}

.fav-item.is-selected {
  border-color: #ff5000;
  box-shadow: 0 0 0 2px rgba(255, 80, 0, 0.1);
}

.checkbox-wrapper {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}

/* 图片区域深度美化 */
.img-wrapper {
  height: 220px;
  background: #fafafa;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.p-img { width: 100%; height: 100%; transition: transform 0.5s; }
.fav-item:hover .p-img { transform: scale(1.05); }

.image-slot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #dcdfe6;
  font-size: 12px;
}
.image-slot p { margin-top: 8px; }

/* 优化后的失效遮罩层 */
.overlay-mask {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(3px); /* 增加毛玻璃效果 */
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  gap: 10px;
  z-index: 5;
}

.mask-icon { font-size: 32px; }
.invalid .mask-icon { color: #f56c6c; }
.no-stock .mask-icon { color: #e6a23c; }

/* 信息区域 */
.info-wrapper {
  padding: 16px;
}

.name {
  font-size: 15px;
  color: #333;
  height: 44px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  cursor: pointer;
  margin-bottom: 12px;
}
.name:hover { color: #ff5000; }

.price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.price { color: #ff5000; font-size: 20px; font-weight: bold; }
.old-price { color: #bbb; text-decoration: line-through; font-size: 13px; }

.tag-row { height: 26px; }
.p-tag { border-radius: 4px; }

/* 底部按钮区域美化 */
.footer-actions {
  padding: 12px 16px;
  border-top: 1px solid #f5f5f5;
  background: #fff;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 将默认按钮变为更有质感的风格 */
.footer-actions .el-button {
  background: #f5f5f5;
  border: none;
  color: #666;
}

.footer-actions .cart-btn:hover { background: #ff9000; color: #fff; }
.footer-actions .delete-btn:hover { background: #f56c6c; color: #fff; }
.footer-actions .similar-btn:hover { background: #909399; color: #fff; }

/* 失效商品的置灰处理 */
.is-invalid .info-wrapper, 
.is-invalid .tag-row {
  opacity: 0.6;
}
</style>