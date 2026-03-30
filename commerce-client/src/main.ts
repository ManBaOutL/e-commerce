import { createApp } from 'vue'
import { createPinia } from 'pinia'
// 导入 Vant 样式和全部组件
import 'vant/lib/index.css'
import Vant from 'vant'
// 导入 ElementPlus 组件
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import GlobalComponents from './components/index'
import zhCn from 'element-plus/es/locale/lang/zh-cn'


import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 3. 注册 Vant 组件
app.use(Vant)
// 4. 注册 ElementPlus 组件(国际化)
app.use(ElementPlus, {
  locale: zhCn,
})
// 5. 注册全局组件
app.use(GlobalComponents)


app.mount('#app')
