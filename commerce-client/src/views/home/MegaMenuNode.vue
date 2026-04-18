<template>
  <div v-if="level === 2" class="mega-group">
    <div class="group-title" @click.stop="handleJump(node.id)">
      <span>{{ node.name }}</span>
      <el-icon v-if="node.children && node.children.length > 0" class="arrow-icon">
        <ArrowRight />
      </el-icon>
    </div>
    
    <div class="group-content" v-if="node.children && node.children.length > 0">
      <MegaMenuNode v-for="child in node.children" :key="child.id" :node="child" :level="level + 1" />
    </div>
  </div>

  <div v-else-if="level === 3 && node.children && node.children.length > 0" class="sub-group">
    <div class="sub-title" @click.stop="handleJump(node.id)">{{ node.name }}</div>
    <div class="sub-content">
      <MegaMenuNode v-for="child in node.children" :key="child.id" :node="child" :level="level + 1" />
    </div>
  </div>

  <span v-else class="leaf-link" @click.stop="handleJump(node.id)">
    {{ node.name }}
  </span>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';

defineProps<{
  node: any;
  level: number;
}>();

const router = useRouter();

const handleJump = (id: number) => {
  router.push({ path: '/product', query: { category_id: id } });
};
</script>

<style scoped>
/* 二级大分组 */
.mega-group {
  margin-bottom: 24px;
  break-inside: avoid; /* 防止在瀑布流中被截断到下一列 */
}

/* 简洁的二级标题 */
.group-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
  cursor: pointer;
  display: flex;
  align-items: center; /* 让箭头紧贴文字居中 */
  transition: color 0.2s;
}
.group-title:hover { color: #ff5000; }
.arrow-icon { margin-left: 4px; font-size: 12px; color: #999; }

/* 组内内容容器 */
.group-content {
  display: flex;
  flex-wrap: wrap; 
  gap: 10px 16px; /* 舒适的行间距和字间距 */
}

/* 三级小分组（独占一行） */
.sub-group {
  width: 100%; 
  display: flex;
  align-items: flex-start;
}

/* 三级小标题 */
.sub-title {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-right: 16px;
  white-space: nowrap; /* 绝对不换行 */
  cursor: pointer;
  transition: color 0.2s;
}
.sub-title:hover { color: #ff5000; }

.sub-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

/* 末端干净的超链接标签 */
.leaf-link {
  font-size: 13px;
  color: #777;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.leaf-link:hover {
  color: #ff5000;
}
</style>