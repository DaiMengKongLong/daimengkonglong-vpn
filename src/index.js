// Cloudflare Workers 订阅转换服务
// 支持多种订阅格式：Base64, Clash, SingBox, Loon, Surge

import { handleRequest } from './handlers/router.js';
import { corsHeaders } from './utils/cors.js';

export default {
  async fetch(request, env, ctx) {
    try {
      // 处理 CORS 预检请求
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: corsHeaders
        });
      }

      const response = await handleRequest(request, env);
      
      // 添加 CORS 头
      Object.keys(corsHeaders).forEach(key => {
        response.headers.set(key, corsHeaders[key]);
      });

      return response;
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
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
