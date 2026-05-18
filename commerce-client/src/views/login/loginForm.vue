<template>
          <!-- 登录标题 -->
       <Title>电商系统登录</Title>
      <!-- 登录表单 -->
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field
            v-if="loginType === 'username'"
            v-model="form.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
          <van-field
            v-if="loginType === 'email'"
            v-model="form.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            :rules="[{ required: true, message: '请填写邮箱' }]"
          />
          <van-field
            v-if="loginType === 'phone'"
            v-model="form.phone"
            type="number"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请填写手机号' },{ pattern: /^1[3-9]\\d{9}$/, message: '手机号格式错误' }]"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </van-cell-group>
        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit">
            提交
          </van-button>
        </div>
      </van-form>
      <!-- 👇 新增：第三方登录入口 -->
      <van-divider>第三方登录</van-divider>
      <div style="margin: 16px;">
        <van-button round block plain type="primary" @click="handleAlipayLogin">
          支付宝登录
        </van-button>
      </div>
      <!-- 登录方式切换 -->
      <div class="login-switch">
          <div @click="loginType = 'username'">用户名登录</div>
          <div @click="loginType = 'email'">邮箱登录</div>
          <div @click="loginType = 'phone'">手机号登录</div>
      </div>
      <!-- 忘记密码 -->
      <div class="login-forgot">
        <div @click="handleForgotPassword">忘记密码？</div>
      </div>
      <!-- 注册账号 -->
      <div class="login-register">
        <div @click="handleRegister">还没有账号？去注册</div>
      </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showSuccessToast, showFailToast } from 'vant';
import router from '../../router';
import type { LoginData } from '@/api/user/types';
import Title from '@/components/login/title.vue'
import { useLoginStore } from '@/stores/modules/common/loginStore'

const loginStore = useLoginStore()
const form = ref<LoginData>({
  username: '',
  password: '',
  email: '',
  phone:''
})
const loginType = ref('username')


// 支付宝登录重定向
const handleAlipayLogin = () => {
  // 🌟 使用 Vite 的 import.meta.env 获取环境变量
  const APP_ID = import.meta.env.VITE_ALIPAY_APP_ID;
  const REDIRECT_URI = encodeURIComponent(import.meta.env.VITE_ALIPAY_REDIRECT_URI);
  const BASE_AUTH_URL = import.meta.env.VITE_ALIPAY_AUTH_URL;
  
  // 拼接授权链接
  const authUrl = `${BASE_AUTH_URL}?app_id=${APP_ID}&scope=auth_user&redirect_uri=${REDIRECT_URI}`;
  
  // 跳转
  window.location.href = authUrl;
}

const handleSubmit = async (e: Event) => {
  const sendData: any = { password: form.value.password, loginType: loginType.value };
  if(loginType.value === 'username'){
    if(!form.value.username){
      showFailToast('请输入用户名！');
      return;
    }
    sendData.username = form.value.username;
  }
  else if(loginType.value === 'email'){
    if(!form.value.email){
      showFailToast('请输入邮箱！');
      return;
    }
    sendData.email = form.value.email;
  }
  else if(loginType.value === 'phone'){
    if(!form.value.phone){
      showFailToast('请输入手机号！');
      return;
    }
    sendData.phone = form.value.phone;
  }
  if(!form.value.password){
    showFailToast('请输入密码！');
    return;
  }

  const res = await loginStore.loginAction(sendData);

  if (res.success) {
    showSuccessToast('登录成功！');
    // 根据 Store 返回的用户身份进行路由跳转
    if (res.userType === '普通用户') router.push('/');
    else if (res.userType === '商家') router.push('/merchant');
    else if (res.userType === '管理员') router.push('/manager');
    else router.push('/');
  } else {
    showFailToast(res.message);
  }

  // 清空表单
  form.value.username = '';
  form.value.password = '';
  form.value.email = '';
  form.value.phone = '';
}

// 忘记密码
const handleForgotPassword = () => {
  console.log('忘记密码');
  router.push('/login/forgetPwd');
}
// 注册账号
const handleRegister = () => {
  console.log('注册账号');
  router.push('/login/register');
}
</script>

<style scoped>

/* 登录方式切换 */
.login-switch {
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
}
.login-switch div {
  padding: 5px 10px;
  cursor: pointer;
  font-size:10px;
}
.login-switch div:hover {
  color: #409eff;
}

/* 忘记密码 */
.login-forgot {
  text-align: center;
  margin-bottom: 5px;
}
.login-forgot div {
  padding: 5px 10px;
  cursor: pointer;
  font-size:10px;
}
.login-forgot div:hover {
  color: #409eff;
}
/* 注册账号 */
.login-register {
  text-align: center;
  margin-bottom: 5px;
}
.login-register div {
  padding: 5px 5px;
  cursor: pointer;
  font-size:10px;
}
.login-register div:hover {
  color: #409eff;
}
</style>
