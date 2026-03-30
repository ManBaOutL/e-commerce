<template>
  <div class="profile-page">
    <div class="profile-form">

      <!-- 头像 -->
      <div class="item">
        <label>头像</label>
        <el-avatar :src="userForm.avatar" :size="80" />
      </div>

      <!-- 用户名 -->
      <div class="item">
        <label>用户名</label>
        <el-input
          v-model="userForm.username"
          :disabled="!isEdit"
          placeholder="请输入用户名"
          class="input-el"
        />
      </div>

      <!-- 用户类型 -->
      <div class="item">
        <label>用户类型</label>
        <el-input
          v-model="userForm.type"
          disabled
          class="input-el"
        />
      </div>

      <!-- 邮箱 -->
      <div class="item">
        <label>邮箱</label>
        <el-input
          v-model="userForm.email"
          :disabled="!isEdit"
          placeholder="请输入邮箱"
          class="input-el"
        />
      </div>

      <!-- 手机号 + 验证码 -->
      <div class="item">
        <label>手机号</label>
        <el-input
          v-model="userForm.phone"
          :disabled="!isEdit"
          placeholder="请输入手机号"
          class="input-el phone-input"
        />
        <el-button
          v-if="isEdit"
          type="primary"
          :disabled="codeDisabled"
          @click="getCode"
          class="code-btn"
        >
          {{ codeText }}
        </el-button>
      </div>

      <!-- 验证码 -->
      <div class="item" v-if="isEdit">
        <label>验证码</label>
        <el-input
          v-model="verifyCode"
          placeholder="请输入验证码"
          class="input-el"
        />
      </div>

      <!-- 年龄 -->
      <div class="item">
        <label>年龄</label>
        <el-input
          v-model.number="userForm.age"
          :disabled="!isEdit"
          placeholder="请输入年龄"
          class="input-el"
        />
      </div>

      <!-- 性别 -->
      <div class="item">
        <label>性别</label>
        <el-radio-group v-model="userForm.gender" :disabled="!isEdit" class="radio-el">
          <el-radio label="男">男</el-radio>
          <el-radio label="女">女</el-radio>
          <el-radio label="保密">保密</el-radio>
        </el-radio-group>
      </div>

      <!-- 会员状态（修复这里！） -->
      <div class="item">
        <label>会员状态</label>
        <el-input
          :value="userForm.is_vip ? 'VIP' : '普通用户'"
          disabled
          class="input-el"
        />
      </div>

      <!-- 按钮 -->
      <div class="item-btn">
        <el-button v-if="!isEdit" type="primary" @click="isEdit = true">修改资料</el-button>
        <template v-else>
          <el-button type="primary" @click="save">保存</el-button>
          <el-button @click="cancel">取消</el-button>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const isEdit = ref(false)

const userForm = reactive({
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  username: 'testuser',
  type: '普通用户',
  email: 'test@demo.com',
  phone: '13800138000',
  age: 25,
  gender: '保密',
  is_vip: false
})

const originForm = JSON.parse(JSON.stringify(userForm))
const verifyCode = ref('')
const codeDisabled = ref(false)
const codeText = ref('获取验证码')

const getCode = () => {
  if (!userForm.phone) {
    ElMessage.warning('请输入手机号')
    return
  }
  codeDisabled.value = true
  codeText.value = '60s 重新发送'
  let sec = 60
  const timer = setInterval(() => {
    sec--
    codeText.value = sec + 's 重新发送'
    if (sec <= 0) {
      clearInterval(timer)
      codeDisabled.value = false
      codeText.value = '获取验证码'
    }
  }, 1000)
  ElMessage.success('验证码已发送（模拟：1234）')
}

const save = () => {
  if (!verifyCode.value) {
    ElMessage.warning('请输入验证码')
    return
  }
  isEdit.value = false
  ElMessage.success('保存成功')
}

const cancel = () => {
  Object.assign(userForm, originForm)
  isEdit.value = false
  verifyCode.value = ''
  ElMessage.info('已取消')
}
</script>

<style scoped>
.profile-page {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: #fff;
  box-sizing: border-box;
}
.profile-form {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
}
.item label {
  width: 100px;
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
}
.input-el {
  width: 100% !important;
  max-width: none !important;
}
.phone-input {
  width: calc(100% - 120px) !important;
  margin-right: 10px;
}
.radio-el {
  width: 100%;
}
.code-btn {
  width: 110px;
  flex-shrink: 0;
}
.item-btn {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
</style>