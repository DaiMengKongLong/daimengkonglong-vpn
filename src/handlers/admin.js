import { getConfig, saveConfig } from '../utils/config.js';

export async function handleAdminPage(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || 'default';
  
  if (request.method === 'POST') {
    return handleAdminPost(request, env, token);
  }
  
  try {
    const config = await getConfig(env, token);
    const html = generateAdminPage(config, token);
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('管理页面生成错误:', error);
    return new Response('服务器错误', { status: 500 });
  }
}

async function handleAdminPost(request, env, token) {
  try {
    const formData = await request.formData();
    const action = formData.get('action');
    
    switch (action) {
      case 'save_config':
        return await handleSaveConfig(formData, env, token);
      case 'add_node':
        return await handleAddNode(formData, env, token);
      case 'delete_node':
        return await handleDeleteNode(formData, env, token);
      case 'add_proxy_ip':
        return await handleAddProxyIP(formData, env, token);
      case 'import_proxy_ips':
        return await handleImportProxyIPs(formData, env, token);
      default:
        return new Response('无效的操作', { status: 400 });
    }
  } catch (error) {
    console.error('管理操作错误:', error);
    return new Response('操作失败', { status: 500 });
  }
}

async function handleSaveConfig(formData, env, token) {
  const config = await getConfig(env, token);
  
  // 更新基本配置
  config.name = formData.get('name') || config.name;
  config.description = formData.get('description') || config.description;
  config.icon = formData.get('icon') || config.icon;
  config.customTitle = formData.get('customTitle') || config.customTitle;
  config.iniTemplate = formData.get('iniTemplate') || config.iniTemplate;
  config.clashTemplate = formData.get('clashTemplate') || config.clashTemplate;
  config.customCSS = formData.get('customCSS') || config.customCSS;
  
  const success = await saveConfig(env, token, config);
  
  if (success) {
    return new Response('配置保存成功', {
      status: 302,
      headers: { 'Location': `/admin?token=${token}&success=1` }
    });
  } else {
    return new Response('配置保存失败', { status: 500 });
  }
}

async function handleAddNode(formData, env, token) {
  const config = await getConfig(env, token);
  
  const node = {
    type: formData.get('nodeType'),
    name: formData.get('nodeName'),
    server: formData.get('nodeServer'),
    port: parseInt(formData.get('nodePort')),
    uuid: formData.get('nodeUuid'),
    password: formData.get('nodePassword'),
    method: formData.get('nodeMethod'),
    alterId: parseInt(formData.get('nodeAlterId') || '0'),
    network: formData.get('nodeNetwork'),
    path: formData.get('nodePath'),
    host: formData.get('nodeHost'),
    tls: formData.get('nodeTls'),
    sni: formData.get('nodeSni')
  };
  
  // 移除空值
  Object.keys(node).forEach(key => {
    if (node[key] === '' || node[key] === null || node[key] === undefined) {
      delete node[key];
    }
  });
  
  if (!config.nodes) config.nodes = [];
  config.nodes.push(node);
  
  const success = await saveConfig(env, token, config);
  
  return new Response('节点添加成功', {
    status: 302,
    headers: { 'Location': `/admin?token=${token}&success=2` }
  });
}

async function handleDeleteNode(formData, env, token) {
  const config = await getConfig(env, token);
  const nodeIndex = parseInt(formData.get('nodeIndex'));
  
  if (config.nodes && nodeIndex >= 0 && nodeIndex < config.nodes.length) {
    config.nodes.splice(nodeIndex, 1);
    await saveConfig(env, token, config);
  }
  
  return new Response('节点删除成功', {
    status: 302,
    headers: { 'Location': `/admin?token=${token}&success=3` }
  });
}

async function handleAddProxyIP(formData, env, token) {
  const config = await getConfig(env, token);
  const proxyIP = formData.get('proxyIP');
  
  if (proxyIP) {
    if (!config.proxyIPs) config.proxyIPs = [];
    if (!config.proxyIPs.includes(proxyIP)) {
      config.proxyIPs.push(proxyIP);
      await saveConfig(env, token, config);
    }
  }
  
  return new Response('反代IP添加成功', {
    status: 302,
    headers: { 'Location': `/admin?token=${token}&success=4` }
  });
}

async function handleImportProxyIPs(formData, env, token) {
  const config = await getConfig(env, token);
  const importData = formData.get('importData');
  
  if (importData) {
    const lines = importData.split('\n').map(line => line.trim()).filter(line => line);
    const newIPs = [];
    
    for (const line of lines) {
      // 支持CSV格式 (IP,端口,备注)
      const parts = line.split(',');
      const ip = parts[0].trim();
      
      if (ip && isValidIP(ip)) {
        newIPs.push(ip);
      }
    }
    
    if (!config.proxyIPs) config.proxyIPs = [];
    
    // 去重并添加
    newIPs.forEach(ip => {
      if (!config.proxyIPs.includes(ip)) {
        config.proxyIPs.push(ip);
      }
    });
    
    await saveConfig(env, token, config);
  }
  
  return new Response('反代IP导入成功', {
    status: 302,
    headers: { 'Location': `/admin?token=${token}&success=5` }
  });
}

function isValidIP(ip) {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
  return ipRegex.test(ip) || domainRegex.test(ip);
}

function generateAdminPage(config, token) {
  return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>管理面板 - ' + (config.customTitle || '节点订阅服务') + '</title><style>' + getAdminCSS() + '</style></head><body><div class="background"><div class="shape"></div><div class="shape"></div><div class="shape"></div></div><div class="container"><header class="glass-card"><h1>🔧 管理面板</h1><p>Token: ' + token + '</p><a href="/?token=' + token + '" class="back-link">← 返回首页</a></header><div class="admin-tabs"><button class="tab-btn active" onclick="showTab(\'basic\')">基础配置</button><button class="tab-btn" onclick="showTab(\'nodes\')">节点管理</button><button class="tab-btn" onclick="showTab(\'proxy\')">反代IP</button><button class="tab-btn" onclick="showTab(\'templates\')">模板配置</button></div><div id="basic" class="tab-content active"><div class="glass-card"><h2>基础配置</h2><form method="POST" class="config-form"><input type="hidden" name="action" value="save_config"><div class="form-group"><label>订阅名称</label><input type="text" name="name" value="' + (config.name || '') + '" required></div><div class="form-group"><label>订阅描述</label><textarea name="description" rows="3">' + (config.description || '') + '</textarea></div><div class="form-group"><label>图标URL</label><input type="url" name="icon" value="' + (config.icon || '') + '" placeholder="https://example.com/icon.png"></div><div class="form-group"><label>自定义标题</label><input type="text" name="customTitle" value="' + (config.customTitle || '') + '" placeholder="网站标题"></div><div class="form-group"><label>自定义CSS</label><textarea name="customCSS" rows="5" placeholder="/* 自定义样式 */">' + (config.customCSS || '') + '</textarea></div><button type="submit" class="submit-btn">💾 保存配置</button></form></div></div><div id="nodes" class="tab-content"><div class="glass-card"><h2>节点列表 (' + (config.nodes ? config.nodes.length : 0) + '个)</h2><div class="nodes-list">' + (config.nodes ? config.nodes.map((node, index) => '<div class="node-item"><div class="node-info"><strong>' + (node.name || node.server) + '</strong><span class="node-type">' + node.type.toUpperCase() + '</span><span class="node-address">' + node.server + ':' + node.port + '</span></div><form method="POST" style="display: inline;"><input type="hidden" name="action" value="delete_node"><input type="hidden" name="nodeIndex" value="' + index + '"><button type="submit" class="delete-btn" onclick="return confirm(\'确定删除此节点？\')">🗑️</button></form></div>').join('') : '<p>暂无节点</p>') + '</div></div><div class="glass-card"><h2>添加节点</h2><form method="POST" class="node-form"><input type="hidden" name="action" value="add_node"><div class="form-row"><div class="form-group"><label>节点类型</label><select name="nodeType" required onchange="toggleNodeFields(this.value)"><option value="vmess">VMess</option><option value="vless">VLESS</option><option value="trojan">Trojan</option><option value="ss">Shadowsocks</option></select></div><div class="form-group"><label>节点名称</label><input type="text" name="nodeName" required></div></div><div class="form-row"><div class="form-group"><label>服务器地址</label><input type="text" name="nodeServer" required></div><div class="form-group"><label>端口</label><input type="number" name="nodePort" required min="1" max="65535"></div></div><div id="vmess-fields" class="node-fields"><div class="form-group"><label>UUID</label><input type="text" name="nodeUuid"></div><div class="form-group"><label>AlterID</label><input type="number" name="nodeAlterId" value="0"></div></div><div id="trojan-fields" class="node-fields" style="display: none;"><div class="form-group"><label>密码</label><input type="text" name="nodePassword"></div></div><div id="ss-fields" class="node-fields" style="display: none;"><div class="form-row"><div class="form-group"><label>密码</label><input type="text" name="nodePassword"></div><div class="form-group"><label>加密方式</label><select name="nodeMethod"><option value="aes-256-gcm">aes-256-gcm</option><option value="aes-128-gcm">aes-128-gcm</option><option value="chacha20-poly1305">chacha20-poly1305</option></select></div></div></div><div class="form-row"><div class="form-group"><label>传输协议</label><select name="nodeNetwork"><option value="tcp">TCP</option><option value="ws">WebSocket</option><option value="grpc">gRPC</option></select></div><div class="form-group"><label>TLS</label><select name="nodeTls"><option value="">无</option><option value="tls">TLS</option></select></div></div><div class="form-row"><div class="form-group"><label>路径 (WebSocket)</label><input type="text" name="nodePath" placeholder="/path"></div><div class="form-group"><label>Host</label><input type="text" name="nodeHost" placeholder="example.com"></div></div><div class="form-group"><label>SNI</label><input type="text" name="nodeSni" placeholder="example.com"></div><button type="submit" class="submit-btn">➕ 添加节点</button></form></div></div><div id="proxy" class="tab-content"><div class="glass-card"><h2>反代IP列表 (' + (config.proxyIPs ? config.proxyIPs.length : 0) + '个)</h2><div class="proxy-list">' + (config.proxyIPs ? config.proxyIPs.map(ip => '<div class="proxy-item">' + ip + '</div>').join('') : '<p>暂无反代IP</p>') + '</div></div><div class="glass-card"><h2>添加反代IP</h2><form method="POST" class="proxy-form"><input type="hidden" name="action" value="add_proxy_ip"><div class="form-group"><label>IP地址或域名</label><input type="text" name="proxyIP" required placeholder="1.2.3.4 或 example.com"></div><button type="submit" class="submit-btn">➕ 添加IP</button></form></div><div class="glass-card"><h2>批量导入反代IP</h2><form method="POST" class="import-form"><input type="hidden" name="action" value="import_proxy_ips"><div class="form-group"><label>导入数据 (支持TXT/CSV格式，每行一个IP)</label><textarea name="importData" rows="10" placeholder="1.2.3.4&#10;example.com&#10;5.6.7.8,443,备注"></textarea></div><button type="submit" class="submit-btn">📥 批量导入</button></form></div></div><div id="templates" class="tab-content"><div class="glass-card"><h2>INI模板配置</h2><form method="POST" class="template-form"><input type="hidden" name="action" value="save_config"><div class="form-group"><label>INI配置模板</label><textarea name="iniTemplate" rows="20" class="code-textarea">' + (config.iniTemplate || '') + '</textarea></div><button type="submit" class="submit-btn">💾 保存INI模板</button></form></div><div class="glass-card"><h2>Clash模板配置</h2><form method="POST" class="template-form"><input type="hidden" name="action" value="save_config"><div class="form-group"><label>Clash配置模板 (JSON格式，可选)</label><textarea name="clashTemplate" rows="15" class="code-textarea" placeholder=\'{"dns": {"enable": true}}\'>' + (config.clashTemplate || '') + '</textarea></div><button type="submit" class="submit-btn">💾 保存Clash模板</button></form></div></div></div><script>' + getAdminJavaScript() + '</script></body></html>';
}

function getAdminCSS() {
  return '* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; overflow-x: hidden; } .background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; } .shape { position: absolute; border-radius: 50%; filter: blur(40px); animation: float 6s ease-in-out infinite; } .shape:nth-child(1) { width: 300px; height: 300px; background: linear-gradient(45deg, #ff6b6b, #feca57); top: 10%; left: 10%; animation-delay: 0s; } .shape:nth-child(2) { width: 200px; height: 200px; background: linear-gradient(45deg, #48cae4, #023e8a); top: 60%; right: 10%; animation-delay: 2s; } .shape:nth-child(3) { width: 250px; height: 250px; background: linear-gradient(45deg, #f093fb, #f5576c); bottom: 10%; left: 50%; animation-delay: 4s; } @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 33% { transform: translateY(-20px) rotate(120deg); } 66% { transform: translateY(20px) rotate(240deg); } } .container { max-width: 1200px; margin: 0 auto; padding: 20px; position: relative; z-index: 1; } .glass-card { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2); padding: 30px; margin: 20px 0; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; } h1, h2 { color: white; margin-bottom: 20px; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); } h1 { font-size: 2.5em; } h2 { font-size: 1.8em; } .back-link { color: #feca57; text-decoration: none; font-weight: 600; transition: color 0.3s ease; } .back-link:hover { color: #ff6b6b; } .admin-tabs { display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap; } .tab-btn { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; } .tab-btn.active, .tab-btn:hover { background: linear-gradient(45deg, #667eea, #764ba2); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3); } .tab-content { display: none; } .tab-content.active { display: block; } .form-group { margin-bottom: 20px; } .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; } label { display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 8px; } input, textarea, select { width: 100%; padding: 12px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; color: white; font-size: 14px; transition: all 0.3s ease; } input:focus, textarea:focus, select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); } input::placeholder, textarea::placeholder { color: rgba(255, 255, 255, 0.5); } .code-textarea { font-family: "Monaco", "Menlo", monospace; font-size: 12px; line-height: 1.5; } .submit-btn { background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; padding: 12px 30px; border-radius: 25px; cursor: pointer; font-weight: 600; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); } .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3); } .nodes-list { max-height: 400px; overflow-y: auto; } .node-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; margin-bottom: 10px; border: 1px solid rgba(255, 255, 255, 0.1); } .node-info { display: flex; flex-direction: column; gap: 5px; } .node-info strong { color: white; font-size: 16px; } .node-type { background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; width: fit-content; } .node-address { color: rgba(255, 255, 255, 0.7); font-size: 14px; } .delete-btn { background: linear-gradient(45deg, #ff6b6b, #ee5a52); color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; } .delete-btn:hover { transform: scale(1.1); } .node-fields { display: block; } .proxy-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; max-height: 300px; overflow-y: auto; } .proxy-item { background: rgba(255, 255, 255, 0.1); padding: 10px 15px; border-radius: 8px; color: white; text-align: center; border: 1px solid rgba(255, 255, 255, 0.2); } @media (max-width: 768px) { .container { padding: 10px; } .glass-card { padding: 20px; } .form-row { grid-template-columns: 1fr; } .admin-tabs { flex-direction: column; } .tab-btn { text-align: center; } }';
}

function getAdminJavaScript() {
  return 'function showTab(tabName) { const tabContents = document.querySelectorAll(\'.tab-content\'); tabContents.forEach(content => { content.classList.remove(\'active\'); }); const tabBtns = document.querySelectorAll(\'.tab-btn\'); tabBtns.forEach(btn => { btn.classList.remove(\'active\'); }); document.getElementById(tabName).classList.add(\'active\'); event.target.classList.add(\'active\'); } function toggleNodeFields(nodeType) { const allFields = document.querySelectorAll(\'.node-fields\'); allFields.forEach(field => { field.style.display = \'none\'; }); const targetField = document.getElementById(nodeType + \'-fields\'); if (targetField) { targetField.style.display = \'block\'; } const uuidField = document.querySelector(\'input[name=nodeUuid]\'); const passwordField = document.querySelector(\'input[name=nodePassword]\'); const methodField = document.querySelector(\'select[name=nodeMethod]\'); if (uuidField) uuidField.required = false; if (passwordField) passwordField.required = false; if (methodField) methodField.required = false; switch(nodeType) { case \'vmess\': case \'vless\': if (uuidField) uuidField.required = true; break; case \'trojan\': if (passwordField) passwordField.required = true; break; case \'ss\': if (passwordField) passwordField.required = true; if (methodField) methodField.required = true; break; } } document.addEventListener(\'DOMContentLoaded\', function() { const urlParams = new URLSearchParams(window.location.search); const success = urlParams.get(\'success\'); if (success) { const messages = { \'1\': \'配置保存成功！\', \'2\': \'节点添加成功！\', \'3\': \'节点删除成功！\', \'4\': \'反代IP添加成功！\', \'5\': \'反代IP导入成功！\' }; if (messages[success]) { showNotification(messages[success], \'success\'); } const newUrl = window.location.pathname + \'?token=\' + urlParams.get(\'token\'); window.history.replaceState({}, \'\', newUrl); } const nodeTypeSelect = document.querySelector(\'select[name=nodeType]\'); if (nodeTypeSelect) { toggleNodeFields(nodeTypeSelect.value); } const cards = document.querySelectorAll(\'.glass-card\'); cards.forEach((card, index) => { card.style.opacity = \'0\'; card.style.transform = \'translateY(30px)\'; setTimeout(() => { card.style.transition = \'all 0.6s ease\'; card.style.opacity = \'1\'; card.style.transform = \'translateY(0)\'; }, index * 100); }); }); function showNotification(message, type) { type = type || \'info\'; const notification = document.createElement(\'div\'); notification.className = \'notification \' + type; notification.textContent = message; notification.style.cssText = \'position: fixed; top: 20px; right: 20px; background: \' + (type === \'success\' ? \'linear-gradient(45deg, #00b894, #00cec9)\' : \'linear-gradient(45deg, #667eea, #764ba2)\') + \'; color: white; padding: 15px 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); z-index: 1000; transform: translateX(400px); transition: transform 0.3s ease;\'; document.body.appendChild(notification); setTimeout(() => { notification.style.transform = \'translateX(0)\'; }, 100); setTimeout(() => { notification.style.transform = \'translateX(400px)\'; setTimeout(() => { document.body.removeChild(notification); }, 300); }, 3000); } function generateUUID() { return \'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx\'.replace(/[xy]/g, function(c) { const r = Math.random() * 16 | 0; const v = c == \'x\' ? r : (r & 0x3 | 0x8); return v.toString(16); }); } document.addEventListener(\'DOMContentLoaded\', function() { const uuidField = document.querySelector(\'input[name=nodeUuid]\'); if (uuidField) { const generateBtn = document.createElement(\'button\'); generateBtn.type = \'button\'; generateBtn.textContent = \'🎲 生成UUID\'; generateBtn.className = \'generate-uuid-btn\'; generateBtn.style.cssText = \'margin-left: 10px; padding: 8px 15px; background: linear-gradient(45deg, #feca57, #ff9ff3); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;\'; generateBtn.onclick = function() { uuidField.value = generateUUID(); }; uuidField.parentNode.appendChild(generateBtn); } });';
}
