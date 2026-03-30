import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'], // 使用 vue 推荐配置
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      parser: tsParser, // 使用 TS 解析器
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules, // 启用 TS 推荐规则
      'prettier/prettier': 'error', // 将 prettier 错误显示为 eslint 错误
      'vue/multi-word-component-names': 'off', // 关闭组件名多单词限制（按需开启）
    },
  },
     prettierConfig, // 最后应用 prettier 配置，覆盖冲突规则
];