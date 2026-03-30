<template>
  <!-- 忘记密码标题 -->
  <Title>忘记密码</Title>
  <!-- 忘记密码表单 -->
  <van-form @submit="handleSubmit">
    <van-cell-group inset>
      <van-field
        v-if="form.type === 'phone'"
        v-model="form.phone"
        label="手机号"
        placeholder="请输入绑定的手机号"
        label-align="top"
      />
      <van-field
        v-if="form.type === 'email'"
        v-model="form.email"
        label="邮箱"
        placeholder="请输入邮箱"
        label-align="top"
      />
      <van-field
         v-model="form.code"
        label="验证码"
        placeholder="请输入验证码"
        label-align="top"
      >
        <template #button>
          <van-button size="small" type="primary" @click="getCode" :disabled="codeDisabled">{{codeText}}</van-button>
        </template>
      </van-field>
      <van-field
        v-model="form.newPwd"
        label="新密码"
        placeholder="请输入新密码"
        label-align="top"
      />
      <van-field
        v-model="form.repeatPwd"
        label="确认新密码"
        placeholder="请确认新密码"
        label-align="top"
      />
    </van-cell-group>
    <div style="margin: 16px;">
      <van-button round block type="primary" native-type="submit">
        提交
      </van-button>
    </div>
  </van-form>
  <!-- 返回登录页 -->
    <div style="margin: 16px;">
      <van-button round block type="default" @click="handleBackLogin">
        返回登录页
      </van-button>
    </div>
    <!-- 密码找回方式切换 -->
      <div class="login-switch">
          <div @click="form.type='email'">邮箱登录</div>
          <div @click="form.type='phone'">手机号登录</div>
      </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast, showFailToast, showToast } from 'vant';
import { sendCode, resetPassword } from '@/api/user/user';
import type { ForgetCodeData } from '@/api/user/types';
import Title from '@/components/login/title.vue'


const router = useRouter();
const loading = ref(false);
// 表单数据
const form = ref<ForgetCodeData>({
  phone: '',
  code: '',
  newPwd: '',
  repeatPwd: '',
  email: '',
  type: 'phone'
});
// 验证码倒计时
const codeDisabled = ref(false);
const codeText = ref('获取验证码');
let timer: NodeJS.Timeout | null = null;

const handleSubmit = async ()=>{
  console.log("忘记密码提交表单数据:", form.value);
  // 校验验证码
  const res:any = await resetPassword({
    phone: form.value.type === 'phone' ? form.value.phone : '',
    email: form.value.type === 'email' ? form.value.email : '',
    code: form.value.code,
    newPwd: form.value.newPwd,
    repeatPwd: form.value.repeatPwd,
    type: form.value.type
  });
  console.log("重置密码响应:", res); 
  if(res.status === 200){
    showSuccessToast('密码重置成功');
    router.push('/login');
  } else {
    showFailToast(res.message || '密码重置失败');
  }
}

// 返回登录页
const handleBackLogin = () => {
  router.push('/login');
}

// 获取验证码
const getCode = async () => {
  // 校验手机号或邮箱
  if (!form.value.phone && !form.value.email) {
    showFailToast('请输入手机号或邮箱');
    return;
  }
  // 简单的手机号格式校验
  const phoneReg = /^1[3-9]\d{9}$/;
  // 简单的邮箱格式校验
  const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (form.value.email && !emailReg.test(form.value.email)) {
    showFailToast('请输入正确的邮箱格式');
    return;
  }

  const sendData = {
    phone: form.value.phone,
    email: form.value.email,
    scene: 'forget'
  };

  try {
    const res:any = await sendCode(sendData);
    showSuccessToast(`验证码已发送`);

    
    // 倒计时逻辑
    codeDisabled.value = true;
    let count = 30;
    codeText.value = `${count}s后重新获取`;
    timer = setInterval(() => {
      count--;
      codeText.value = `${count}s后重新获取`;
      if(count >= 20){
        showToast({
          message:`验证码已发送：${res.data}`,
          position:'top'
        });
      }
      if (count <= 0) {
        clearInterval(timer!);
        codeDisabled.value = false;
        codeText.value = '获取验证码';
      }
      //console.log(count);
    }, 1000);
  } catch (error: any) {
    showFailToast(error?.msg || '获取验证码失败');
  }
};

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.forgot-pwd-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.code-item {
  flex-direction: row;
  align-items: flex-end;
  gap: 10px;
}
.code-input {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-item label {
  font-size: 14px;
  color: #333;
}
.form-item input {
  padding: 10px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
}
.get-code-btn {
  padding: 10px 15px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}
.get-code-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}
.submit-btn {
  padding: 10px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}
.submit-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
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