export async function generateLoonConfig(config) {
  const { nodes, proxyIPs } = config;
  const proxies = [];

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
    }
  }

  const loonConfig = `[General]
ipv6 = false
dns-server = 223.5.5.5, 119.29.29.29
allow-wifi-access = false
wifi-access-http-port = 7222
wifi-access-socks5-port = 7221
proxy-test-url = http://www.gstatic.com/generate_204
test-timeout = 3

[Host]

[Proxy]
${proxies.join('\n')}

[Remote Proxy]

[Proxy Group]
PROXY = select,${proxies.map(p => p.split(' = ')[0]).join(',')}
AUTO = url-test,${proxies.map(p => p.split(' = ')[0]).join(',')},url = http://www.gstatic.com/generate_204,interval = 600

[Rule]
GEOIP,CN,DIRECT
FINAL,PROXY

[Remote Rule]

[URL Rewrite]

[Remote Rewrite]

[Script]

[Remote Script]

[Plugin]

[Mitm]
hostname =
ca-p12 =
ca-passphrase =
skip-server-cert-verify = true`;

  return loonConfig;
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
  params.push(`transport=${node.network || 'tcp'}`);
  
  if (node.host) params.push(`host=${node.host}`);
  if (node.path) params.push(`path=${node.path}`);
  if (node.tls === 'tls') params.push('over-tls=true');
  if (node.sni) params.push(`tls-name=${node.sni}`);
  
  return `${name} = vmess,${serverIP},${node.port},${node.uuid},"${node.method || 'auto'}",${params.join(',')}`;
}

function generateVlessProxy(node, serverIP, name) {
  const params = [];
  params.push(`transport=${node.network || 'tcp'}`);
  
  if (node.host) params.push(`host=${node.host}`);
  if (node.path) params.push(`path=${node.path}`);
  if (node.tls === 'tls') params.push('over-tls=true');
  if (node.sni) params.push(`tls-name=${node.sni}`);
  
  return `${name} = vless,${serverIP},${node.port},${node.uuid},${params.join(',')}`;
}

function generateTrojanProxy(node, serverIP, name) {
  const params = [];
  if (node.sni) params.push(`tls-name=${node.sni}`);
  
  return `${name} = trojan,${serverIP},${node.port},${node.password},${params.join(',')}`;
}

function generateShadowsocksProxy(node, serverIP, name) {
  return `${name} = shadowsocks,${serverIP},${node.port},${node.method},${node.password}`;
}
