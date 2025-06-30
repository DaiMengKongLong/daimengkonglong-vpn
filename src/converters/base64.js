export async function generateBase64Config(config) {
  const { nodes, proxyIPs } = config;
  const proxies = [];

  for (const node of nodes) {
    // 处理反代IP
    const serverIP = getProxyIP(node.server, proxyIPs) || node.server;
    
    let proxyUrl;
    
    switch (node.type.toLowerCase()) {
      case 'vmess':
        proxyUrl = generateVmessUrl(node, serverIP);
        break;
      case 'vless':
        proxyUrl = generateVlessUrl(node, serverIP);
        break;
      case 'trojan':
        proxyUrl = generateTrojanUrl(node, serverIP);
        break;
      case 'ss':
      case 'shadowsocks':
        proxyUrl = generateShadowsocksUrl(node, serverIP);
        break;
      default:
        continue;
    }
    
    if (proxyUrl) {
      proxies.push(proxyUrl);
    }
  }

  return btoa(proxies.join('\n'));
}

function getProxyIP(originalIP, proxyIPs) {
  if (!proxyIPs || proxyIPs.length === 0) return null;
  
  // 随机选择一个反代IP
  const randomIndex = Math.floor(Math.random() * proxyIPs.length);
  return proxyIPs[randomIndex];
}

function generateVmessUrl(node, serverIP) {
  const vmessConfig = {
    v: '2',
    ps: node.name || node.server,
    add: serverIP,
    port: node.port,
    id: node.uuid,
    aid: node.alterId || 0,
    net: node.network || 'tcp',
    type: node.type || 'none',
    host: node.host || '',
    path: node.path || '',
    tls: node.tls || '',
    sni: node.sni || ''
  };
  
  return 'vmess://' + btoa(JSON.stringify(vmessConfig));
}

function generateVlessUrl(node, serverIP) {
  const params = new URLSearchParams();
  params.set('type', node.network || 'tcp');
  params.set('security', node.tls || 'none');
  
  if (node.host) params.set('host', node.host);
  if (node.path) params.set('path', node.path);
  if (node.sni) params.set('sni', node.sni);
  
  return `vless://${node.uuid}@${serverIP}:${node.port}?${params.toString()}#${encodeURIComponent(node.name || node.server)}`;
}

function generateTrojanUrl(node, serverIP) {
  const params = new URLSearchParams();
  params.set('type', node.network || 'tcp');
  
  if (node.host) params.set('host', node.host);
  if (node.path) params.set('path', node.path);
  if (node.sni) params.set('sni', node.sni);
  
  return `trojan://${node.password}@${serverIP}:${node.port}?${params.toString()}#${encodeURIComponent(node.name || node.server)}`;
}

function generateShadowsocksUrl(node, serverIP) {
  const auth = btoa(`${node.method}:${node.password}`);
  return `ss://${auth}@${serverIP}:${node.port}#${encodeURIComponent(node.name || node.server)}`;
}
