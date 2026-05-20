<template>
  <div class="dashboard-page">
    <div class="header-row">
      <h3>管理员数据概览</h3>
      <div class="time-buttons">
        <el-button 
          :type="selectedDays === 1 ? 'primary' : 'default'" 
          @click="loadData(1)"
        >
          当日
        </el-button>
        <el-button 
          :type="selectedDays === 7 ? 'primary' : 'default'" 
          @click="loadData(7)"
        >
          一周
        </el-button>
        <el-button 
          :type="selectedDays === 31 ? 'primary' : 'default'" 
          @click="loadData(31)"
        >
          当月
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="data-row">
      <el-col :span="6"><div class="data-card">总用户：{{ userCount }}</div></el-col>
      <el-col :span="6"><div class="data-card">总商品：{{ goodsCount }}</div></el-col>
      <el-col :span="6"><div class="data-card">总订单：{{ orderCount }}</div></el-col>
      <el-col :span="6"><div class="data-card">今日销售额：¥{{ saleAmount }}</div></el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12">
        <div class="chart-box"><h4>{{ timeRangeText }}订单量</h4>
          <LineChart id="orderChart" :xData="xData" :seriesData="orderData" /></div>
      </el-col>
      <el-col :span="12">
        <div class="chart-box"><h4>{{ timeRangeText }}销售额</h4>
          <BarChart id="saleChart" :xData="xData" :seriesData="saleData" />
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12">
        <div class="chart-box">
          <h4>各分类商品成交额占比</h4>
          <PieChart :title="`各分类商品成交额占比`" :pieData="pieData" />
        </div>
      </el-col>
      <el-col :span="12">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-box">
              <h4>{{ timeRangeText }}地区消费偏好分析</h4>
              <div class="analysis-list">
                <div v-for="(item, index) in regionAnalysis.slice(0, 5)" :key="item.region" class="analysis-item">
                  <span class="rank" :class="getRankClass(index)">{{ index + 1 }}</span>
                  <span class="name">{{ item.region }}</span>
                  <span class="amount">¥{{ item.totalAmount.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-box">
              <h4>{{ timeRangeText }}年龄段消费偏好分析</h4>
              <div class="analysis-list">
                <div v-for="(item, index) in ageGroupAnalysis" :key="item.ageGroup" class="analysis-item">
                  <span class="name">{{ item.ageGroup }}</span>
                  <span class="amount">¥{{ item.totalAmount.toLocaleString() }}</span>
                  <span v-if="item.totalAmount > 0" class="count">{{ item.userCount }}用户</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <!-- 报表生成按钮组 -->
    <div class="report-buttons">
      <el-dropdown @command="handleReportCommand" trigger="click">
        <el-button type="primary" size="large" circle>
          <el-icon><Document /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="daily_pdf">日报 (PDF)</el-dropdown-item>
            <el-dropdown-item command="weekly_pdf">周报 (PDF)</el-dropdown-item>
            <el-dropdown-item command="monthly_pdf">月报 (PDF)</el-dropdown-item>
            <el-dropdown-item command="daily_excel">日报 (Excel)</el-dropdown-item>
            <el-dropdown-item command="weekly_excel">周报 (Excel)</el-dropdown-item>
            <el-dropdown-item command="monthly_excel">月报 (Excel)</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <p class="report-label">生成报表</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import LineChart from '@/components/Charts/LineChart.vue'
import BarChart from '@/components/Charts/BarChart.vue'
import PieChart from '@/components/Charts/PieChart.vue'
import { useAdminStore } from '@/stores/modules/adminStore'
import { useOrderStore } from '@/stores/modules/orderStore'

// 添加报表生成相关导入
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { el } from 'element-plus/es/locale/index.mjs'

const orderStore = useOrderStore()

const adminStore = useAdminStore()

const userCount = ref(0)
const goodsCount = ref(0)
const orderCount = ref(0)
const saleAmount = ref(0)

const selectedDays = ref(7)

// 根据天数生成友好的时间范围描述
const timeRangeText = computed(() => {
  if (selectedDays.value === 1) return '当日'
  if (selectedDays.value === 7) return '近7日'
  if (selectedDays.value === 31) return '本月'
  return `近${selectedDays.value}天`
})

const xData = ref(['1日','2日','3日','4日','5日','6日','7日'])
const orderData = ref([15,28,22,35,39,45,42])
const saleData = ref([1500,2800,2200,3500,3900,4500,4200])

const pieData = ref([
  { value: 186600, name: '电子产品' },
  { value: 86400, name: '服装鞋包' },
  { value: 42200, name: '家居用品' },
  { value: 28900, name: '食品饮料' },
  { value: 15600, name: '美妆护肤' },
])

// 新增数据（含测试数据）
const regionAnalysis = ref([
  // { region: '浙江省', totalAmount: 128000, orderCount: 285 },
  // { region: '江苏省', totalAmount: 112000, orderCount: 245 },
  // { region: '北京市', totalAmount: 89000, orderCount: 195 },
  // { region: '山东省', totalAmount: 76000, orderCount: 168 },
  // { region: '四川省', totalAmount: 65000, orderCount: 145 },
  // { region: '湖北省', totalAmount: 58000, orderCount: 132 },
])

const ageGroupAnalysis = ref([
  { ageGroup: '未知', totalAmount: 35000, userCount: 186, orderCount: 78 },
  { ageGroup: '18岁以下', totalAmount: 28000, userCount: 156, orderCount: 68 },
  { ageGroup: '18-25岁', totalAmount: 186000, userCount: 589, orderCount: 425 },
  { ageGroup: '26-35岁', totalAmount: 225000, userCount: 728, orderCount: 512 },
  { ageGroup: '36-45岁', totalAmount: 156000, userCount: 412, orderCount: 358 },
  { ageGroup: '46-55岁', totalAmount: 89000, userCount: 235, orderCount: 198 },
  { ageGroup: '55岁以上', totalAmount: 42000, userCount: 128, orderCount: 89 },
])

const hotProducts = ref([
  { name: 'iPhone 15 Pro Max', totalQuantity: 156, totalAmount: 1497600 },
  { name: 'MacBook Pro 14英寸', totalQuantity: 89, totalAmount: 1246000 },
  { name: 'AirPods Pro 2', totalQuantity: 234, totalAmount: 466620 },
  { name: 'Nike Air Max运动鞋', totalQuantity: 312, totalAmount: 374400 },
  { name: '华为Mate 60 Pro', totalQuantity: 128, totalAmount: 704000 },
  { name: '小米14 Ultra', totalQuantity: 98, totalAmount: 480200 },
  { name: '索尼WH-1000XM5耳机', totalQuantity: 167, totalAmount: 332660 },
  { name: '戴森V15吸尘器', totalQuantity: 56, totalAmount: 268800 },
])

// 获取排名样式
const getRankClass = (index) => {
  switch (index) {
    case 0: return 'rank-1';
    case 1: return 'rank-2';
    case 2: return 'rank-3';
    default: return 'rank-other';
  }
}

// 处理报表命令
const handleReportCommand = async (command) => {
  try {
    // 根据命令确定要使用的天数
    let days = selectedDays.value; // 默认使用当前选择的天数
    
    if (command.startsWith('daily')) {
      days = 1; // 日报使用1天
    } else if (command.startsWith('weekly')) {
      days = 7; // 周报使用7天
    } else if (command.startsWith('monthly')) {
      days = 31; // 月报使用31天
    }
    
    // 强制使用确定的天数重新加载数据
    await loadData(days);
    
    if (command.endsWith('_pdf')) {
      await generatePDFReport(command);
    } else if (command.endsWith('_excel')) {
      await generateExcelReport(command);
    }
  } catch (error) {
    console.error('生成报表失败:', error);
    ElMessage.error('生成报表失败，请重试');
  }
}

// 生成PDF报告
const generatePDFReport = async () => {
  ElMessage.info('正在生成PDF报告...');
  
  // 创建一个新的div用于PDF内容
  const pdfContent = document.createElement('div');
  pdfContent.style.position = 'absolute';
  pdfContent.style.left = '-9999px';
  pdfContent.style.width = '210mm';
  pdfContent.style.padding = '20px';
  pdfContent.style.boxSizing = 'border-box';
  pdfContent.style.backgroundColor = 'white';
  
  // 获取当前数据
  const currentDate = new Date().toLocaleDateString('zh-CN');
  const reportTitle = `${timeRangeText.value}报表`;
  
  // 计算时间范围内的订单数和销售额
  const timeRangeOrderCount = orderData.value.reduce((sum, val) => sum + parseInt(val || 0), 0);
  const timeRangeSaleAmount = saleData.value.reduce((sum, val) => sum + parseFloat(val || 0), 0);
  
  // 生成PDF内容
  pdfContent.innerHTML = `
    <h1 style="text-align: center; color: #333;">商业管理系统 - ${reportTitle}</h1>
    <p style="text-align: center; color: #666;">时间范围: ${timeRangeText.value} | 生成时间: ${currentDate}</p>
    <hr style="margin: 20px 0;">
    
    <!-- 数据汇总卡片 -->
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>总用户</h3>
        <p style="font-size: 24px; font-weight: bold; color: #409EFF;">${userCount.value}</p>
      </div>
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>总商品</h3>
        <p style="font-size: 24px; font-weight: bold; color: #67C23A;">${goodsCount.value}</p>
      </div>
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>${timeRangeText.value}订单数</h3>
        <p style="font-size: 24px; font-weight: bold; color: #E6A23C;">${timeRangeOrderCount}</p>
      </div>
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>${timeRangeText.value}销售额</h3>
        <p style="font-size: 24px; font-weight: bold; color: #F56C6C;">¥${timeRangeSaleAmount.toFixed(2)}</p>
      </div>
    </div>
    
    <!-- 订单量趋势数据 -->
    <div style="margin: 20px 0;">
      <h3>${timeRangeText.value}订单量趋势</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f5f7fa;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">日期</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">订单量</th>
          </tr>
        </thead>
        <tbody>
          ${xData.value.map((day, i) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${day}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${orderData.value[i] || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- 销售额趋势数据 -->
    <div style="margin: 20px 0;">
      <h3>${timeRangeText.value}销售额趋势</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f5f7fa;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">日期</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">销售额</th>
          </tr>
        </thead>
        <tbody>
          ${xData.value.map((day, i) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${day}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">¥${saleData.value[i] || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- 分类成交额占比 -->
    <div style="margin: 20px 0;">
      <h3>${timeRangeText.value}各分类商品成交额占比</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f5f7fa;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">分类名称</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">成交额</th>
          </tr>
        </thead>
        <tbody>
          ${pieData.value.map(item => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">¥${item.value}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- 地区消费偏好分析 -->
    <div style="margin: 20px 0;">
      <h3>${timeRangeText.value}地区消费偏好分析</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f5f7fa;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">地区</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">成交额</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">订单数</th>
          </tr>
        </thead>
        <tbody>
          ${regionAnalysis.value.map(item => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.region}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">¥${item.totalAmount}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.orderCount}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- 年龄段消费偏好分析 -->
    <div style="margin: 20px 0;">
      <h3>${timeRangeText.value}年龄段消费偏好分析</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f5f7fa;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">年龄段</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">成交额</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">用户数</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">订单数</th>
          </tr>
        </thead>
        <tbody>
          ${ageGroupAnalysis.value.map(item => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.ageGroup}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">¥${item.totalAmount}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.userCount}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.orderCount}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- 热门商品 -->
    <div style="margin: 20px 0;">
      <h3>${timeRangeText.value}热门商品</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f5f7fa;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">排名</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">商品名称</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">销售数量</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">销售额</th>
          </tr>
        </thead>
        <tbody>
          ${hotProducts.value.map((item, index) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.totalQuantity}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">¥${item.totalAmount}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  // 添加到页面
  document.body.appendChild(pdfContent);
  
  // 使用html2canvas生成PDF
  try {
    const canvas = await html2canvas(pdfContent, { 
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // 下载PDF
    const fileName = `${reportTitle}_${currentDate.replace(/\//g, '-')}.pdf`;
    pdf.save(fileName);
    
    ElMessage.success(`${reportTitle}已生成并下载！`);
  } catch (error) {
    console.error('生成PDF失败:', error);
    ElMessage.error('生成PDF失败，请重试');
  } finally {
    // 清理临时元素
    document.body.removeChild(pdfContent);
  }
};
// 生成Excel报告
const generateExcelReport = async (type) => {
  ElMessage.info('正在生成Excel报告...');
  
  // 根据类型设置标题
  let reportTitle = '';
  if (type.startsWith('daily')) {
    reportTitle = '日报';
  } else if (type.startsWith('weekly')) {
    reportTitle = '周报';
  } else if (type.startsWith('monthly')) {
    reportTitle = '月报';
  }
  
  // 准备数据
  const currentDate = new Date().toLocaleDateString('zh-CN');
  
  // 创建工作簿
  const wb = XLSX.utils.book_new();
  
  // 数据汇总工作表
  // 计算时间范围内的订单数和销售额
  const timeRangeOrderCount = orderData.value.reduce((sum, val) => sum + parseInt(val || 0), 0);
  const timeRangeSaleAmount = saleData.value.reduce((sum, val) => sum + parseFloat(val || 0), 0);

  // 数据汇总工作表
  const summaryData = [
    { 指标: '报告类型', 数值: `${timeRangeText.value}报表` },
    { 指标: '时间范围', 数值: timeRangeText.value },
    { 指标: '生成时间', 数值: currentDate },
    { 指标: '总用户', 数值: userCount.value },
    { 指标: '总商品', 数值: goodsCount.value },
    { 指标: `${timeRangeText.value}订单数`, 数值: timeRangeOrderCount },
    { 指标: `${timeRangeText.value}销售额`, 数值: `¥${timeRangeSaleAmount.toFixed(2)}` },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, '数据汇总');

  // 订单趋势工作表（根据时间范围显示）
  const orderDataSheet = xData.value.map((day, i) => ({
    日期: day,
    订单量: orderData.value[i]
  }));
  const wsOrders = XLSX.utils.json_to_sheet(orderDataSheet);
  XLSX.utils.book_append_sheet(wb, wsOrders, `${timeRangeText.value}订单趋势`);

  // 销售趋势工作表（根据时间范围显示）
  const saleDataSheet = xData.value.map((day, i) => ({
    日期: day,
    销售额: `¥${saleData.value[i]}`
  }));
  const wsSales = XLSX.utils.json_to_sheet(saleDataSheet);
  XLSX.utils.book_append_sheet(wb, wsSales, `${timeRangeText.value}销售趋势`);

  // 分类成交额占比工作表
  const categoryDataSheet = pieData.value.map(item => ({
    分类名称: item.name,
    成交额: `¥${item.value}`
  }));
  const wsCategories = XLSX.utils.json_to_sheet(categoryDataSheet);
  XLSX.utils.book_append_sheet(wb, wsCategories, `${timeRangeText.value}分类占比`);

  // 地区消费偏好工作表
  const regionDataSheet = regionAnalysis.value.map(item => ({
    地区: item.region,
    总成交额: `¥${item.totalAmount}`,
    订单数: item.orderCount
  }));
  const wsRegion = XLSX.utils.json_to_sheet(regionDataSheet);
  XLSX.utils.book_append_sheet(wb, wsRegion, `${timeRangeText.value}地区分析`);

  // 年龄段消费偏好工作表
  const ageGroupDataSheet = ageGroupAnalysis.value.map(item => ({
    年龄段: item.ageGroup,
    总成交额: `¥${item.totalAmount}`,
    用户数: item.userCount,
    订单数: item.orderCount
  }));
  const wsAgeGroup = XLSX.utils.json_to_sheet(ageGroupDataSheet);
  XLSX.utils.book_append_sheet(wb, wsAgeGroup, `${timeRangeText.value}年龄分析`);

  // 热门商品工作表
  const hotProductsSheet = hotProducts.value.map(item => ({
    商品名称: item.name,
    销售数量: item.totalQuantity,
    销售额: `¥${item.totalAmount}`
  }));
  const wsHotProducts = XLSX.utils.json_to_sheet(hotProductsSheet);
  XLSX.utils.book_append_sheet(wb, wsHotProducts, `${timeRangeText.value}热门商品`);
  
  // 保存Excel文件
  const fileName = `${reportTitle}_${currentDate.replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  ElMessage.success(`${reportTitle}已生成并下载！`);
};

// 加载数据函数
const loadData = async (days) => {
  selectedDays.value = days
  await adminStore.initShowData(days)
  console.log("加载数据成功:", adminStore.showData)
  userCount.value = adminStore.showData.totalUserCount
  goodsCount.value = adminStore.showData.totalProductCount
  orderCount.value = adminStore.showData.totalOrderCount
  saleAmount.value = adminStore.showData.sumOrderAmount
  orderData.value = adminStore.showData.orderData
  saleData.value = adminStore.showData.saleData
  pieData.value = adminStore.showData.pieData
  xData.value = adminStore.showData.xData
  regionAnalysis.value = adminStore.showData.regionAnalysis || []
  ageGroupAnalysis.value = adminStore.showData.ageGroupAnalysis || []
  hotProducts.value = adminStore.showData.hotProducts || []
}

onMounted(async () => {
  await loadData(selectedDays.value)
})
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-row h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.time-buttons {
  display: flex;
  gap: 10px;
}

.time-buttons .el-button {
  padding: 8px 20px;
  font-size: 14px;
}

.data-card { background: white; padding: 30px 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px #00000010; }
.chart-box { background: white; border-radius: 8px; padding:15px; box-shadow: 0 2px 5px #00000010; height: 320px; display: flex; flex-direction: column; }

/* 报表按钮样式 */
.report-buttons {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.report-buttons .el-button {
  width: 60px;
  height: 60px;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.report-label {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: #666;
}

/* 分析列表样式 */
.analysis-list {
  margin-top: 15px;
  flex: 1;
  overflow-y: auto;
}

.analysis-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.analysis-item:last-child {
  border-bottom: none;
}

.rank {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  margin-right: 12px;
}

.rank-1 {
  background-color: #F56C6C;
}

.rank-2 {
  background-color: #E6A23C;
}

.rank-3 {
  background-color: #67C23A;
}

.rank-other {
  background-color: #909399;
}

.analysis-item .name {
  flex: 1;
  font-size: 14px;
  color: #666;
}

.analysis-item .amount {
  font-size: 14px;
  font-weight: bold;
  color: #F56C6C;
  margin-right: 12px;
}

.analysis-item .count {
  font-size: 12px;
  color: #999;
}
</style>