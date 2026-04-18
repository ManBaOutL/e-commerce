import dayjs from 'dayjs'

// 定义 formatTime 函数
const formatTime = (time:any) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')

export default formatTime