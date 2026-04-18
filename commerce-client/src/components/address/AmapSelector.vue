<template>
  <div class="amap-select">
    <el-input
      v-model="displayAddress"
      placeholder="点击选择地址"
      readonly
      @click="openMap"
      class="map-input"
    />

    <el-dialog
      v-model="mapVisible"
      title="选择地址"
      width="1000px"
      append-to-body
      @opened="initMap"
    >
      <div class="map-box">
        <div ref="mapContainer" class="map-container"></div>

        <!-- 搜索提示框 -->
        <div class="search-group">
          <el-autocomplete
            v-model="searchKey"
            placeholder="输入地址搜索"
            style="width: 320px"
            :fetch-suggestions="querySearchAsync"
            @select="handleSelect"
            @keydown.enter="doSearch"
          />
          <el-button type="primary" @click="doSearch">搜索</el-button>
        </div>
      </div>

      <template #footer>
        <el-button @click="closeMap">取消</el-button>
        <el-button type="primary" @click="confirmSelect">确认选择</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import AMapLoader from '@amap/amap-jsapi-loader'

const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue', 'locationSelected']) // 🌟 增加抛出完整数据的事件

// 🌟 新增：临时存储完整的定位结构化数据
const currentLocationData = ref(null)

const displayAddress = ref(props.modelValue || '')
const mapVisible = ref(false)
const mapContainer = ref(null)
const searchKey = ref('')

let AMap = null
let map = null
let marker = null
let geocoder = null
let autoComplete = null
let infoWindow = null

// 核心修复：侦听外部值的变化，实时同步给内部显示
watch(() => props.modelValue, (newVal) => {
  displayAddress.value = newVal || ''
  searchKey.value = newVal || ''
}, { immediate: true }) // 立即执行一次初始化

// 打开地图
const openMap = () => {
  displayAddress.value = props.modelValue || ''
  searchKey.value = props.modelValue || ''
  mapVisible.value = true
}

const closeMap = () => {
  mapVisible.value = false
  // 清空搜索关键字和临时状态，但不影响父组件
  searchKey.value = ''
  if (infoWindow) infoWindow.close()
}

// 提取一个通用的更新 Marker 和信息窗的方法
const updateMarkerAndWindow = (lnglat, address) => {
  // console.log('更新 Marker 和信息窗，坐标:', lnglat, '地址:', address)
  if (!map) return;

  const pos = [lnglat.lng, lnglat.lat];

  // 1. 更新或创建 Marker
  if (marker) {
    marker.setPosition(pos);
    if (!marker.getMap()) marker.setMap(map); // 确保 marker 在地图上
  } else {
    marker = new AMap.Marker({
      position: pos,
      map: map,
      draggable: true
    });
  }

  // 2. 移动中心点
  map.setCenter(pos);

  // 3. 更新并打开信息窗
  infoWindow.setContent(`
    <div style="padding:10px;min-width:200px">
      <div style="font-weight:bold;margin-bottom:5px">当前位置</div>
      <div>${address}</div>
      <div style="font-size:12px;color:#666;margin-top:5px">
        ${lnglat.lng.toFixed(6)}, ${lnglat.lat.toFixed(6)}
      </div>
    </div>
  `);
  infoWindow.open(map, pos);
};
// 初始化地图（完全修复版）
const initMap = async () => {
  if (map) {
    if (displayAddress.value) {
      // 延迟一小下，确保 DOM 渲染完成
      setTimeout(() => {
        doSearch(); 
      }, 100);
    }
    return;
  }

  AMapLoader.reset() 

  AMap = await AMapLoader.load({
    key: "461b52d49983cd0ff1d49a52dbddcb97",
    version: "2.0",
    plugins: ['AMap.Geocoder', 'AMap.AutoComplete', 'AMap.InfoWindow']
  })

  // 创建地图
  map = new AMap.Map(mapContainer.value, {
    zoom: 15,
    center: [116.397428, 39.90923]
  })

  // 地理编码
  geocoder = new AMap.Geocoder({
    radius: 1000,
    extensions: 'all'
  })

  // 自动补全
  autoComplete = new AMap.AutoComplete({
    city: '全国'
  })

  // 信息窗体
  infoWindow = new AMap.InfoWindow({
    offset: new AMap.Pixel(0, -30)
  })

  // 修改点击事件
  map.on('click', (e) => {
    geocoder.getAddress(e.lnglat, (status, result) => {
      if (status === 'complete' && result.regeocode) {
        const addr = result.regeocode.formattedAddress;
        const comp = result.regeocode.addressComponent; // 🌟 提取地址组成元素
        
        displayAddress.value = addr;
        searchKey.value = addr;
        
        // 🌟 组装结构化数据
        currentLocationData.value = {
          address: addr,
          lng: e.lnglat.lng,
          lat: e.lnglat.lat,
          province: comp.province,
          city: comp.city || comp.province, // 直辖市可能没有city
          district: comp.district,
          street: comp.township || comp.street
        }
        
        updateMarkerAndWindow(e.lnglat, addr);
      }
    });
  });
}

// 搜索联想
const querySearchAsync = (query, cb) => {
  if (!query || !autoComplete) return cb([])
  autoComplete.search(query, (status, result) => {
    if (status === 'complete' && result.tips) {
      const list = result.tips.map(i => ({
        value: i.name,
        address: i.district + i.name
      }))
      cb(list)
    } else {
      cb([])
    }
  })
}

// 选中联想项
const handleSelect = (item) => {
  searchKey.value = item.value
  doSearch()
}

// 搜索地址
const doSearch = () => {
  if (!searchKey.value) return ElMessage.warning('请输入地址')
  geocoder.getLocation(searchKey.value, (status, result) => {
    if (status === 'complete' && result.geocodes.length) {
      const obj = result.geocodes[0]
      const pos = [obj.location.lng, obj.location.lat]
      const comp = obj.addressComponent; // 🌟 提取地址组成元素
      
      displayAddress.value = obj.formattedAddress

      // 🌟 组装结构化数据
      currentLocationData.value = {
        address: obj.formattedAddress,
        lng: pos[0],
        lat: pos[1],
        province: comp.province,
        city: comp.city || comp.province,
        district: comp.district,
        street: comp.township || comp.street
      }

      if (marker) marker.setPosition(pos)
      else marker = new AMap.Marker({ position: pos, map, draggable: true })
      
      map.setCenter(pos)
      map.setZoom(16)

      infoWindow.setContent(`
        <div style="padding:10px;min-width:200px">
          <div style="font-weight:bold;margin-bottom:5px">搜索结果</div>
          <div>${obj.formattedAddress}</div>
        </div>
      `)
      infoWindow.open(map, pos)
    } else {
      ElMessage.error('未找到地址')
    }
  })
}

// 确认选择
const confirmSelect = () => {
  if (!displayAddress.value) return ElMessage.warning('请选择地址')
  emit('update:modelValue', displayAddress.value)
  // 🌟 将结构化数据抛给父组件
  if (currentLocationData.value) {
    emit('locationSelected', currentLocationData.value)
  }
  closeMap()
}

// 销毁
onUnmounted(() => {
  if (map) map.destroy()
  AMap = null
})
</script>

<style scoped>
.map-box {
  position: relative;
}
.map-container {
  width: 100%;
  height: 550px;
}
.search-group {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 999;
  display: flex;
  gap: 8px;
}
.map-input {
  cursor: pointer;
  width: 500px;
}
:deep(.el-autocomplete) {
  width: 300px;
}
:deep(.el-autocomplete-suggestion) {
  z-index: 1000 !important;
}
</style>