// 配置管理工具

export async function getConfig(env, token = 'default') {
  try {
    const configKey = `config_${token}`;
    const configData = await env.CONFIG_KV.get(configKey);
    
    if (!configData) {
      // 返回默认配置
      return getDefaultConfig();
    }
    
    return JSON.parse(configData);
  } catch (error) {
    console.error('获取配置失败:', error);
    return getDefaultConfig();
  }
}

export async function saveConfig(env, token, config) {
  try {
    const configKey = `config_${token}`;
    await env.CONFIG_KV.put(configKey, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('保存配置失败:', error);
    return false;
  }
}

export async function getAllConfigs(env) {
  try {
    const list = await env.CONFIG_KV.list({ prefix: 'config_' });
    const configs = [];
    
    for (const key of list.keys) {
      const token = key.name.replace('config_', '');
      const configData = await env.CONFIG_KV.get(key.name);
      if (configData) {
        const config = JSON.parse(configData);
        configs.push({
          token,
          name: config.name || token,
          nodeCount: config.nodes ? config.nodes.length : 0,
          lastModified: key.metadata?.lastModified || new Date().toISOString()
        });
      }
    }
    
    return configs;
  } catch (error) {
    console.error('获取配置列表失败:', error);
    return [];
  }
}

export function getDefaultConfig() {
  return {
    name: '默认订阅',
    description: '默认订阅配置',
    icon: 'https://img.picui.cn/free/2025/06/30/686234d353680.png',
    nodes: [
      {
        type: 'vmess',
        name: '示例节点',
        server: '1.2.3.4',
        port: 443,
        uuid: '12345678-1234-1234-1234-123456789abc',
        alterId: 0,
        network: 'ws',
        path: '/path',
        host: 'example.com',
        tls: 'tls'
      }
    ],
    proxyIPs: [],
    iniTemplate: getDefaultIniTemplate(),
    clashTemplate: null,
    customTitle: '节点订阅服务',
    customCSS: ''
  };
}

export function getDefaultIniTemplate() {
  return `[custom]
;自定义规则
;设置规则标志位
ruleset=🎯 全球直连,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/LocalAreaNetwork.list
ruleset=🎯 全球直连,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/UnBan.list
ruleset=🛑 广告拦截,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list
ruleset=🍃 应用净化,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanProgramAD.list
ruleset=🎯 全球直连,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/GoogleCN.list
ruleset=🎯 全球直连,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/SteamCN.list
ruleset=Ⓜ️ 微软云盘,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/OneDrive.list
ruleset=Ⓜ️ 微软服务,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list
ruleset=🍎 苹果服务,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list
ruleset=📲 电报消息,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list
ruleset=🎶 网易音乐,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/NetEaseMusic.list
ruleset=🎮 游戏平台,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Epic.list
ruleset=🎮 游戏平台,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Sony.list
ruleset=🎮 游戏平台,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Steam.list
ruleset=📹 油管视频,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list
ruleset=🎥 奈飞视频,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list
ruleset=📺 巴哈姆特,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Bahamut.list
ruleset=📺 哔哩哔哩,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/BilibiliHMT.list
ruleset=📺 哔哩哔哩,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Bilibili.list
ruleset=🌍 国外媒体,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list
ruleset=🚀 节点选择,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list
ruleset=🎯 全球直连,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaIp.list
ruleset=🎯 全球直连,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list
ruleset=🎯 全球直连,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaCompanyIp.list
ruleset=🎯 全球直连,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Download.list
ruleset=🎯 全球直连,[]GEOIP,CN
ruleset=🐟 漏网之鱼,[]FINAL

;设置规则标志位
custom_proxy_group=🚀 节点选择\`select\`[]♻️ 自动选择\`[]🔯 故障转移\`[]🔮 负载均衡\`[]🎯 全球直连\`.*
custom_proxy_group=♻️ 自动选择\`url-test\`.*\`http://www.gstatic.com/generate_204\`300,,50
custom_proxy_group=🔯 故障转移\`fallback\`.*\`http://www.gstatic.com/generate_204\`300,,50
custom_proxy_group=🔮 负载均衡\`load-balance\`.*\`http://www.gstatic.com/generate_204\`300,,50
custom_proxy_group=📲 电报消息\`select\`[]🚀 节点选择\`[]♻️ 自动选择\`[]🎯 全球直连\`.*
custom_proxy_group=📹 油管视频\`select\`[]🚀 节点选择\`[]♻️ 自动选择\`[]🎯 全球直连\`.*
custom_proxy_group=🎥 奈飞视频\`select\`[]🚀 节点选择\`[]♻️ 自动选择\`[]🎯 全球直连\`.*
custom_proxy_group=📺 巴哈姆特\`select\`[]🚀 节点选择\`[]♻️ 自动选择\`[]🎯 全球直连\`.*
custom_proxy_group=📺 哔哩哔哩\`select\`[]🎯 全球直连\`[]🚀 节点选择\`[]♻️ 自动选择
custom_proxy_group=🌍 国外媒体\`select\`[]🚀 节点选择\`[]♻️ 自动选择\`[]🎯 全球直连\`.*
custom_proxy_group=🌏 国内媒体\`select\`[]🎯 全球直连\`[]🚀 节点选择\`[]♻️ 自动选择
custom_proxy_group=Ⓜ️ 微软云盘\`select\`[]🎯 全球直连\`[]🚀 节点选择\`[]♻️ 自动选择
custom_proxy_group=Ⓜ️ 微软服务\`select\`[]🎯 全球直连\`[]🚀 节点选择\`[]♻️ 自动选择
custom_proxy_group=🍎 苹果服务\`select\`[]🎯 全球直连\`[]🚀 节点选择\`[]♻️ 自动选择
custom_proxy_group=🎮 游戏平台\`select\`[]🎯 全球直连\`[]🚀 节点选择\`[]♻️ 自动选择
custom_proxy_group=🎶 网易音乐\`select\`[]🎯 全球直连\`[]🚀 节点选择\`[]♻️ 自动选择\`.*
custom_proxy_group=🎯 全球直连\`select\`[]DIRECT\`[]🚀 节点选择\`[]♻️ 自动选择
custom_proxy_group=🛑 广告拦截\`select\`[]REJECT\`[]🎯 全球直连
custom_proxy_group=🍃 应用净化\`select\`[]REJECT\`[]🎯 全球直连
custom_proxy_group=🐟 漏网之鱼\`select\`[]🚀 节点选择\`[]🎯 全球直连\`[]♻️ 自动选择\`.*

enable_rule_generator=true
overwrite_original_rules=true`;
}
