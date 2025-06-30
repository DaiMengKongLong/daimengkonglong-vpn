// Cloudflare Pages Functions 中间件
// 用于处理全局请求拦截和环境设置

export async function onRequest(context) {
  // 设置 Pages 环境标识
  context.env.DEPLOYMENT_TYPE = 'pages';
  context.env.CF_PAGES = true;
  
  // 如果没有配置 KV，使用默认的环境变量名
  if (!context.env.CONFIG_KV && context.env.KV_NAMESPACE) {
    context.env.CONFIG_KV = context.env.KV_NAMESPACE;
  }
  
  // 继续处理请求
  return context.next();
}
