#!/usr/bin/env node

// 调试INI配置保存和应用问题
import { getDefaultConfig, getDefaultIniTemplate } from './src/utils/config.js';
import { parseIniConfig, validateIniConfig, applyIniConfigToClash } from './src/utils/iniParser.js';

console.log('🔍 调试INI配置问题...\n');

// 1. 检查默认配置
console.log('1. 检查默认配置:');
const defaultConfig = getDefaultConfig();
console.log('✅ 默认配置包含INI模板:', !!defaultConfig.iniTemplate);
console.log('✅ INI模板长度:', defaultConfig.iniTemplate ? defaultConfig.iniTemplate.length : 0);

// 2. 检查默认INI模板
console.log('\n2. 检查默认INI模板:');
const defaultIniTemplate = getDefaultIniTemplate();
console.log('✅ 默认INI模板长度:', defaultIniTemplate.length);

// 3. 验证默认INI配置
console.log('\n3. 验证默认INI配置:');
const validation = validateIniConfig(defaultIniTemplate);
console.log('验证结果:', validation.valid ? '✅ 有效' : '❌ 无效');
if (!validation.valid) {
  console.log('错误:', validation.error);
}

// 4. 解析默认INI配置
console.log('\n4. 解析默认INI配置:');
if (validation.valid) {
  const parsedConfig = parseIniConfig(defaultIniTemplate);
  console.log('✅ 规则集数量:', parsedConfig.rulesets.length);
  console.log('✅ 代理组数量:', parsedConfig.proxyGroups.length);
  
  // 显示前5个代理组
  console.log('\n前5个代理组:');
  parsedConfig.proxyGroups.slice(0, 5).forEach((group, index) => {
    console.log(`${index + 1}. ${group.name} (${group.type})`);
  });
}

// 5. 测试应用到Clash配置
console.log('\n5. 测试应用到Clash配置:');
if (validation.valid) {
  const parsedConfig = parseIniConfig(defaultIniTemplate);
  const testProxyNames = ['香港节点1', '美国节点1', '日本节点1'];
  
  const baseClashConfig = {
    port: 7890,
    'socks-port': 7891,
    mode: 'rule',
    proxies: [],
    'proxy-groups': [],
    rules: []
  };
  
  try {
    const appliedConfig = applyIniConfigToClash(baseClashConfig, parsedConfig, testProxyNames);
    console.log('✅ 应用成功');
    console.log('✅ 生成的代理组数量:', appliedConfig['proxy-groups'].length);
    console.log('✅ 生成的规则数量:', appliedConfig.rules.length);
    
    // 显示前3个代理组
    console.log('\n生成的前3个代理组:');
    appliedConfig['proxy-groups'].slice(0, 3).forEach((group, index) => {
      console.log(`${index + 1}. ${group.name} (${group.type}) - ${group.proxies.length}个代理`);
    });
  } catch (error) {
    console.log('❌ 应用失败:', error.message);
  }
}

// 6. 检查可能的问题
console.log('\n6. 检查可能的问题:');

// 检查是否有空的配置字段
console.log('检查配置字段:');
console.log('- name:', !!defaultConfig.name);
console.log('- description:', !!defaultConfig.description);
console.log('- iniTemplate:', !!defaultConfig.iniTemplate);
console.log('- nodes:', Array.isArray(defaultConfig.nodes));
console.log('- proxyIPs:', Array.isArray(defaultConfig.proxyIPs));

// 7. 模拟配置保存过程
console.log('\n7. 模拟配置保存过程:');

// 模拟表单数据
const mockFormData = new Map();
mockFormData.set('name', '测试订阅');
mockFormData.set('description', '这是一个测试订阅');
mockFormData.set('iniTemplate', defaultIniTemplate);

// 模拟配置更新逻辑
const testConfig = { ...defaultConfig };
testConfig.name = mockFormData.get('name') || testConfig.name;
testConfig.description = mockFormData.get('description') || testConfig.description;
testConfig.iniTemplate = mockFormData.get('iniTemplate') || testConfig.iniTemplate;

console.log('✅ 配置更新模拟成功');
console.log('- 更新后的名称:', testConfig.name);
console.log('- 更新后的描述:', testConfig.description);
console.log('- INI模板是否保持:', testConfig.iniTemplate === defaultIniTemplate);

// 8. 检查INI配置的特殊字符
console.log('\n8. 检查INI配置的特殊字符:');
const specialChars = ['`', '#', '[', ']', '(', ')', '|'];
specialChars.forEach(char => {
  const count = (defaultIniTemplate.match(new RegExp('\\' + char, 'g')) || []).length;
  console.log(`- "${char}" 字符数量: ${count}`);
});

// 9. 检查配置保存后的JSON序列化
console.log('\n9. 检查JSON序列化:');
try {
  const serialized = JSON.stringify(testConfig);
  const deserialized = JSON.parse(serialized);
  console.log('✅ JSON序列化/反序列化成功');
  console.log('✅ INI模板在序列化后保持完整:', deserialized.iniTemplate === testConfig.iniTemplate);
} catch (error) {
  console.log('❌ JSON序列化失败:', error.message);
}

console.log('\n🎯 调试建议:');
console.log('1. 确保KV命名空间已正确配置');
console.log('2. 检查管理面板中INI模板是否正确显示');
console.log('3. 尝试保存简单的INI配置进行测试');
console.log('4. 检查浏览器开发者工具的Network标签');
console.log('5. 查看Cloudflare Pages Functions日志');

console.log('\n✅ 调试完成！');
