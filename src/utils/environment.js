// 环境检测和适配工具

/**
 * 检测当前运行环境
 * @param {Object} env - 环境变量对象
 * @returns {Object} 环境信息
 */
export function detectEnvironment(env) {
  const isPages = !!(env.CF_PAGES || env.CF_PAGES_BRANCH || env.DEPLOYMENT_TYPE === 'pages');
  const isWorkers = !isPages;
  
  return {
    isPages,
    isWorkers,
    deploymentType: isPages ? 'pages' : 'workers',
    branch: env.CF_PAGES_BRANCH || 'main',
    commitSha: env.CF_PAGES_COMMIT_SHA || '',
    url: env.CF_PAGES_URL || '',
    environment: env.ENVIRONMENT || (isPages ? 'pages' : 'production')
  };
}

/**
 * 适配环境变量
 * @param {Object} env - 原始环境变量
 * @returns {Object} 适配后的环境变量
 */
export function adaptEnvironment(env) {
  const envInfo = detectEnvironment(env);
  
  return {
    // 保持原有环境变量
    ...env,
    
    // 统一的环境标识
    DEPLOYMENT_TYPE: envInfo.deploymentType,
    IS_PAGES: envInfo.isPages,
    IS_WORKERS: envInfo.isWorkers,
    
    // KV 存储适配
    CONFIG_KV: env.CONFIG_KV || env.KV_NAMESPACE || env.SUBSCRIPTION_KV,
    
    // Pages 特有环境变量
    CF_PAGES: env.CF_PAGES || envInfo.isPages,
    CF_PAGES_BRANCH: env.CF_PAGES_BRANCH || 'main',
    CF_PAGES_COMMIT_SHA: env.CF_PAGES_COMMIT_SHA || '',
    CF_PAGES_URL: env.CF_PAGES_URL || '',
    
    // 环境信息
    ENVIRONMENT: env.ENVIRONMENT || envInfo.environment,
    BUILD_TIME: new Date().toISOString(),
    
    // 调试信息
    DEBUG: env.DEBUG || env.ENVIRONMENT === 'development'
  };
}

/**
 * 获取环境特定的配置
 * @param {Object} env - 环境变量
 * @returns {Object} 环境配置
 */
export function getEnvironmentConfig(env) {
  const envInfo = detectEnvironment(env);
  
  const baseConfig = {
    cors: {
      enabled: true,
      origins: ['*'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization']
    },
    cache: {
      enabled: true,
      ttl: 300 // 5分钟
    },
    logging: {
      level: env.DEBUG ? 'debug' : 'info',
      enabled: true
    }
  };
  
  if (envInfo.isPages) {
    return {
      ...baseConfig,
      // Pages 特定配置
      staticAssets: {
        enabled: true,
        path: '/static'
      },
      functions: {
        enabled: true,
        path: '/functions'
      }
    };
  } else {
    return {
      ...baseConfig,
      // Workers 特定配置
      workers: {
        enabled: true,
        cpu_limit: 50 // ms
      }
    };
  }
}

/**
 * 记录环境信息
 * @param {Object} env - 环境变量
 */
export function logEnvironmentInfo(env) {
  const envInfo = detectEnvironment(env);
  const config = getEnvironmentConfig(env);
  
  console.log('🌍 环境信息:', {
    deployment: envInfo.deploymentType,
    environment: envInfo.environment,
    branch: envInfo.branch,
    hasKV: !!(env.CONFIG_KV || env.KV_NAMESPACE),
    debug: !!env.DEBUG,
    timestamp: new Date().toISOString()
  });
  
  if (envInfo.isPages) {
    console.log('📄 Pages 环境:', {
      url: envInfo.url,
      commit: envInfo.commitSha?.substring(0, 8) || 'unknown'
    });
  }
  
  if (config.logging.level === 'debug') {
    console.log('🔧 调试模式已启用');
    console.log('📋 完整环境变量:', Object.keys(env));
  }
}

/**
 * 验证环境配置
 * @param {Object} env - 环境变量
 * @returns {Object} 验证结果
 */
export function validateEnvironment(env) {
  const issues = [];
  const warnings = [];
  
  // 检查必需的环境变量
  if (!env.CONFIG_KV && !env.KV_NAMESPACE) {
    issues.push('缺少 KV 存储配置 (CONFIG_KV 或 KV_NAMESPACE)');
  }
  
  // 检查环境特定配置
  const envInfo = detectEnvironment(env);
  
  if (envInfo.isPages) {
    if (!env.CF_PAGES_URL && env.ENVIRONMENT === 'production') {
      warnings.push('生产环境建议设置 CF_PAGES_URL');
    }
  }
  
  // 检查安全配置
  if (env.DEBUG && env.ENVIRONMENT === 'production') {
    warnings.push('生产环境不建议启用调试模式');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    warnings,
    environment: envInfo
  };
}

/**
 * 获取运行时信息
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @returns {Object} 运行时信息
 */
export function getRuntimeInfo(request, env) {
  const envInfo = detectEnvironment(env);
  const url = new URL(request.url);
  
  return {
    // 环境信息
    environment: envInfo,
    
    // 请求信息
    request: {
      method: request.method,
      url: request.url,
      host: url.host,
      pathname: url.pathname,
      userAgent: request.headers.get('User-Agent'),
      cf: request.cf ? {
        country: request.cf.country,
        city: request.cf.city,
        timezone: request.cf.timezone
      } : null
    },
    
    // 时间信息
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // 系统信息
    runtime: envInfo.isPages ? 'Pages Functions' : 'Workers Runtime'
  };
}
