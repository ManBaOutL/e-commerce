<template>
  <div class="stats-container">
    <div class="stats-toolbar">
      <div class="filter-section">
        <div class="tab-group">
          <div 
            v-for="item in timeOptions" 
            :key="item.value"
            class="tab-item"
            :class="{ active: timeType === item.value }"
            @click="handleTimeTypeChange(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
        
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          class="taobao-date-picker"
          @change="handleCustomDate"
        />
      </div>
      
      <div class="action-section">
        <el-button type="primary" plain size="small" icon="Download" @click="handleExport">
          导出报表
        </el-button>
      </div>
    </div>

    <div class="metric-grid">
      <div 
        v-for="metric in metricsConfig" 
        :key="metric.key"
        class="metric-card"
        :class="{ active: currentMetric === metric.key }"
        @click="currentMetric = metric.key"
      >
        <div class="card-inner">
          <div class="m-title">
            {{ metric.label }}
            <el-tooltip :content="metric.tip" placement="top">
              <el-icon class="tip-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="m-value">
            <span v-if="metric.unit === '¥'" class="unit">¥</span>
            {{ metric.value }}
            <span v-if="metric.unit !== '¥'" class="unit-suffix">{{ metric.unit }}</span>
          </div>
          <div class="m-footer">
            <span class="compare">较前一周期</span>
            <span :class="['trend', metric.status]">
              {{ metric.trend }} {{ metric.status === 'up' ? '↑' : '↓' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-wrapper">
      <div class="chart-header">
        <div class="title-wrapper">
          <span class="main-title">消费趋势分析</span>
          <span class="sub-title">展示所选周期内的{{ currentMetricName }}波动</span>
        </div>
        <div class="type-switch">
          <span 
            class="icon-btn" 
            :class="{ active: chartType === 'line' }" 
            @click="chartType = 'line'"
          >
            <el-icon><Histogram v-if="chartType === 'bar'" /><TrendCharts v-else /></el-icon>
            {{ chartType === 'line' ? '折线图' : '柱状图' }}
          </span>
        </div>
      </div>
      <div id="mainTrendChart" class="chart-instance"></div>
    </div>

    <div class="bottom-grid">
      <div class="analysis-box category-pie">
        <div class="box-title">消费类目占比</div>
        <div id="categoryPieChart" class="sub-chart"></div>
      </div>
      <div class="analysis-box rank-list">
        <div class="box-title">最高消费排行</div>
        <div class="rank-items">
          <div v-for="(item, index) in mockData.ranking" :key="index" class="rank-row">
            <span class="rank-num" :class="'top-' + (index + 1)">{{ index + 1 }}</span>
            <span class="rank-name">{{ item.name }}</span>
            <el-progress :percentage="item.percent" :color="index < 3 ? '#ff5000' : '#999'" />
            <span class="rank-val">¥{{ item.val }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { QuestionFilled, TrendCharts, Histogram,  } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox} from 'element-plus';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- 模拟测试数据（易于后续替换为接口） ---
const mockData = ref({
  summary: {
    amount: { value: '3,842.00', trend: '12.5%', status: 'up' },
    count: { value: '56', trend: '2.3%', status: 'down' },
    avg: { value: '68.60', trend: '5.1%', status: 'up' }
  },
  trend: {
    xAxis: ['04-01', '04-02', '04-03', '04-04', '04-05', '04-06', '04-07'],
    amountData: [420, 580, 390, 820, 710, 520, 402],
    countData: [5, 8, 4, 12, 9, 6, 12]
  },
  categories: [
    { value: 1048, name: '美妆个护' },
    { value: 735, name: '服饰鞋包' },
    { value: 580, name: '数码家电' },
    { value: 484, name: '食品饮料' },
    { value: 300, name: '日用百货' }
  ],
  ranking: [
    { name: 'iPhone 15 Pro', val: 7999, percent: 85 },
    { name: 'Nike Air Max', val: 1299, percent: 60 },
    { name: '乐事薯片大礼包', val: 99, percent: 15 }
  ]
});

// --- 状态变量 ---
const timeType = ref('week');
const dateRange = ref([]);
const currentMetric = ref('amount');
const chartType = ref('line');
const timeOptions = [
  { label: '今日', value: 'today' },
  { label: '近7日', value: 'week' },
  { label: '近30日', value: 'month' },
  { label: '自定义', value: 'custom' }
];

const metricsConfig = computed(() => [
  { key: 'amount', label: '总消费额', value: mockData.value.summary.amount.value, trend: mockData.value.summary.amount.trend, status: mockData.value.summary.amount.status, unit: '¥', tip: '选定周期内支付成功的订单总金额' },
  { key: 'count', label: '订单总量', value: mockData.value.summary.count.value, trend: mockData.value.summary.count.trend, status: mockData.value.summary.count.status, unit: '单', tip: '选定周期内支付成功的订单总数' },
  { key: 'avg', label: '客单价', value: mockData.value.summary.avg.value, trend: mockData.value.summary.avg.trend, status: mockData.value.summary.avg.status, unit: '¥', tip: '总消费额 / 订单总量' }
]);

const currentMetricName = computed(() => metricsConfig.value.find(m => m.key === currentMetric.value)?.label);

// --- 图表实例与逻辑 ---
let trendChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;

const initCharts = () => {
  // 趋势图
  trendChart = echarts.init(document.getElementById('mainTrendChart'));
  // 饼图
  pieChart = echarts.init(document.getElementById('categoryPieChart'));
  renderTrend();
  renderPie();
};

const renderTrend = () => {
  const isAmount = currentMetric.value === 'amount';
  const color = isAmount ? '#ff5000' : '#1890ff';
  
  const option = {
    tooltip: { trigger: 'axis', backgroundColor: '#fff', textStyle: { color: '#333' } },
    grid: { top: '15%', left: '3%', right: '3%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: mockData.value.trend.xAxis,
      axisLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#999' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f5f5f5' } }
    },
    series: [{
      name: currentMetricName.value,
      type: chartType.value,
      data: isAmount ? mockData.value.trend.amountData : mockData.value.trend.countData,
      smooth: true,
      showSymbol: false,
      itemStyle: { color: color },
      areaStyle: chartType.value === 'line' ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: color + '33' },
          { offset: 1, color: color + '00' }
        ])
      } : null
    }]
  };
  trendChart?.setOption(option, true);
};

const renderPie = () => {
  pieChart?.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0', icon: 'circle', itemWidth: 8 },
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: mockData.value.categories
    }]
  });
};

// --- 交互处理 ---
const handleTimeTypeChange = (val: string) => {
  timeType.value = val;
  // 此处模拟接口请求
  console.log('请求接口，参数为:', val);
  renderTrend(); 
};

watch([currentMetric, chartType], () => renderTrend());

const handleCustomDate = (val: string[]) => {
  // 处理自定义日期选择
}

// 导出文件逻辑
const exportData = [
  { date: '2024-04-01', category: '餐饮', name: '午餐外卖', amount: 25.5, status: '已支付' },
  { date: '2024-04-01', category: '服饰', name: '春季衬衫', amount: 199.0, status: '已支付' },
  { date: '2024-04-02', category: '交通', name: '打车', amount: 45.0, status: '已支付' },
  { date: '2024-04-03', category: '日用', name: '抽纸', amount: 12.9, status: '已支付' },
];
// 1. 导出 Excel 逻辑
const exportToExcel = () => {
  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "消费明细");
  
  // 设置表头名称（可选）
  XLSX.utils.sheet_add_aoa(worksheet, [["日期", "分类", "商品名称", "金额", "状态"]], { origin: "A1" });

  // 导出文件
  XLSX.writeFile(workbook, `消费明细表_${timeType.value}.xlsx`);
  
  ElMessage.success('Excel 导出成功');
};

// 2. 导出 PDF 逻辑 (将整个 stats-container 区域截图导出)
const exportToPDF = async () => {
  const element = document.querySelector('.stats-container') as HTMLElement;
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // 提高清晰度
      useCORS: true, // 允许跨域图片
      backgroundColor: '#f4f4f4' // 保持背景色
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // 计算图片在 PDF 中的宽高
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`消费分析报告_${new Date().getTime()}.pdf`);
    
    ElMessage.success('PDF 报告生成成功');
  } catch (error) {
    console.error('PDF 导出失败', error);
    ElMessage.error('PDF 导出失败');
  }
};

// 3. 统一处理导出按钮点击
const handleExport = () => {
  ElMessageBox.confirm(
    '请选择导出格式',
    '数据导出',
    {
      distinguishCancelAndClose: true,
      confirmButtonText: '导出 PDF 报告',
      cancelButtonText: '导出 Excel 明细',
      type: 'info',
      center: true // 居中显示更像 ActionSheet
    }
  )
  .then(() => { exportToPDF();})
  .catch((action) => {
    if (action === 'cancel') { exportToExcel(); }
  })
}
onMounted(() => {
  initCharts();
  window.addEventListener('resize', () => {
    trendChart?.resize();
    pieChart?.resize();
  });
});
</script>

<style scoped>
.stats-container {
  padding: 16px;
  background: #f4f4f4;
  min-height: 100vh;
}

/* 淘宝风格工具栏 */
.stats-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.filter-section {
  display: flex;
  align-items: center;
}

.tab-group {
  display: flex;
  background: #f0f0f0;
  padding: 3px;
  border-radius: 6px;
  margin-right: 16px;
}

.tab-item {
  padding: 5px 16px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s;
}

.tab-item.active {
  background: #fff;
  color: #ff5000;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.taobao-date-picker {
  border-radius: 20px !important;
  width: 240px !important;
}

/* 指标卡片 */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.metric-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.3s;
}

.metric-card.active {
  border-color: #ff5000;
  background: linear-gradient(180deg, #fffcfb 0%, #fff 100%);
}

.m-title {
  font-size: 14px;
  color: #999;
  display: flex;
  align-items: center;
}

.tip-icon { margin-left: 4px; font-size: 14px; cursor: help; }

.m-value {
  font-size: 28px;
  font-weight: 600;
  margin: 12px 0;
  color: #333;
}

.unit { font-size: 16px; margin-right: 4px; }
.unit-suffix { font-size: 14px; margin-left: 4px; }

.m-footer { font-size: 12px; }
.compare { color: #999; margin-right: 8px; }
.trend.up { color: #ff5000; }
.trend.down { color: #52c41a; }

/* 图表区 */
.chart-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.main-title { font-size: 16px; font-weight: bold; display: block; }
.sub-title { font-size: 12px; color: #999; margin-top: 4px; }

.icon-btn {
  font-size: 13px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.icon-btn.active { color: #ff5000; border-color: #ff5000; }

.chart-instance { width: 100%; height: 320px; }

/* 底部布局 */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 16px;
}

.analysis-box {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.box-title { font-size: 15px; font-weight: bold; margin-bottom: 20px; }
.sub-chart { width: 100%; height: 280px; }

.rank-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.rank-num {
  width: 20px;
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.rank-num.top-1 { background: #ff5000; color: #fff; }
.rank-num.top-2 { background: #ff8547; color: #fff; }
.rank-num.top-3 { background: #ffb38a; color: #fff; }

.rank-name { width: 100px; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rank-val { width: 80px; text-align: right; font-size: 13px; font-weight: bold; }
:deep(.el-progress) { flex: 1; }
</style>