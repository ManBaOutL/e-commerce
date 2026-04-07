<template>
  <div style="display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap">
    <!-- 父类筛选 -->
    <el-select v-model="parentTypeVal" placeholder="商品父类" style="width:180px">
      <el-option
        v-for="item in parentTypeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

    <!-- 子类筛选（根据父类联动） -->
    <el-select v-model="childTypeVal" placeholder="商品子类" style="width:180px" :disabled="!parentTypeVal">
      <el-option
        v-for="item in currentChildOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

    <!-- 审核状态筛选（已修复！） -->
    <el-select v-model="auditVal" placeholder="审核状态" style="width:180px">
      <el-option
        v-for="item in auditOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

    <el-button @click="clear">清空筛选</el-button>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  parentTypeValue: String,
  childTypeValue: String,
  auditValue: String,
})

const emit = defineEmits([
  'update:parentTypeValue',
  'update:childTypeValue',
  'update:auditValue'
])

// ---------------------- 商品分类父子级数据 ----------------------
const categoryOptions = ref([
  {
    parentLabel: '数码产品',
    parentValue: 'digital',
    children: [
      { label: '手机', value: 'digital_phone' },
      { label: '耳机', value: 'digital_headset' },
      { label: '充电器', value: 'digital_charger' }
    ]
  },
  {
    parentLabel: '服饰',
    parentValue: 'clothing',
    children: [
      { label: '上衣', value: 'clothing_top' },
      { label: '裤子', value: 'clothing_pants' },
      { label: '外套', value: 'clothing_coat' }
    ]
  },
  {
    parentLabel: '家居',
    parentValue: 'home',
    children: [
      { label: '家具', value: 'home_furniture' },
      { label: '日用品', value: 'home_daily' }
    ]
  }
])

// 父类选项
const parentTypeOptions = computed(() => {
  return [
    { label: '全部', value: '' },
    ...categoryOptions.value.map(item => ({
      label: item.parentLabel,
      value: item.parentValue
    }))
  ]
})

// 子类选项
const currentChildOptions = computed(() => {
  if (!props.parentTypeValue) return [{ label: '全部', value: '' }]
  const current = categoryOptions.value.find(c => c.parentValue === props.parentTypeValue)
  return [
    { label: '全部', value: '' },
    ...(current?.children || [])
  ]
})

// ---------------------- 审核状态选项（已恢复！） ----------------------
const auditOptions = ref([
  { label: '全部', value: '' },
  { label: '已通过', value: '已通过' },
  { label: '待审核', value: '待审核' },
  { label: '已驳回', value: '已驳回' },
])

// ---------------------- 双向绑定 ----------------------
const parentTypeVal = computed({
  get: () => props.parentTypeValue,
  set: v => {
    emit('update:parentTypeValue', v)
    emit('update:childTypeValue', '')
  }
})

const childTypeVal = computed({
  get: () => props.childTypeValue,
  set: v => emit('update:childTypeValue', v)
})

const auditVal = computed({
  get: () => props.auditValue,
  set: v => emit('update:auditValue', v)
})

// 清空
const clear = () => {
  emit('update:parentTypeValue', '')
  emit('update:childTypeValue', '')
  emit('update:auditValue', '')
}
</script>