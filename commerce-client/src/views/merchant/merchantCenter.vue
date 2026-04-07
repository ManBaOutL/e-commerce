<template>
  <div class="shop-page">
    <h3>商家中心 - 店铺管理</h3>

    <div class="card">
      <!-- 头像 -->
      <div class="avatar" :style="{ bg: color }">{{ nameFirst }}</div>

      <!-- 信息展示 -->
      <div class="item"><label>店铺名称：</label>{{ shop.name }}</div>
      <div class="item"><label>店铺简介：</label>{{ shop.intro }}</div>
      <div class="item"><label>所属人：</label>{{ user.name }}</div>
      <div class="item"><label>邮箱：</label>{{ user.email }}</div>
      <div class="item"><label>电话：</label>{{ user.phone }}</div>
      <div class="item"><label>入驻时间：</label>{{ shop.createTime }}</div>
      <div class="item"><label>审核状态：</label>
        <el-tag type="success">{{ shop.status }}</el-tag>
      </div>

      <!-- 按钮 -->
      <div class="btns">
        <el-button type="primary" @click="openEdit">修改资料</el-button>
        <el-button type="success" @click="openPwd">修改密码</el-button>
      </div>
    </div>

    <!-- 修改资料弹窗 -->
    <el-dialog v-model="showEdit" title="修改店铺资料">
      <el-input v-model="shop.name" placeholder="店铺名称" class="mb10" />
      <el-input v-model="shop.intro" type="textarea" rows="3" placeholder="简介" />
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="showPwd" title="修改登录密码">
      <el-input v-model="pwd.new" placeholder="新密码" show-password class="mb10" />
      <el-input v-model="pwd.confirm" placeholder="确认密码" show-password />
      <template #footer>
        <el-button @click="showPwd = false">取消</el-button>
        <el-button type="success" @click="savePwd">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 展示数据
const shop = ref({
  name: '优品数码店',
  intro: '主营数码3C产品，正品保障',
  createTime: '2026-04-07',
  status: '已通过'
})
const user = ref({
  name: '张伟',
  email: 'zhangwei@qq.com',
  phone: '13800138002'
})

// 头像
const color = '#409EFF'
const nameFirst = computed(() => shop.value.name.substring(0, 2))

// 弹窗
const showEdit = ref(false)
const showPwd = ref(false)
const pwd = ref({ old: '', new: '', confirm: '' })

// 打开弹窗
const openEdit = () => showEdit.value = true
const openPwd = () => showPwd.value = true

// 保存资料
const saveEdit = () => {
  showEdit.value = false
  ElMessage.success('资料已保存')
}

// 保存密码
const savePwd = () => {
  if (pwd.value.new !== pwd.value.confirm) return ElMessage.error('两次密码不一致')
  showPwd.value = false
  ElMessage.success('密码修改成功')
}
</script>

<style scoped>
.shop-page {max-width: 600px; margin: 30px auto; padding: 20px}
.card {background: #fff; padding: 25px; border-radius: 8px; text-align: center}
.avatar {width: 70px; height: 70px; border-radius: 50%; background: #409EFF;
         color: #fff; font-size: 22px; font-weight: bold;
         display: flex; align-items: center; justify-content: center;
         margin: 0 auto 20px}
.item {text-align: left; margin: 12px 0; font-size: 14px}
label {font-weight: 500; width: 90px; display: inline-block}
.btns {margin-top: 20px; display: flex; gap: 15px; justify-content: center}
.mb10 {margin-bottom: 10px}
</style>