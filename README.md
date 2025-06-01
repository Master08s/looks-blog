# Looks Blog

一个基于 GitHub Issues 的个人博客系统，使用 GitHub Actions 和 GitHub Pages 自动构建和部署。

## ✨ 特性

- 📝 **GitHub Issues 作为博客文章** - 直接在 GitHub Issues 中写作，自动转换为博客文章
- 🏷️ **标签作为分类** - Issue 标签自动成为文章分类
- 💬 **GitHub 评论系统** - Issue 评论作为文章评论，支持 GitHub 登录
- 🔍 **全文搜索** - 客户端搜索功能，快速查找文章
- 📱 **响应式设计** - 适配各种设备屏幕
- ⚡ **自动部署** - 基于 GitHub Actions 的自动构建和部署
- 🎨 **简洁美观** - 现代化的设计风格

## 🚀 快速开始

### 1. 使用模板

点击 "Use this template" 按钮创建你的博客仓库。

### 2. 配置博客

编辑 `config.json` 文件：

```json
{
  "site": {
    "title": "你的博客名称",
    "description": "你的博客描述",
    "url": "https://yourusername.github.io/your-repo-name",
    "author": "你的用户名",
    "avatar": "https://github.com/yourusername.png",
    "language": "zh-CN"
  },
  "github": {
    "owner": "你的用户名",
    "repo": "你的仓库名",
    "token": "process.env.GITHUB_TOKEN"
  },
  "social": {
    "github": "https://github.com/yourusername"
  }
}
```

### 3. 启用 GitHub Pages

1. 进入仓库的 Settings 页面
2. 找到 Pages 设置
3. Source 选择 "GitHub Actions"

### 4. 开始写作

1. 在你的仓库中创建新的 Issue
2. 使用 Markdown 格式写作
3. 添加标签作为文章分类
4. 发布 Issue，GitHub Actions 会自动构建并部署博客

## 📝 写作指南

### 创建文章

1. 点击仓库的 "Issues" 标签
2. 点击 "New issue" 创建新文章
3. 标题作为文章标题
4. 内容使用 Markdown 格式
5. 添加标签作为分类

### 文章分类

通过给 Issue 添加标签来设置文章分类：

- 标签名称会成为分类名称
- 标签颜色会用于分类显示
- 一篇文章可以有多个分类

### 评论系统

- Issue 的评论会自动显示为文章评论
- 读者可以通过 GitHub 账号登录并评论
- 支持 Markdown 格式的评论

## 🛠️ 本地开发

### 安装依赖

```bash
npm install
```

### 本地构建

```bash
npm run build
```

### 本地预览

```bash
npm run dev
```

然后访问 `http://localhost:8080` 预览博客。

## 📁 项目结构

```
├── .github/workflows/    # GitHub Actions 工作流
├── assets/              # 静态资源
├── scripts/             # 构建脚本
├── templates/           # 页面模板
├── config.json          # 博客配置
├── package.json         # 项目配置
└── README.md           # 说明文档
```

## 🎨 自定义

### 修改样式

编辑 `assets/` 目录下的 CSS 文件来自定义博客样式。

### 修改模板

编辑 `templates/` 目录下的 HTML 模板文件：

- `index.html` - 首页模板
- `post.html` - 文章页面模板
- `categories.html` - 分类页面模板
- `archives.html` - 归档页面模板
- `search.html` - 搜索页面模板

## 🔧 高级配置

### GitHub OAuth 应用

如果需要完整的评论功能，需要创建 GitHub OAuth 应用：

1. 访问 GitHub Settings > Developer settings > OAuth Apps
2. 创建新的 OAuth 应用
3. 设置回调 URL 为你的博客域名
4. 在 `templates/post.html` 中配置 Client ID

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如果你在使用过程中遇到问题，可以：

1. 查看 [Issues](https://github.com/Master08s/looks-blog/issues) 寻找解决方案
2. 创建新的 Issue 描述问题
3. 参考 [GitHub Pages 文档](https://docs.github.com/en/pages)
