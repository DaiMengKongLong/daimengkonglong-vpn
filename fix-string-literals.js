#!/usr/bin/env node

// 一次性修复所有字符串字面量问题
const fs = require('fs');
const path = require('path');

console.log('🔧 一次性修复所有字符串字面量问题...\n');

// 需要修复的文件列表
const filesToFix = [
  'src/handlers/admin.js',
  'src/handlers/home.js'
];

// 修复每个文件
filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ 文件不存在: ${filePath}`);
    return;
  }

  console.log(`🔍 处理文件: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // 修复多行字符串
  content = fixMultilineStrings(content);
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已修复: ${filePath}`);
  } else {
    console.log(`✅ 无需修复: ${filePath}`);
  }
});

function fixMultilineStrings(content) {
  // 修复 getAdminCSS 函数
  content = content.replace(
    /function getAdminCSS\(\) \{\s*return\s*'\s*\*/,
    "function getAdminCSS() {\n  return '* {"
  );
  
  // 修复 getGlassmorphismCSS 函数
  content = content.replace(
    /function getGlassmorphismCSS\(\) \{\s*return\s*'\s*\*/,
    "function getGlassmorphismCSS() {\n  return '* {"
  );
  
  // 修复 getAdminJavaScript 函数
  content = content.replace(
    /function getAdminJavaScript\(\) \{\s*return\s*'\s*function/,
    "function getAdminJavaScript() {\n  return 'function"
  );
  
  // 修复 getJavaScript 函数
  content = content.replace(
    /function getJavaScript\(\) \{\s*return\s*'\s*function/,
    "function getJavaScript() {\n  return 'function"
  );
  
  // 修复结尾的多行字符串
  content = content.replace(
    /\s+}\s*'\s*;/g,
    " }';"
  );
  
  return content;
}

console.log('\n🎉 字符串字面量修复完成！');

// 验证修复结果
console.log('\n🧪 验证修复结果...');

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  try {
    // 简单的语法检查
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否还有未终止的字符串
    const lines = content.split('\n');
    let hasErrors = false;
    
    lines.forEach((line, index) => {
      // 检查 return ' 开头但没有结束的行
      if (line.includes("return '") && !line.includes("';")) {
        const nextLine = lines[index + 1];
        if (nextLine && !nextLine.trim().startsWith("'") && !nextLine.includes("';")) {
          console.log(`❌ ${filePath}:${index + 1} 可能有未终止的字符串`);
          hasErrors = true;
        }
      }
    });
    
    if (!hasErrors) {
      console.log(`✅ ${filePath} - 验证通过`);
    }
  } catch (error) {
    console.log(`❌ ${filePath} - 验证失败: ${error.message}`);
  }
});

console.log('\n🚀 现在可以重新部署了！');
console.log('\n📋 建议的部署步骤:');
console.log('1. 运行: node pre-deploy-check.js');
console.log('2. 如果检查通过，运行: ./deploy-pages.sh');
console.log('3. 或者生成加密版本: node create-encrypted.js');
