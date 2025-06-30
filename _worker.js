// Cloudflare Pages Functions 入口文件
// 这个文件使项目能够在 Cloudflare Pages 环境中运行

// 导入主要的处理逻辑
import { handleRequest } from './src/handlers/router.js';
import { corsHeaders } from './src/utils/cors.js';
import { adaptEnvironment, logEnvironmentInfo, validateEnvironment } from './src/utils/environment.js';

// Pages Functions 导出格式
export default {
  async fetch(request, env, _ctx) {
    try {
      // 环境适配和验证
      const adaptedEnv = adaptEnvironment(env);

      // 确保 Pages 环境标识
      adaptedEnv.DEPLOYMENT_TYPE = 'pages';
      adaptedEnv.CF_PAGES = true;

      // 记录环境信息（仅在调试模式下）
      if (adaptedEnv.DEBUG) {
        logEnvironmentInfo(adaptedEnv);
      }

      // 验证环境配置
      const validation = validateEnvironment(adaptedEnv);
      if (!validation.valid) {
        console.error('Pages 环境配置错误:', validation.issues);
        return new Response(JSON.stringify({
          error: 'Pages Environment Configuration Error',
          issues: validation.issues,
          warnings: validation.warnings
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 处理 CORS 预检请求
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: corsHeaders
        });
      }

      const response = await handleRequest(request, adaptedEnv);

      // 添加 CORS 头
      Object.keys(corsHeaders).forEach(key => {
        response.headers.set(key, corsHeaders[key]);
      });

      // 添加 Pages 特有的响应头
      response.headers.set('X-Deployment-Type', 'pages');
      response.headers.set('X-Environment', adaptedEnv.ENVIRONMENT);
      if (adaptedEnv.CF_PAGES_BRANCH) {
        response.headers.set('X-Pages-Branch', adaptedEnv.CF_PAGES_BRANCH);
      }

      return response;
    } catch (error) {
      console.error('Pages Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        environment: 'Pages'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};
