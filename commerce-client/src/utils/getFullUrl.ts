// 🌟 修改点 2：编写路径拼接工具函数
const getFullUrl = (imgPath : string) => {
  if (!imgPath) return ''; // 如果没有图片，返回空触发 error 插槽
  
  // 如果数据库里存的已经是 http 开头的网络图片（比如你以后接了OSS），直接返回
  if (imgPath.startsWith('http')) {
    return imgPath;
  }
  
  // 你的 Node.js 后端基础地址
  const baseURL = import.meta.env.VITE_APP_BASE_API;
  
  // 处理路径斜杠问题，防止出现 http://.../8888//img/xxx 的情况
  const cleanPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
  
  return baseURL + cleanPath;
}

export default getFullUrl;