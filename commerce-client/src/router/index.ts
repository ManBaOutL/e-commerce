import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/home.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/loginLayout.vue'),
      children: [
        {
          path: '',
          name: 'loginForm',
          component: () => import('@/views/login/loginForm.vue'),
        },
        {
          path: 'forgetPwd',
          name: 'forgetPwd',
          component: () => import('@/views/login/forgetPwd.vue'),
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/login/registerForm.vue'),
        },
      ],
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/cart/cart.vue'),
    },
    {
      path: '/product',
      name: 'Product',
      component: () => import('@/views/product/ProductList.vue'),
    },
    {
      path: '/user',
      redirect: '/user/house',
      component: () => import('@/views/user/index.vue'),
      children: [
        {
          path: 'house',
          component: () => import('@/views/user/house/index.vue'),
          meta: { title: '我的KK' },
        },
        {
          path: 'profile',
          component: () => import('@/views/user/profile/index.vue'),
          meta: { title: '个人资料' },
        },
        {
          path: 'orders',
          component: () => import('@/views/user/orders/index.vue'),
          meta: { title: '我的订单' },
        },
        {
          path: 'coupons',
          component: () => import('@/views/user/coupons/index.vue'),
          meta: { title: '我的优惠券' },
        },
        {
          path: 'address',
          component: () => import('@/views/user/address/index.vue'),
          meta: { title: '收货地址' },
        },
        {
          path: 'security',
          component: () => import('@/views/user/security/index.vue'),
          meta: { title: '安全设置' },
        },
      ],
    },
  ],
})

export default router
