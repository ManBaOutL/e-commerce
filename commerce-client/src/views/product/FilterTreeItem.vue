<template>
  <div class="taobao-filter-container">
    <div class="filter-label">所有分类：</div>
    
    <div class="category-list">
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
 * 判断一级分类是否应该高亮
 * 逻辑：当前路由 ID 等于一级 ID，或者路由 ID 在该一级的 children 数组中
 */
const isMainCatActive = (mainCat: CategoryItem) => {
  const currentId = Number(route.query.category_id);
  if (currentId == mainCat.id) 
  {
    // console.log("一级分类直接匹配，应该高亮", mainCat.id);
    return true;
  }
  // 检查子级是否有被选中的
  if (mainCat.children) {
    // console.log("一级分类有子级，检查是否有被选中", mainCat.children);
    return mainCat.children.some(sub => sub.id == currentId);
  }
  return false;
};

const handleJump = (id: number) => {
  router.push({
    path: '/product',
    query: { 
      ...route.query, 
      category_id: id, 
    }
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

/* 移除原本只给 .main-cat-name 的 active，改为给 wrapper 及其子元素 */
.main-cat-wrapper.active .main-cat-name {
  color: #ff5000;
  font-weight: bold;
}

/* 即使没 hover，只要是 active 状态，背景也可以稍微加深或加个底线 */
.main-cat-wrapper.active {
  background-color: #fff2e8; /* 浅橙色背景，更有选中感 */
}

/* 一级激活状态 */
.main-cat-wrapper:hover .main-cat-name {
  color: #ff5000; /* 淘宝橙 */
}

/* 2. 美化 Hover 悬浮框 */
.sub-popover {
  display: none; /* 默认隐藏 */
  position: absolute;
  top: 100%; /* 在一级分类正下方 */
  left: 50%;
  transform: translateX(-50%); /* 居中显示 */
  margin-top: 10px; /* 留出一点空隙给小三角 */
  z-index: 100;
  background: #fff;
  box-shadow: 0 4px 18px rgba(0,0,0,0.15); /* 更柔和的阴影 */
  border-radius: 8px; /* 圆角 */
  padding: 16px;
  min-width: 220px; /* 保证宽度 */
  border: 1px solid #f0f0f0;
}
.sub-popover::before {
  content: "";
  position: absolute;
  top: -12px; /* 覆盖掉那 10px 的 margin 缝隙 */
  left: 0;
  width: 100%;
  height: 12px;
  background: transparent; /* 透明的，用户看不见 */
}

/* 增加一个小三角指针 */
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

/* 关键：滑动到一级分类上时显示二级 */
.main-cat-wrapper:hover .sub-popover {
  display: block;
  animation: fadeIn 0.2s ease; /* 增加淡入动画 */
}

/* 二级分类网格布局 */
.sub-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 一行三个 */
  gap: 12px 16px; /* 网格间距 */
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

/* 二级激活状态 */
.sub-cat-item.active {
  color: #ff5000;
  font-weight: 500;
}

/* 淡入动画定义 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(5px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>