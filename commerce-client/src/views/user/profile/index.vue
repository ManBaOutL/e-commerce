<template>
  <div class="profile-page">
    <div class="profile-form">

      <div class="item">
        <label>头像</label>
        <el-upload
          class="avatar-uploader"
          action="/api/user/media/upload"  
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :disabled="!isEdit"
          accept="image/*"
        >
          <div class="img-wrapper">
            <el-avatar :src="getFullUrl(userForm.img)" :size="80">
              <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
            </el-avatar>
            <div class="edit-mask" v-if="isEdit">
              <el-icon color="#fff" :size="20"><Camera /></el-icon>
            </div>
          </div>
        </el-upload>
      </div>

      <div class="item">
        <label>用户名</label>
        <el-input v-model="userForm.username" :disabled="!isEdit" placeholder="请输入用户名" class="input-el" />
      </div>

      <div class="item">
        <label>账户余额</label>
        <div class="balance-display" style="flex: 1; display: flex; align-items: center; gap: 15px;">
          <span style="font-size: 20px; color: #ff5000; font-weight: bold;">
            ¥ {{ Number(userForm.balance || 0).toFixed(2) }}
          </span>
          <el-button type="success" size="small" plain @click="rechargeDialogVisible = true">模拟充值</el-button>
          <el-button type="warning" size="small" plain @click="withdrawDialogVisible = true">模拟提现</el-button>
        </div>
      </div>

      <div class="item">
        <label>用户类型</label>
        <el-input v-model="userForm.type" disabled class="input-el" />
      </div>

      <div class="item">
        <label>邮箱</label>
        <el-input v-model="userForm.email" :disabled="!isEdit" placeholder="请输入邮箱" class="input-el" @change="handleContactChange" />
      </div>

      <div class="item">
        <label>手机号</label>
        <el-input v-model="userForm.phone" :disabled="!isEdit" placeholder="请输入手机号" class="input-el phone-input" @change="handleContactChange" />
        <el-button v-if="isEdit && needCode" type="primary" :disabled="codeDisabled" @click="getCode" class="code-btn">
          {{ codeText }}
        </el-button>
      </div>

      <div class="item" v-if="isEdit && needCode">
        <label>验证码</label>
        <el-input v-model="verifyCode" placeholder="由于您修改了联系方式，请输入验证码" class="input-el" />
      </div>

      <div class="item">
        <label>年龄</label>
        <el-input v-model.number="userForm.age" :disabled="!isEdit" placeholder="请输入年龄" class="input-el" />
      </div>

      <div class="item">
        <label>性别</label>
        <el-radio-group v-model="userForm.gender" :disabled="!isEdit" class="radio-el">
          <el-radio value="男">男</el-radio>
          <el-radio value="女">女</el-radio>
          <el-radio value="保密">保密</el-radio>
        </el-radio-group>
      </div>

      <div class="item">
        <label>会员状态</label>
        <el-input :value="userForm.is_vip ? 'VIP 会员' : '普通用户'" disabled class="input-el" />
      </div>

      <div class="item-btn">
        <el-button v-if="!isEdit" type="primary" icon="Edit" @click="startEdit">修改资料</el-button>
        <template v-else>
          <el-button type="primary" :loading="loading" @click="save">保存设置</el-button>
          <el-button @click="cancel">取消</el-button>
        </template>
      </div>
    </div>

    <el-dialog v-model="rechargeDialogVisible" title="账户充值" width="400px" destroy-on-close>
      <div style="margin-bottom: 15px; color: #666; display: flex; justify-content: space-between; align-items: center;">
        <span>当前余额: <strong style="color: #ff5000;">¥{{ Number(userForm.balance || 0).toFixed(2) }}</strong></span>
        <el-tag size="small" type="info">单次限额: ¥50,000</el-tag>
      </div>
      <el-input-number 
        v-model="rechargeAmount" 
        :min="0.01" 
        :max="50000" 
        :precision="2" 
        :step="100" 
        style="width: 100%;" 
        placeholder="请输入充值金额" 
      />
      <template #footer>
        <el-button @click="rechargeDialogVisible = false">取消</el-button>
        <el-button type="success" :loading="balanceLoading" @click="handleRecharge">确认充值</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="withdrawDialogVisible" title="账户提现" width="400px" destroy-on-close>
      <div style="margin-bottom: 15px; color: #666;">可提现余额: ¥{{ Number(userForm.balance || 0).toFixed(2) }}</div>
      <el-input-number v-model="withdrawAmount" :min="0.01" :precision="2" :step="100" style="width: 100%;" placeholder="请输入提现金额" />
      <template #footer>
        <el-button @click="withdrawDialogVisible = false">取消</el-button>
        <el-button type="warning" :loading="balanceLoading" @click="handleWithdraw">确认提现</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useLoginStore } from '@/stores/modules/common/loginStore'
import { useUserStore } from '@/stores/modules/user/userStore'
import getFullUrl from '@/utils/getFullUrl'

const loginStore = useLoginStore()
const userStore = useUserStore()
const { userInfo, token } = storeToRefs(loginStore)

const isEdit = ref<boolean>(false)
const loading = ref<boolean>(false)

// 🌟 扩展表单结构，加入 balance
const userForm = reactive<any>({
  user_id: 0,
  img: '',
  username: '',
  type: undefined,
  email: '',
  phone: '',
  age: 0,
  gender: '保密',
  is_vip: 0,
  balance: 0 
})

const originForm = ref<any>({})
const verifyCode = ref<string>('')
const needCode = ref<boolean>(false)
let timer: ReturnType<typeof setInterval> | null = null

const initForm = () => {
  if (userInfo?.value) {
    Object.assign(userForm, {
      img: userInfo.value.img || '',
      username: userInfo.value.username || '',
      type: userInfo.value.type || '普通用户',
      email: userInfo.value.email || '',
      phone: userInfo.value.phone || '',
      age: userInfo.value.age || null,
      gender: userInfo.value.gender || '保密',
    })
    originForm.value = JSON.parse(JSON.stringify(userForm))
  }
}

onMounted(async () => {
  const res = await userStore.getUserInfo()
  userForm.balance = res.data.balance || 0
  userForm.is_vip = res.data.is_vip || 0
  initForm()
})

// === 头像上传逻辑 ===
const uploadHeaders = computed(() => {
  const cleanToken = (token.value || '').replace(/(^"|"$)/g, '')
  return { Authorization: `Bearer ${cleanToken}` }
})

const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 5
  if (!isImage) ElMessage.error('头像只能是图片格式!')
  if (!isLt2M) ElMessage.error('头像图片大小不能超过 5MB!')
  return isImage && isLt2M
}

const handleAvatarSuccess: UploadProps['onSuccess'] = (res) => {
  if (res.success || res.code === 200) {
    userForm.img = res.data.url || res.data 
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败')
  }
}

// === 修改与验证逻辑 ===
const startEdit = () => {
  isEdit.value = true
  needCode.value = false
  verifyCode.value = ''
}

const handleContactChange = () => {
  if (userForm.phone !== originForm.value.phone || userForm.email !== originForm.value.email) {
    needCode.value = true
  } else {
    needCode.value = false
  }
}

const codeDisabled = ref<boolean>(false)
const codeText = ref<string>('获取验证码')

const getCode = async () => {
  if (!userForm.phone) return ElMessage.warning('请输入手机号')
  try {
    codeDisabled.value = true
    const res: any = await loginStore.sendCodeAction({
      phone: userForm.phone,
      scene: 'update_profile'
    })
    if (res.success) {
      ElMessage.success('验证码已发送')
      let sec = 60
      codeText.value = `${sec}s 重新获取`
      timer = setInterval(() => {
        sec--
        codeText.value = `${sec}s 重新获取`
        if (sec <= 0) {
          if (timer) clearInterval(timer)
          codeDisabled.value = false
          codeText.value = '获取验证码'
        }
      }, 1000)
    } else {
      ElMessage.error(res.message || '发送失败')
      codeDisabled.value = false
    }
  } catch (error) {
    codeDisabled.value = false
  }
}

// === 保存与取消 ===
const save = async () => {
  if (!userForm.username.trim()) return ElMessage.warning('用户名不能为空')
  if (needCode.value && !verifyCode.value) return ElMessage.warning('请输入验证码')
  try {
    loading.value = true
    const payload: Record<string, any> = {
      username: userForm.username,
      img: userForm.img,
      email: userForm.email,
      phone: userForm.phone,
      age: userForm.age,
      gender: userForm.gender
    }
    if (needCode.value) payload.code = verifyCode.value

    const res: any = userStore.updateUserInfo(payload)
    if (res.success || res.status === 200) {
      ElMessage.success('个人资料更新成功')
      const finalAvatarUrl = res.data?.avatar || payload.img;
      payload.img = finalAvatarUrl;
      userForm.img = finalAvatarUrl;
      loginStore.userInfo = { ...loginStore.userInfo, ...payload } as any
      localStorage.setItem('userInfo', JSON.stringify(loginStore.userInfo))
      originForm.value = JSON.parse(JSON.stringify(userForm))
      isEdit.value = false
      needCode.value = false
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    ElMessage.error('服务器异常')
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  Object.assign(userForm, originForm.value)
  isEdit.value = false
  needCode.value = false
  verifyCode.value = ''
  if (timer) clearInterval(timer)
  codeDisabled.value = false
  codeText.value = '获取验证码'
}

// ================= 🌟 充值与提现逻辑 =================
const rechargeDialogVisible = ref(false)
const withdrawDialogVisible = ref(false)
const rechargeAmount = ref(100)
const withdrawAmount = ref(0)
const balanceLoading = ref(false)

// 处理充值
const handleRecharge = async () => {
  if (rechargeAmount.value <= 0) return ElMessage.warning('金额必须大于 0')
  balanceLoading.value = true
  try {
    // 调后端真实接口（用 axios 的实例 request 直接发请求）
    const res: any = await userStore.userRecharge({ amount: rechargeAmount.value })
    if (res.success) {
      ElMessage.success(`成功充值 ¥${rechargeAmount.value}`)
      userForm.balance = Number(userForm.balance) + rechargeAmount.value
      // 更新全局 Store
      loginStore.userInfo.balance = userForm.balance
      localStorage.setItem('userInfo', JSON.stringify(loginStore.userInfo))
      rechargeDialogVisible.value = false
      rechargeAmount.value = 100 // 重置输入框
    } else {
      ElMessage.error(res.message || '充值失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('网络异常，无法充值')
  } finally {
    balanceLoading.value = false
  }
}

// 处理提现
const handleWithdraw = async () => {
  if (withdrawAmount.value <= 0) return ElMessage.warning('金额必须大于 0')
  if (withdrawAmount.value > Number(userForm.balance)) return ElMessage.warning('余额不足')
  balanceLoading.value = true
  try {
    const res: any = await userStore.userWithdraw({ amount: withdrawAmount.value })
    if (res.success) {
      ElMessage.success(`成功提现 ¥${withdrawAmount.value}`)
      userForm.balance = Number(userForm.balance) - withdrawAmount.value
      // 更新全局 Stor
      withdrawDialogVisible.value = false
      withdrawAmount.value = 0
    } else {
      ElMessage.error(res.message || '提现失败')
    }
  } catch (error) {
    ElMessage.error('网络异常，无法提现')
  } finally {
    balanceLoading.value = false
  }
}
</script>

<style scoped>
.profile-page { width: 100%; padding: 30px; background: #fff; border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05); }
.profile-form { width: 100%; max-width: 600px; display: flex; flex-direction: column; }
.item { display: flex; align-items: center; margin-bottom: 24px; }
.item label { width: 90px; font-size: 14px; color: #606266; font-weight: 500; flex-shrink: 0; }
.input-el { flex: 1; }
.phone-input { margin-right: 12px; }
.radio-el { flex: 1; }
.code-btn { width: 120px; flex-shrink: 0; }
.item-btn { margin-top: 20px; padding-left: 90px; display: flex; gap: 15px; }

.avatar-uploader { cursor: pointer; }
.img-wrapper { position: relative; border-radius: 50%; overflow: hidden; display: inline-block; }
.edit-mask { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s; }
.img-wrapper:hover .edit-mask { opacity: 1; }
</style>