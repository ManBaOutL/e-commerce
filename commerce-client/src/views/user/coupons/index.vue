<template>
  <div class="coupon-container">
    <main class="page-content">
      <div class="header-filter">
        <h2 class="page-title">我的优惠券</h2>
        <div class="mine-status-filter">
          <el-radio-group v-model="mineFilter" size="default">
            <el-radio-button value="未使用">未使用</el-radio-button>
            <el-radio-button value="已使用">已使用</el-radio-button>
            <el-radio-button value="已过期">已过期</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      
      <div class="coupon-grid" v-if="filteredMineCoupons.length > 0">
        <div 
          v-for="item in filteredMineCoupons" 
          :key="item.coupon_id" 
          class="coupon-card" 
          :class="{ 'is-disabled': item.status !== '未使用' }"
        >
          <div class="left-part">
            <div class="price">
              <span class="symbol" v-if="item.type !== '折扣'">¥</span>
              <span class="num">{{ item.type === '折扣' ? (item.discount_value as number / 10).toFixed(1) : item.discount_value }}</span>
              <span class="symbol" v-if="item.type === '折扣'" style="font-size: 16px; margin-left: 2px;">折</span>
            </div>
            <div class="condition">
              {{ Number(item.min_order_amount) === 0 ? '无门槛' : `满 ${item.min_order_amount} 可用` }}
            </div>
          </div>
          
          <div class="right-part">
            <div class="info">
              <div class="tags">
                <span class="type-tag">{{ item.type }}</span>
              </div>
              <h4 class="title">{{ item.type }}</h4>
              <p class="time">有效期至 {{ item.end_time }}</p>
            </div>
            
            <div class="status-stamp" v-if="item.status !== '未使用'">
              {{ item.status }}
            </div>
            
            <div class="action" v-if="item.status === '未使用'">
              <button class="use-btn" @click="$router.push('/product')">去使用</button>
            </div>
          </div>
          
          <div class="sawtooth"></div>
        </div>
      </div>

      <div class="empty-wrap" v-else>
        <el-empty :description="`暂无${mineFilter}的优惠券`" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/modules/user/userStore';

// 默认选中“未使用”
const mineFilter = ref('未使用');
const userStore = useUserStore();

onMounted(() => {
  userStore.fetchMyCoupons();
});

// 计算过滤后的券
const filteredMineCoupons = computed(() => {
  return userStore.myCoupons.filter(c => c.status === mineFilter.value);
});
</script>

<style scoped>
.coupon-container {
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
}

.header-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #fff;
  padding: 20px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.coupon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

/* 核心：优惠券卡片样式 */
.coupon-card {
  display: flex;
  height: 120px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.coupon-card:hover {
  transform: translateY(-2px);
}

/* 左侧：面额区 */
.left-part {
  width: 130px;
  background: linear-gradient(135deg, #ff7e00 0%, #ff4f00 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  border-right: 2px dashed rgba(255, 255, 255, 0.5);
}

.left-part .num { font-size: 36px; font-weight: bold; line-height: 1; }
.left-part .symbol { font-size: 16px; font-weight: 500; margin-right: 2px; }
.left-part .condition { font-size: 12px; margin-top: 8px; opacity: 0.9; }

/* 锯齿线 */
.sawtooth {
  position: absolute;
  top: 0;
  left: 125px; /* 定位在左侧色块边缘 */
  width: 10px;
  height: 100%;
  background-image: radial-gradient(circle at 5px 10px, #fff 4px, transparent 5px);
  background-size: 10px 15px;
  z-index: 10;
}

/* 右侧：信息区 */
.right-part {
  flex: 1;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 25px;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tags { margin-bottom: 6px; }
.type-tag {
  background: #fff0e8;
  color: #ff5000;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #ffd8c4;
}

.info .title { font-size: 16px; color: #333; margin: 0 0 8px 0; font-weight: bold;}
.info .time { font-size: 12px; color: #999; margin: 0; }

.use-btn {
  padding: 6px 18px;
  border-radius: 20px;
  border: 1px solid #ff5000;
  background: #fff;
  color: #ff5000;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.use-btn:hover { background: #ff5000; color: #fff; }

/* 🌟 已使用/已过期状态灰度处理 */
.coupon-card.is-disabled {
  filter: grayscale(100%);
  opacity: 0.7;
}
.coupon-card.is-disabled .left-part {
  background: #b0b0b0; /* 灰掉的底色 */
}
.coupon-card.is-disabled .type-tag {
  background: #f0f0f0;
  color: #999;
  border-color: #ddd;
}

/* 状态印章 */
.status-stamp {
  position: absolute;
  right: 20px;
  top: 30px;
  width: 60px;
  height: 60px;
  border: 2px solid #ccc;
  border-radius: 50%;
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  transform: rotate(-25deg);
  letter-spacing: 2px;
  opacity: 0.6;
}

.empty-wrap {
  background: #fff;
  padding: 60px 0;
  border-radius: 8px;
}
</style>