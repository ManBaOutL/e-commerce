<template>
  <!-- 关键修改：使用 v-model:model-value 替代直接 v-model -->
  <el-dialog v-model:model-value="visible" title="回复评论" width="500px" append-to-body>
    <div class="user-comment">{{ comment.content }}</div>
    <el-input 
      v-model="replyContent" 
      type="textarea" 
      rows="4" 
      style="margin-top:10px" 
      placeholder="请输入回复内容"
    />
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">回复</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'

// 定义props（visible 改为接收 modelValue，符合Vue3 v-model规范）
const props = defineProps({
  modelValue: { // 对应 v-model:model-value
    type: Boolean,
    required: true
  },
  comment: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

// 定义emits（更新visible需要触发 update:modelValue 事件）
const emit = defineEmits(['update:modelValue', 'submit'])

const replyContent = ref('')

// 取消回复
const handleCancel = () => {
  replyContent.value = ''
  emit('update:modelValue', false) // 触发事件更新父组件的visible
}

// 提交回复
const handleSubmit = () => {
  if (!replyContent.value.trim()) {
    return ElMessage.warning('请输入回复内容')
  }
  emit('submit', {
    commentId: props.comment.orderId,
    content: replyContent.value
  })
  replyContent.value = ''
  emit('update:modelValue', false)
}
</script>

<style scoped>
.user-comment {
  padding: 10px;
  background: #f7f8fa;
  border-radius: 6px;
}
</style>