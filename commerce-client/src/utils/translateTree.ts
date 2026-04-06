import type { CategoryItem } from '@/api/product/types';

/**
 * 将扁平的分类数组转换为树形结构
 * @param data 从接口获取的扁平分类数组
 * @returns 树形结构的分类数组
 */
const translateTree = (data: CategoryItem[]): CategoryItem[] => {
  // 使用 Record 定义一个 ID 到分类对象的映射表
  const map: Record<number, CategoryItem> = {};
  const tree: CategoryItem[] = [];

  // 第一遍遍历：初始化映射表，并深拷贝对象防止污染原数据
  data.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });

  // 第二遍遍历：构建层级关系
  data.forEach((item) => {
    const currentNode = map[item.id] as CategoryItem;
    if (item.parent_id !== null && map[item.parent_id]) {
      // 如果有父级，将当前节点推入父级的 children 中
      map[item.parent_id]?.children?.push(currentNode);
    } else {
      // 如果没有父级（或者父级不存在），则作为顶层节点
      tree.push(currentNode);
    }
  });

  return tree;
};

export default translateTree;