<template>
  <div class="register-container">
    <!-- 注册标题 -->
    <Title>新用户注册</Title>
    <van-form @submit="handleSubmit" class="register-form">
      <!-- 手机号输入框 -->
      <van-field
        v-if="form.method === 'phone'"
        v-model="form.phone"
        name="phone"
        label="手机号"
        placeholder="请输入11位手机号"
        required
        :rules="[{ required: true, message: '请输入手机号' }, { pattern: phoneReg, message: '请输入正确的手机号' }]"
      />

      <van-field
        v-if="form.method === 'email'"
        v-model="form.email"
        name="email"
        label="邮箱"
        placeholder="请绑定邮箱"
        required
        :rules="[
          //{ pattern: /^[a-zA-Z0-9_]+@[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)+$/, message: '请输入正确的邮箱格式' }
        ]"
      />

      <!-- 验证码输入框 + 获取验证码按钮 -->
      <van-field
        v-model="form.code"
        name="code"
        label="验证码"
        placeholder="请输入6位验证码"
        required
        :rules="[{ required: true, message: '请输入验证码' }, { pattern: /^\d{6}$/, message: '请输入正确的验证码' }]"
      >
        <template #button>
          <van-button 
            type="primary" 
            size="small" 
            :disabled="codeDisabled"
            @click="getCode"
          >
            {{ codeText }}
          </van-button>
        </template>
      </van-field>

      
      <van-field name="radio" label="身份选择">
        <template #input>
          <van-radio-group v-model="form.type" direction="vertical">
            <van-radio name="普通用户" icon-size="15px">普通用户</van-radio>
            <van-radio name="商家" icon-size="15px">商家</van-radio>
            <van-radio name="管理员" icon-size="15px">管理员</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      
      <van-field
        v-model="form.username"
        name="username"
        label="用户名"
        placeholder="请输入用户名"
        required
        :rules="[
          { required: true, message: '请输入用户名' },
          { pattern: /^[a-zA-Z0-9_]{4,16}$/, message: '用户名只能包含字母、数字和下划线，4-16位' }
        ]"
      />

      <!-- 密码输入框 -->
      <van-field
        v-model="form.password"
        name="password"
        label="设置密码"
        type="password"
        placeholder="请输入6-16位密码"
        required
        :rules="[
          { required: true, message: '请输入密码' },
        ]"
      />

      <!-- 确认密码输入框 -->
      <van-field
        v-model="form.repassword"
        name="repassword"
        label="确认密码"
        type="password"
        placeholder="请再次输入密码"
        :rules="[
          { required: true, message: '请确认密码' },
          { validator: validateRepassword, message: '两次密码不一致' }
        ]"
        required
      />

      <!-- 注册按钮 -->
      <van-button type="primary" native-type="submit" block class="register-btn">
        立即注册
      </van-button>
    </van-form>
    <!-- 登录跳转 -->
    <div style="margin:16px 10px;">
      <van-button type="default" block class="login-btn" @click="goLogin">
        已有账号？去登录
      </van-button>
    </div>
    <!-- 注册方式切换 -->
      <div class="login-switch">
          <div @click="form.method='email'">邮箱注册</div>
          <div @click="form.method='phone'">手机号注册</div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref ,onUnmounted} from 'vue';
import { showToast, showSuccessToast, showFailToast } from 'vant';
import router from '@/router'; // 引入路由模块
import request from '@/utils/request'; // 复用你之前的request封装
import Title from '@/components/login/title.vue'
import { register } from '@/api/user/user'; // 引入注册接口
import { useRouter } from 'vue-router';


// 表单数据
const form = ref({
  phone: '',
  code: '',
  username: '',
  email: '',
  password: '',
  repassword: '',
  type: '普通用户',
  method:'phone',
});

// 验证码相关
const codeDisabled = ref(false);
const codeText = ref('获取验证码');
let timer: NodeJS.Timeout | null = null;

// 手机号正则
const phoneReg = /^1[3-9]\d{9}$/;

// 确认密码校验
const validateRepassword = (val: string) => {
  return val === form.value.password;
};

// 获取验证码
const getCode = async () => {
  // 前置校验手机号
  if (!phoneReg.test(form.value.phone)) {
    showToast('请输入正确的11位手机号');
    return;
  }

  if (codeDisabled.value) return;

  try {
    // 调用后端获取验证码接口
    const res = await request.post('/code', {
      phone: form.value.method === 'phone' ? form.value.phone : '',
      email: form.value.method === 'email' ? form.value.email : '',
      scene: 'register'
    });

    showSuccessToast(`验证码已发送`);

    // 启动倒计时
    codeDisabled.value = true;
    let count = 60;
    codeText.value = `${count}s后重新获取`;
    timer = setInterval(() => {
      count--;
      codeText.value = `${count}s后重新获取`;
      if (count <= 0) {
        clearInterval(timer!);
        codeDisabled.value = false;
        codeText.value = '获取验证码';
      }
      if(count >= 20){
        showToast({
          message:`验证码已发送：${res.data}`,
          position:'top'
        });
      }
    }, 1000);
  } catch (err: any) {
    codeDisabled.value = false;
    showFailToast(err?.msg || '获取验证码失败');
  }
};

// 提交注册
const handleSubmit = async () => {
  console.log('handleSubmit', form.value);
  // try {
  //   // 调用后端注册接口
  //   const res = await request.post('/register', {
  //     phone: form.value.phone,
  //     code: form.value.code,
  //     password: form.value.password
  //   });
  //   showToast('注册成功，即将跳转到登录页');
    
  //   // 注册成功后跳转登录页（需引入路由）
  //   // import { useRouter } from 'vue-router';
  //   // const router = useRouter();
  //   // setTimeout(() => {
  //   //   router.push('/login');
  //   // }, 1500);
  // } catch (err: any) {
  //   showToast(err.response?.data?.message || '注册失败');
  // }
  // 调用后端注册接口
  const res = await register({
    phone: form.value.method === 'phone' ? form.value.phone : '',
    code: form.value.code,
    username: form.value.username,
    email: form.value.method === 'email' ? form.value.email : '',
    password: form.value.password,
    repassword: form.value.repassword,
    type: form.value.type,
  });
  showToast('注册成功，即将跳转到登录页');
  
  //注册成功后跳转登录页（需引入路由）
  const router = useRouter();
  setTimeout(() => {
    router.push('/login');
  }, 1500);

};

// 登录跳转
const goLogin = () => {
  console.log('goLogin');
  router.push('/login');
}

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.register-container {
  padding-top: 46px; /* 适配导航栏 */
  padding: 46px 16px 0;
}

.register-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.register-form {
  margin-top: 20px;
}

.register-btn {
  margin-top: 30px;
}

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
</style>