<template>
  <div class="home-menu-container">
    <div class="my-menu">
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
import { useProductStore } from '@/stores/modules/productStore';

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
  height: 380px; 
  background: #fff;
  border-radius: 8px;
  /* 移除 overflow: hidden 否则如果内容多一点会被切断 */
  box-sizing: border-box;
  padding: 8px 0; /* 增加上下内边距，让首尾不贴边 */
}

.my-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-row {
  /* 核心：固定高度，380px 除去 padding 16px，10行每行约 36px */
  height: 36px; 
  line-height: 36px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px; /* 稍微加大一点点字号更清晰 */
}

.menu-row:hover {
  background: linear-gradient(90deg, #fff1eb 0%, #fff 100%); /* 渐变背景更高级 */
  color: #ff5000;
}

.main-icon {
  font-size: 16px;
  margin-right: 12px;
  color: #666; /* 初始图标颜色淡一点 */
}

.menu-row:hover .main-icon {
  color: #ff5000;
}

.content-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
}

.main-name {
  font-weight: 500;
  margin-right: 4px;
}

.sub-links {
  color: #999; /* 子类链接颜色调淡，突出主类 */
  font-size: 12px;
}

.separator {
  margin: 0 2px;
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