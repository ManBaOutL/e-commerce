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
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/favorites/favorites.vue'),
    },
    {
      path: '/product',
      name: 'Product',
      component: () => import('@/views/product/ProductList.vue'),
      meta: { title: '商品列表' },
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
          path: 'consumption',
          component: () => import('@/views/user/ConsumptionStats/index.vue'),
          meta: { title: '消费统计' },
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
    {
      path: '/goods/:id', // 支持商品ID传参
      name: 'goodsDetail',
      component: () => import('@/views/goods/detail.vue'),
      meta: { title: '商品详情' }
    },
    {
      path: '/buy',
      name: 'buy',
      component: () => import('@/views/buy/buy.vue'),
      meta: { title: '购买' }
    },
    {
      path: '/user/orders/detail',
      name: 'order-detail',
      component: () => import('@/views/user/orders/order-detail.vue'),
      meta: { title: '订单详情' }
    },
    {
      path: '/user/orders/comment',
      name: 'order-comment',
      component: () => import('@/views/user/orders/order-comment.vue'),
      meta: { title: '订单评价' }
    },
    {
      path: '/user/orders/order-pay',
      name: 'order-pay',
      component: () => import('@/views/user/orders/pay-order.vue'),
      meta: { title: '订单支付' }
    },
    {
      path: '/merchant',
      name: 'merchant',
      component: () => import('@/views/merchant/merchant.vue'),
      meta: { title: '商家管理后台' },
      redirect: '/merchant/showdata',
      children: [
        {
          path: 'showdata',
          name: 'MerchantShowData',
          component: () => import('@/views/merchant/showData.vue'),
        },
        {
          path: 'order',
          name: 'MerchantOrder',
          component: () => import('@/views/merchant/order.vue'),
        },
        {
          path: 'product',
          name: 'MerchantProduct',
          component: () => import('@/views/merchant/product.vue'),
        },
        {
          path: 'comment',
          name: 'MerchantComment',
          component: () => import('@/views/merchant/comment.vue'),
        },
        {
          path: 'merchantCenter',
          name: 'MerchantCenter',
          component: () => import('@/views/merchant/merchantCenter.vue'),
        }
      ]
    },
    {
      path: '/manager',
      name: 'manager',
      component: () => import('@/views/manager/manager.vue'),
      meta: { title: '管理员管理后台' },
      redirect: '/manager/showdata',
      children: [
        {
          path: 'showdata',
          name: 'ManagerShowData',
          component: () => import('@/views/manager/showData.vue'),
        },
        {
          path: 'user',
          name: 'ManagerUser',
          component: () => import('@/views/manager/user.vue'),
        },
        {
          path: 'allOrder',
          name: 'ManagerOrder',
          component: () => import('@/views/manager/allOrder.vue'),
        },
        {
          path: 'allProduct',
          name: 'ManagerProduct',
          component: () => import('@/views/manager/allProduct.vue'),
        },
        {
          path: 'category',
          name: 'ManagerCategory',
          component: () => import('@/views/manager/category.vue'),
        },
        {
          path: 'coupon',
          name: 'ManagerCoupon',
          component: () => import('@/views/manager/coupon.vue'),
        },
        {
          path: 'operationLog',
          name: 'ManagerOperationLog',
          component: () => import('@/views/manager/operationLog.vue'),
        }
      ]
    }
  ],
})

export default router
