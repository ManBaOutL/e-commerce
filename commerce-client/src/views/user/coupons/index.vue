<template>
  <div class="coupon-container">
    <el-tabs v-model="activeTab" class="coupon-tabs">
      <el-tab-pane label="领券中心" name="center">
        <div class="coupon-grid">
          <div v-for="item in availableCoupons" :key="item.id" class="coupon-card get-mode">
            <div class="left-part">
              <div class="price">
                <span class="symbol">{{ item.type === 'reduction' ? '¥' : '' }}</span>
                <span class="num">{{ item.value }}</span>
                <span class="symbol">{{ item.type === 'discount' ? '折' : '' }}</span>
              </div>
              <div class="condition">满{{ item.threshold }}可用</div>
            </div>
            <div class="right-part">
              <div class="info">
                <h4 class="title">{{ item.title }}</h4>
                <p class="time">{{ item.startTime }} - {{ item.endTime }}</p>
                <p class="desc">{{ item.desc }}</p>
              </div>
              <div class="action">
                <button class="get-btn" @click="handleGetCoupon(item.id)">立即领取</button>
              </div>
            </div>
            <div class="sawtooth"></div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="我的优惠券" name="mine">
        <div class="mine-status-filter">
          <el-radio-group v-model="mineFilter" size="small">
            <el-radio-button label="unused">未使用</el-radio-button>
            <el-radio-button label="used">已使用</el-radio-button>
            <el-radio-button label="expired">已过期</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="coupon-grid">
          <div 
            v-for="item in filteredMineCoupons" 
            :key="item.id" 
            class="coupon-card" 
            :class="item.status"
          >
            <div class="left-part">
              <div class="price">
                <span class="symbol">¥</span><span class="num">{{ item.value }}</span>
              </div>
              <div class="condition">满{{ item.threshold }}可用</div>
            </div>
            <div class="right-part">
              <div class="info">
                <h4 class="title">{{ item.title }}</h4>
                <p class="time">有效期至 {{ item.endTime }}</p>
              </div>
              <div class="status-icon" v-if="item.status !== 'unused'">
                {{ item.status === 'used' ? '已使用' : '已过期' }}
              </div>
              <div class="action" v-if="item.status === 'unused'">
                <button class="use-btn" @click="$router.push('/product')">去使用</button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

const activeTab = ref('center');
const mineFilter = ref('unused');

// 模拟数据引入
const couponMock = {
  // 领券中心数据
  available: [
    { id: 1, title: '全场通用券', type: 'reduction', value: 20, threshold: 200, startTime: '2024.04.01', endTime: '2024.04.30', desc: '限全平台商品使用', status: 'ready' },
    { id: 2, title: '服饰类目专享', type: 'discount', value: 8.5, threshold: 100, startTime: '2024.04.10', endTime: '2024.05.10', desc: '仅限指定运动品牌', status: 'ready' }
  ],
  // 我的优惠券
  mine: [
    { id: 101, title: '新人大礼包', type: 'reduction', value: 50, threshold: 500, status: 'unused', endTime: '2026-12-31' },
    { id: 102, title: '超市满减券', type: 'reduction', value: 10, threshold: 99, status: 'used', endTime: '2024-03-20' },
    { id: 103, title: '春季大促', type: 'discount', value: 9, threshold: 1, status: 'expired', endTime: '2024-04-01' }
  ]
}
const availableCoupons = ref(couponMock.available);
const myCoupons = ref(couponMock.mine);

const filteredMineCoupons = computed(() => {
  return myCoupons.value.filter(c => c.status === mineFilter.value);
});

const handleGetCoupon = (id: number) => {
  ElMessage.success('领取成功！已放入您的卡券包');
  // 后续逻辑：调用接口，并从未领取列表中移除
};
</script>

<style scoped>
.coupon-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 80vh;
}

.coupon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* 核心：优惠券卡片样式 */
.coupon-card {
  display: flex;
  height: 110px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

/* 左侧：面额区 */
.left-part {
  width: 120px;
  background: linear-gradient(135deg, #ff9000 0%, #ff5000 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.left-part .num { font-size: 32px; font-weight: bold; }
.left-part .symbol { font-size: 14px; }
.left-part .condition { font-size: 12px; opacity: 0.9; }

/* 锯齿线 */
.left-part::after {
  content: "";
  position: absolute;
  top: 0;
  right: -5px;
  width: 10px;
  height: 100%;
  background-image: radial-gradient(circle at 5px 10px, #fff 4px, transparent 5px);
  background-size: 10px 15px;
}

/* 右侧：信息区 */
.right-part {
  flex: 1;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info .title { font-size: 15px; color: #333; margin-bottom: 8px; }
.info .time { font-size: 12px; color: #999; margin-bottom: 4px; }
.info .desc { font-size: 11px; color: #bbb; }

.get-btn, .use-btn {
  padding: 6px 15px;
  border-radius: 20px;
  border: 1px solid #ff5000;
  background: #fff;
  color: #ff5000;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.get-btn:hover { background: #ff5000; color: #fff; }

/* 已使用/已过期状态灰度处理 */
.used, .expired {
  filter: grayscale(100%);
  opacity: 0.7;
}

.status-icon {
  border: 2px solid #ccc;
  color: #ccc;
  padding: 5px;
  font-size: 12px;
  border-radius: 4px;
  transform: rotate(-15deg);
}

.mine-status-filter {
  margin-top: 10px;
}
</style>