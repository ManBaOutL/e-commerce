<template>
  <div class="taobao-filter-container">
    <div class="filter-label">所有分类：</div>
    
    <div class="category-list">
      <div 
        class="main-cat-wrapper"
        :class="{ active: !route.query.category_id }"
      >
        <div 
          class="main-cat-name"
          @click="handleJump(undefined)"
        >
          全部
        </div>
      </div>

      <div 
        v-for="mainCat in categoryTree" 
        :key="mainCat.id" 
        class="main-cat-wrapper"
        :class="{ active: isMainCatActive(mainCat) }"
      >
        <div 
          class="main-cat-name"
          @click="handleJump(mainCat.id)"
        >
          {{ mainCat.name }}
        </div>

        <div v-if="mainCat.children?.length" class="sub-popover">
          <div class="sub-popover-arrow"></div>
          <div class="sub-grid">
            <div 
              v-for="subCat in mainCat.children" 
              :key="subCat.id"
              class="sub-cat-item"
              :class="{ active: Number(route.query.category_id) === subCat.id }"
              @click.stop="handleJump(subCat.id)"
            >
              {{ subCat.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import type { CategoryItem } from '@/api/product/types';

const props = defineProps<{
  categoryTree: CategoryItem[]; 
}>();

const route = useRoute();
const router = useRouter();

/**
 * 🌟 核心递归：判断当前分类树节点（或其任意深度的子节点）是否被选中
 */
const isMainCatActive = (mainCat: CategoryItem): boolean => {
  const currentId = Number(route.query.category_id);
  if (!currentId) return false; // 如果 URL 里没有 category_id，全都不高亮

  // 定义内部递归查找函数
  const findRecursively = (cat: CategoryItem): boolean => {
    // 命中自身
    if (cat.id === currentId) return true;
    // 自身没命中，且有子级，则递归遍历子级
    if (cat.children && cat.children.length > 0) {
      return cat.children.some(child => findRecursively(child));
    }
    return false;
  };

  return findRecursively(mainCat);
};

/**
 * 🌟 优化跳转逻辑：保留原有的 query 参数（比如搜索关键词），只修改 category_id
 */
const handleJump = (id?: number) => {
  // 浅拷贝当前路由的所有查询参数
  const newQuery = { ...route.query };
  
  if (id !== undefined) {
    newQuery.category_id = String(id);
  } else {
    // 如果点击的是“全部”，则从 URL 中移除 category_id 参数
    delete newQuery.category_id;
  }

  router.push({
    path: '/product',
    query: newQuery
  });
};
</script>

<style scoped>
.taobao-filter-container {
  display: flex;
  align-items: flex-start;
  padding: 5px 0;
  user-select: none;
}

.filter-label {
  color: #999;
  font-size: 14px;
  width: 80px;
  padding-top: 6px; /* 对齐文本 */
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px; /* 一级分类间距 */
  flex: 1;
}

/* 级联悬浮核心逻辑 */
.main-cat-wrapper {
  position: relative; /* 供 popover 定位 */
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.main-cat-wrapper:hover {
  background-color: #f5f5f5;
}

.main-cat-name {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

.main-cat-wrapper.active .main-cat-name {
  color: #ff5000;
  font-weight: bold;
}

.main-cat-wrapper.active {
  background-color: #fff2e8; 
}

.main-cat-wrapper:hover .main-cat-name {
  color: #ff5000; 
}

/* 美化 Hover 悬浮框 */
.sub-popover {
  display: none; 
  position: absolute;
  top: 100%; 
  left: 50%;
  transform: translateX(-50%); 
  margin-top: 10px; 
  z-index: 100;
  background: #fff;
  box-shadow: 0 4px 18px rgba(0,0,0,0.15); 
  border-radius: 8px; 
  padding: 16px;
  min-width: 220px; 
  border: 1px solid #f0f0f0;
}
.sub-popover::before {
  content: "";
  position: absolute;
  top: -12px; 
  left: 0;
  width: 100%;
  height: 12px;
  background: transparent; 
}

.sub-popover-arrow {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: #fff;
  border-left: 1px solid #f0f0f0;
  border-top: 1px solid #f0f0f0;
}

.main-cat-wrapper:hover .sub-popover {
  display: block;
  animation: fadeIn 0.2s ease; 
}

/* 二级分类网格布局 */
.sub-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); 
  gap: 12px 16px; 
}

.sub-cat-item {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  transition: color 0.2s;
  text-align: center;
}

.sub-cat-item:hover {
  color: #ff5000;
  text-decoration: underline;
}

.sub-cat-item.active {
  color: #ff5000;
  font-weight: 500;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(5px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>