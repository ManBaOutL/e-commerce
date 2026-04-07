<template>
  <div style="display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap">
    <el-select v-model="value" placeholder="按评分筛选" style="width:200px">
      <el-option
        v-for="item in scoreOptions"
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

const scoreOptions = ref([
  { label: '全部', value: '' },
  { label: '5星', value: 5 },
  { label: '4星', value: 4 },
  { label: '3星', value: 3 },
  { label: '2星', value: 2 },
  { label: '1星', value: 1 },
])

const value = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const clear = () => emit('update:modelValue', '')
</script>