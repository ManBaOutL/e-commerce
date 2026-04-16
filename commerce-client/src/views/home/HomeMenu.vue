<template>
  <div class="home-menu-container" @mouseleave="activeIndex = -1">
    
    <div class="my-menu">
      <div 
        v-for="(mainItem, index) in categoryTree.slice(0, 8)" 
        :key="mainItem.id" 
        class="menu-row"
        :class="{ 'is-active': activeIndex === index }"
        @mouseenter="activeIndex = index" 
        @click="handleJump(mainItem.id)" 
      >
        <div class="row-left">
          <el-icon class="main-icon">
            <component :is="getIcon(mainItem.name, index)" />
          </el-icon>
          <span class="main-name">{{ mainItem.name }}</span>
        </div>
        <el-icon class="row-arrow" v-if="mainItem.children?.length"><ArrowRight /></el-icon>
      </div>
    </div>

    <div 
      class="mega-menu-panel" 
      v-show="activeIndex !== -1 && activeCategory?.children?.length"
    >
      <div class="mega-content-wrapper" v-if="activeCategory">
        
        <MegaMenuNode 
          v-for="child in activeCategory.children" 
          :key="child.id" 
          :node="child" 
          :level="2" 
        />

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoryStore } from '@/stores/modules/common/categoryStore';
import { Iphone, Monitor, Watch, Headset, House, Present, Goods, Collection, ArrowRight } from '@element-plus/icons-vue';
import MegaMenuNode from './MegaMenuNode.vue'; 

const categoryStore = useCategoryStore();
const router = useRouter();
const activeIndex = ref(-1);

const categoryTree = computed(() => categoryStore.categoryTree);
const activeCategory = computed(() => activeIndex.value !== -1 ? categoryTree.value[activeIndex.value] : null);

const getIcon = (name: string, index: number) => {
  if (name.includes('手机')) return Iphone;
  if (name.includes('电脑')) return Monitor;
  if (name.includes('穿戴')) return Watch;
  if (name.includes('耳机')) return Headset;
  if (name.includes('家电')) return House;
  return [Goods, Present, Collection][index % 3];
};

const handleJump = (id: number) => router.push({ path: '/product', query: { category_id: id } });

onMounted(() => categoryStore.getCategoryList());
</script>

<style scoped>
/* 外层容器 */
.home-menu-container {
  position: relative;
  height: 380px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.my-menu {
  width: 220px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  box-sizing: border-box;
}

.menu-row {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px 0 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.row-left {
  display: flex;
  align-items: center;
}

.main-icon {
  font-size: 18px;
  margin-right: 12px;
  color: #666;
}

.main-name {
  font-size: 14px;
  color: #333;
  transition: all 0.2s;
}

.row-arrow {
  font-size: 12px;
  color: transparent; 
  transition: all 0.2s;
  transform: translateX(-4px);
}

.menu-row.is-active {
  background-color: #fff;
  z-index: 101;
  width: calc(100% + 2px);
}

.menu-row.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: #ff5000;
  border-radius: 0 4px 4px 0;
}

.menu-row.is-active .main-icon,
.menu-row.is-active .main-name {
  color: #ff5000;
  font-weight: 500;
}

.menu-row.is-active .row-arrow {
  color: #ff5000;
  transform: translateX(0);
}

/* 🌟 极简悬浮面板 */
.mega-menu-panel {
  position: absolute;
  left: 220px;
  top: 0;
  height: 380px;
  background: #fff;
  z-index: 100;
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.06); 
  border-radius: 0 8px 8px 0;
  padding: 24px 30px; 
  width: max-content; 
  min-width: 300px;
  max-width: 750px;
  overflow: hidden;
}

/* 瀑布流自适应分列 */
.mega-content-wrapper {
  display: flex;
  flex-flow: column wrap; 
  height: 332px; /* 控制自动换列的最大高度 */
  gap: 0 50px; /* 列与列之间保持 50px 的清爽留白 */
  align-content: flex-start;
}
</style>