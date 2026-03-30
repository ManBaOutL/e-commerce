<template>
  <div class="product-card">
    <div class="image-placeholder">
      <el-image :src="props.image" fit="cover">
        <template #error><div class="err-txt">暂无图片</div></template>
      </el-image>
    </div>
    <div class="info">
      <div class="title">{{ props.name }}</div>
      <div class="footer">
        <span class="price">¥{{ props.price }}</span>
        <span class="sales">99+人付款</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['name', 'price', 'image'])
// console.log(props)
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
  width: 100%;
  height: 180px;
  background: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
    overflow: hidden; /* 新增：防止图片溢出 */
}
.image-placeholder img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border: 1px solid red;
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