<template>
  <div class="home-page">
    <TheHeader />

    <main class="main-container">
      <el-row :gutter="20">
        <!-- 左侧菜单 -->
        <el-col :md="5" :sm="0" :xs="0">
          <div class="side-menu">
            <HomeMenu />
          </div>
        </el-col>
        <!-- 右侧轮播图 -->
        <el-col :md="14" :sm="24" :xs="24">
          <el-carousel height="380px" class="home-carousel" trigger="click">
            <el-carousel-item v-for="item in bannerList" :key="item.id">
              <div class="banner-wrapper" @click="handleBannerClick(item.link)">
                <img :src="item.image" :alt="item.title" class="banner-img" />
              </div>
            </el-carousel-item>
          </el-carousel>
        </el-col>
        <!-- 右侧用户信息 -->
        <el-col :lg="5" :md="0" :sm="0" :xs="0">
          <div class="user-panel">
            <el-avatar 
              :size="60" 
              :src="isLoggedIn ? getFullUrl(userInfo?.img) : ''" 
            />
            
            <p class="welcome-text">
              Hi, {{ isLoggedIn ? userInfo?.username : '欢迎来到商城!' }}
            </p>
            
            <div class="auth-btns" v-if="!isLoggedIn">
              <el-button type="primary" size="small" @click="handleToLogin">登录</el-button>
              <el-button size="small" plain @click="handleToRegister">注册</el-button>
            </div>

            <div class="auth-btns" v-else>
              <el-button type="primary" size="small" class="tb-manage-btn" @click="router.push('/user/house')">个人中心</el-button>
              <el-button size="small" plain @click="handleLogout">退出</el-button>
            </div>

            <!-- 商家/管理员管理按钮 -->
            <div v-if="showManageButton" class="manage-btn-wrap">
              <el-button 
                type="primary" 
                size="small" 
                class="tb-manage-btn"
                @click="goToManagePage"
              >
                <el-icon><Setting /></el-icon>
                {{ manageButtonText }}
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <section class="goods-section">
        <h3 class="grid-title">猜你喜欢</h3>
           <ProductPage />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue' // 🌟 新增 ref 和 onMounted
import { Setting } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import HomeMenu from './HomeMenu.vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'

// 静态兜底图片
import banner1 from '@/assets/images/banners/1.png'
import banner2 from '@/assets/images/banners/2.png'
import banner3 from '@/assets/images/banners/3.png'

import { useLoginStore } from '@/stores/modules/common/loginStore'
import getFullUrl from '@/utils/getFullUrl'

const router = useRouter()
const loginStore = useLoginStore()
const { userInfo, token } = storeToRefs(loginStore)

const isLoggedIn = computed(() => !!token.value)

// 判断是否显示管理按钮
const showManageButton = computed(() => {
  const userType = userInfo.value?.type
  return userType === '商家' || userType === '管理员'
})

// 管理按钮文字
const manageButtonText = computed(() => {
  const userType = userInfo.value?.type
  return userType === '管理员' ? '后台管理' : '商家管理'
})

// 跳转到对应管理页面
const goToManagePage = () => {
  const userType = userInfo.value?.type
  if (userType === '管理员') {
    router.push('/manager')
  } else if (userType === '商家') {
    router.push('/merchant')
  }
}

// 🌟 1. 将轮播图变为响应式数据
const bannerList = ref([])

// 🌟 2. 静态兜底数据预设
const defaultBanners = [
  { id: 'default_1', image: banner1, title: '双十一大促', link: '/product?category_id=1' },
  { id: 'default_2', image: banner2, title: '数码家电上新', link: '/product?category_id=2' },
  { id: 'default_3', image: banner3, title: '秋冬服装焕新', link: '/product' }
]

// 🌟 3. 初始化轮播图的核心逻辑
import { reqGetFrontActivityList } from '@/api/user'
const initBanners = async () => {
  try {
    // 调取后端公共的活动接口（查询状态为“进行中”的活动）
    const res = await reqGetFrontActivityList()
    
    if (res.success && res.data && res.data.length > 0) {
      // 转换后端数据，并将 img 通过 getFullUrl 拼成完整路径
      const activeBanners = res.data.map((act) => ({
        id: act.act_id,
        image: getFullUrl(act.img), 
        title: act.name,
        link: `/product?activity_id=${act.act_id}` // 点击跳转到带活动参数的商品列表
      }))

      // 【核心逻辑】：判断数量
      if (activeBanners.length >= 3) {
        bannerList.value = activeBanners 
      } else {
        // 不足 3 张，计算需要几张静态图来补齐
        const needCount = 3 - activeBanners.length
        bannerList.value = [
          ...activeBanners, 
          ...defaultBanners.slice(0, needCount)
        ]
      }
    } else {
      // 接口成功但没有进行中的活动，完全使用静态图兜底
      bannerList.value = defaultBanners
    }
  } catch (error) {
    console.error('获取活动轮播图失败，启用兜底展示', error)
    // 接口报错，完全使用静态图兜底
    bannerList.value = defaultBanners
  }
}

// 页面加载时拉取数据
onMounted(() => {
  initBanners()
})

// 点击轮播图跳转
const handleBannerClick = (link) => {
  if (link) {
    router.push(link)
  }
}
const handleToLogin = () => {
  router.push('/login')
}
const handleToRegister = () => {
  router.push('/login/register')
}
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    loginStore.logout() // 调用你 store 里的退出方法 (清除 token/缓存)
    ElMessage.success('已安全退出')
    // 可以在这里刷新一下页面或停留在首页
  }).catch(() => {})
}

</script>

<style scoped>
/* 定义局部 CSS 变量，方便统一管理颜色 */
.home-page {
  --primary-orange: #ff5000;
  background-color: #f4f4f4;
  min-height: 100vh;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 10px;
}

.side-menu {
  background: #fff;
  border-radius: 8px;
  padding: 10px 0;
  height: 380px;
  box-sizing: border-box;
}

.menu-item {
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  color: #333;
}

.menu-item:hover {
  background-color: #fff1eb;
  color: var(--primary-orange);
}

.home-carousel {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* 加点阴影更高级 */
}

/* 🌟 轮播图图片专属样式 */
.banner-wrapper {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证图片铺满且不被拉伸变形 */
  transition: transform 0.3s ease;
}

.banner-wrapper:hover .banner-img {
  transform: scale(1.02); /* 鼠标放上去微微放大，提升点击欲 */
}

/* 覆盖 Element Plus 默认的指示器(小圆点)样式，模仿淘宝 */
:deep(.el-carousel__indicator.is-active button) {
  background-color: var(--primary-orange);
  width: 20px;
  border-radius: 10px;
}
:deep(.el-carousel__button) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
}

.user-panel {
  background: #fff;
  border-radius: 8px;
  height: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.welcome-text {
  margin: 15px 0;
  font-weight: bold;
}

.auth-btns {
  display: flex;
  gap: 10px;
}



.manage-btn-wrap {
  margin-top: 10px;
}

.tb-manage-btn {
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 6px 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tb-manage-btn:hover {
  opacity: 0.9;
}

.goods-section {
  margin-top: 30px;
}

.grid-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  padding-left: 5px;
  border-left: 4px solid var(--primary-orange);
}

:deep(.product-card) {
  cursor: pointer;
}
</style>