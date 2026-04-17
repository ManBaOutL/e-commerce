<template>
  <div class="product-card"   @click="handleToGoodsDetail(id)">
    <div class="image-placeholder">
      <el-image :src="getFullUrl(image)" fit="cover">
        <template #error><div class="err-txt">暂无图片</div></template>
      </el-image>
    </div>
    <div class="info">
      <div class="title">{{ name }}</div>
      <div class="footer">
        <span class="price">¥{{ price }}</span>
        <span class="sales">{{salesText}}人付款</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import getFullUrl from '@/utils/getFullUrl'
const router = useRouter()

const props = defineProps(['id','name', 'price', 'image', 'sales'])
// console.log(props)
// 计算属性
const salesText = computed(() => {
  const { sales } = props
  if (sales > 999) {
    return '99+'
  } 
  else if (sales > 99){
    return '999+'
  }else {
    return sales
  }
})

const handleToGoodsDetail = (id : any) => {
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
}

.err-txt {
  color: #999;
  font-size: 12px;
}

.info {
  padding: 12px;
}

.title {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  height: 40px;
  /* 标准 CSS 文本截断（两行） */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.price {
  color: #ff5000;
  font-size: 18px;
  font-weight: bold;
}

.sales {
  color: #999;
  font-size: 12px;
}
</style>