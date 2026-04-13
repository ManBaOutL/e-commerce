// 获取最近n天的日期数组(用于表示图表的x轴数据)
module.exports = function getLastDays(needDays = 7) {
    let days = []
    for (let i = needDays - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const day = date.getDate() // 取出几号
        days.push(day + '日')
    }
    return days
}