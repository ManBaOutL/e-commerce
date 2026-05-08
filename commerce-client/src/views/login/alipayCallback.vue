<template>
  <div style="height: 100vh; display: flex; justify-content: center; align-items: center;">
    <div>正在验证支付宝授权信息，请稍候...</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import { useLoginStore } from '@/stores/modules/common/loginStore';

const route = useRoute();
const router = useRouter();
const loginStore = useLoginStore();

onMounted(async () => {
  const authCode = route.query.auth_code as string;
  if (!authCode) {
    showFailToast('获取授权码失败');
    return router.replace('/login');
  }

  // 调用 Store 的支付宝登录方法
  const res = await loginStore.alipayLoginAction(authCode);

  if (res.success) {
    showSuccessToast('支付宝登录成功！');
    if (res.userType === '普通用户') router.replace('/');
    else if (res.userType === '商家') router.replace('/merchant');
    else if (res.userType === '管理员') router.replace('/manager');
    else router.replace('/');
  } else {
    showFailToast(res.message || '支付宝服务当前繁忙，请稍后再试');
    router.replace('/login');
  }
});
</script>