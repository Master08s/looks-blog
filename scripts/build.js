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

marked.setOptions({
  renderer: renderer,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {}
    }
    return hljs.highlightAuto(code).value;
  },
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
      console.log(`📄 Found ${this.issues.length} issues`);
      
      // Fetch comments for each issue
      for (const issue of this.issues) {
        if (issue.comments > 0) {
          const commentsResponse = await axios.get(issue.comments_url, { headers });
          issue.issue_comments = commentsResponse.data;
        } else {
          issue.issue_comments = [];
        }
      }
      
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

  processPosts() {
    console.log('🔄 Processing posts...');

    this.posts = this.issues.map(issue => {
      const createdAt = new Date(issue.created_at);
      const updatedAt = new Date(issue.updated_at);
      const isUpdated = updatedAt.getTime() - createdAt.getTime() > 60000; // More than 1 minute difference

      const post = {
        id: issue.number,
        title: issue.title,
        content: marked(issue.body || ''),
        excerpt: this.generateExcerpt(issue.body || ''),
        author: issue.user.login,
        avatar: issue.user.avatar_url,
        created_at: createdAt,
        updated_at: updatedAt,
        created_at_iso: createdAt.toISOString(),
        created_at_formatted: this.formatDate(createdAt),
        updated_at_formatted: this.formatDate(updatedAt),
        is_updated: isUpdated,
        url: `${this.baseUrl}/posts/${issue.number}.html`,
        github_url: issue.html_url,
        labels: issue.labels || [],
        comments_count: issue.comments,
        state: issue.state || 'open',
        // GitHub Issue specific data
        issue_data: {
          number: issue.number,
          state: issue.state,
          locked: issue.locked || false,
          assignees: issue.assignees || [],
          milestone: issue.milestone,
          reactions: issue.reactions || {},
          author_association: issue.author_association
        }
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

    // Sort posts by creation date (newest first)
    this.posts.sort((a, b) => b.created_at - a.created_at);
  }

  formatDate(date) {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  generateExcerpt(content) {
    const plainText = content.replace(/[#*`\[\]]/g, '').trim();
    return plainText.length > this.config.build.excerptLength 
      ? plainText.substring(0, this.config.build.excerptLength) + '...'
      : plainText;
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
              <div class="textc-primary font-serif font-semibold" style="font-size: 1.2rem">${this.escapeHtml(post.title)}</div>

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
      html = html.replace(/\{\{post\.created_at_iso\}\}/g, data.post.created_at_iso || '');
      html = html.replace(/\{\{post\.created_at_formatted\}\}/g, data.post.created_at_formatted || '');
      html = html.replace(/\{\{post\.updated_at_formatted\}\}/g, data.post.updated_at_formatted || '');
      html = html.replace(/\{\{post\.author\}\}/g, this.escapeHtml(data.post.author) || '');
      html = html.replace(/\{\{post\.github_url\}\}/g, data.post.github_url || '');
      html = html.replace(/\{\{post\.avatar\}\}/g, data.post.avatar || '');
      html = html.replace(/\{\{post\.url\}\}/g, data.post.url || '');
      html = html.replace(/\{\{post\.excerpt\}\}/g, this.escapeHtml(data.post.excerpt) || '');
      // Create full URL by combining site URL with post URL (removing duplicate baseUrl)
      const fullUrl = data.post.url.startsWith(this.baseUrl)
        ? `${this.config.site.url}${data.post.url}`
        : `${this.config.site.url}${this.baseUrl}${data.post.url}`;
      html = html.replace(/\{\{post\.full_url\}\}/g, fullUrl || '');

      // Handle post labels section
      if (data.post.labels && data.post.labels.length > 0) {
        const labelsHtml = `
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="mb-2 text-sm font-medium text-gray-700">标签</div>
            <div class="flex flex-wrap gap-2">
              ${data.post.labels.map(label =>
                `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                       style="background-color: #${label.color}20; color: #${label.color}; border: 1px solid #${label.color}40">
                  ${this.escapeHtml(label.name)}
                </span>`
              ).join('')}
            </div>
          </div>
        `;
        html = html.replace(/\{\{post\.labels_section\}\}/g, labelsHtml);

        // Legacy labels support (for backward compatibility)
        const legacyLabelsHtml = data.post.labels.map(label =>
          `<span class="category" style="background-color: #${label.color}20; color: #${label.color}; border: 1px solid #${label.color}40">${this.escapeHtml(label.name)}</span>`
        ).join('');
        html = html.replace(/\{\{post\.labels\}\}/g, legacyLabelsHtml);
      } else {
        html = html.replace(/\{\{post\.labels_section\}\}/g, '');
        html = html.replace(/\{\{post\.labels\}\}/g, '');
      }

      // Handle updated time section
      if (data.post.is_updated) {
        const updatedIndicator = `<span class="text-orange-600">· 已更新于 ${data.post.updated_at_formatted}</span>`;
        html = html.replace(/\{\{post\.updated_indicator\}\}/g, updatedIndicator);

        const updatedTimeSection = `
          <div class="flex justify-between">
            <span class="text-gray-600">更新时间:</span>
            <time datetime="${data.post.updated_at.toISOString()}">${data.post.updated_at_formatted}</time>
          </div>
        `;
        html = html.replace(/\{\{post\.updated_time_section\}\}/g, updatedTimeSection);
      } else {
        html = html.replace(/\{\{post\.updated_indicator\}\}/g, '');
        html = html.replace(/\{\{post\.updated_time_section\}\}/g, '');
      }

      // Handle issue state section
      const stateColor = data.post.state === 'open' ? 'green' : 'purple';
      const stateText = data.post.state === 'open' ? '开放' : '已关闭';
      const issueStateSection = `
        <div class="flex justify-between">
          <span class="text-gray-600">Issue 状态:</span>
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${stateColor}-100 text-${stateColor}-800">
            ${stateText}
          </span>
        </div>
      `;
      html = html.replace(/\{\{post\.issue_state_section\}\}/g, issueStateSection);

      // Handle time tips section
      const daysSinceCreated = Math.floor((Date.now() - data.post.created_at.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreated > 30) {
        const phrases = [
          "时过境迁", "沧海桑田", "天翻地覆", "水流花落", "斗转星移",
          "物是人非", "时移世易", "物换星移", "春去秋来"
        ];
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        const timeTipsSection = `
          <div class="card p-4 bg-amber-50 border-amber-200">
            <div class="flex items-center gap-2 text-amber-800">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm font-medium">时间提醒</span>
            </div>
            <p class="mt-2 text-sm text-amber-700" id="post-time-tips-span">
              本文发布于 ${daysSinceCreated} 天前，其中的信息可能已经${randomPhrase}
            </p>
          </div>
        `;
        html = html.replace(/\{\{post\.time_tips_section\}\}/g, timeTipsSection);
      } else {
        html = html.replace(/\{\{post\.time_tips_section\}\}/g, '');
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

    return html;
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
