<template>
  <div class="product-card" @click="handleToGoodsDetail(id)">
    <div class="image-placeholder">
      <el-image :src="getFullUrl(image)" fit="cover">
        <template #error><div class="err-txt">暂无图片</div></template>
      </el-image>
      <div v-if="is_flash_sale" class="flash-badge">限时秒杀</div>
    </div>
    
    <div class="info">
      <div class="title">{{ name }}</div>
      
      <div class="tags-container">
        <span v-for="(act, index) in activities" :key="index" class="act-tag">
          {{ act }}
        </span>
      </div>

      <div class="footer">
        <div class="price-area">
          <span class="price">¥{{ actual_price !== undefined ? actual_price : price }}</span>
          <span class="original-price" v-if="actual_price < original_price">
            ¥{{ original_price }}
          </span>
        </div>
        <span class="sales">{{ salesText }}人付款</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import getFullUrl from '@/utils/getFullUrl'
const router = useRouter()

// 🌟 新增了 actual_price, original_price, is_flash_sale, activities 四个属性
const props = defineProps([
  'id', 'name', 'price', 'image', 'sales', 
  'actual_price', 'original_price', 'is_flash_sale', 'activities'
])

const salesText = computed(() => {
  const { sales } = props
  if (sales > 999) return '99+'
  else if (sales > 99) return '999+'
  else return sales
})

const handleToGoodsDetail = (id: any) => {
  router.push(`/goods/${id}`)
}
</script>

<style scoped>
.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
  cursor: pointer;
  margin-bottom: 20px;
  position: relative; /* 🌟 为了绝对定位秒杀角标 */
}

.product-card:hover {
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  transform: translateY(-5px);
  border-color: #ff5000;
}

.image-placeholder {
  height: 180px;
  background: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

/* 🌟 秒杀角标样式 */
.flash-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(90deg, #ff0036, #ff5000);
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-bottom-right-radius: 8px;
  font-weight: bold;
  z-index: 2;
}

.err-txt { color: #999; font-size: 12px; }

.info { padding: 12px; }

.title {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  height: 40px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 🌟 活动标签样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
  height: 20px; /* 固定高度防止撑破卡片 */
  overflow: hidden;
}
.act-tag {
  font-size: 10px;
  color: #ff5000;
  border: 1px solid #ff5000;
  padding: 0 4px;
  border-radius: 4px;
  line-height: 16px;
  background-color: #fff1eb;
}

.footer {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.price-area {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price {
  color: #ff5000;
  font-size: 18px;
  font-weight: bold;
}

/* 🌟 原价划线样式 */
.original-price {
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
}

.sales { color: #999; font-size: 12px; }
</style>