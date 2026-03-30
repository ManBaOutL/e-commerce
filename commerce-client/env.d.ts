/// <reference types="vite/client" />

// 关键：声明所有 .vue 文件的类型
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    // 告诉 TS：.vue 文件是 Vue 组件类型，避免 any 类型警告
    const component: DefineComponent<{}, {}, any>
    export default component
}