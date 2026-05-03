<template>
  <div class="shop-page">
    <TheHeader />

    <main class="shop-container" v-loading="loading">
      <!-- 1. 店铺招牌 Banner -->
      <div class="shop-banner">
        <div class="banner-content">
          <el-avatar :size="80" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" class="shop-logo" />
          <div class="shop-info">
            <h1 class="shop-name">{{ shopInfo.name || '商家店铺' }}</h1>
            <p class="shop-desc">{{ shopInfo.description || '该商家很懒，还没有填写店铺简介~' }}</p>
            <div class="shop-tags">
              <el-tag size="small" type="danger" effect="dark">企业认证</el-tag>
              <el-tag size="small" type="info" style="margin-left: 8px;">开店时间：{{ shopInfo.create_time?.split(' ')[0] || '--' }}</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 店铺商品列表 -->
      <div class="shop-products">
        <div class="section-title">
          <h3>全部商品</h3>
          <span class="total-count">共 {{ productList.length }} 件商品</span>
        </div>

        <el-row :gutter="20" v-if="productList.length > 0">
          <el-col :xs="12" :sm="8" :md="6" :lg="6" v-for="item in productList" :key="item.id" style="margin-bottom: 20px;">
            <!-- 🌟 直接引入全局组件，完美绑定属性 -->
            <ProductCard 
              :id="item.id"
              :name="item.name"
              :price="item.price"
              :image="item.image"
              :sales="item.sales"
              :actual_price="item.actual_price"
              :original_price="item.original_price"
              :is_flash_sale="item.is_flash_sale"
              :activities="item.activities"
            />
          </el-col>
        </el-row>
        
        <el-empty v-else description="该店铺暂无上架商品" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import getFullUrl from '@/utils/getFullUrl'
import { reqGetShopInfo, reqGetShopProducts } from '@/api/user'
import type { Product } from '@/api/product/types'

const route = useRoute()
const router = useRouter()
const loading = ref(true)

const shopInfo = ref<any>({})
const productList = ref<Product[]>([])

onMounted(async () => {
  const shopId = route.params.id
  if (!shopId) return router.replace('/')

  await loadShopData(Number(shopId))
})

const loadShopData = async (shopId: number) => {
  loading.value = true
  try {
    // 🌟 核心：并发请求店铺基础信息和商品列表
    const [shopRes, productRes] = await Promise.all([
      reqGetShopInfo(shopId),
      reqGetShopProducts(shopId)
    ])
    
    if (shopRes.success) {
      shopInfo.value = shopRes.data
    }
    
    if (productRes.success) {
      // 在商品卡片列表里要渲染 actual_price 和 original_price 哦
      productList.value = productRes.data
    }
  } catch (error) {
    ElMessage.error('获取店铺信息失败')
  } finally {
    loading.value = false
  }
}

const goToDetail = (id: number) => {
  router.push(`/goods/${id}`)
}
</script>

<style scoped>
.shop-page { background: #f5f5f5; min-height: 100vh; padding-bottom: 40px; }
.shop-container { max-width: 1200px; margin: 0 auto; padding-top: 20px; }

/* 店铺 Banner */
.shop-banner {
  background: linear-gradient(135deg, #2b3245 0%, #434d68 100%);
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 24px;
  color: #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.banner-content { display: flex; align-items: center; gap: 24px; }
.shop-logo { border: 4px solid rgba(255,255,255,0.2); }
.shop-info { flex: 1; }
.shop-name { font-size: 28px; font-weight: bold; margin: 0 0 10px 0; letter-spacing: 1px; }
.shop-desc { font-size: 14px; color: #dcdfe6; margin: 0 0 15px 0; line-height: 1.5; max-width: 600px; }
.shop-tags { display: flex; align-items: center; }

/* 商品列表 */
.shop-products { background: #fff; padding: 24px; border-radius: 12px; }
.section-title { display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px; }
.section-title h3 { margin: 0; font-size: 18px; color: #333; }
.total-count { font-size: 13px; color: #999; }

/* 商品卡片 */
.product-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
}
</style>