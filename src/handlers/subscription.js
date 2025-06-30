import { generateBase64Config } from '../converters/base64.js';
import { generateClashConfig } from '../converters/clash.js';
import { generateSingBoxConfig } from '../converters/singbox.js';
import { generateLoonConfig } from '../converters/loon.js';
import { generateSurgeConfig } from '../converters/surge.js';
import { getConfig } from '../utils/config.js';

export async function handleSubscription(request, env) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const format = pathParts[2]; // /sub/{format}
  const token = url.searchParams.get('token') || 'default';

  try {
    // 获取配置
    const config = await getConfig(env, token);
    if (!config) {
      return new Response('Invalid token or configuration not found', { status: 404 });
    }

    // 根据格式生成订阅内容
    let content, contentType, filename;

    switch (format.toLowerCase()) {
      case 'base64':
        content = await generateBase64Config(config);
        contentType = 'text/plain; charset=utf-8';
        filename = 'subscription.txt';
        break;

      case 'clash':
        content = await generateClashConfig(config);
        contentType = 'application/x-yaml; charset=utf-8';
        filename = 'clash.yaml';
        break;

      case 'singbox':
        content = await generateSingBoxConfig(config);
        contentType = 'application/json; charset=utf-8';
        filename = 'singbox.json';
        break;

      case 'loon':
        content = await generateLoonConfig(config);
        contentType = 'text/plain; charset=utf-8';
        filename = 'loon.conf';
        break;

      case 'surge':
        content = await generateSurgeConfig(config);
        contentType = 'text/plain; charset=utf-8';
        filename = 'surge.conf';
        break;

      default:
        return new Response('Unsupported format', { status: 400 });
    }

    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Subscription generation error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
