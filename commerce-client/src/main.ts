//import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// 1. 导入 Vant 组件（按需导入）
import { Form, Field, CellGroup, Button, Toast } from 'vant'
import { Popup, RadioGroup, Radio } from 'vant'
// 2. 导入 Vant 样式
import 'vant/lib/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 3. 注册 Vant 组件
app.use(Form)
app.use(Field)
app.use(CellGroup)
app.use(Button)
app.use(Toast)
app.use(Popup)
app.use(RadioGroup)
app.use(Radio)


app.mount('#app')
