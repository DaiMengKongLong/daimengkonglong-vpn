import { getConfig, saveConfig, getAllConfigs } from '../utils/config.js';

export async function handleAPI(request, env) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(part => part);
  const endpoint = pathParts[1]; // /api/{endpoint}

  try {
    switch (endpoint) {
      case 'config':
        return handleConfigAPI(request, env);
      case 'configs':
        return handleConfigsAPI(request, env);
      case 'test':
        return handleTestAPI(request, env);
      default:
        return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('API错误:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleConfigAPI(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || 'default';

  switch (request.method) {
    case 'GET':
      const config = await getConfig(env, token);
      return new Response(JSON.stringify(config), {
        headers: { 'Content-Type': 'application/json' }
      });

    case 'POST':
    case 'PUT':
      const newConfig = await request.json();
      const success = await saveConfig(env, token, newConfig);
      
      return new Response(JSON.stringify({ 
        success,
        message: success ? '配置保存成功' : '配置保存失败'
      }), {
        status: success ? 200 : 500,
        headers: { 'Content-Type': 'application/json' }
      });

    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
  }
}

async function handleConfigsAPI(request, env) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const configs = await getAllConfigs(env);
  return new Response(JSON.stringify(configs), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleTestAPI(request, env) {
  const url = new URL(request.url);
  const testType = url.searchParams.get('type');
  const target = url.searchParams.get('target');

  switch (testType) {
    case 'node':
      return await testNodeConnectivity(target);
    case 'proxy':
      return await testProxyIP(target);
    default:
      return new Response(JSON.stringify({
        success: true,
        message: 'API服务正常运行',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
  }
}

async function testNodeConnectivity(nodeData) {
  try {
    if (!nodeData) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '缺少节点数据' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const node = JSON.parse(decodeURIComponent(nodeData));
    
    // 简单的连通性测试 - 尝试连接到节点服务器
    const testUrl = `http://${node.server}:${node.port}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    try {
      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      return new Response(JSON.stringify({
        success: true,
        message: '节点连接测试成功',
        latency: Date.now() - startTime,
        status: response.status
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      return new Response(JSON.stringify({
        success: false,
        message: '节点连接失败',
        error: fetchError.message
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '节点测试失败',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function testProxyIP(proxyIP) {
  try {
    if (!proxyIP) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '缺少代理IP' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 测试代理IP的可达性
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      // 尝试通过代理IP访问一个测试URL
      const testUrl = `http://${proxyIP}`;
      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;
      
      return new Response(JSON.stringify({
        success: true,
        message: '代理IP测试成功',
        latency: latency,
        ip: proxyIP
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      return new Response(JSON.stringify({
        success: false,
        message: '代理IP连接失败',
        error: fetchError.message,
        ip: proxyIP
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '代理IP测试失败',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
