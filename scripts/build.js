#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { marked } = require('marked');
const hljs = require('highlight.js');
const pinyinLib = require('pinyin');

// Configure marked with highlight.js and custom renderer
const renderer = new marked.Renderer();

// Custom heading renderer to add id attributes for TOC
renderer.heading = function(text, level) {
  // Generate id from text (remove special characters and spaces)
  const id = text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-') // Replace non-word chars with dash, keep Chinese
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .replace(/-+/g, '-'); // Replace multiple dashes with single dash

  return `<h${level} id="${id}">${text}</h${level}>`;
};

// Custom code block renderer with copy button
renderer.code = function(code, infostring, escaped) {
  const lang = (infostring || '').match(/\S*/)[0];
  const langClass = lang ? ` class="language-${lang}"` : '';
  const langLabel = lang || 'text';

  // Highlight the code
  let highlightedCode;
  if (lang && hljs.getLanguage(lang)) {
    try {
      highlightedCode = hljs.highlight(code, { language: lang }).value;
    } catch (err) {
      highlightedCode = hljs.highlightAuto(code).value;
    }
  } else {
    highlightedCode = hljs.highlightAuto(code).value;
  }

  return `<div class="code-block-wrapper">
    <div class="code-block-header">
      <span class="code-block-lang">${langLabel}</span>
      <button class="code-copy-btn" onclick="copyCode(this)" title="复制代码">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
    </div>
    <pre><code${langClass}>${highlightedCode}</code></pre>
  </div>`;
};

marked.setOptions({
  renderer: renderer,
  breaks: true,
  gfm: true
});

class BlogBuilder {
  constructor() {
    this.config = require('../config.json');
    this.distDir = path.join(__dirname, '../dist');
    this.templatesDir = path.join(__dirname, '../templates');
    this.assetsDir = path.join(__dirname, '../assets');

    // GitHub API setup
    this.github = {
      token: process.env.GITHUB_TOKEN,
      owner: process.env.GITHUB_REPOSITORY?.split('/')[0] || this.config.github.owner,
      repo: process.env.GITHUB_REPOSITORY?.split('/')[1] || this.config.github.repo
    };

    // Auto-detect base URL for GitHub Pages deployment
    this.baseUrl = this.detectBaseUrl();

    this.posts = [];
    this.categories = new Map();
  }

  /**
   * Convert Chinese text to pinyin filename
   * @param {string} text - Chinese text to convert
   * @returns {string} - Pinyin filename
   */
  toPinyinFilename(text) {
    if (!text) return '';

    // Convert to pinyin
    const pinyinArray = pinyinLib.pinyin(text, {
      style: pinyinLib.pinyin.STYLE_NORMAL,
      heteronym: false
    });

    // Join pinyin words with hyphens and convert to lowercase
    const pinyinText = pinyinArray.map(item => item[0]).join('-').toLowerCase();

    // Remove special characters and replace spaces with hyphens
    const cleanText = pinyinText
      .replace(/[^\w-]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');

    return cleanText || 'category';
  }

  detectBaseUrl() {
    // Auto-detect base URL based on GitHub repository and site URL
    const siteUrl = this.config.site.url;
    const repoName = this.github.repo;

    if (!siteUrl) {
      return '';
    }

    try {
      const url = new URL(siteUrl);
      const pathname = url.pathname;

      // If pathname is just '/' or empty, it's a root domain deployment
      if (!pathname || pathname === '/') {
        return '';
      }

      // Remove trailing slash and return the path
      return pathname.replace(/\/$/, '');
    } catch (error) {
      console.warn('Failed to parse site URL, using repository name as base URL');
      // Fallback: if repo name is not the same as username, assume it's a project page
      if (repoName !== this.github.owner) {
        return `/${repoName}`;
      }
      return '';
    }
  }

  async build() {
    console.log('🚀 Starting blog build...');

    // 显示图片代理状态
    if (this.config.imageProxy?.enabled) {
      console.log(`🖼️  Image proxy enabled: ${this.config.imageProxy.baseUrl}`);
    } else {
      console.log('🖼️  Image proxy disabled');
    }

    try {
      // Clean and create dist directory
      await fs.ensureDir(this.distDir);
      await fs.emptyDir(this.distDir);
      
      // Copy assets
      await this.copyAssets();
      
      // Fetch issues from GitHub
      await this.fetchIssues();
      
      // Process posts and categories
      this.processPosts();
      
      // Generate pages
      await this.generatePages();
      
      console.log('✅ Blog build completed successfully!');
      console.log(`📝 Generated ${this.posts.length} posts`);
      console.log(`🏷️  Found ${this.categories.size} categories`);
      
    } catch (error) {
      console.error('❌ Build failed:', error);
      process.exit(1);
    }
  }

  async copyAssets() {
    console.log('📁 Copying assets...');
    
    if (await fs.pathExists(this.assetsDir)) {
      await fs.copy(this.assetsDir, path.join(this.distDir, 'assets'));
    }
  }

  async fetchIssues() {
    console.log('📡 Fetching issues from GitHub...');

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'looks-blog'
    };

    if (this.github.token) {
      headers['Authorization'] = `token ${this.github.token}`;
    }

    try {
      // Fetch all open issues created by the repository owner
      const response = await axios.get(
        `https://api.github.com/repos/${this.github.owner}/${this.github.repo}/issues`,
        {
          headers,
          params: {
            state: 'open',
            creator: this.github.owner,
            sort: 'created',
            direction: 'desc',
            per_page: 100
          }
        }
      );

      this.issues = response.data.filter(issue => !issue.pull_request);
      console.log(`📄 Found ${this.issues.length} open issues`);

      // Fetch pinned issues
      await this.fetchPinnedIssues(headers);

      // Fetch comments for each issue
      for (const issue of this.issues) {
        if (issue.comments > 0) {
          const commentsResponse = await axios.get(issue.comments_url, { headers });
          issue.issue_comments = commentsResponse.data;
        } else {
          issue.issue_comments = [];
        }
      }

      // Clean up deleted issues
      await this.cleanupDeletedIssues();

    } catch (error) {
      console.error('Failed to fetch issues:', error.message);
      console.log('🔄 Using mock data for development...');

      // 使用模拟数据进行开发测试
      this.issues = [
        {
          number: 1,
          title: '欢迎来到 Looks Blog',
          body: '# 欢迎来到 Looks Blog\n\n这是一个基于 GitHub Issues 的博客系统。\n\n## 特性\n\n- 使用 GitHub Issues 作为博客文章\n- 自动部署到 GitHub Pages\n- 支持标签分类\n- 响应式设计\n\n开始写作吧！',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          html_url: 'https://github.com/Master08s/looks-blog/issues/1',
          user: {
            login: 'Master08s',
            avatar_url: 'https://github.com/Master08s.png'
          },
          labels: [
            { name: '博客', color: '0075ca' },
            { name: '介绍', color: '7057ff' }
          ],
          comments: 0,
          issue_comments: []
        },
        {
          number: 2,
          title: '如何使用这个博客系统',
          body: '# 如何使用这个博客系统\n\n## 创建文章\n\n1. 在 GitHub 仓库中创建新的 Issue\n2. 使用 Markdown 格式写作\n3. 添加标签作为分类\n4. 发布后会自动生成博客文章\n\n## 管理评论\n\nIssue 的评论会自动显示为文章评论。',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          html_url: 'https://github.com/Master08s/looks-blog/issues/2',
          user: {
            login: 'Master08s',
            avatar_url: 'https://github.com/Master08s.png'
          },
          labels: [
            { name: '教程', color: 'a2eeef' },
            { name: '使用指南', color: 'd73a4a' }
          ],
          comments: 1,
          issue_comments: [
            {
              user: {
                login: 'Master08s',
                avatar_url: 'https://github.com/Master08s.png'
              },
              body: '这是一个示例评论。',
              created_at: new Date().toISOString()
            }
          ]
        }
      ];
    }
  }

  async fetchPinnedIssues(headers) {
    try {
      // Mark issues as pinned if they have the "pinned" or "置顶" label
      this.issues.forEach(issue => {
        issue.is_pinned = issue.labels.some(label =>
          label.name.toLowerCase() === 'pinned' ||
          label.name.toLowerCase() === '置顶'
        );
      });

      const pinnedCount = this.issues.filter(issue => issue.is_pinned).length;
      if (pinnedCount > 0) {
        console.log(`📌 Found ${pinnedCount} pinned issues`);
      }
    } catch (error) {
      console.warn('Could not fetch pinned issues:', error.message);
    }
  }

  async cleanupDeletedIssues() {
    try {
      const postsDir = path.join(this.distDir, 'posts');

      if (await fs.pathExists(postsDir)) {
        const existingFiles = await fs.readdir(postsDir);
        const currentIssueIds = new Set(this.issues.map(issue => `${issue.number}.html`));

        // Find files that don't correspond to current issues
        const filesToDelete = existingFiles.filter(file =>
          file.endsWith('.html') && !currentIssueIds.has(file)
        );

        // Delete orphaned post files
        for (const file of filesToDelete) {
          const filePath = path.join(postsDir, file);
          await fs.remove(filePath);
          console.log(`🗑️  Deleted orphaned post file: ${file}`);
        }

        if (filesToDelete.length > 0) {
          console.log(`🧹 Cleaned up ${filesToDelete.length} deleted post(s)`);
        }
      }
    } catch (error) {
      console.warn('Could not cleanup deleted issues:', error.message);
    }
  }

  processPosts() {
    console.log('🔄 Processing posts...');

    this.posts = this.issues.map(issue => {
      const createdAt = new Date(issue.created_at);
      const updatedAt = new Date(issue.updated_at);
      const isUpdated = updatedAt.getTime() - createdAt.getTime() > 60000; // More than 1 minute difference

      // 处理图片代理
      const processedContent = this.processImageProxy(issue.body || '');

      const post = {
        id: issue.number,
        title: issue.title,
        content: marked(processedContent),
        excerpt: this.generateExcerpt(issue.body || ''),
        author: issue.user.login,
        avatar: issue.user.avatar_url,
        created_at: createdAt,
        updated_at: updatedAt,
        is_updated: isUpdated,
        is_pinned: issue.is_pinned || false,
        url: `${this.baseUrl}/posts/${issue.number}.html`,
        github_url: issue.html_url,
        labels: issue.labels || [],
        comments_count: issue.comments
      };

      // Process categories from labels
      post.labels.forEach(label => {
        if (!this.categories.has(label.name)) {
          this.categories.set(label.name, {
            name: label.name,
            color: label.color,
            posts: []
          });
        }
        this.categories.get(label.name).posts.push(post);
      });

      return post;
    });

    // Sort posts: pinned posts first, then by creation date (newest first)
    this.posts.sort((a, b) => {
      // If one is pinned and the other is not, pinned comes first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      // If both have the same pinned status, sort by creation date (newest first)
      return b.created_at - a.created_at;
    });

    const pinnedCount = this.posts.filter(post => post.is_pinned).length;
    if (pinnedCount > 0) {
      console.log(`📌 ${pinnedCount} post(s) will be displayed as pinned`);
    }
  }

  generateExcerpt(content) {
    const plainText = content.replace(/[#*`\[\]]/g, '').trim();
    return plainText.length > this.config.build.excerptLength
      ? plainText.substring(0, this.config.build.excerptLength) + '...'
      : plainText;
  }

  processImageProxy(content) {
    // 检查是否启用图片代理
    if (!this.config.imageProxy?.enabled) {
      return content;
    }

    const proxyBaseUrl = this.config.imageProxy.baseUrl || 'https://images.weserv.nl/?url=';

    // 处理 Markdown 图片语法: ![alt](url)
    content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      // 跳过已经是代理链接的图片
      if (url.includes('images.weserv.nl') || url.includes('weserv.nl')) {
        return match;
      }

      // 只处理 http/https 链接
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const proxiedUrl = proxyBaseUrl + url;
        return `![${alt}](${proxiedUrl})`;
      }

      return match;
    });

    // 处理 HTML img 标签: <img src="url" />
    content = content.replace(/<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/g, (match, before, url, after) => {
      // 跳过已经是代理链接的图片
      if (url.includes('images.weserv.nl') || url.includes('weserv.nl')) {
        return match;
      }

      // 只处理 http/https 链接
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const proxiedUrl = proxyBaseUrl + url;
        return `<img${before}src="${proxiedUrl}"${after}>`;
      }

      return match;
    });

    return content;
  }

  async generatePages() {
    console.log('📄 Generating pages...');
    
    // Load templates
    const templates = await this.loadTemplates();
    
    // Generate index page
    await this.generateIndexPage(templates);
    
    // Generate individual post pages
    await this.generatePostPages(templates);
    
    // Generate category pages
    await this.generateCategoryPages(templates);
    
    // Generate archives page
    await this.generateArchivesPage(templates);

    // Generate search page and data
    await this.generateSearchPage(templates);
    await this.generateSearchData();

    // Generate sitemap if enabled
    if (this.config.seo?.generateSitemap) {
      await this.generateSitemap();
    }
  }

  async loadTemplates() {
    const templates = {};
    const templateFiles = ['index.html', 'post.html', 'category.html', 'categories.html', 'archives.html', 'search.html'];

    for (const file of templateFiles) {
      const filePath = path.join(this.templatesDir, file);
      if (await fs.pathExists(filePath)) {
        templates[file.replace('.html', '')] = await fs.readFile(filePath, 'utf8');
      }
    }

    return templates;
  }

  async generateIndexPage(templates) {
    console.log('🏠 Generating index page...');

    const postsPerPage = this.config.build.postsPerPage;
    const totalPages = Math.max(1, Math.ceil(this.posts.length / postsPerPage)); // Ensure at least 1 page

    for (let page = 1; page <= totalPages; page++) {
      const startIndex = (page - 1) * postsPerPage;
      const endIndex = startIndex + postsPerPage;
      const pagePosts = this.posts.slice(startIndex, endIndex);
      
      const html = this.renderTemplate(templates.index || '', {
        site: this.config.site,
        posts: pagePosts,
        pagination: {
          current: page,
          total: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          nextUrl: page < totalPages ? (page === 1 ? `${this.baseUrl}/page/2.html` : `${this.baseUrl}/page/${page + 1}.html`) : null,
          prevUrl: page > 1 ? (page === 2 ? `${this.baseUrl}/` : `${this.baseUrl}/page/${page - 1}.html`) : null,
          nextLink: page < totalPages ? `<a href="${page === 1 ? `${this.baseUrl}/page/2.html` : `${this.baseUrl}/page/${page + 1}.html`}" class="btn">下一页</a>` : '',
          prevLink: page > 1 ? `<a href="${page === 2 ? `${this.baseUrl}/` : `${this.baseUrl}/page/${page - 1}.html`}" class="btn">上一页</a>` : ''
        },
        categories: Array.from(this.categories.values())
      });
      
      const fileName = page === 1 ? 'index.html' : `page/${page}.html`;
      await fs.ensureDir(path.dirname(path.join(this.distDir, fileName)));
      await fs.writeFile(path.join(this.distDir, fileName), html);
    }
  }

  async generatePostPages(templates) {
    console.log('📝 Generating post pages...');
    
    await fs.ensureDir(path.join(this.distDir, 'posts'));
    
    for (const post of this.posts) {
      const html = this.renderTemplate(templates.post || '', {
        site: this.config.site,
        post,
        categories: Array.from(this.categories.values())
      });
      
      await fs.writeFile(path.join(this.distDir, 'posts', `${post.id}.html`), html);
    }
  }

  async generateCategoryPages(templates) {
    console.log('🏷️  Generating category pages...');
    
    await fs.ensureDir(path.join(this.distDir, 'categories'));
    
    // Generate categories index
    const categoriesHtml = this.renderTemplate(templates.categories || '', {
      site: this.config.site,
      github: this.github,
      categories: Array.from(this.categories.values())
    });

    await fs.writeFile(path.join(this.distDir, 'categories.html'), categoriesHtml);
    
    // Generate individual category pages
    for (const [name, category] of this.categories) {
      const html = this.renderTemplate(templates.category || '', {
        site: this.config.site,
        github: this.github,
        category,
        posts: category.posts,
        categories: Array.from(this.categories.values())
      });

      // Convert category name to pinyin filename for URL safety
      const fileName = this.toPinyinFilename(name);
      await fs.writeFile(path.join(this.distDir, 'categories', `${fileName}.html`), html);

      console.log(`📁 Generated category page: ${name} -> ${fileName}.html`);
    }
  }

  async generateArchivesPage(templates) {
    console.log('📚 Generating archives page...');
    
    // Group posts by year and month
    const archives = {};
    
    this.posts.forEach(post => {
      const year = post.created_at.getFullYear();
      const month = post.created_at.getMonth();
      
      if (!archives[year]) {
        archives[year] = {};
      }
      
      if (!archives[year][month]) {
        archives[year][month] = [];
      }
      
      archives[year][month].push(post);
    });
    
    // Generate archives HTML
    const archivesHtml = Object.keys(archives)
      .sort((a, b) => b - a)
      .map(year => {
        const yearPosts = Object.values(archives[year]).flat();
        return `
          <div class="year-group">
            <h2 class="text-xl font-bold mb-4">${year} 年 (${yearPosts.length} 篇)</h2>
            <div class="space-y-2 ml-4">
              ${yearPosts.map(post => `
                <div class="flex items-center justify-between py-2 border-b border-gray-200">
                  <a href="${post.url}" class="text-blue-600 hover:text-blue-800">
                    ${this.escapeHtml(post.title)}
                  </a>
                  <time class="text-sm text-gray-500">
                    ${post.created_at.toISOString().split('T')[0]}
                  </time>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');

    const html = this.renderTemplate(templates.archives || '', {
      site: this.config.site,
      github: this.github,
      archives: archivesHtml
    });
    
    await fs.writeFile(path.join(this.distDir, 'archives.html'), html);
  }

  async generateSearchPage(templates) {
    console.log('🔍 Generating search page...');

    const html = this.renderTemplate(templates.search || '', {
      site: this.config.site,
      github: this.github
    });

    await fs.writeFile(path.join(this.distDir, 'search.html'), html);
  }

  async generateSearchData() {
    console.log('📊 Generating search data...');

    const searchData = this.posts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      url: post.url,
      created_at: post.created_at.toISOString().split('T')[0],
      labels: post.labels.map(label => ({
        name: label.name,
        color: label.color
      }))
    }));

    await fs.writeFile(
      path.join(this.distDir, 'search-data.json'),
      JSON.stringify(searchData, null, 2)
    );
  }

  async generateSitemap() {
    console.log('🗺️  Generating sitemap...');

    const siteUrl = this.config.site.url;
    if (!siteUrl) {
      console.warn('⚠️  Site URL not configured, skipping sitemap generation');
      return;
    }

    // Extract base domain from siteUrl for proper URL construction
    const url = new URL(siteUrl);
    const baseDomain = `${url.protocol}//${url.host}`;

    // Generate sitemap URLs
    const urls = [];

    // Add homepage
    urls.push({
      loc: siteUrl,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '1.0'
    });

    // Add static pages
    const staticPages = [
      { path: '/archives.html', priority: '0.8' },
      { path: '/categories.html', priority: '0.8' },
      { path: '/search.html', priority: '0.6' }
    ];

    staticPages.forEach(page => {
      // Construct URL properly: baseDomain + baseUrl + page.path
      const pageUrl = `${baseDomain}${this.baseUrl}${page.path}`;
      urls.push({
        loc: pageUrl,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: page.priority
      });
    });

    // Add post pages
    this.posts.forEach(post => {
      // post.url already includes baseUrl, so combine with baseDomain
      const postUrl = `${baseDomain}${post.url}`;
      urls.push({
        loc: postUrl,
        lastmod: post.updated_at.toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.7'
      });
    });

    // Add category pages
    this.categories.forEach(category => {
      // Construct URL properly: baseDomain + baseUrl + category path
      const categoryUrl = `${baseDomain}${this.baseUrl}/categories/${this.toPinyinFilename(category.name)}.html`;
      urls.push({
        loc: categoryUrl,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.6'
      });
    });

    // Generate XML
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    await fs.writeFile(path.join(this.distDir, 'sitemap.xml'), sitemapXml);
    console.log(`✅ Generated sitemap with ${urls.length} URLs`);
  }

  renderTemplate(template, data) {
    // Simple template rendering - replace placeholders with actual data
    // This is a basic implementation - in a real scenario, you might want to use a proper template engine
    
    let html = template;
    
    // Replace site data
    html = html.replace(/\{\{site\.title\}\}/g, data.site?.title || '');
    html = html.replace(/\{\{site\.description\}\}/g, data.site?.description || '');
    html = html.replace(/\{\{site\.author\}\}/g, data.site?.author || '');
    html = html.replace(/\{\{site\.avatar\}\}/g, data.site?.avatar || '');
    html = html.replace(/\{\{site\.url\}\}/g, data.site?.url || '');
    html = html.replace(/\{\{site\.date\}\}/g, data.site?.date || '');
    html = html.replace(/\{\{site\.favicon\}\}/g, data.site?.favicon || '');

    // Replace SEO keywords
    if (this.config.seo?.keywords && this.config.seo.keywords.length > 0) {
      const keywords = this.config.seo.keywords.join(', ');
      html = html.replace(/\{\{seo\.keywords\}\}/g, keywords);
    } else {
      html = html.replace(/\{\{seo\.keywords\}\}/g, '');
    }

    // Replace GitHub data
    html = html.replace(/\{\{github\.owner\}\}/g, this.github.owner || '');
    html = html.replace(/\{\{github\.repo\}\}/g, this.github.repo || '');

    // Replace base URL for assets and links
    html = html.replace(/\{\{baseUrl\}\}/g, this.baseUrl || '');

    // Auto-fix asset paths
    html = this.fixAssetPaths(html);
    
    // Replace posts data (for index page)
    if (data.posts !== undefined) {
      if (data.posts.length > 0) {
        const postsHtml = data.posts.map(post => `
          <a href="${post.url}" class="index-post-card hover:shadow-card text-black transition duration-300">
            <div class="post mx-4 my-4 flex flex-col gap-2">
              <!-- 标题 -->
              <div class="textc-primary font-serif font-semibold flex items-center gap-2" style="font-size: 1.2rem">
                ${post.is_pinned ? '<span class="pin-icon" title="置顶文章">📌</span>' : ''}
                <span>${this.escapeHtml(post.title)}</span>
              </div>

              <!-- 摘要 -->
              <div style="font-size: 0.9rem" class="text-gray">${this.escapeHtml(post.excerpt)}</div>

              <!-- 元信息 -->
              <div class="flex items-center justify-between" style="font-size: 0.8rem">
                <time class="text-gray">${post.created_at.toISOString().split('T')[0]}</time>
                <div class="flex gap-2">
                  ${post.labels.map(label => `<span class="category" style="background-color: #${label.color}20; color: #${label.color}">${this.escapeHtml(label.name)}</span>`).join('')}
                </div>
              </div>
            </div>
          </a>
        `).join('');

        html = html.replace(/\{\{posts\}\}/g, postsHtml);
      } else {
        // Show a friendly message when there are no posts
        const noPostsHtml = `
          <div class="text-center py-20">
            <div class="text-6xl mb-4">📝</div>
            <div class="text-xl font-semibold mb-2">还没有文章</div>
            <div class="text-gray-600 mb-4">开始在 GitHub Issues 中创建你的第一篇文章吧！</div>
            <a href="https://github.com/${this.github.owner}/${this.github.repo}/issues/new"
               target="_blank"
               class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              创建文章
            </a>
          </div>
        `;
        html = html.replace(/\{\{posts\}\}/g, noPostsHtml);
      }
    }
    
    // Replace pagination data
    if (data.pagination) {
      html = html.replace(/\{\{pagination\.current\}\}/g, data.pagination.current || 1);
      html = html.replace(/\{\{pagination\.total\}\}/g, data.pagination.total || 1);
      html = html.replace(/\{\{pagination\.prevLink\}\}/g, data.pagination.prevLink || '');
      html = html.replace(/\{\{pagination\.nextLink\}\}/g, data.pagination.nextLink || '');
    }

    // Replace post data (for individual post pages)
    if (data.post) {
      html = html.replace(/\{\{post\.id\}\}/g, data.post.id || '');
      html = html.replace(/\{\{post\.title\}\}/g, this.escapeHtml(data.post.title) || '');
      html = html.replace(/\{\{post\.content\}\}/g, data.post.content || '');
      html = html.replace(/\{\{post\.created_at\}\}/g, data.post.created_at.toISOString().split('T')[0]);

      html = html.replace(/\{\{post\.author\}\}/g, this.escapeHtml(data.post.author) || '');
      html = html.replace(/\{\{post\.github_url\}\}/g, data.post.github_url || '');
      html = html.replace(/\{\{post\.avatar\}\}/g, data.post.avatar || '');
      html = html.replace(/\{\{post\.url\}\}/g, data.post.url || '');
      html = html.replace(/\{\{post\.excerpt\}\}/g, this.escapeHtml(data.post.excerpt) || '');
      // Create full URL by combining base domain with post URL
      const url = new URL(this.config.site.url);
      const baseDomain = `${url.protocol}//${url.host}`;
      const fullUrl = `${baseDomain}${data.post.url}`;
      html = html.replace(/\{\{post\.full_url\}\}/g, fullUrl || '');



      // Handle categories meta
      if (data.post.labels && data.post.labels.length > 0) {
        const categoriesMeta = `
          <span class="flex items-center gap-1">
            <span class="icon-[material-symbols--folder-outline-rounded] iconify-inline"></span>
            <span>
              ${data.post.labels.map(label =>
                `<a href="${this.baseUrl}/categories/${this.toPinyinFilename(label.name)}.html" class="text-blue-600 hover:underline">${this.escapeHtml(label.name)}</a>`
              ).join(', ')}
            </span>
          </span>
        `;
        html = html.replace(/\{\{post\.categories_meta\}\}/g, categoriesMeta);
      } else {
        html = html.replace(/\{\{post\.categories_meta\}\}/g, '');
      }

      // Handle post labels (legacy support)
      if (data.post.labels) {
        const labelsHtml = data.post.labels.map(label =>
          `<span class="category" style="background-color: #${label.color}20; color: #${label.color}; border: 1px solid #${label.color}40">${this.escapeHtml(label.name)}</span>`
        ).join('');

        html = html.replace(/\{\{post\.labels\}\}/g, labelsHtml);
      }
    }

    // Replace categories data
    if (data.categories) {
      const categoriesHtml = data.categories.map(category => `
        <span class="card-small">
          <span class="icon-[material-symbols--folder-outline-rounded] iconify-inline"></span>
          <a class="text-black" href="${this.baseUrl}/categories/${this.toPinyinFilename(category.name)}.html">
            ${this.escapeHtml(category.name)}
          </a>
          <span>${category.posts.length}</span>
        </span>
      `).join('');

      html = html.replace(/\{\{categories\}\}/g, categoriesHtml);
    }

    // Replace archives data
    if (data.archives) {
      html = html.replace(/\{\{archives\}\}/g, data.archives);
    }

    // Replace category data (for individual category pages)
    if (data.category) {
      html = html.replace(/\{\{category\.name\}\}/g, this.escapeHtml(data.category.name) || '');
      html = html.replace(/\{\{category\.color\}\}/g, data.category.color || '');
    }

    // Replace comments system
    html = this.renderComments(html, data);

    return html;
  }

  renderComments(html, data) {
    // Check if comments are enabled and we have a post (only show comments on post pages)
    if (!this.config.comments?.enabled || !data.post) {
      html = html.replace(/\{\{comments\}\}/g, '');
      return html;
    }

    const provider = this.config.comments.provider;
    let commentsHtml = '';

    switch (provider) {
      case 'giscus':
        commentsHtml = this.renderGiscusComments(data.post);
        break;
      case 'utterances':
        commentsHtml = this.renderUtterancesComments(data.post);
        break;
      case 'gitalk':
        commentsHtml = this.renderGitalkComments(data.post);
        break;
      case 'none':
      default:
        commentsHtml = '';
        break;
    }

    html = html.replace(/\{\{comments\}\}/g, commentsHtml);
    return html;
  }

  renderGiscusComments(post) {
    const config = this.config.comments.giscus;

    // Skip if required fields are missing
    if (!config.repo || !config.repoId || !config.categoryId) {
      return `
        <div class="comments-section mt-12 mx-auto" style="max-width: 750px;">
          <div class="text-center text-gray-500 py-8">
            <p>💬 Giscus 评论系统配置不完整</p>
            <p class="text-sm mt-2">请在 config.json 中配置 repoId 和 categoryId</p>
            <p class="text-sm">
              <a href="https://giscus.app/zh-CN" target="_blank" class="text-blue-600 hover:underline">
                前往 Giscus 官网获取配置
              </a>
            </p>
          </div>
        </div>
      `;
    }

    return `
      <div class="comments-section mt-12 mx-auto" style="max-width: 750px;">
        <div class="border-t pt-8">
          <h3 class="text-xl font-bold mb-6 text-center">💬 评论</h3>
          <script src="https://giscus.app/client.js"
                  data-repo="${config.repo}"
                  data-repo-id="${config.repoId}"
                  data-category="${config.category}"
                  data-category-id="${config.categoryId}"
                  data-mapping="${config.mapping}"
                  data-strict="${config.strict}"
                  data-reactions-enabled="${config.reactionsEnabled}"
                  data-emit-metadata="${config.emitMetadata}"
                  data-input-position="${config.inputPosition}"
                  data-theme="${config.theme}"
                  data-lang="${config.lang}"
                  crossorigin="anonymous"
                  async>
          </script>
        </div>
      </div>
    `;
  }

  renderUtterancesComments(post) {
    const config = this.config.comments.utterances;

    return `
      <div class="comments-section mt-12 mx-auto" style="max-width: 750px;">
        <div class="border-t pt-8">
          <h3 class="text-xl font-bold mb-6 text-center">💬 评论</h3>
          <script src="https://utteranc.es/client.js"
                  repo="${config.repo}"
                  issue-term="${config.issueTerm}"
                  label="${config.label}"
                  theme="${config.theme}"
                  crossorigin="anonymous"
                  async>
          </script>
        </div>
      </div>
    `;
  }

  renderGitalkComments(post) {
    const config = this.config.comments.gitalk;

    // Skip if required fields are missing
    if (!config.clientID || !config.clientSecret) {
      return `
        <div class="comments-section mt-12 mx-auto" style="max-width: 750px;">
          <div class="text-center text-gray-500 py-8">
            <p>💬 GitTalk 评论系统配置不完整</p>
            <p class="text-sm mt-2">请在 config.json 中配置 clientID 和 clientSecret</p>
            <p class="text-sm">
              <a href="https://github.com/settings/applications/new" target="_blank" class="text-blue-600 hover:underline">
                前往 GitHub 创建 OAuth App
              </a>
            </p>
          </div>
        </div>
      `;
    }

    // Generate unique ID for the post
    const postId = config.id === 'pathname' ? post.url : `post-${post.id}`;
    const uniqueId = this.generateMD5(postId).substring(0, 50); // GitTalk requires ID <= 50 chars

    return `
      <div class="comments-section mt-12 mx-auto" style="max-width: 750px;">
        <div class="border-t pt-8">
          <h3 class="text-xl font-bold mb-6 text-center">💬 评论</h3>
          <div id="gitalk-container"></div>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css">
          <script src="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js"></script>
          <script>
            const gitalk = new Gitalk({
              clientID: '${config.clientID}',
              clientSecret: '${config.clientSecret}',
              repo: '${config.repo}',
              owner: '${config.owner}',
              admin: ${JSON.stringify(config.admin)},
              id: '${uniqueId}',
              distractionFreeMode: ${config.distractionFreeMode},
              language: '${config.language}'
            });
            gitalk.render('gitalk-container');
          </script>
        </div>
      </div>
    `;
  }

  generateMD5(str) {
    // Simple hash function for generating unique IDs
    // This is a basic implementation - in production you might want to use a proper crypto library
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  fixAssetPaths(html) {
    // For GitHub Pages deployment from dist directory
    // We need to fix paths to work with the baseUrl

    if (!this.baseUrl) {
      // If no baseUrl (root domain deployment), convert relative paths to absolute
      html = html.replace(/href="\.\/assets\//g, 'href="/assets/');
      html = html.replace(/src="\.\/assets\//g, 'src="/assets/');
      return html;
    }

    // For subdirectory deployment, fix all paths to include baseUrl
    const lines = html.split('\n');
    const fixedLines = lines.map(line => {
      // Skip lines that already contain the baseUrl to avoid double replacement
      if (line.includes(this.baseUrl)) {
        return line;
      }

      // Fix relative asset paths to absolute with baseUrl
      line = line.replace(/href="\.\/assets\//g, `href="${this.baseUrl}/assets/`);
      line = line.replace(/src="\.\/assets\//g, `src="${this.baseUrl}/assets/`);

      // Fix absolute asset paths
      line = line.replace(/href="\/assets\//g, `href="${this.baseUrl}/assets/`);
      line = line.replace(/src="\/assets\//g, `src="${this.baseUrl}/assets/`);

      // Fix navigation links
      line = line.replace(/href="\/"/g, `href="${this.baseUrl}/"`);
      line = line.replace(/href="\/([^"]*\.html)"/g, `href="${this.baseUrl}/$1"`);
      line = line.replace(/href="\/([^"]*\.json)"/g, `href="${this.baseUrl}/$1"`);

      // Fix search data path
      line = line.replace(/fetch\('\/search-data\.json'\)/g, `fetch('${this.baseUrl}/search-data.json')`);

      return line;
    });

    return fixedLines.join('\n');
  }
}

// Run the build
if (require.main === module) {
  const builder = new BlogBuilder();
  builder.build();
}

module.exports = BlogBuilder;
