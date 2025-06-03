#!/usr/bin/env node

const BlogBuilder = require('./build.js');

async function testPathDetection() {
  console.log('🧪 Testing path detection for different deployment scenarios...\n');
  
  // Test scenarios
  const scenarios = [
    {
      name: 'Root domain deployment (username.github.io)',
      siteUrl: 'https://master08s.github.io',
      owner: 'Master08s',
      repo: 'master08s.github.io',
      expectedBaseUrl: ''
    },
    {
      name: 'Project page deployment (username.github.io/repo)',
      siteUrl: 'https://master08s.github.io/looks-blog',
      owner: 'Master08s',
      repo: 'looks-blog',
      expectedBaseUrl: '/looks-blog'
    },
    {
      name: 'Custom domain with subdirectory',
      siteUrl: 'https://example.com/blog',
      owner: 'Master08s',
      repo: 'looks-blog',
      expectedBaseUrl: '/blog'
    },
    {
      name: 'Custom domain root',
      siteUrl: 'https://example.com',
      owner: 'Master08s',
      repo: 'looks-blog',
      expectedBaseUrl: ''
    }
  ];
  
  for (const scenario of scenarios) {
    console.log(`📋 Testing: ${scenario.name}`);
    console.log(`   Site URL: ${scenario.siteUrl}`);
    console.log(`   Repository: ${scenario.owner}/${scenario.repo}`);
    
    // Create a temporary config for testing
    const testConfig = {
      site: {
        url: scenario.siteUrl,
        title: 'Test Blog',
        author: scenario.owner
      },
      github: {
        owner: scenario.owner,
        repo: scenario.repo
      }
    };
    
    // Create builder instance with test config
    const builder = new BlogBuilder();
    builder.config = testConfig;
    builder.github = {
      owner: scenario.owner,
      repo: scenario.repo
    };
    
    // Test baseUrl detection
    const detectedBaseUrl = builder.detectBaseUrl();
    
    console.log(`   Expected baseUrl: "${scenario.expectedBaseUrl}"`);
    console.log(`   Detected baseUrl: "${detectedBaseUrl}"`);
    
    if (detectedBaseUrl === scenario.expectedBaseUrl) {
      console.log('   ✅ PASS\n');
    } else {
      console.log('   ❌ FAIL\n');
    }
  }
  
  console.log('🎯 Path detection test completed!');
}

// Test asset path fixing
function testAssetPathFixing() {
  console.log('\n🧪 Testing asset path fixing...\n');
  
  const builder = new BlogBuilder();
  builder.baseUrl = '/looks-blog';
  
  const testHtml = `
    <link rel="stylesheet" href="./assets/dist/main.css" />
    <script src="./assets/dist/main.iife.js"></script>
    <a href="/">首页</a>
    <a href="/archives.html">归档</a>
    <a href="/categories.html">分类</a>
  `;
  
  const fixedHtml = builder.fixAssetPaths(testHtml);
  
  console.log('Original HTML:');
  console.log(testHtml);
  console.log('\nFixed HTML:');
  console.log(fixedHtml);
  
  // Check if paths are correctly fixed
  const expectedPaths = [
    'href="./assets/dist/main.css"', // Relative paths should remain relative
    'src="./assets/dist/main.iife.js"', // Relative paths should remain relative
    'href="/looks-blog/"',
    'href="/looks-blog/archives.html"',
    'href="/looks-blog/categories.html"'
  ];
  
  let allCorrect = true;
  for (const expectedPath of expectedPaths) {
    if (!fixedHtml.includes(expectedPath)) {
      console.log(`❌ Missing expected path: ${expectedPath}`);
      allCorrect = false;
    }
  }
  
  if (allCorrect) {
    console.log('✅ All asset paths correctly fixed!');
  } else {
    console.log('❌ Some asset paths were not fixed correctly!');
  }
}

if (require.main === module) {
  testPathDetection().then(() => {
    testAssetPathFixing();
  }).catch(console.error);
}

module.exports = { testPathDetection, testAssetPathFixing };
