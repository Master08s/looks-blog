#!/usr/bin/env node

/**
 * 评论系统测试脚本
 * 测试 Giscus、Utterances、GitTalk 三种评论系统的配置和渲染
 */

const fs = require('fs-extra');
const path = require('path');

// 测试配置
const testConfigs = {
  giscus: {
    enabled: true,
    provider: 'giscus',
    giscus: {
      repo: 'Master08s/looks-blog',
      repoId: 'R_kgDOH_test',
      category: 'General',
      categoryId: 'DIC_kwDOH_test',
      mapping: 'pathname',
      strict: '0',
      reactionsEnabled: '1',
      emitMetadata: '0',
      inputPosition: 'bottom',
      theme: 'preferred_color_scheme',
      lang: 'zh-CN'
    }
  },
  utterances: {
    enabled: true,
    provider: 'utterances',
    utterances: {
      repo: 'Master08s/looks-blog',
      issueTerm: 'pathname',
      label: 'comment',
      theme: 'github-light'
    }
  },
  gitalk: {
    enabled: true,
    provider: 'gitalk',
    gitalk: {
      clientID: 'test-client-id',
      clientSecret: 'test-client-secret',
      repo: 'looks-blog',
      owner: 'Master08s',
      admin: ['Master08s'],
      id: 'pathname',
      distractionFreeMode: false,
      language: 'zh-CN'
    }
  },
  disabled: {
    enabled: false,
    provider: 'none'
  }
};

async function testCommentSystem(name, config) {
  console.log(`\n🧪 测试 ${name} 评论系统...`);
  
  try {
    // 备份原配置
    const originalConfig = await fs.readJson('config.json');
    
    // 更新配置
    const testConfig = { ...originalConfig, comments: config };
    await fs.writeJson('config.json', testConfig, { spaces: 2 });
    
    // 运行构建
    const { exec } = require('child_process');
    await new Promise((resolve, reject) => {
      exec('npm run build', (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
    
    // 检查生成的文件
    const postHtml = await fs.readFile('dist/posts/2.html', 'utf8');
    
    if (config.enabled === false) {
      if (postHtml.includes('comments-section')) {
        console.log('❌ 评论系统应该被禁用但仍然存在');
      } else {
        console.log('✅ 评论系统已正确禁用');
      }
    } else {
      switch (config.provider) {
        case 'giscus':
          if (postHtml.includes('giscus.app/client.js')) {
            console.log('✅ Giscus 评论系统已正确集成');
          } else if (postHtml.includes('Giscus 评论系统配置不完整')) {
            console.log('⚠️  Giscus 配置不完整提示已显示');
          } else {
            console.log('❌ Giscus 评论系统未找到');
          }
          break;
        case 'utterances':
          if (postHtml.includes('utteranc.es/client.js')) {
            console.log('✅ Utterances 评论系统已正确集成');
          } else {
            console.log('❌ Utterances 评论系统未找到');
          }
          break;
        case 'gitalk':
          if (postHtml.includes('gitalk.min.js')) {
            console.log('✅ GitTalk 评论系统已正确集成');
          } else if (postHtml.includes('GitTalk 评论系统配置不完整')) {
            console.log('⚠️  GitTalk 配置不完整提示已显示');
          } else {
            console.log('❌ GitTalk 评论系统未找到');
          }
          break;
      }
    }
    
    // 恢复原配置
    await fs.writeJson('config.json', originalConfig, { spaces: 2 });
    
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 开始评论系统测试...');
  
  for (const [name, config] of Object.entries(testConfigs)) {
    await testCommentSystem(name, config);
  }
  
  console.log('\n✅ 所有测试完成！');
}

if (require.main === module) {
  runTests();
}

module.exports = { testCommentSystem, runTests };
