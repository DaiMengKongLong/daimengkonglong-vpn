// INI配置文件解析器
// 用于解析subconverter格式的INI配置

export function parseIniConfig(iniContent) {
  if (!iniContent || typeof iniContent !== 'string') {
    return null;
  }

  const config = {
    rulesets: [],
    proxyGroups: [],
    settings: {}
  };

  const lines = iniContent.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith(';'));

  for (const line of lines) {
    // 解析ruleset
    if (line.startsWith('ruleset=')) {
      const rulesetContent = line.substring(8); // 移除 'ruleset='
      const [groupName, ruleUrl] = rulesetContent.split(',', 2);
      
      if (groupName && ruleUrl) {
        config.rulesets.push({
          group: groupName.trim(),
          url: ruleUrl.trim()
        });
      }
    }
    
    // 解析custom_proxy_group
    else if (line.startsWith('custom_proxy_group=')) {
      const groupContent = line.substring(19); // 移除 'custom_proxy_group='
      const parts = groupContent.split('`');
      
      if (parts.length >= 3) {
        const group = {
          name: parts[0].trim(),
          type: parts[1].trim(),
          proxies: [],
          url: '',
          interval: 300,
          tolerance: 50,
          strategy: ''
        };

        // 解析代理列表和参数
        for (let i = 2; i < parts.length; i++) {
          const part = parts[i].trim();
          
          if (part.startsWith('http://') || part.startsWith('https://')) {
            group.url = part;
          } else if (/^\d+$/.test(part)) {
            if (!group.url) {
              // 如果还没有URL，这可能是interval
              group.interval = parseInt(part);
            } else {
              // 如果已有URL，这可能是tolerance
              group.tolerance = parseInt(part);
            }
          } else if (part.includes('consistent-hashing') || part.includes('round-robin')) {
            group.strategy = part;
          } else if (part) {
            // 代理名称或正则表达式
            group.proxies.push(part);
          }
        }

        config.proxyGroups.push(group);
      }
    }
    
    // 解析其他设置
    else if (line.includes('=')) {
      const [key, value] = line.split('=', 2);
      if (key && value) {
        config.settings[key.trim()] = value.trim();
      }
    }
  }

  return config;
}

export function applyIniConfigToClash(clashConfig, iniConfig, proxyNames) {
  if (!iniConfig) {
    return clashConfig;
  }

  // 应用代理组配置
  if (iniConfig.proxyGroups && iniConfig.proxyGroups.length > 0) {
    clashConfig['proxy-groups'] = iniConfig.proxyGroups.map(group => {
      const clashGroup = {
        name: group.name,
        type: group.type,
        proxies: []
      };

      // 处理代理列表
      for (const proxy of group.proxies) {
        if (proxy === '.*') {
          // 添加所有节点
          clashGroup.proxies.push(...proxyNames);
        } else if (proxy.startsWith('[]')) {
          // 引用其他组
          clashGroup.proxies.push(proxy.substring(2));
        } else if (proxy.startsWith('(') && proxy.endsWith(')')) {
          // 正则表达式匹配节点
          const regex = new RegExp(proxy.substring(1, proxy.length - 1), 'i');
          const matchedProxies = proxyNames.filter(name => regex.test(name));
          clashGroup.proxies.push(...matchedProxies);
        } else {
          // 直接添加
          clashGroup.proxies.push(proxy);
        }
      }

      // 添加测试URL和间隔
      if (group.url && (group.type === 'url-test' || group.type === 'fallback' || group.type === 'load-balance')) {
        clashGroup.url = group.url;
        clashGroup.interval = group.interval;
        
        if (group.type === 'url-test' && group.tolerance) {
          clashGroup.tolerance = group.tolerance;
        }
        
        if (group.type === 'load-balance' && group.strategy) {
          clashGroup.strategy = group.strategy;
        }
      }

      // 确保代理组至少有一个代理
      if (clashGroup.proxies.length === 0) {
        clashGroup.proxies.push('DIRECT');
      }

      return clashGroup;
    });
  }

  // 应用规则配置
  if (iniConfig.rulesets && iniConfig.rulesets.length > 0) {
    const rules = [];
    
    for (const ruleset of iniConfig.rulesets) {
      const url = ruleset.url.trim();
      
      // 处理特殊规则格式
      if (url.startsWith('[]')) {
        // 内置规则，如 []GEOIP,CN 或 []FINAL
        const rule = url.substring(2);
        if (rule === 'FINAL') {
          rules.push(`MATCH,${ruleset.group}`);
        } else {
          rules.push(`${rule},${ruleset.group}`);
        }
      } else {
        // 外部规则文件，添加注释说明
        rules.push(`# Rules from ${url} -> ${ruleset.group}`);
      }
    }
    
    // 添加基本规则
    const basicRules = [
      'DOMAIN-SUFFIX,local,DIRECT',
      'IP-CIDR,127.0.0.0/8,DIRECT',
      'IP-CIDR,172.16.0.0/12,DIRECT',
      'IP-CIDR,192.168.0.0/16,DIRECT',
      'IP-CIDR,10.0.0.0/8,DIRECT',
      'IP-CIDR,17.0.0.0/8,DIRECT',
      'IP-CIDR,100.64.0.0/10,DIRECT'
    ];
    
    clashConfig.rules = [...basicRules, ...rules];
  }

  return clashConfig;
}

export function validateIniConfig(iniContent) {
  try {
    const config = parseIniConfig(iniContent);
    
    if (!config) {
      return { valid: false, error: 'INI配置解析失败' };
    }

    if (config.proxyGroups.length === 0) {
      return { valid: false, error: '未找到有效的代理组配置' };
    }

    // 检查是否有基本的代理组
    const hasMainGroup = config.proxyGroups.some(group => 
      group.name.includes('节点选择') || group.name.includes('PROXY') || group.type === 'select'
    );

    if (!hasMainGroup) {
      return { valid: false, error: '缺少主要的节点选择组' };
    }

    return { valid: true, config };
  } catch (error) {
    return { valid: false, error: `INI配置验证失败: ${error.message}` };
  }
}
