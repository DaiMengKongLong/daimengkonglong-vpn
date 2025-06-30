import { handleHomePage } from './home.js';
import { handleAdminPage } from './admin.js';
import { handleSubscription } from './subscription.js';
import { handleAPI } from './api.js';

export async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 路由处理
  switch (true) {
    case path === '/':
      return handleHomePage(request, env);
    
    case path === '/admin':
      return handleAdminPage(request, env);
    
    case path.startsWith('/sub/'):
      return handleSubscription(request, env);
    
    case path.startsWith('/api/'):
      return handleAPI(request, env);
    
    case path.startsWith('/static/'):
      return handleStaticFiles(request, env);
    
    default:
      return new Response('Not Found', { status: 404 });
  }
}

async function handleStaticFiles(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 处理静态文件请求
  if (path.endsWith('.css')) {
    return new Response('/* CSS will be inlined */', {
      headers: { 'Content-Type': 'text/css' }
    });
  }
  
  if (path.endsWith('.js')) {
    return new Response('// JS will be inlined', {
      headers: { 'Content-Type': 'application/javascript' }
    });
  }
  
  return new Response('Not Found', { status: 404 });
}
