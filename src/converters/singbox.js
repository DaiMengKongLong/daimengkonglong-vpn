export async function generateSingBoxConfig(config) {
  const { nodes, proxyIPs } = config;
  const outbounds = [];
  const tags = [];

  // 添加直连和阻断出站
  outbounds.push({
    type: "direct",
    tag: "direct"
  });
  
  outbounds.push({
    type: "block",
    tag: "block"
  });

  // 生成代理出站
  for (const node of nodes) {
    const serverIP = getProxyIP(node.server, proxyIPs) || node.server;
    const tag = node.name || `${node.server}:${node.port}`;
    
    let outbound;
    
    switch (node.type.toLowerCase()) {
      case 'vmess':
        outbound = generateVmessOutbound(node, serverIP, tag);
        break;
      case 'vless':
        outbound = generateVlessOutbound(node, serverIP, tag);
        break;
      case 'trojan':
        outbound = generateTrojanOutbound(node, serverIP, tag);
        break;
      case 'ss':
      case 'shadowsocks':
        outbound = generateShadowsocksOutbound(node, serverIP, tag);
        break;
      default:
        continue;
    }
    
    if (outbound) {
      outbounds.push(outbound);
      tags.push(tag);
    }
  }

  // 添加选择器出站
  outbounds.unshift({
    type: "selector",
    tag: "proxy",
    outbounds: ["auto", ...tags, "direct"]
  });

  outbounds.unshift({
    type: "urltest",
    tag: "auto",
    outbounds: tags,
    url: "https://www.gstatic.com/generate_204",
    interval: "5m",
    tolerance: 50
  });

  const singboxConfig = {
    log: {
      level: "info",
      timestamp: true
    },
    dns: {
      servers: [
        {
          tag: "google",
          address: "tls://8.8.8.8",
          strategy: "prefer_ipv4"
        },
        {
          tag: "local",
          address: "223.5.5.5",
          strategy: "prefer_ipv4",
          detour: "direct"
        }
      ],
      rules: [
        {
          geosite: "cn",
          server: "local"
        }
      ],
      final: "google",
      strategy: "prefer_ipv4"
    },
    inbounds: [
      {
        type: "mixed",
        listen: "127.0.0.1",
        listen_port: 2080,
        sniff: true,
        sniff_override_destination: true
      }
    ],
    outbounds: outbounds,
    route: {
      geoip: {
        download_url: "https://github.com/SagerNet/sing-geoip/releases/latest/download/geoip.db",
        download_detour: "proxy"
      },
      geosite: {
        download_url: "https://github.com/SagerNet/sing-geosite/releases/latest/download/geosite.db",
        download_detour: "proxy"
      },
      rules: [
        {
          protocol: "dns",
          outbound: "dns-out"
        },
        {
          geosite: "cn",
          geoip: "cn",
          outbound: "direct"
        },
        {
          geosite: "geolocation-!cn",
          outbound: "proxy"
        }
      ],
      final: "proxy",
      auto_detect_interface: true
    }
  };

  return JSON.stringify(singboxConfig, null, 2);
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

function generateVmessOutbound(node, serverIP, tag) {
  return {
    type: "vmess",
    tag: tag,
    server: serverIP,
    server_port: node.port,
    uuid: node.uuid,
    alter_id: node.alterId || 0,
    security: "auto",
    transport: {
      type: node.network || "tcp",
      ...(node.network === "ws" && {
        path: node.path || "/",
        headers: node.host ? { Host: node.host } : {}
      })
    },
    ...(node.tls === "tls" && {
      tls: {
        enabled: true,
        insecure: true,
        server_name: node.sni || node.host || serverIP
      }
    })
  };
}

function generateVlessOutbound(node, serverIP, tag) {
  return {
    type: "vless",
    tag: tag,
    server: serverIP,
    server_port: node.port,
    uuid: node.uuid,
    transport: {
      type: node.network || "tcp",
      ...(node.network === "ws" && {
        path: node.path || "/",
        headers: node.host ? { Host: node.host } : {}
      })
    },
    ...(node.tls === "tls" && {
      tls: {
        enabled: true,
        insecure: true,
        server_name: node.sni || node.host || serverIP
      }
    })
  };
}

function generateTrojanOutbound(node, serverIP, tag) {
  return {
    type: "trojan",
    tag: tag,
    server: serverIP,
    server_port: node.port,
    password: node.password,
    tls: {
      enabled: true,
      insecure: true,
      server_name: node.sni || serverIP
    }
  };
}

function generateShadowsocksOutbound(node, serverIP, tag) {
  return {
    type: "shadowsocks",
    tag: tag,
    server: serverIP,
    server_port: node.port,
    method: node.method,
    password: node.password
  };
}
