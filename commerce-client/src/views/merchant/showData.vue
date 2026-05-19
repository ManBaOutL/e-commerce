<template>
  <div class="dashboard-page">
    <div class="header-row">
      <h3>商家数据概览</h3>
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

    <!-- 数据卡片 -->
    <el-row :gutter="20" class="data-row">
      <el-col :span="6"><div class="data-card">本店商品：{{ goodsCount }}</div></el-col>
      <el-col :span="6"><div class="data-card">本店订单：{{ orderCount }}</div></el-col>
      <el-col :span="6"><div class="data-card">待发货：{{ waitSend }}</div></el-col>
      <el-col :span="6"><div class="data-card">{{ timeRangeText }}销售额：¥{{ sumOrderAmount }}</div></el-col>
    </el-row>

    <!-- 折线图 + 柱状图 -->
    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12">
        <div class="chart-box">
          <h4>{{ timeRangeText }}订单量</h4>
          <LineChart id="orderChart" :xData="xData" :seriesData="orderData" />
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-box">
          <h4>{{ timeRangeText }}销售额</h4>
          <BarChart id="saleChart" :xData="xData" :seriesData="saleData" />
        </div>
      </el-col>
    </el-row>

    <!-- 饼图 + 分析区域 -->
    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12">
        <div class="chart-box">
          <h4>本店分类成交额占比</h4>
          <PieChart :title="`分类成交额占比`" :pieData="pieData" />
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
                <div v-for="item in ageGroupAnalysis" :key="item.ageGroup" class="analysis-item">
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
import { useMerchantStore } from '@/stores/modules/merchantStore'

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

const merchantStore = useMerchantStore()

const selectedDays = ref(7)

const timeRangeText = computed(() => {
  if (selectedDays.value === 1) return '当日'
  if (selectedDays.value === 7) return '近7日'
  if (selectedDays.value === 31) return '本月'
  return `近${selectedDays.value}天`
})

// 商家数据
const goodsCount = ref(0)
const orderCount = ref(0)
const waitSend = ref(0)
const sumOrderAmount = ref(0)

// 近N日坐标
const xData = ref(['1日','2日','3日','4日','5日','6日','7日'])

// 订单量折线图
const orderData = ref([0,0,0,0,0,0,0])

// 销售额柱状图
const saleData = ref([0,0,0,0,0,0,0])

// 饼图：本店分类成交额
const pieData = ref([
  { value: 0, name: '暂无数据' },
])

// 新增数据
const regionAnalysis = ref([
  { region: '暂无数据', totalAmount: 0, orderCount: 0 },
])

const ageGroupAnalysis = ref([
  { ageGroup: '暂无数据', totalAmount: 0, userCount: 0, orderCount: 0 },
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
    let days = selectedDays.value;
    
    if (command.startsWith('daily')) {
      days = 1;
    } else if (command.startsWith('weekly')) {
      days = 7;
    } else if (command.startsWith('monthly')) {
      days = 31;
    }
    
    await loadData(days);
    
    if (command.endsWith('_pdf')) {
      await generatePDFReport();
    } else if (command.endsWith('_excel')) {
      await generateExcelReport();
    }
  } catch (error) {
    console.error('生成报表失败:', error);
    ElMessage.error('生成报表失败，请重试');
  }
}

// 生成PDF报告
const generatePDFReport = async () => {
  ElMessage.info('正在生成PDF报告...');
  
  const pdfContent = document.createElement('div');
  pdfContent.style.position = 'absolute';
  pdfContent.style.left = '-9999px';
  pdfContent.style.width = '210mm';
  pdfContent.style.padding = '20px';
  pdfContent.style.boxSizing = 'border-box';
  pdfContent.style.backgroundColor = 'white';
  
  const currentDate = new Date().toLocaleDateString('zh-CN');
  const reportTitle = `${timeRangeText.value}报表`;
  
  const timeRangeOrderCount = orderData.value.reduce((sum, val) => sum + parseInt(val || 0), 0);
  const timeRangeSaleAmount = saleData.value.reduce((sum, val) => sum + parseFloat(val || 0), 0);
  
  pdfContent.innerHTML = `
    <h1 style="text-align: center; color: #333;">商家管理系统 - ${reportTitle}</h1>
    <p style="text-align: center; color: #666;">时间范围: ${timeRangeText.value} | 生成时间: ${currentDate}</p>
    <hr style="margin: 20px 0;">
    
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>本店商品</h3>
        <p style="font-size: 24px; font-weight: bold; color: #67C23A;">${goodsCount.value}</p>
      </div>
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>本店订单</h3>
        <p style="font-size: 24px; font-weight: bold; color: #E6A23C;">${orderCount.value}</p>
      </div>
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>待发货</h3>
        <p style="font-size: 24px; font-weight: bold; color: #F56C6C;">${waitSend.value}</p>
      </div>
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>${timeRangeText.value}销售额</h3>
        <p style="font-size: 24px; font-weight: bold; color: #409EFF;">¥${sumOrderAmount.value.toLocaleString()}</p>
      </div>
    </div>
    
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
  `;
  
  document.body.appendChild(pdfContent);
  
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
    
    const fileName = `${reportTitle}_${currentDate.replace(/\//g, '-')}.pdf`;
    pdf.save(fileName);
    
    ElMessage.success(`${reportTitle}已生成并下载！`);
  } catch (error) {
    console.error('生成PDF失败:', error);
    ElMessage.error('生成PDF失败，请重试');
  } finally {
    document.body.removeChild(pdfContent);
  }
};

// 生成Excel报告
const generateExcelReport = async () => {
  ElMessage.info('正在生成Excel报告...');
  
  const reportTitle = `${timeRangeText.value}报表`;
  const currentDate = new Date().toLocaleDateString('zh-CN');
  
  const wb = XLSX.utils.book_new();
  
  const summaryData = [
    { 指标: '报告类型', 数值: reportTitle },
    { 指标: '时间范围', 数值: timeRangeText.value },
    { 指标: '生成时间', 数值: currentDate },
    { 指标: '本店商品', 数值: goodsCount.value },
    { 指标: '本店订单', 数值: orderCount.value },
    { 指标: '待发货', 数值: waitSend.value },
    { 指标: `${timeRangeText.value}销售额`, 数值: `¥${sumOrderAmount.value.toLocaleString()}` },
  ];
  
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, '数据汇总');
  
  const orderDataSheet = xData.value.map((day, i) => ({
    日期: day,
    订单量: orderData.value[i]
  }));
  const wsOrders = XLSX.utils.json_to_sheet(orderDataSheet);
  XLSX.utils.book_append_sheet(wb, wsOrders, `${timeRangeText.value}订单趋势`);
  
  const saleDataSheet = xData.value.map((day, i) => ({
    日期: day,
    销售额: saleData.value[i]
  }));
  const wsSales = XLSX.utils.json_to_sheet(saleDataSheet);
  XLSX.utils.book_append_sheet(wb, wsSales, `${timeRangeText.value}销售趋势`);
  
  const categoryDataSheet = pieData.value.map(item => ({
    分类名称: item.name,
    成交额: item.value
  }));
  const wsCategories = XLSX.utils.json_to_sheet(categoryDataSheet);
  XLSX.utils.book_append_sheet(wb, wsCategories, `${timeRangeText.value}分类占比`);
  
  const regionDataSheet = regionAnalysis.value.map(item => ({
    地区: item.region,
    总成交额: item.totalAmount,
    订单数: item.orderCount
  }));
  const wsRegion = XLSX.utils.json_to_sheet(regionDataSheet);
  XLSX.utils.book_append_sheet(wb, wsRegion, `${timeRangeText.value}地区分析`);
  
  const ageGroupDataSheet = ageGroupAnalysis.value.map(item => ({
    年龄段: item.ageGroup,
    总成交额: item.totalAmount,
    用户数: item.userCount,
    订单数: item.orderCount
  }));
  const wsAgeGroup = XLSX.utils.json_to_sheet(ageGroupDataSheet);
  XLSX.utils.book_append_sheet(wb, wsAgeGroup, `${timeRangeText.value}年龄分析`);
  
  const fileName = `${reportTitle}_${currentDate.replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  ElMessage.success(`${reportTitle}已生成并下载！`);
};

// 加载数据函数
const loadData = async (days) => {
  selectedDays.value = days
  await merchantStore.getShowData(days)
  console.log("加载数据成功:", merchantStore.showData)
  
  goodsCount.value = merchantStore.showData.goodsCount || 0
  orderCount.value = merchantStore.showData.orderCount || 0
  waitSend.value = merchantStore.showData.waitSend || 0
  sumOrderAmount.value = merchantStore.showData.sumOrderAmount || 0
  orderData.value = merchantStore.showData.orderData || []
  saleData.value = merchantStore.showData.saleData || []
  pieData.value = merchantStore.showData.pieData || []
  xData.value = merchantStore.showData.xData || []
  regionAnalysis.value = merchantStore.showData.regionAnalysis || []
  ageGroupAnalysis.value = merchantStore.showData.ageGroupAnalysis || []
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

.analysis-item .rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 8px;
  color: white;
}

.analysis-item .rank-1 { background: #FFD700; }
.analysis-item .rank-2 { background: #C0C0C0; }
.analysis-item .rank-3 { background: #CD7F32; }
.analysis-item .rank-other { background: #909399; }

.analysis-item .name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.analysis-item .amount {
  font-size: 14px;
  font-weight: bold;
  color: #409EFF;
  margin-right: 10px;
}

.analysis-item .count {
  font-size: 12px;
  color: #909399;
}
</style>