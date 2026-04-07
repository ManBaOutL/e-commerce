<template>
  <div style="display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap">
    <el-select v-model="value" placeholder="选择订单状态" style="width:200px">
      <el-option
        v-for="item in statusOptions"
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
const props = defineProps({ modelValue: [String, Number] })
const emit = defineEmits(['update:modelValue'])

// 动态筛选选项
const statusOptions = ref([
  { label: '全部', value: '' },
  { label: '待发货', value: '待发货' },
  { label: '已完成', value: '已完成' },
  { label: '已取消', value: '已取消' },
])

const value = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const clear = () => emit('update:modelValue', '')
</script>