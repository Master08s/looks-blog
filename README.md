<div align="center">

# Looks Blog

**让写作回归本质，用 GitHub Issues 构建你的个人博客**

[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/Master08s/looks-blog/build-deploy.yml?branch=main&style=flat-square)](https://github.com/Master08s/looks-blog/actions)
[![License](https://img.shields.io/github/license/Master08s/looks-blog?style=flat-square)](LICENSE)

[在线演示](https://master08s.github.io/looks-blog/) · [问题反馈](https://github.com/Master08s/looks-blog/issues)

</div>

---

## 为什么选择 Looks Blog？

在这个信息爆炸的时代，我们需要一个简单纯粹的写作空间。Looks Blog 让你专注于内容创作，而不是复杂的技术配置。

**核心理念**
- **写作优先** - 在熟悉的 GitHub Issues 中写作，无需学习新工具
- **自动化** - 发布文章后自动构建部署，专注创作不被打断
- **简洁美观** - 现代化设计，让内容成为主角
- **完全免费** - 基于 GitHub 生态，永久免费使用

## 三分钟搭建你的博客

### 第一步：创建你的博客仓库

点击 [Use this template](https://github.com/Master08s/looks-blog/generate) 按钮，GitHub 会为你创建一个全新的博客仓库。

### 第二步：个性化配置

打开 `config.json` 文件，这是你博客的"身份证"，让我们一起填写：

```json
{
  "site": {
    "title": "张三的技术博客",
    "description": "分享前端开发经验与生活感悟",
    "url": "https://zhangsan.github.io/my-blog",
    "author": "zhangsan",
    "avatar": "https://github.com/zhangsan.png",
    "favicon": "https://github.com/zhangsan.png",
    "language": "zh-CN",
    "date": "2024-01-01",
    "keywords": ["技术", "编程", "前端", "博客"],
    "timezone": "Asia/Shanghai",
    "copyright": "© 2024 张三. All rights reserved."
  },
  "github": {
    "owner": "zhangsan",
    "repo": "my-blog"
  },
  "social": {
    "github": "https://github.com/zhangsan",
    "email": "zhangsan@example.com"
  }
}
```

## 📋 完整配置参数详解

### 🏠 `site` 部分 - 博客基本信息
- `title` - 博客标题，会显示在网站顶部和浏览器标签页
- `description` - 博客描述，用于 SEO 和社交分享
- `url` - 博客访问地址
  - 如果仓库名是 `username.github.io`，填写：`https://username.github.io`
  - 如果仓库名是其他名称，填写：`https://username.github.io/仓库名`
- `author` - 你的 GitHub 用户名，用于版权信息和链接
- `avatar` - 头像图片链接，建议使用 GitHub 头像：`https://github.com/用户名.png`
- `favicon` - 网站图标链接，显示在浏览器标签页和书签中
- `language` - 网站语言，影响页面的语言标识
- `date` - 博客创建日期，用于计算运行天数
- `keywords` - 网站关键词数组，用于 SEO 优化
- `timezone` - 时区设置，影响时间显示格式
- `copyright` - 版权信息，显示在页面底部
- `icp` - 备案号（可选，国内网站需要）
- `analytics` - 统计代码配置
  - `google` - Google Analytics 跟踪 ID
  - `baidu` - 百度统计代码

### 🔗 `github` 部分 - GitHub 仓库信息
- `owner` - GitHub 用户名（与 author 保持一致）
- `repo` - 仓库名称
- `token` - GitHub API 令牌（通过环境变量设置）

### 📱 `social` 部分 - 社交媒体链接
- `github` - GitHub 个人主页链接
- `twitter` - Twitter 个人主页链接
- `weibo` - 微博个人主页链接
- `email` - 邮箱地址
- `linkedin` - LinkedIn 个人主页链接
- `telegram` - Telegram 联系方式
- `wechat` - 微信号
- `qq` - QQ 号

### ⚙️ `build` 部分 - 构建配置
- `postsPerPage` - 每页显示的文章数量
- `excerptLength` - 文章摘要长度（字符数）
- `dateFormat` - 日期显示格式
- `enableCache` - 是否启用构建缓存
- `cacheExpiry` - 缓存过期时间（秒）
- `minifyHtml` - 是否压缩 HTML
- `generateSitemap` - 是否生成站点地图
- `generateRss` - 是否生成 RSS 订阅

### 🎛️ `features` 部分 - 功能开关
- `comments` - 是否启用评论功能
- `search` - 是否启用搜索功能
- `categories` - 是否启用分类功能
- `archives` - 是否启用归档功能
- `imageProxy` - 是否启用图片代理功能

### 🖼️ `imageProxy` 部分 - 图片代理配置
- `enabled` - 是否启用图片代理（true/false）
- `baseUrl` - 代理服务地址，默认使用 weserv.nl
- `description` - 功能说明

### 🎨 `theme` 部分 - 主题配置
- `primaryColor` - 主色调
- `accentColor` - 强调色
- `backgroundColor` - 背景色
- `textColor` - 文字颜色
- `linkColor` - 链接颜色
- `borderColor` - 边框颜色
- `codeTheme` - 代码高亮主题
- `fontFamily` - 字体系列
- `darkMode` - 暗色模式配置
  - `enabled` - 是否启用暗色模式
  - `auto` - 是否自动切换

### 🎯 `ui` 部分 - 界面功能
- `showReadingTime` - 显示阅读时间
- `showWordCount` - 显示字数统计
- `showViewCount` - 显示浏览量
- `showLastModified` - 显示最后修改时间
- `showTableOfContents` - 显示目录导航
- `enableLazyLoading` - 启用图片懒加载
- `enableImageZoom` - 启用图片缩放
- `showBackToTop` - 显示返回顶部按钮

### 🔧 `customCode` 部分 - 自定义代码注入
- `global` - 全局自定义代码（所有页面生效）
  - `head` - 头部代码注入（插入到 `</head>` 前）
    - `css` - CSS 文件链接数组
    - `js` - JavaScript 文件链接数组
    - `html` - 自定义 HTML 代码
  - `footer` - 底部代码注入（插入到 `</body>` 前）
    - `css` - CSS 文件链接数组
    - `js` - JavaScript 文件链接数组
    - `html` - 自定义 HTML 代码
- `post` - 文章页专用自定义代码（仅文章页生效）
  - `head` - 文章页头部代码注入
  - `footer` - 文章页底部代码注入

**重要提醒：**
> 请确保 `owner` 和 `repo` 与你的实际仓库信息一致，否则无法正确获取 Issues 数据

### 📝 完整配置示例

<details>
<summary>点击查看完整的 config.json 配置示例</summary>

```json
{
  "site": {
    "title": "我的技术博客",
    "description": "分享编程经验与技术思考",
    "url": "https://username.github.io/my-blog",
    "author": "username",
    "avatar": "https://github.com/username.png",
    "favicon": "https://github.com/username.png",
    "language": "zh-CN",
    "date": "2024-01-01",
    "keywords": ["技术", "编程", "前端", "后端", "博客"],
    "timezone": "Asia/Shanghai",
    "copyright": "© 2024 我的技术博客. All rights reserved.",
    "icp": "",
    "analytics": {
      "google": "G-XXXXXXXXXX",
      "baidu": "xxxxxxxxxxxxxxxx"
    }
  },
  "github": {
    "owner": "username",
    "repo": "my-blog",
    "token": "process.env.GITHUB_TOKEN"
  },
  "social": {
    "github": "https://github.com/username",
    "twitter": "https://twitter.com/username",
    "weibo": "https://weibo.com/username",
    "email": "username@example.com",
    "linkedin": "https://linkedin.com/in/username",
    "telegram": "@username",
    "wechat": "your-wechat-id",
    "qq": "123456789"
  },
  "build": {
    "postsPerPage": 10,
    "excerptLength": 150,
    "dateFormat": "yyyy-MM-dd",
    "enableCache": true,
    "cacheExpiry": 3600,
    "minifyHtml": false,
    "generateSitemap": true,
    "generateRss": true
  },
  "features": {
    "comments": true,
    "search": true,
    "categories": true,
    "archives": true,
    "imageProxy": true
  },
  "imageProxy": {
    "enabled": true,
    "baseUrl": "https://images.weserv.nl/?url=",
    "description": "使用 weserv.nl 图片代理服务加速图片加载"
  },
  "theme": {
    "primaryColor": "#3b82f6",
    "accentColor": "#10b981",
    "backgroundColor": "#ffffff",
    "textColor": "#1f2937",
    "linkColor": "#3b82f6",
    "borderColor": "#e5e7eb",
    "codeTheme": "github",
    "fontFamily": "system-ui, -apple-system, sans-serif",
    "darkMode": {
      "enabled": false,
      "auto": false
    }
  },
  "ui": {
    "showReadingTime": true,
    "showWordCount": true,
    "showViewCount": false,
    "showLastModified": false,
    "showTableOfContents": true,
    "enableLazyLoading": true,
    "enableImageZoom": false,
    "showBackToTop": true
  },
  "customCode": {
    "global": {
      "head": {
        "css": [
          "https://cdn.jsdelivr.net/npm/custom-styles@1.0.0/dist/style.css"
        ],
        "js": [
          "https://cdn.jsdelivr.net/npm/analytics@1.0.0/dist/analytics.min.js"
        ],
        "html": "<!-- 全局头部自定义代码 -->\n<meta name=\"custom-meta\" content=\"global\">"
      },
      "footer": {
        "css": [],
        "js": [
          "https://cdn.jsdelivr.net/npm/global-footer@1.0.0/dist/footer.min.js"
        ],
        "html": "<!-- 全局底部自定义代码 -->\n<div id=\"custom-footer\">Powered by Custom Code</div>"
      }
    },
    "post": {
      "head": {
        "css": [
          "https://cdn.jsdelivr.net/npm/post-styles@1.0.0/dist/post.css"
        ],
        "js": [],
        "html": "<!-- 文章页头部自定义代码 -->"
      },
      "footer": {
        "css": [],
        "js": [
          "https://cdn.jsdelivr.net/npm/post-enhancements@1.0.0/dist/post.min.js"
        ],
        "html": "<!-- 文章页底部自定义代码 -->\n<script>\n  console.log('Post page loaded');\n</script>"
      }
    }
  }
}
```

</details>

### 第三步：启用 GitHub Pages

这一步让你的博客真正"上线"：

1. 进入你的仓库，点击 **Settings** 标签
2. 在左侧菜单找到 **Pages** 选项
3. 在 **Source** 下拉菜单中选择 **GitHub Actions**
4. 保存设置，等待几分钟自动部署完成

**小贴士：** 如果没有创建文章,需手动执行action

### 第四步：写下你的第一篇文章

现在来体验最有趣的部分 - 写作！

1. 在你的仓库中点击 **Issues** 标签
2. 点击绿色的 **New issue** 按钮
3. 填写标题（这就是你的文章标题）
4. 在内容区域用 Markdown 写作
5. 在右侧添加标签作为文章分类
6. 点击 **Submit new issue** 发布

**恭喜！** 你的博客已经搭建完成，文章会在几分钟内自动发布到你的网站。

---

## 写作技巧与最佳实践

### 如何创作优质内容

**标题的艺术**
- 使用清晰、有吸引力的标题
- 避免过长的标题，建议控制在 50 字以内
- 可以使用问号、数字等增加吸引力

**内容结构建议**
- 使用 Markdown 的标题层级（`#`、`##`、`###`）组织内容
- 适当使用代码块、引用、列表等格式
- 添加图片让文章更生动（支持拖拽上传）

**分类标签策略**
- 建议每篇文章 2-4 个标签
- 使用一致的标签命名规则
- 可以按技术栈、主题、难度等维度分类

**文章管理功能**
- **置顶文章** - 给 Issue 添加 `pinned` 或 `置顶` 标签，文章会显示在首页顶部并带有 📌 图标
- **删除文章** - 删除或关闭 Issue，对应的文章文件会在下次构建时自动清理
- **文章排序** - 置顶文章优先显示，其余文章按创建时间倒序排列

### 高级写作功能

**支持的 Markdown 语法**
- 基础格式：**粗体**、*斜体*、`代码`
- 代码块：支持语法高亮
- 表格、列表、引用
- 数学公式（LaTeX 语法）
- 任务列表：`- [ ]` 和 `- [x]`

**图片处理功能**
- **图片代理加速** - 启用后自动通过 weserv.nl 代理加载图片，提高访问速度
- **自动处理** - 支持 Markdown 和 HTML 格式的图片链接自动转换
- **智能识别** - 只处理 HTTP/HTTPS 链接，跳过已代理的图片
- **配置灵活** - 可在 `config.json` 中开启/关闭图片代理功能

**图片使用建议**
- 推荐使用 GitHub 的图片上传功能
- 图片大小建议控制在 1MB 以内
- 启用图片代理可显著提升国内访问速度

---

## 🎨 主题与样式定制

### 颜色主题配置

你可以通过 `theme` 配置自定义博客的颜色主题：

```json
{
  "theme": {
    "primaryColor": "#3b82f6",    // 主色调（蓝色）
    "accentColor": "#10b981",     // 强调色（绿色）
    "backgroundColor": "#ffffff", // 背景色（白色）
    "textColor": "#1f2937",       // 文字颜色（深灰）
    "linkColor": "#3b82f6",       // 链接颜色（蓝色）
    "borderColor": "#e5e7eb"      // 边框颜色（浅灰）
  }
}
```

### 代码高亮主题

支持多种代码高亮主题，可在 `theme.codeTheme` 中设置：
- `github` - GitHub 风格（默认）
- `monokai` - Monokai 暗色主题
- `atom-one-dark` - Atom One Dark 主题
- `vs2015` - Visual Studio 2015 主题

### 字体配置

可以自定义字体系列：

```json
{
  "theme": {
    "fontFamily": "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
  }
}
```

## 📊 SEO 与统计配置

### 搜索引擎优化

通过以下配置提升 SEO 效果：

```json
{
  "site": {
    "keywords": ["技术", "编程", "前端", "博客"],
    "description": "详细的博客描述，有助于搜索引擎理解网站内容"
  },
  "build": {
    "generateSitemap": true,  // 自动生成站点地图
    "generateRss": true       // 自动生成 RSS 订阅
  }
}
```

### 网站统计

支持 Google Analytics 和百度统计：

```json
{
  "site": {
    "analytics": {
      "google": "G-XXXXXXXXXX",        // Google Analytics 4 测量 ID
      "baidu": "xxxxxxxxxxxxxxxx"      // 百度统计代码
    }
  }
}
```

## 🔧 功能开关配置

### UI 功能控制

通过 `ui` 配置控制界面功能的显示：

```json
{
  "ui": {
    "showReadingTime": true,      // 显示预计阅读时间
    "showWordCount": true,        // 显示文章字数
    "showViewCount": false,       // 显示浏览量（需要统计服务支持）
    "showLastModified": false,    // 显示最后修改时间
    "showTableOfContents": true,  // 显示文章目录
    "enableLazyLoading": true,    // 启用图片懒加载
    "enableImageZoom": false,     // 启用图片点击放大
    "showBackToTop": true         // 显示返回顶部按钮
  }
}
```

### 社交媒体链接

配置多个社交媒体平台的链接：

```json
{
  "social": {
    "github": "https://github.com/username",
    "twitter": "https://twitter.com/username",
    "weibo": "https://weibo.com/username",
    "email": "username@example.com",
    "linkedin": "https://linkedin.com/in/username",
    "telegram": "@username",
    "wechat": "your-wechat-id",
    "qq": "123456789"
  }
}
```

## 🔧 自定义代码注入

### 功能概述

自定义代码注入功能允许你在博客的不同位置添加第三方 CSS、JavaScript 和 HTML 代码，支持：

- **全局注入** - 在所有页面生效
- **文章页专用** - 仅在文章页面生效
- **头部注入** - 代码插入到 `</head>` 标签前
- **底部注入** - 代码插入到 `</body>` 标签前

### 基础配置

```json
{
  "customCode": {
    "global": {
      "head": {
        "css": ["https://example.com/global.css"],
        "js": ["https://example.com/global.js"],
        "html": "<meta name=\"custom\" content=\"global\">"
      },
      "footer": {
        "css": [],
        "js": ["https://example.com/footer.js"],
        "html": "<div id=\"global-footer\">Custom Footer</div>"
      }
    },
    "post": {
      "head": {
        "css": ["https://example.com/post.css"],
        "js": ["https://example.com/post.js"],
        "html": "<!-- Post specific head code -->"
      },
      "footer": {
        "css": [],
        "js": ["https://example.com/post-footer.js"],
        "html": "<script>console.log('Post loaded');</script>"
      }
    }
  }
}
```

### 实际应用示例

#### 添加 Google Analytics

```json
{
  "customCode": {
    "global": {
      "head": {
        "js": ["https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"],
        "html": "<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'GA_MEASUREMENT_ID');\n</script>"
      }
    }
  }
}
```

#### 添加评论系统（如 Giscus）

```json
{
  "customCode": {
    "post": {
      "footer": {
        "html": "<script src=\"https://giscus.app/client.js\"\n        data-repo=\"your-username/your-repo\"\n        data-repo-id=\"your-repo-id\"\n        data-category=\"General\"\n        data-category-id=\"your-category-id\"\n        data-mapping=\"pathname\"\n        data-strict=\"0\"\n        data-reactions-enabled=\"1\"\n        data-emit-metadata=\"0\"\n        data-input-position=\"bottom\"\n        data-theme=\"preferred_color_scheme\"\n        data-lang=\"zh-CN\"\n        crossorigin=\"anonymous\"\n        async>\n</script>"
      }
    }
  }
}
```

#### 添加自定义样式

```json
{
  "customCode": {
    "global": {
      "head": {
        "css": [
          "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
          "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css"
        ],
        "html": "<style>\n  body { font-family: 'Inter', sans-serif; }\n  .animate { animation: fadeIn 0.5s ease-in; }\n</style>"
      }
    }
  }
}
```

#### 添加数学公式支持（MathJax）

```json
{
  "customCode": {
    "post": {
      "head": {
        "js": ["https://polyfill.io/v3/polyfill.min.js?features=es6"],
        "html": "<script id=\"MathJax-script\" async src=\"https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js\"></script>\n<script>\n  window.MathJax = {\n    tex: {\n      inlineMath: [['$', '$'], ['\\\\(', '\\\\)']]\n    }\n  };\n</script>"
      }
    }
  }
}
```

### 注意事项

1. **安全性** - 只添加来自可信来源的代码
2. **性能** - 避免添加过多外部资源，影响页面加载速度
3. **兼容性** - 确保添加的代码与现有样式和功能兼容
4. **测试** - 添加自定义代码后要充分测试各个页面
5. **备份** - 修改前建议备份当前配置

## 🚀 性能优化配置

### 构建缓存

启用构建缓存可以显著提升构建速度：

```json
{
  "build": {
    "enableCache": true,    // 启用缓存
    "cacheExpiry": 3600,    // 缓存过期时间（秒）
    "minifyHtml": false     // HTML 压缩（可选）
  }
}
```

### 图片优化

图片代理功能可以加速图片加载：

```json
{
  "imageProxy": {
    "enabled": true,
    "baseUrl": "https://images.weserv.nl/?url=",
    "description": "使用 weserv.nl 图片代理服务加速图片加载"
  }
}
```

---

## 进阶配置与自定义

### 本地开发环境

如果你想在本地预览博客效果，可以搭建开发环境：

**环境准备**
- Node.js 18 或更高版本
- Git 工具

**快速开始**
```bash
# 克隆你的博客仓库
git clone https://github.com/你的用户名/你的仓库名.git
cd 你的仓库名

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问 `http://localhost:8080` 即可预览。

### 自动化部署详解

**什么时候会自动重新构建？**
- 创建、编辑、删除 Issues
- 添加或删除 Issue 标签
- 有人在 Issues 下评论
- 推送代码到主分支
- 每天凌晨 2 点定时重建

**什么时候需要手动触发？**
- 修改了 `config.json` 配置文件
- 修改了 `README.md` 文档
- 需要立即重建博客

**如何手动触发构建？**
1. 进入仓库的 **Actions** 标签
2. 选择 **Build and Deploy Blog** 工作流
3. 点击 **Run workflow** 按钮

### 个性化定制

**修改博客样式**
- 编辑 `assets/css/` 目录下的样式文件
- 支持自定义颜色、字体、布局等

**修改页面模板**
- `templates/` 目录包含所有页面模板
- 支持 HTML 和模板语法自定义

**添加自定义功能**
- 可以在模板中添加统计代码
- 支持集成评论系统
- 可以添加自定义 JavaScript

---

## 常见问题解答

**Q: 为什么我的文章没有显示？**
A: 请检查 Issue 是否为 "Open" 状态，只有开放的 Issues 会被转换为文章。

**Q: 可以设置文章的发布时间吗？**
A: 文章的发布时间就是 Issue 的创建时间，暂不支持自定义发布时间。

**Q: 如何删除文章？**
A: 删除或关闭对应的 Issue 即可，文章文件会在下次构建时自动清理。

**Q: 如何置顶文章？**
A: 给 Issue 添加 `置顶` 标签，文章会自动显示在首页顶部并带有 📌 图标。

**Q: 支持评论功能吗？**
A: Issue 的评论会自动显示为文章评论，读者可以直接在 GitHub 上参与讨论。

**Q: 图片加载很慢怎么办？**
A: 可以在 `config.json` 中启用图片代理功能，系统会自动通过 weserv.nl 代理加载图片，显著提升访问速度。

**Q: 如何关闭图片代理功能？**
A: 在 `config.json` 中将 `imageProxy.enabled` 设置为 `false` 即可关闭图片代理。

**Q: 如何自定义博客主题颜色？**
A: 在 `config.json` 的 `theme` 部分修改颜色配置，支持自定义主色调、强调色、背景色等。

**Q: 如何添加 Google Analytics 统计？**
A: 在 `config.json` 的 `site.analytics.google` 字段填入你的 Google Analytics 测量 ID。

**Q: 如何关闭某些 UI 功能？**
A: 在 `config.json` 的 `ui` 部分将对应功能设置为 `false`，如关闭阅读时间显示：`"showReadingTime": false`。

**Q: 如何添加社交媒体链接？**
A: 在 `config.json` 的 `social` 部分填入对应平台的链接，支持 GitHub、Twitter、微博、邮箱等多个平台。

**Q: 如何启用暗色模式？**
A: 在 `config.json` 的 `theme.darkMode` 部分设置 `"enabled": true`，还可以设置 `"auto": true` 实现自动切换。

**Q: 新增的配置项需要重新构建吗？**
A: 是的，修改 `config.json` 后需要手动触发 GitHub Actions 重新构建博客。

**Q: 如何添加第三方 CSS 或 JavaScript？**
A: 在 `config.json` 的 `customCode` 部分配置，支持全局和文章页专用的代码注入。

**Q: 自定义代码会影响页面性能吗？**
A: 可能会，建议只添加必要的代码，并选择可靠的 CDN 来源以确保加载速度。

**Q: 如何添加评论系统？**
A: 可以通过 `customCode.post.footer.html` 添加评论系统代码，如 Giscus、Disqus 等。

**Q: 自定义代码支持哪些位置？**
A: 支持头部（`</head>` 前）和底部（`</body>` 前）注入，分别支持全局和文章页专用。

**Q: 如何添加数学公式支持？**
A: 在 `customCode.post.head` 中添加 MathJax 或 KaTeX 的相关代码即可。

---

## 许可证

本项目采用 MIT 许可证，你可以自由使用、修改和分发。

## 贡献与支持

如果这个项目对你有帮助，欢迎：
- 给项目点个 ⭐ Star
- 提交 Issue 反馈问题
- 提交 Pull Request 贡献代码
- 分享给更多需要的朋友

**让我们一起让写作变得更简单、更纯粹。**
