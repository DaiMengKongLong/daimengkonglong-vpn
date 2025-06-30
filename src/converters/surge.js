export async function generateSurgeConfig(config) {
  const { nodes, proxyIPs } = config;
  const proxies = [];
  const proxyNames = [];

  for (const node of nodes) {
    const serverIP = getProxyIP(node.server, proxyIPs) || node.server;
    const name = node.name || `${node.server}:${node.port}`;
    
    let proxy;
    
    switch (node.type.toLowerCase()) {
      case 'vmess':
        proxy = generateVmessProxy(node, serverIP, name);
        break;
      case 'vless':
        proxy = generateVlessProxy(node, serverIP, name);
        break;
      case 'trojan':
        proxy = generateTrojanProxy(node, serverIP, name);
        break;
      case 'ss':
      case 'shadowsocks':
        proxy = generateShadowsocksProxy(node, serverIP, name);
        break;
      default:
        continue;
    }
    
    if (proxy) {
      proxies.push(proxy);
      proxyNames.push(name);
    }
  }

  const surgeConfig = `#!MANAGED-CONFIG https://example.com/surge.conf

[General]
loglevel = notify
internet-test-url = http://www.gstatic.com/generate_204
proxy-test-url = http://www.gstatic.com/generate_204
test-timeout = 3
dns-server = 223.5.5.5, 119.29.29.29
wifi-assist = true
ipv6 = false

[Replica]
hide-apple-request = true
hide-crash-reporter-request = true
use-keyword-filter = false

[Proxy]
${proxies.join('\n')}

[Proxy Group]
PROXY = select, ${proxyNames.join(', ')}
AUTO = url-test, ${proxyNames.join(', ')}, url = http://www.gstatic.com/generate_204, interval = 600, tolerance = 100

[Rule]
RULE-SET,https://raw.githubusercontent.com/DivineEngine/Profiles/master/Surge/Ruleset/Guard/Advertising.list,REJECT
RULE-SET,https://raw.githubusercontent.com/DivineEngine/Profiles/master/Surge/Ruleset/Guard/Hijacking.list,REJECT
RULE-SET,https://raw.githubusercontent.com/DivineEngine/Profiles/master/Surge/Ruleset/Guard/Privacy.list,REJECT
RULE-SET,https://raw.githubusercontent.com/DivineEngine/Profiles/master/Surge/Ruleset/China.list,DIRECT
GEOIP,CN,DIRECT
FINAL,PROXY,dns-failed

[Host]
*.taobao.com = server:223.5.5.5
*.tmall.com = server:223.5.5.5
*.alipay.com = server:223.5.5.5
*.alicdn.com = server:223.5.5.5
*.aliyun.com = server:223.5.5.5
*.jd.com = server:119.28.28.28
*.qq.com = server:119.28.28.28
*.tencent.com = server:119.28.28.28
*.weixin.com = server:119.28.28.28
*.bilibili.com = server:119.29.29.29
hdslb.com = server:119.29.29.29

[URL Rewrite]
^https?://(www.)?g.cn https://www.google.com 302
^https?://(www.)?google.cn https://www.google.com 302

[MITM]
skip-server-cert-verify = true
hostname = *.google.cn, *.google.com.hk`;

  return surgeConfig;
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
  const params = [];
  params.push(`username=${node.uuid}`);
  
  if (node.network === 'ws') {
    params.push('ws=true');
    if (node.path) params.push(`ws-path=${node.path}`);
    if (node.host) params.push(`ws-headers=Host:${node.host}`);
  }
  
  if (node.tls === 'tls') {
    params.push('tls=true');
    if (node.sni) params.push(`sni=${node.sni}`);
  }
  
  params.push('vmess-aead=true');
  
  return `${name} = vmess, ${serverIP}, ${node.port}, ${params.join(', ')}`;
}

function generateVlessProxy(node, serverIP, name) {
  // Surge 不直接支持 VLESS，转换为 Trojan 或跳过
  return null;
}

function generateTrojanProxy(node, serverIP, name) {
  const params = [];
  params.push(`password=${node.password}`);
  
  if (node.sni) params.push(`sni=${node.sni}`);
  params.push('tls=true');
  
  return `${name} = trojan, ${serverIP}, ${node.port}, ${params.join(', ')}`;
}

function generateShadowsocksProxy(node, serverIP, name) {
  return `${name} = ss, ${serverIP}, ${node.port}, encrypt-method=${node.method}, password=${node.password}`;
}
