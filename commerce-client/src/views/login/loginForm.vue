<template>
      <!-- 登录标题 -->
       <Title>电商系统登录</Title>
      <!-- 登录表单 -->
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field
            v-if="type === 'username'"
            v-model="form.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
          <van-field
            v-if="type === 'email'"
            v-model="form.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            :rules="[{ required: true, message: '请填写邮箱' }]"
          />
          <van-field
            v-if="type === 'phone'"
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
      <!-- 登录方式切换 -->
      <div class="login-switch">
          <div @click="type = 'username'">用户名登录</div>
          <div @click="type = 'email'">邮箱登录</div>
          <div @click="type = 'phone'">手机号登录</div>
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
import request from '../../utils/request';
import { showSuccessToast, showFailToast } from 'vant';
import { send } from 'vite';
import router from '../../router';
import { login } from '@/api/user/user';
import type { LoginData } from '@/api/user/types';
import Title from '@/components/login/title.vue'
import { mockLogin } from '@/api/user/user';

const form = ref<LoginData>({
  username: '',
  password: '',
  email: '',
  phone:''
})
const type = ref('username')


const handleSubmit = async (e: Event) => {
  const sendData = {} as any
  if(type.value === 'username'){
    if(!form.value.username){
      showFailToast('请输入用户名！');
      return;
    }
    sendData.username = form.value.username;
  }
  else if(type.value === 'email'){
    if(!form.value.email){
      showFailToast('请输入邮箱！');
      return;
    }
    sendData.email = form.value.email;
  }
  else if(type.value === 'phone'){
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
  sendData.password = form.value.password;
  sendData.type = type.value;
  console.log(sendData);

  try {
    // 发起登录请求（baseURL 已封装，只需写相对路径）
    //const resData = await login(sendData);
    const resData:any = await mockLogin(sendData);
    console.log("登录模拟接口返回数据:", resData);

    // 登录成功处理
    showSuccessToast('登录成功！');
    //localStorage.setItem('token', JSON.stringify(resData.data));

    //模拟登录成功后，存储token
    localStorage.setItem('token', JSON.stringify(resData[0]));


    router.push('/');
  } catch (error) {
    console.error('登录失败：', error);
    showFailToast('登录失败！');
  }finally{
    // 登录完成后，清空表单数据,防止其他登录时使用
    form.value.username = '';
    form.value.password = '';
    form.value.email = '';
    form.value.phone = '';
  }
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
