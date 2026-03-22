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
        }
      ]
    },
  ],
})

export default router
