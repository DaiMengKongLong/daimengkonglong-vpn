export async function generateClashConfig(config) {
  const { nodes, proxyIPs, clashTemplate } = config;
  const proxies = [];
  const proxyNames = [];

  for (const node of nodes) {
    const serverIP = getProxyIP(node.server, proxyIPs) || node.server;
    const proxyName = node.name || `${node.server}:${node.port}`;
    
    let proxy;
    
    switch (node.type.toLowerCase()) {
      case 'vmess':
        proxy = generateVmessProxy(node, serverIP, proxyName);
        break;
      case 'vless':
        proxy = generateVlessProxy(node, serverIP, proxyName);
        break;
      case 'trojan':
        proxy = generateTrojanProxy(node, serverIP, proxyName);
        break;
      case 'ss':
      case 'shadowsocks':
        proxy = generateShadowsocksProxy(node, serverIP, proxyName);
        break;
      default:
        continue;
    }
    
    if (proxy) {
      proxies.push(proxy);
      proxyNames.push(proxyName);
    }
  }

  const clashConfig = {
    port: 7890,
    'socks-port': 7891,
    'allow-lan': false,
    mode: 'rule',
    'log-level': 'info',
    'external-controller': '127.0.0.1:9090',
    dns: {
      enable: true,
      ipv6: false,
      'default-nameserver': ['223.5.5.5', '119.29.29.29'],
      'enhanced-mode': 'fake-ip',
      'fake-ip-range': '198.18.0.1/16',
      nameserver: ['https://doh.pub/dns-query', 'https://dns.alidns.com/dns-query']
    },
    proxies: proxies,
    'proxy-groups': [
      {
        name: '🚀 节点选择',
        type: 'select',
        proxies: ['♻️ 自动选择', '🔯 故障转移', '🔮 负载均衡', '🎯 全球直连', ...proxyNames]
      },
      {
        name: '♻️ 自动选择',
        type: 'url-test',
        proxies: proxyNames,
        url: 'http://www.gstatic.com/generate_204',
        interval: 300
      },
      {
        name: '🔯 故障转移',
        type: 'fallback',
        proxies: proxyNames,
        url: 'http://www.gstatic.com/generate_204',
        interval: 300
      },
      {
        name: '🔮 负载均衡',
        type: 'load-balance',
        proxies: proxyNames,
        url: 'http://www.gstatic.com/generate_204',
        interval: 300
      },
      {
        name: '🎯 全球直连',
        type: 'select',
        proxies: ['DIRECT']
      }
    ],
    rules: [
      'DOMAIN-SUFFIX,local,DIRECT',
      'IP-CIDR,127.0.0.0/8,DIRECT',
      'IP-CIDR,172.16.0.0/12,DIRECT',
      'IP-CIDR,192.168.0.0/16,DIRECT',
      'IP-CIDR,10.0.0.0/8,DIRECT',
      'IP-CIDR,17.0.0.0/8,DIRECT',
      'IP-CIDR,100.64.0.0/10,DIRECT',
      'GEOIP,CN,DIRECT',
      'MATCH,🚀 节点选择'
    ]
  };

  // 如果有自定义模板，合并配置
  if (clashTemplate) {
    try {
      const template = JSON.parse(clashTemplate);
      Object.assign(clashConfig, template);
      // 确保代理和代理组不被覆盖
      clashConfig.proxies = proxies;
      if (template['proxy-groups']) {
        clashConfig['proxy-groups'] = template['proxy-groups'].map(group => {
          if (group.proxies && group.proxies.includes('{{proxies}}')) {
            group.proxies = group.proxies.map(p => p === '{{proxies}}' ? proxyNames : p).flat();
          }
          return group;
        });
      }
    } catch (e) {
      console.error('Invalid clash template:', e);
    }
  }

  // 转换为YAML格式
  return convertToYAML(clashConfig);
}

function getProxyIP(originalIP, proxyIPs) {
  if (!proxyIPs || proxyIPs.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * proxyIPs.length);
  return proxyIPs[randomIndex];
}

function generateVmessProxy(node, serverIP, name) {
  return {
    name: name,
    type: 'vmess',
    server: serverIP,
    port: node.port,
    uuid: node.uuid,
    alterId: node.alterId || 0,
    cipher: 'auto',
    network: node.network || 'tcp',
    tls: node.tls === 'tls',
    'skip-cert-verify': true,
    ...(node.host && { 'ws-opts': { headers: { Host: node.host } } }),
    ...(node.path && { 'ws-opts': { ...((node.host && { headers: { Host: node.host } }) || {}), path: node.path } })
  };
}

function generateVlessProxy(node, serverIP, name) {
  return {
    name: name,
    type: 'vless',
    server: serverIP,
    port: node.port,
    uuid: node.uuid,
    network: node.network || 'tcp',
    tls: node.tls === 'tls',
    'skip-cert-verify': true,
    ...(node.host && { 'ws-opts': { headers: { Host: node.host } } }),
    ...(node.path && { 'ws-opts': { ...((node.host && { headers: { Host: node.host } }) || {}), path: node.path } })
  };
}

function generateTrojanProxy(node, serverIP, name) {
  return {
    name: name,
    type: 'trojan',
    server: serverIP,
    port: node.port,
    password: node.password,
    'skip-cert-verify': true,
    ...(node.sni && { sni: node.sni })
  };
}

function generateShadowsocksProxy(node, serverIP, name) {
  return {
    name: name,
    type: 'ss',
    server: serverIP,
    port: node.port,
    cipher: node.method,
    password: node.password
  };
}

function convertToYAML(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  let yaml = '';

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;

    if (Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`;
      for (const item of value) {
        if (typeof item === 'object') {
          yaml += `${spaces}  - `;
          const itemYaml = convertToYAML(item, indent + 2);
          yaml += itemYaml.substring(spaces.length + 4) + '\n';
        } else {
          yaml += `${spaces}  - ${item}\n`;
        }
      }
    } else if (typeof value === 'object') {
      yaml += `${spaces}${key}:\n`;
      yaml += convertToYAML(value, indent + 1);
    } else {
      const quotedValue = typeof value === 'string' && (value.includes(':') || value.includes('#') || value.includes('-'))
        ? `"${value}"` : value;
      yaml += `${spaces}${key}: ${quotedValue}\n`;
    }
  }

  return yaml;
}
