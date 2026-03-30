// 注册全局的自定义组件
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ProductCard from './product/ProductCard.vue'
import TheHeader from './product/TheHeader.vue'

const allComponent = {
  ProductCard,
  TheHeader
}

export default {
  // 这里必须要用install方法注册组件，否则无法正常使用
  install: (app: any) => {
    // 使用 entries 遍历，直接获取键和值
    Object.entries(allComponent).forEach(([key, component]) => {
      app.component(key, component)
    })
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }
  }
}
