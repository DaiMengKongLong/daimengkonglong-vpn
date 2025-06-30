import { parseIniConfig, applyIniConfigToClash } from '../utils/iniParser.js';

export async function generateClashConfig(config) {
  const { nodes, proxyIPs, clashTemplate, iniTemplate } = config;
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

  let clashConfig = {
    port: 7890,
    'socks-port': 7891,
    'allow-lan': false,
    mode: 'rule',
    'log-level': 'info',
    'external-controller': '127.0.0.1:9090',
    dns: {
      enable: true,
      ipv6: false,
      'default-nameserver': ['223.5.5.5', '119.29.29.29', '8.8.8.8'],
      'enhanced-mode': 'fake-ip',
      'fake-ip-range': '198.18.0.1/16',
      'fake-ip-filter': [
        '*.lan',
        '*.local',
        '*.localhost',
        'time.*.com',
        'time.*.gov',
        'time.*.edu.cn',
        'time.*.apple.com',
        'time1.*.com',
        'time2.*.com',
        'time3.*.com',
        'time4.*.com',
        'time5.*.com',
        'time6.*.com',
        'time7.*.com',
        'ntp.*.com',
        '*.time.edu.cn',
        '*.ntp.org.cn',
        '+.pool.ntp.org',
        'time1.cloud.tencent.com'
      ],
      nameserver: [
        'https://doh.pub/dns-query',
        'https://dns.alidns.com/dns-query',
        'https://1.1.1.1/dns-query',
        'https://8.8.8.8/dns-query'
      ],
      fallback: [
        'https://1.1.1.1/dns-query',
        'https://dns.google/dns-query',
        'https://cloudflare-dns.com/dns-query'
      ],
      'fallback-filter': {
        geoip: true,
        'geoip-code': 'CN',
        ipcidr: ['240.0.0.0/4']
      }
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
        proxies: proxyNames.length > 0 ? proxyNames : ['DIRECT'],
        url: 'http://www.gstatic.com/generate_204',
        interval: 300,
        tolerance: 50
      },
      {
        name: '🔯 故障转移',
        type: 'fallback',
        proxies: proxyNames.length > 0 ? proxyNames : ['DIRECT'],
        url: 'http://www.gstatic.com/generate_204',
        interval: 300
      },
      {
        name: '🔮 负载均衡',
        type: 'load-balance',
        proxies: proxyNames.length > 0 ? proxyNames : ['DIRECT'],
        url: 'http://www.gstatic.com/generate_204',
        interval: 300,
        strategy: 'consistent-hashing'
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

  // 优先使用INI配置，然后是Clash模板
  if (iniTemplate) {
    try {
      const iniConfig = parseIniConfig(iniTemplate);
      if (iniConfig) {
        console.log('应用INI配置:', iniConfig);
        clashConfig = applyIniConfigToClash(clashConfig, iniConfig, proxyNames);
      }
    } catch (e) {
      console.error('INI配置解析失败:', e);
    }
  }

  // 如果有自定义Clash模板，作为补充配置
  if (clashTemplate) {
    try {
      const template = JSON.parse(clashTemplate);
      // 只合并非关键配置，保护代理和代理组
      const { proxies: _, 'proxy-groups': __, rules: ___, ...otherConfig } = template;
      Object.assign(clashConfig, otherConfig);

      // 确保代理不被覆盖
      clashConfig.proxies = proxies;
    } catch (e) {
      console.error('Invalid clash template:', e);
    }
  }

  // 转换为YAML格式
  return convertToYAML(clashConfig);
}

function getProxyIP(originalIP, proxyIPs) {
  if (!proxyIPs || proxyIPs.length === 0) return null;

  // 随机选择一个反代IP
  const randomIndex = Math.floor(Math.random() * proxyIPs.length);
  const selectedProxy = proxyIPs[randomIndex];

  // 解析反代IP格式: IP:端口#地区 或 IP#地区 或 纯IP
  if (selectedProxy.includes('#')) {
    // 格式: IP:端口#地区 或 IP#地区
    const [ipPart] = selectedProxy.split('#');
    if (ipPart.includes(':')) {
      // 格式: IP:端口#地区，只返回IP部分
      const [ip] = ipPart.split(':');
      return ip.trim();
    } else {
      // 格式: IP#地区，返回IP部分
      return ipPart.trim();
    }
  } else if (selectedProxy.includes(':')) {
    // 格式: IP:端口，只返回IP部分
    const [ip] = selectedProxy.split(':');
    return ip.trim();
  } else {
    // 纯IP格式
    return selectedProxy.trim();
  }
}

function generateVmessProxy(node, serverIP, name) {
  const proxy = {
    name: name,
    type: 'vmess',
    server: serverIP,
    port: parseInt(node.port),
    uuid: node.uuid,
    alterId: parseInt(node.alterId) || 0,
    cipher: 'auto',
    network: node.network || 'tcp',
    tls: node.tls === 'tls',
    'skip-cert-verify': true
  };

  // 处理WebSocket配置
  if (node.network === 'ws') {
    proxy['ws-opts'] = {};
    if (node.path) {
      proxy['ws-opts'].path = node.path;
    }
    if (node.host) {
      proxy['ws-opts'].headers = { Host: node.host };
    }
  }

  // 处理gRPC配置
  if (node.network === 'grpc') {
    proxy['grpc-opts'] = {};
    if (node.path) {
      proxy['grpc-opts']['grpc-service-name'] = node.path;
    }
  }

  return proxy;
}

function generateVlessProxy(node, serverIP, name) {
  const proxy = {
    name: name,
    type: 'vless',
    server: serverIP,
    port: parseInt(node.port),
    uuid: node.uuid,
    network: node.network || 'tcp',
    tls: node.tls === 'tls',
    'skip-cert-verify': true
  };

  // 处理WebSocket配置
  if (node.network === 'ws') {
    proxy['ws-opts'] = {};
    if (node.path) {
      proxy['ws-opts'].path = node.path;
    }
    if (node.host) {
      proxy['ws-opts'].headers = { Host: node.host };
    }
  }

  // 处理gRPC配置
  if (node.network === 'grpc') {
    proxy['grpc-opts'] = {};
    if (node.path) {
      proxy['grpc-opts']['grpc-service-name'] = node.path;
    }
  }

  return proxy;
}

function generateTrojanProxy(node, serverIP, name) {
  const proxy = {
    name: name,
    type: 'trojan',
    server: serverIP,
    port: parseInt(node.port),
    password: node.password,
    'skip-cert-verify': true
  };

  if (node.sni) {
    proxy.sni = node.sni;
  }

  // 处理WebSocket配置
  if (node.network === 'ws') {
    proxy.network = 'ws';
    proxy['ws-opts'] = {};
    if (node.path) {
      proxy['ws-opts'].path = node.path;
    }
    if (node.host) {
      proxy['ws-opts'].headers = { Host: node.host };
    }
  }

  return proxy;
}

function generateShadowsocksProxy(node, serverIP, name) {
  return {
    name: name,
    type: 'ss',
    server: serverIP,
    port: parseInt(node.port),
    cipher: node.method || 'aes-256-gcm',
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
