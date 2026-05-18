// 🌟 修改点 2：编写路径拼接工具函数
const getFullUrl = (imgPath?: string) => {
  if (!imgPath) return ''; // 如果没有图片，返回空触发 error 插槽
  
  // 如果数据库里存的已经是 http 开头的网络图片（比如你以后接了OSS），直接返回
  if (imgPath.startsWith('http')) {
    return imgPath;
  }
  
  // 确保 baseURL 总是以 '/' 结尾
  // console.log('baseURL:', import.meta.env.VITE_APP_BASE_API);
  const baseURL = import.meta.env.VITE_APP_BASE_API as string || '';
  const safeBaseURL = baseURL.endsWith('/') ? baseURL : baseURL + '/';
  
  // 去除 imgPath 开头的 '/'
  const cleanPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
  console.log('拼接后的 URL:', safeBaseURL + cleanPath);
  return safeBaseURL + cleanPath;
}

export default getFullUrl;