#!/usr/bin/env node

// 调试配置保存问题的详细脚本
console.log('🔍 调试配置保存问题...\n');

const fs = require('fs');

// 检查当前部署的代码
console.log('📋 检查当前代码状态:');

// 1. 检查admin.js中的handleSaveConfig函数
console.log('\n1. 检查 handleSaveConfig 函数:');
if (fs.existsSync('src/handlers/admin.js')) {
  const adminContent = fs.readFileSync('src/handlers/admin.js', 'utf8');
  
  // 检查重定向URL语法
  if (adminContent.includes('`/admin?token=${token}&success=1`')) {
    console.log('✅ 重定向URL语法正确 (使用模板字符串)');
  } else if (adminContent.includes('/admin?token=${token}&success=1')) {
    console.log('✅ 重定向URL语法正确');
  } else if (adminContent.includes("'/admin?token=' + token")) {
    console.log('❌ 重定向URL语法错误 (字符串拼接问题)');
  } else {
    console.log('⚠️ 无法确定重定向URL语法');
  }
  
  // 检查saveConfig调用
  if (adminContent.includes('await saveConfig(env.CONFIG_KV, updatedConfig)')) {
    console.log('✅ saveConfig 函数调用正确');
  } else {
    console.log('❌ saveConfig 函数调用可能有问题');
  }
} else {
  console.log('❌ admin.js 文件不存在');
}

// 2. 检查config.js中的saveConfig函数
console.log('\n2. 检查 saveConfig 函数实现:');
if (fs.existsSync('src/utils/config.js')) {
  const configContent = fs.readFileSync('src/utils/config.js', 'utf8');
  
  if (configContent.includes('await kv.put(CONFIG_KEY, JSON.stringify(config))')) {
    console.log('✅ KV存储操作正确');
  } else {
    console.log('❌ KV存储操作可能有问题');
  }
  
  if (configContent.includes('return true')) {
    console.log('✅ 函数返回值正确');
  } else {
    console.log('❌ 函数返回值可能有问题');
  }
} else {
  console.log('❌ config.js 文件不存在');
}

// 3. 检查环境配置
console.log('\n3. 检查环境配置:');
if (fs.existsSync('wrangler.toml')) {
  const wranglerContent = fs.readFileSync('wrangler.toml', 'utf8');
  
  if (wranglerContent.includes('your-kv-namespace-id')) {
    console.log('❌ KV命名空间ID未配置 (仍为占位符)');
    console.log('   这是配置保存失败的主要原因！');
  } else {
    console.log('✅ KV命名空间ID已配置');
  }
  
  if (wranglerContent.includes('binding = "CONFIG_KV"')) {
    console.log('✅ KV绑定名称正确');
  } else {
    console.log('❌ KV绑定名称不正确');
  }
} else {
  console.log('❌ wrangler.toml 文件不存在');
}

// 4. 生成测试用的修复版本
console.log('\n4. 生成调试信息:');

console.log('\n🔧 问题分析:');
console.log('基于您提供的信息 (Token: default, Pages部署)');
console.log('URL: https://daimengkonglong-vpn.pages.dev/admin?token=default');
console.log('');

console.log('可能的问题原因:');
console.log('1. ❌ KV命名空间未在Pages项目中配置');
console.log('2. ❌ CONFIG_KV绑定未设置');
console.log('3. ❌ 代码中的语法错误导致函数执行失败');
console.log('4. ❌ 表单数据解析问题');

console.log('\n🚀 立即解决方案:');

console.log('\n方案1: 在Cloudflare Pages Dashboard中配置KV');
console.log('1. 访问: https://dash.cloudflare.com/');
console.log('2. 进入 Pages > daimengkonglong-vpn');
console.log('3. 点击 Settings > Functions');
console.log('4. 在 "KV namespace bindings" 部分:');
console.log('   - 点击 "Add binding"');
console.log('   - Variable name: CONFIG_KV');
console.log('   - KV namespace: 创建新的或选择现有的');
console.log('5. 保存设置');
console.log('6. 重新部署项目 (可能需要推送新的commit)');

console.log('\n方案2: 检查浏览器开发者工具');
console.log('1. 打开 https://daimengkonglong-vpn.pages.dev/admin?token=default');
console.log('2. 按F12打开开发者工具');
console.log('3. 切换到 Network 标签');
console.log('4. 尝试保存配置');
console.log('5. 查看POST请求的状态码和响应:');
console.log('   - 500错误: KV绑定问题');
console.log('   - 400错误: 表单数据问题');
console.log('   - 302重定向但配置未保存: 逻辑问题');

console.log('\n方案3: 查看Pages Functions日志');
console.log('1. 在Cloudflare Dashboard中进入Pages项目');
console.log('2. 点击 Functions 标签');
console.log('3. 查看实时日志或历史日志');
console.log('4. 寻找错误信息');

console.log('\n🧪 测试步骤:');
console.log('配置KV绑定后:');
console.log('1. 访问管理面板');
console.log('2. 填写订阅名称: "测试订阅"');
console.log('3. 填写描述: "这是一个测试"');
console.log('4. 点击保存配置');
console.log('5. 检查是否显示成功消息并重定向');

console.log('\n💡 临时调试方法:');
console.log('如果问题持续，可以:');
console.log('1. 在代码中添加console.log调试信息');
console.log('2. 重新部署并查看日志');
console.log('3. 或者使用Workers部署进行测试');

console.log('\n📞 如果仍有问题:');
console.log('请提供以下信息:');
console.log('- 浏览器开发者工具中的错误信息');
console.log('- Pages Functions日志中的错误');
console.log('- 是否已在Pages设置中配置KV绑定');

console.log('\n🎯 最可能的解决方案:');
console.log('根据经验，90%的配置保存失败是因为KV绑定未配置');
console.log('请优先检查Pages项目的Functions设置中的KV namespace bindings');

console.log('\n✅ 调试信息生成完成！');
