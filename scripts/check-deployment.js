#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

async function checkDeployment() {
  console.log('🔍 检查部署文件...\n');
  
  const distDir = path.join(__dirname, '..', 'dist');
  
  // 检查dist目录是否存在
  if (!await fs.pathExists(distDir)) {
    console.log('❌ dist目录不存在，请先运行 npm run build');
    return;
  }
  
  // 检查关键文件
  const criticalFiles = [
    'index.html',
    'assets/dist/main.css',
    'assets/dist/main.iife.js',
    'search-data.json'
  ];
  
  console.log('📋 检查关键文件:');
  for (const file of criticalFiles) {
    const filePath = path.join(distDir, file);
    const exists = await fs.pathExists(filePath);
    
    if (exists) {
      const stats = await fs.stat(filePath);
      console.log(`✅ ${file} (${stats.size} bytes)`);
    } else {
      console.log(`❌ ${file} - 文件不存在`);
    }
  }
  
  // 检查HTML文件中的路径
  console.log('\n🔗 检查HTML文件中的路径:');
  const indexPath = path.join(distDir, 'index.html');
  
  if (await fs.pathExists(indexPath)) {
    const content = await fs.readFile(indexPath, 'utf8');
    
    // 检查CSS路径
    const cssMatch = content.match(/href="([^"]*main\.css)"/);
    if (cssMatch) {
      console.log(`📄 CSS路径: ${cssMatch[1]}`);
    }
    
    // 检查JS路径
    const jsMatch = content.match(/src="([^"]*main\.iife\.js)"/);
    if (jsMatch) {
      console.log(`📄 JS路径: ${jsMatch[1]}`);
    }
    
    // 检查导航链接
    const navMatches = content.match(/href="([^"]*\.html)"/g);
    if (navMatches) {
      console.log('📄 导航链接:');
      navMatches.forEach(match => {
        const url = match.match(/href="([^"]*)"/)[1];
        console.log(`   - ${url}`);
      });
    }
  }
  
  // 检查目录结构
  console.log('\n📁 目录结构:');
  await printDirectoryStructure(distDir, '', 0, 2);
  
  console.log('\n💡 部署建议:');
  console.log('1. 确保GitHub Actions工作流已正确触发');
  console.log('2. 检查GitHub Pages设置是否选择了"GitHub Actions"作为源');
  console.log('3. 确认仓库是公开的或者有GitHub Pages权限');
  console.log('4. 检查GitHub Actions的构建日志是否有错误');
  
  console.log('\n🌐 如果部署成功，请访问:');
  console.log('https://master08s.github.io/looks-blog/');
}

async function printDirectoryStructure(dir, prefix, currentDepth, maxDepth) {
  if (currentDepth >= maxDepth) return;
  
  try {
    const items = await fs.readdir(dir);
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemPath = path.join(dir, item);
      const stats = await fs.stat(itemPath);
      const isLast = i === items.length - 1;
      const currentPrefix = isLast ? '└── ' : '├── ';
      const nextPrefix = isLast ? '    ' : '│   ';
      
      if (stats.isDirectory()) {
        console.log(`${prefix}${currentPrefix}${item}/`);
        await printDirectoryStructure(itemPath, prefix + nextPrefix, currentDepth + 1, maxDepth);
      } else {
        const size = stats.size > 1024 ? `${Math.round(stats.size / 1024)}KB` : `${stats.size}B`;
        console.log(`${prefix}${currentPrefix}${item} (${size})`);
      }
    }
  } catch (error) {
    console.log(`${prefix}❌ 无法读取目录: ${error.message}`);
  }
}

if (require.main === module) {
  checkDeployment().catch(console.error);
}

module.exports = { checkDeployment };
