<template>
  <div class="shop-page">
    <h3>商家中心 - 店铺管理</h3>
    <div class="card">
      <!-- 头像：有图显示图，没图显示文字 -->
      <div v-if="user && user.img" class="avatar-img">
        <img :src="getFullUrl(user.img)" alt="头像" />
      </div>
      <div v-else class="avatar" :style="{ background: color }">{{ nameFirst }}</div>

      <div class="item"><label>店铺名称：</label>{{ shop.shop_name }}</div>
      <div class="item"><label>店铺描述：</label>{{ shop.description }}</div>
      <div class="item"><label>用户名：</label>{{ user.username }}</div>
      <div class="item"><label>邮箱：</label>{{ user.email }}</div>
      <div class="item"><label>电话：</label>{{ user.phone }}</div>
      <div class="item"><label>账户余额：</label><span style="color: #f56c6c; font-weight: bold;">¥{{ (user.balance || 0).toFixed(2) }}</span></div>
      <div class="item"><label>创建时间：</label>{{ user.create_time }}</div>
      <div class="item"><label>状态：</label>
        <el-tag type="success">{{ user.status }}</el-tag>
      </div>

      <div class="btns">
        <el-button type="primary" @click="openUserDialog">用户信息</el-button>
        <el-button type="success" @click="openShopDialog">店铺信息</el-button>
        <el-button type="warning" @click="openPwdDialog">修改密码</el-button>
      </div>
    </div>

    <!-- 用户信息弹窗 -->
    <el-dialog v-model="showUserDialog" title="用户信息">
      <el-form 
        :model="user" 
        :rules="userFormRules" 
        ref="userFormRef" 
        label-width="80px"
      >
        <el-form-item label="头像">
          <el-upload
            v-if="userEdit"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            action="/api/user/media/upload"
            :headers="uploadHeaders"
            :on-error="handleAvatarError"
          >
            <img v-if="user.img" :src="getFullUrl(user.img)" class="user-img" />
            <div v-else class="user-img-placeholder">点击上传</div>
          </el-upload>

          <div v-else>
            <img v-if="user.img" :src="getFullUrl(user.img)" class="user-img" />
            <div v-else class="avatar" :style="{ background: color }">{{ nameFirst }}</div>
          </div>
          <div class="tip">注：你的用户头像将作为店铺的头像，请谨慎上传！</div>
        </el-form-item>

        <el-form-item label="用户编号"><div>{{ user.user_id }}</div></el-form-item>
        <el-form-item label="账号类型"><div>{{ user.type }}</div></el-form-item>
        
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username" :disabled="!userEdit" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="user.email" :disabled="!userEdit" />
        </el-form-item>
        
        <el-form-item label="电话" prop="phone">
          <el-input v-model="user.phone" :disabled="!userEdit" />
        </el-form-item>
        
        <el-form-item label="年龄" prop="age">
          <el-input v-model="user.age" :disabled="!userEdit" type="number" />
        </el-form-item>
        
        <el-form-item label="性别" prop="gender">
          <el-select v-model="user.gender" :disabled="!userEdit" placeholder="请选择性别">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
            <el-option label="保密" value="保密" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="创建时间"><div>{{ user.create_time }}</div></el-form-item>
        <el-form-item label="更新时间"><div>{{ user.update_time }}</div></el-form-item>
        <el-form-item label="状态"><div>{{ user.status }}</div></el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showUserDialog = false,user.img = imgPath">关闭</el-button>
        <el-button v-if="!userEdit" type="primary" @click="userEdit = true">修改</el-button>
        <el-button v-if="userEdit" type="success" @click="saveUser">保存</el-button>
        <el-button v-if="userEdit" @click="userEdit = false, user.img = imgPath">取消</el-button>
      </template>
    </el-dialog>

    <!-- 店铺信息弹窗 -->
    <el-dialog v-model="showShopDialog" title="店铺信息">
      <el-form label-width="100px">
        <el-form-item label="店铺编号"><div>{{ shop.shop_id }}</div></el-form-item>
        <el-form-item label="店铺名称">
          <el-input v-model="shop.shop_name" :disabled="!shopEdit" />
        </el-form-item>
        <el-form-item label="店铺描述">
          <el-input type="textarea" rows="3" v-model="shop.description" :disabled="!shopEdit" />
        </el-form-item>
        <el-form-item label="创建时间"><div>{{ shop.create_time }}</div></el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showShopDialog = false">关闭</el-button>
        <el-button v-if="!shopEdit" type="success" @click="shopEdit = true">修改</el-button>
        <el-button v-if="shopEdit" type="primary" @click="saveShop">保存</el-button>
        <el-button v-if="shopEdit" @click="shopEdit = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="showPwdDialog" title="修改登录密码">
      <el-input v-model="pwdForm.newPwd" show-password placeholder="请输入新密码" class="mb10" />
      <el-input v-model="pwdForm.confirmPwd" show-password placeholder="请确认新密码" />
      <template #footer>
        <el-button @click="showPwdDialog = false">取消</el-button>
        <el-button type="warning" @click="savePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useMerchantStore } from '@/stores/modules/merchantStore'
import { useLoginStore } from '@/stores/modules/common/loginStore' // 新增引入
import getFullUrl from '@/utils/getFullUrl' // 新增路径工具引入

const merchantStore = useMerchantStore()
const loginStore = useLoginStore()

// 新增上传headers计算属性
const uploadHeaders = computed(() => {
  const cleanToken = (loginStore.token || '').replace(/(^"|"$)/g, '')
  return { Authorization: `Bearer ${cleanToken}` }
})

onMounted(async () => {
  try {
    await merchantStore.getShop()
    user.value = merchantStore.user
    console.log("商家中心获取用户信息:", user.value)
    shop.value = merchantStore.shop
    //console.log("商家中心获取店铺信息:", shop.value)
    imgPath.value = user.value.img // 新增：保存原始图片路径

  } catch (e) {
    console.log(e)
    ElMessage.error('获取商家信息失败')
  }
})

const user = ref({
  user_id: 10001,
  type: "merchant",
  username: "商家测试账号",
  email: "merchant@test.com",
  phone: "13800138000",
  age: 28,
  gender: "男",
  balance: 0,
  create_time: "2025-01-01 12:00:00",
  update_time: "2025-05-01 15:30:00",
  img: "",
  status: "正常"
})

const shop = ref({
  shop_id: 2001,
  shop_name: "优品数码专营店",
  description: "主营手机、电脑、数码配件，正品保障",
  create_time: "2025-01-10 10:00:00"
})

const color = '#409EFF'
const nameFirst = computed(() => shop.value.shop_name?.substring(0, 2) || '商')

const showUserDialog = ref(false)
const showShopDialog = ref(false)
const showPwdDialog = ref(false)
const userEdit = ref(false)
const shopEdit = ref(false)

const userFormRef = ref(null)
const imgPath = ref(null) // 新增：保存原始图片路径，取消修改时恢复
// 用户表单校验规则
const userFormRules = ref({
  username: [
    { min: 2, max: 20, message: '用户名长度 2-20 位', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  // 这里替换成下面任意一种写法
  age: [
    {
      pattern: /^$|^([1-9]|[1-9]\d|1[01]\d|120)$/,
      message: '年龄必须在 1-120 之间',
      trigger: 'blur'
    }
  ],
  gender: []
})

const pwdForm = ref({ newPwd: '', confirmPwd: '' })

const openUserDialog = () => {
  userEdit.value = false
  showUserDialog.value = true
  nextTick(() => {
    if (userFormRef.value) {
      userFormRef.value.clearValidate()
    }
  })
  //console.log("打开用户信息弹窗，用户信息:", user.value)
}
const openShopDialog = () => { shopEdit.value = false; showShopDialog.value = true }
const openPwdDialog = () => { 
  pwdForm.value = { newPwd: '', confirmPwd: '' }
  showPwdDialog.value = true 
}

const saveUser = async () => {
  try {
    const valid = await userFormRef.value.validate()
    if (!valid) return
    ElMessage.success('用户信息保存成功')
    const operation = {
      operation: 'user',
      user:user.value
    }
    console.log("商家更新用户信息请求体: ", operation)
    merchantStore.updateShop(operation)
    userEdit.value = false
    console.log("保存用户信息:", user.value)
  } catch (e) {
    ElMessage.error('请检查表单信息')
  }
}

const saveShop = () => { 
  ElMessage.success('店铺信息保存成功')
  console.log("保存店铺信息:", shop.value)
    const operation = {
        operation: 'shop',
        shop:shop.value
      }
  merchantStore.updateShop(operation)
  shopEdit.value = false
 }

const savePassword = () => {
  const { newPwd, confirmPwd } = pwdForm.value
  if (!newPwd || !confirmPwd) return ElMessage.error('请输入完整密码')
  if (newPwd !== confirmPwd) return ElMessage.error('两次密码不一致')
  if(newPwd===user.value.password) return ElMessage.error('新密码不能与旧密码相同')
  ElMessage.success('密码修改成功！')
  const operation = {
    operation: 'password',
    password: newPwd
  }
  merchantStore.updateShop(operation)
  console.log("修改密码:", newPwd)
  showPwdDialog.value = false
}

const handleAvatarSuccess = (res) => {
  if (res.status === 200) {
    // 后端返回图片路径，直接赋值
    imgPath.value = user.value.img //原来user.img的路径
    user.value.img = res.data.url
    //console.log("上传成功，图片路径:", user.value.img)
    ElMessage.success('头像上传成功')
  } else {
    console.log("头像上传失败，后端返回:", res)
    ElMessage.error(res.message || '上传失败')
  }
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) { ElMessage.error('只能上传图片！'); return false }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) { ElMessage.error('图片大小不能超过 2MB！'); return false }
  return true
}

const handleAvatarError = () => {
  ElMessage.error('头像上传失败')
}


</script>

<style scoped>
.shop-page {max-width: 600px; margin: 30px auto; padding: 20px}
.card {background: #fff; padding: 25px; border-radius: 8px; text-align: center}

.avatar {
  width: 70px; height: 70px; border-radius: 50%; background: #409EFF;
  color: #fff; font-size: 22px; font-weight: bold;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
}
.avatar-img {
  width: 70px; height: 70px; margin: 0 auto 20px;
}
.avatar-img img {
  width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
}

.item {text-align: left; margin: 12px 0; font-size: 14px}
label {font-weight: 500; width: 90px; display: inline-block}
.btns {margin-top: 20px; display: flex; gap: 15px; justify-content: center}
.mb10 {margin-bottom: 10px}

.user-img { width: 70px; height: 70px; border-radius: 50%; object-fit: cover; }
.user-img-placeholder { width: 70px; height: 70px; border-radius: 50%; background: #f5f5f5; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; }
.tip {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 15px !important;
  margin-left: 10px;
  text-align: left;
  line-height: 1.4;
}
</style>