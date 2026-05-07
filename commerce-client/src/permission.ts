import router from './router'
import { useLoginStore } from '@/stores/modules/common/loginStore'
import { ElMessage } from 'element-plus'

// 1. 定义免登录白名单路由 (精确匹配)
const whiteList = ['/', '/login', '/login/register', '/login/forgetPwd', '/alipayCallback']

// 2. 新版全局前置守卫 (去掉 next 参数，使用 return)
router.beforeEach(async (to, from) => {
  const loginStore = useLoginStore()
  
  // 🌟 重要提醒：根据你的 loginStore 逻辑，如果 store 里没有，要从 localStorage 里取一次
  const token = loginStore.token || localStorage.getItem('token')?.replace(/(^"|"$)/g, '')

  // 动态判断是否是允许免登录访问的详情页 (如 /goods/123 或 /shop/456)
  const isPublicDynamicRoute = to.path.startsWith('/goods/') || to.path.startsWith('/shop/')
  const inWhiteList = whiteList.includes(to.path) || isPublicDynamicRoute

  if (token) {
    // ==========================================
    // 🌟 已登录状态
    // ==========================================
    if (to.path.startsWith('/login')) {
      // 已经登录过，还要去登录页，直接拦截回首页
      return '/'
    }

    // 处理页面刷新导致的 Pinia 状态丢失 (你的 loginStore 提供了 initStore 方法)
    if (!loginStore.userInfo?.user_id) {
      loginStore.initStore()
      
      // 如果 initStore 后依然没有用户信息，说明本地数据被篡改或丢失
      if (!loginStore.userInfo?.user_id) {
        loginStore.logout() // 清理残余数据
        ElMessage.error('登录状态异常，请重新登录')
        return `/login?redirect=${to.path}`
      }
    }

    // ==========================================
    // 🌟 角色权限拦截 (RBAC)
    // ==========================================
    const userType = loginStore.userInfo?.type

    // 1. 商家后台权限校验
    if (to.path.startsWith('/merchant')) {
      if (userType !== '商家' && userType !== '管理员') {
        ElMessage.error('越权操作：您没有商家后台访问权限')
        return '/' // 打回首页
      }
    }

    // 2. 管理员后台权限校验
    if (to.path.startsWith('/manager')) {
      if (userType !== '管理员') {
        ElMessage.error('越权操作：您没有管理员后台访问权限')
        return '/' // 打回首页
      }
    }

    // 权限校验通过，正常放行 (返回 true 或 undefined 等同于传统的 next())
    return true
    
  } else {
    // ==========================================
    // 🌟 未登录状态
    // ==========================================
    if (inWhiteList) {
      // 在白名单内，直接放行
      return true
    } else {
      // 不在白名单内，强制跳转登录页，并携带原本要去的路由参数
      ElMessage.warning('请先登录系统')
      return `/login?redirect=${to.path}`
    }
  }
})

// 全局后置钩子
router.afterEach((to) => {
  // 切换路由后自动滚动到页面顶部
  window.scrollTo(0, 0)
  
  // 动态修改浏览器标题
  const defaultTitle = '电商平台'
  document.title = to.meta.title ? `${to.meta.title} - ${defaultTitle}` : defaultTitle
})