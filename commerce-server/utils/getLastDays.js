// 获取最近n天的日期数组(用于表示图表的x轴数据)
function getLastDays(needDays = 7) {
    let days = []
    for (let i = needDays - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const day = date.getDate() // 取出几号
        days.push(day + '日')
    }
    return days
}

// 获取当月日期数组(从1日到今天)
function getCurrentMonthDays() {
    let days = []
    const today = new Date()
    const currentDay = today.getDate()
    for (let i = 1; i <= currentDay; i++) {
        days.push(i + '日')
    }
    return days
}

module.exports = { getLastDays, getCurrentMonthDays }