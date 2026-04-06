<template>
  <div class="home-menu-container">
    <div class="taobao-menu">
      <div 
        v-for="mainItem in categoryTree.slice(0, 10)" 
        :key="mainItem.id" 
        class="menu-row"
        @click="handleJump(mainItem.id, mainItem.name)" 
      >
        <el-icon class="main-icon">
          <component :is="mainItem.icon || 'Menu'" />
        </el-icon>
        
        <!-- 分类展示 -->
        <div class="content-wrapper">
          <span class="main-name">{{ mainItem.name }}</span>

          <div class="sub-links" v-if="mainItem.children && mainItem.children.length">
            <template v-for="(sub, index) in mainItem.children.slice(0, 4)" :key="sub.id">
              <span class="separator">/</span>
              <span class="sub-name" @click.stop="handleJump(sub.id, sub.name)">
                {{ sub.name }}
              </span>
            </template>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/stores/modules/product';

const productStore = useProductStore();
const router = useRouter();


// 跳转到商品列表页
const handleJump = (id: number, name: string) => {
  router.push({
    path: '/product',
    query: { category_id: id, keyword: name }
  });
};
// 使用计算属性，自动追踪 store 的变化
const categoryTree = computed(() => productStore.categoryTree);
const fetchCategories = () => {
    // 获取分类数据(已化为树状结构)
    productStore.getCategoryList();
};
onMounted(fetchCategories);
</script>

<style scoped>
.home-menu-container {
  height: 380px; /* 承接父级盒子的 380px 高度 */
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-sizing: border-box;
}

.taobao-menu {
  height: 100%;
  display: flex;
  flex-direction: column; /* 垂直排列 */
}

.menu-row {
  flex: 1; /* 核心：10行平分 380px 高度，每行约 38px */
  display: flex;
  align-items: center;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.menu-row:hover {
  background-color: #fff1eb;
  color: #ff5000;
  border-left-color: #ff5000;
}

.main-icon {
  font-size: 15px; /* 缩小图标 */
  margin-right: 8px;
}

.content-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  /* 修改点：缩小整体字体大小，更接近截图风格 */
  font-size: 12px; 
  color: #333;
  white-space: nowrap;
  overflow: hidden;
}

.main-name {
  font-weight: 500;
}

.main-name:hover, .sub-name:hover {
  text-decoration: underline;
}

.sub-links {
  color: #666;
  display: flex;
  align-items: center;
}

.separator {
  margin: 0 3px;
  color: #e0e0e0;
}

.sub-name {
  color: #666;
}

/* 确保 hover 时子分类也变橙色 */
.menu-row:hover .sub-name {
  color: #ff5000;
}
</style>