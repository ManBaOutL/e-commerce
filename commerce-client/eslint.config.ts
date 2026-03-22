// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import js from '@eslint/js'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.{js,vue}'],
    rules: {
      // 允许单单词组件名（兼容组件库）
      'vue/multi-word-component-names': 'off',

      // 修改这里：开发环境允许 console 和 debugger
      'no-console': 'off',           // 完全关闭 console 检查
      'no-debugger': 'off',          // 完全关闭 debugger 检查

      // 或者改成警告但不阻止构建
      // 'no-console': 'warn',
      // 'no-debugger': 'warn',

      // 其他自定义规则
      'vue/require-default-prop': 'error'
    }
  }
]