#!/usr/bin/env node

// 彻底修复字符串字面量问题
const fs = require('fs');

console.log('🔧 彻底修复字符串字面量问题...\n');

// 修复 admin.js
console.log('🔍 修复 src/handlers/admin.js...');
fixAdminJS();

// 修复 home.js  
console.log('🔍 修复 src/handlers/home.js...');
fixHomeJS();

function fixAdminJS() {
  const filePath = 'src/handlers/admin.js';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 找到 getAdminCSS 函数并替换
  const cssFunction = `function getAdminCSS() {
  return '* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; overflow-x: hidden; } .background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; } .shape { position: absolute; border-radius: 50%; filter: blur(40px); animation: float 6s ease-in-out infinite; } .shape:nth-child(1) { width: 300px; height: 300px; background: linear-gradient(45deg, #ff6b6b, #feca57); top: 10%; left: 10%; animation-delay: 0s; } .shape:nth-child(2) { width: 200px; height: 200px; background: linear-gradient(45deg, #48cae4, #023e8a); top: 60%; right: 10%; animation-delay: 2s; } .shape:nth-child(3) { width: 250px; height: 250px; background: linear-gradient(45deg, #f093fb, #f5576c); bottom: 10%; left: 50%; animation-delay: 4s; } @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 33% { transform: translateY(-20px) rotate(120deg); } 66% { transform: translateY(20px) rotate(240deg); } } .container { max-width: 1200px; margin: 0 auto; padding: 20px; position: relative; z-index: 1; } .glass-card { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2); padding: 30px; margin: 20px 0; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; } h1, h2 { color: white; margin-bottom: 20px; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); } h1 { font-size: 2.5em; } h2 { font-size: 1.8em; } .back-link { color: #feca57; text-decoration: none; font-weight: 600; transition: color 0.3s ease; } .back-link:hover { color: #ff6b6b; } .admin-tabs { display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap; } .tab-btn { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; } .tab-btn.active, .tab-btn:hover { background: linear-gradient(45deg, #667eea, #764ba2); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3); } .tab-content { display: none; } .tab-content.active { display: block; } .form-group { margin-bottom: 20px; } .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; } label { display: block; color: rgba(255, 255, 255, 0.9); font-weight: 600; margin-bottom: 8px; } input, textarea, select { width: 100%; padding: 12px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; color: white; font-size: 14px; transition: all 0.3s ease; } input:focus, textarea:focus, select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); } input::placeholder, textarea::placeholder { color: rgba(255, 255, 255, 0.5); } .code-textarea { font-family: "Monaco", "Menlo", monospace; font-size: 12px; line-height: 1.5; } .submit-btn { background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; padding: 12px 30px; border-radius: 25px; cursor: pointer; font-weight: 600; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); } .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3); } .nodes-list { max-height: 400px; overflow-y: auto; } .node-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; margin-bottom: 10px; border: 1px solid rgba(255, 255, 255, 0.1); } .node-info { display: flex; flex-direction: column; gap: 5px; } .node-info strong { color: white; font-size: 16px; } .node-type { background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; width: fit-content; } .node-address { color: rgba(255, 255, 255, 0.7); font-size: 14px; } .delete-btn { background: linear-gradient(45deg, #ff6b6b, #ee5a52); color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; } .delete-btn:hover { transform: scale(1.1); } .node-fields { display: block; } .proxy-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; max-height: 300px; overflow-y: auto; } .proxy-item { background: rgba(255, 255, 255, 0.1); padding: 10px 15px; border-radius: 8px; color: white; text-align: center; border: 1px solid rgba(255, 255, 255, 0.2); } @media (max-width: 768px) { .container { padding: 10px; } .glass-card { padding: 20px; } .form-row { grid-template-columns: 1fr; } .admin-tabs { flex-direction: column; } .tab-btn { text-align: center; } }';
}`;

  // 找到 getAdminJavaScript 函数并替换
  const jsFunction = `function getAdminJavaScript() {
  return 'function showTab(tabName) { const tabContents = document.querySelectorAll(".tab-content"); tabContents.forEach(content => { content.classList.remove("active"); }); const tabBtns = document.querySelectorAll(".tab-btn"); tabBtns.forEach(btn => { btn.classList.remove("active"); }); document.getElementById(tabName).classList.add("active"); event.target.classList.add("active"); } function toggleNodeFields(nodeType) { const allFields = document.querySelectorAll(".node-fields"); allFields.forEach(field => { field.style.display = "none"; }); const targetField = document.getElementById(nodeType + "-fields"); if (targetField) { targetField.style.display = "block"; } const uuidField = document.querySelector("input[name=\\"nodeUuid\\"]"); const passwordField = document.querySelector("input[name=\\"nodePassword\\"]"); const methodField = document.querySelector("select[name=\\"nodeMethod\\"]"); if (uuidField) uuidField.required = false; if (passwordField) passwordField.required = false; if (methodField) methodField.required = false; switch(nodeType) { case "vmess": case "vless": if (uuidField) uuidField.required = true; break; case "trojan": if (passwordField) passwordField.required = true; break; case "ss": if (passwordField) passwordField.required = true; if (methodField) methodField.required = true; break; } } document.addEventListener("DOMContentLoaded", function() { const urlParams = new URLSearchParams(window.location.search); const success = urlParams.get("success"); if (success) { const messages = { "1": "配置保存成功！", "2": "节点添加成功！", "3": "节点删除成功！", "4": "反代IP添加成功！", "5": "反代IP导入成功！" }; if (messages[success]) { showNotification(messages[success], "success"); } const newUrl = window.location.pathname + "?token=" + urlParams.get("token"); window.history.replaceState({}, "", newUrl); } const nodeTypeSelect = document.querySelector("select[name=\\"nodeType\\"]"); if (nodeTypeSelect) { toggleNodeFields(nodeTypeSelect.value); } const cards = document.querySelectorAll(".glass-card"); cards.forEach((card, index) => { card.style.opacity = "0"; card.style.transform = "translateY(30px)"; setTimeout(() => { card.style.transition = "all 0.6s ease"; card.style.opacity = "1"; card.style.transform = "translateY(0)"; }, index * 100); }); }); function showNotification(message, type = "info") { const notification = document.createElement("div"); notification.className = "notification " + type; notification.textContent = message; notification.style.cssText = "position: fixed; top: 20px; right: 20px; background: " + (type === "success" ? "linear-gradient(45deg, #00b894, #00cec9)" : "linear-gradient(45deg, #667eea, #764ba2)") + "; color: white; padding: 15px 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); z-index: 1000; transform: translateX(400px); transition: transform 0.3s ease;"; document.body.appendChild(notification); setTimeout(() => { notification.style.transform = "translateX(0)"; }, 100); setTimeout(() => { notification.style.transform = "translateX(400px)"; setTimeout(() => { document.body.removeChild(notification); }, 300); }, 3000); } function generateUUID() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) { const r = Math.random() * 16 | 0; const v = c == "x" ? r : (r & 0x3 | 0x8); return v.toString(16); }); } document.addEventListener("DOMContentLoaded", function() { const uuidField = document.querySelector("input[name=\\"nodeUuid\\"]"); if (uuidField) { const generateBtn = document.createElement("button"); generateBtn.type = "button"; generateBtn.textContent = "🎲 生成UUID"; generateBtn.className = "generate-uuid-btn"; generateBtn.style.cssText = "margin-left: 10px; padding: 8px 15px; background: linear-gradient(45deg, #feca57, #ff9ff3); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;"; generateBtn.onclick = function() { uuidField.value = generateUUID(); }; uuidField.parentNode.appendChild(generateBtn); } });';
}`;

  // 替换函数
  content = content.replace(
    /function getAdminCSS\(\) \{[\s\S]*?\n\}/,
    cssFunction
  );
  
  content = content.replace(
    /function getAdminJavaScript\(\) \{[\s\S]*?\n\}/,
    jsFunction
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ admin.js 修复完成');
}

function fixHomeJS() {
  const filePath = 'src/handlers/home.js';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 找到 getGlassmorphismCSS 函数并替换
  const cssFunction = `function getGlassmorphismCSS() {
  return '* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; overflow-x: hidden; position: relative; } .background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; } .shape { position: absolute; border-radius: 50%; filter: blur(40px); animation: float 6s ease-in-out infinite; } .shape:nth-child(1) { width: 300px; height: 300px; background: linear-gradient(45deg, #ff6b6b, #feca57); top: 10%; left: 10%; animation-delay: 0s; } .shape:nth-child(2) { width: 200px; height: 200px; background: linear-gradient(45deg, #48cae4, #023e8a); top: 60%; right: 10%; animation-delay: 2s; } .shape:nth-child(3) { width: 250px; height: 250px; background: linear-gradient(45deg, #f093fb, #f5576c); bottom: 10%; left: 50%; animation-delay: 4s; } @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 33% { transform: translateY(-20px) rotate(120deg); } 66% { transform: translateY(20px) rotate(240deg); } } .container { max-width: 1200px; margin: 0 auto; padding: 20px; position: relative; z-index: 1; } .glass-card { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2); padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; animation: slideInUp 0.6s ease-out; } @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } } .glass-card:hover { transform: translateY(-5px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15); } .logo { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; } .logo-img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255, 255, 255, 0.3); } .logo h1 { color: white; font-size: 2.5rem; margin: 0; background: linear-gradient(45deg, #fff, #f0f0f0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; } .description { color: rgba(255, 255, 255, 0.9); font-size: 1.1rem; margin: 0; } .main-content { display: grid; gap: 30px; } .subscription-section h2, .config-section h2, .ini-section h2 { color: white; margin-bottom: 20px; font-size: 1.8rem; display: flex; align-items: center; gap: 10px; } .subscription-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; } .subscription-card { background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 25px; text-align: center; cursor: pointer; transition: all 0.3s ease; border: 1px solid rgba(255, 255, 255, 0.2); } .subscription-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.15); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); } .subscription-icon { font-size: 2.5rem; margin-bottom: 15px; } .subscription-card h3 { color: white; margin-bottom: 15px; font-size: 1.3rem; } .subscription-url { color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; word-break: break-all; margin-bottom: 15px; background: rgba(0, 0, 0, 0.2); padding: 10px; border-radius: 8px; } .copy-btn { background: linear-gradient(45deg, #00b894, #00cec9); color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; } .copy-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 184, 148, 0.4); } .config-card { padding: 25px; } .config-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); } .config-item:last-child { border-bottom: none; } .config-label { color: rgba(255, 255, 255, 0.8); font-weight: 500; } .config-value { color: white; font-weight: 600; } .ini-card { padding: 25px; } .ini-content { width: 100%; height: 200px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; padding: 15px; color: white; font-family: "Courier New", monospace; font-size: 12px; resize: vertical; } .admin-link { color: #00cec9; text-decoration: none; font-weight: 600; transition: color 0.3s ease; } .admin-link:hover { color: #00b894; } .toast { position: fixed; top: 20px; right: 20px; background: linear-gradient(45deg, #00b894, #00cec9); color: white; padding: 15px 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); transform: translateX(400px); transition: transform 0.3s ease; z-index: 1000; } .toast.show { transform: translateX(0); } @media (max-width: 768px) { .container { padding: 15px; } .logo { flex-direction: column; text-align: center; } .subscription-grid { grid-template-columns: 1fr; } .config-item { flex-direction: column; align-items: flex-start; gap: 5px; } }';
}`;

  // 找到 getJavaScript 函数并替换
  const jsFunction = `function getJavaScript() {
  return 'function copyToClipboard(text) { navigator.clipboard.writeText(text).then(() => { showToast("链接已复制到剪贴板！"); }).catch(() => { const textArea = document.createElement("textarea"); textArea.value = text; document.body.appendChild(textArea); textArea.select(); document.execCommand("copy"); document.body.removeChild(textArea); showToast("链接已复制到剪贴板！"); }); } function copyIniConfig() { const iniContent = document.querySelector(".ini-content"); if (iniContent) { copyToClipboard(iniContent.value); } } function showToast(message) { const toast = document.getElementById("toast"); toast.textContent = message; toast.classList.add("show"); setTimeout(() => { toast.classList.remove("show"); }, 3000); } document.addEventListener("DOMContentLoaded", function() { const shapes = document.querySelectorAll(".shape"); document.addEventListener("mousemove", (e) => { const mouseX = e.clientX / window.innerWidth; const mouseY = e.clientY / window.innerHeight; shapes.forEach((shape, index) => { const speed = (index + 1) * 0.5; const xOffset = (mouseX - 0.5) * speed * 20; const yOffset = (mouseY - 0.5) * speed * 20; shape.style.transform = "translate(" + xOffset + "px, " + yOffset + "px)"; }); }); });';
}`;

  // 替换函数
  content = content.replace(
    /function getGlassmorphismCSS\(\) \{[\s\S]*?\n\}/,
    cssFunction
  );
  
  content = content.replace(
    /function getJavaScript\(\) \{[\s\S]*?\n\}/,
    jsFunction
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ home.js 修复完成');
}

console.log('\n🎉 彻底修复完成！');
console.log('\n🧪 运行语法检查...');

// 运行语法检查
const { exec } = require('child_process');
exec('node pre-deploy-check.js', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ 语法检查失败:', error.message);
    return;
  }
  console.log(stdout);
});
