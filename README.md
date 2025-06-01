# Looks Blog

一个基于 GitHub Issues 的个人博客系统，使用 GitHub Actions 和 GitHub Pages 自动构建和部署。

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

### 2. 启用 GitHub Pages

1. 进入仓库的 Settings 页面
2. 找到 Pages 设置
3. Source 选择 "GitHub Actions"

### 3. 开始写作

1. 在你的仓库中创建新的 Issue
2. 使用 Markdown 格式写作
3. 添加标签作为文章分类
4. 发布 Issue，GitHub Actions 会自动构建并部署博客

--------------------------

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


##  许可证

MIT License

##  贡献

欢迎提交 Issue 和 Pull Request！
