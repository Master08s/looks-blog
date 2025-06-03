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
    "date": "2024-01-01"
  },
  "github": {
    "owner": "zhangsan",
    "repo": "my-blog"
  }
}
```

**参数详解：**

**`site` 部分 - 博客基本信息**
- `title` - 博客标题，会显示在网站顶部和浏览器标签页
- `description` - 博客描述，用于 SEO 和社交分享
- `url` - 博客访问地址
  - 如果仓库名是 `username.github.io`，填写：`https://username.github.io`
  - 如果仓库名是其他名称，填写：`https://username.github.io/仓库名`
  - 如果是自定义域名,填写: `https://xxxx.xx`
- `author` - 你的 GitHub 用户名，用于版权信息和链接
- `avatar` - 头像图片链接，建议使用 GitHub 头像：`https://github.com/用户名.png`
- `favicon` - 网站图标链接，显示在浏览器标签页和书签中
- `language` - 网站语言，影响页面的语言标识
- `date` - 博客创建日期，用于计算运行天数

**`github` 部分 - GitHub 仓库信息**
- `owner` - GitHub 用户名（与 author 保持一致）
- `repo` - 仓库名称

**`imageProxy` 部分 - 图片代理配置**
- `enabled` - 是否启用图片代理（true/false）
- `baseUrl` - 代理服务地址，默认使用 weserv.nl
- `description` - 功能说明

**`comments` 部分 - 评论系统配置**
- `enabled` - 是否启用评论功能（true/false）
- `provider` - 评论系统提供商，可选值：`giscus`、`utterances`、`gitalk`、`none`
- `giscus` - Giscus 评论系统配置（推荐）
- `utterances` - Utterances 评论系统配置
- `gitalk` - GitTalk 评论系统配置

**重要提醒：**
> 请确保 `owner` 和 `repo` 与你的实际仓库信息一致，否则无法正确获取 Issues 数据

### 第三步：启用 GitHub Pages

这一步让你的博客真正"上线"：

1. 进入你的仓库，点击 **Settings** 标签
2. 在左侧菜单找到 **Pages** 选项
3. 在 **Source** 下拉菜单中选择 **GitHub Actions**
4. 保存设置，等待几分钟自动部署完成

**小贴士：**
- 使用模板创建仓库时，系统会自动跳过初始构建，避免无意义的部署
- 如果没有创建文章，需要手动执行 Action 或创建第一个 Issue 来触发构建

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

## 评论系统配置

Looks Blog 支持三种主流的评论系统，你可以根据需要选择其中一种：

### 🌟 Giscus（推荐）

Giscus 是基于 GitHub Discussions 的评论系统，功能强大且现代化。

**配置步骤：**

1. **启用 GitHub Discussions**
   - 进入你的博客仓库
   - 点击 **Settings** → **General**
   - 在 **Features** 部分勾选 **Discussions**

2. **获取配置信息**
   - 访问 [Giscus 官网](https://giscus.app/zh-CN)
   - 输入你的仓库信息（如：`username/blog-repo`）
   - 选择页面 ↔️ discussion 映射关系（推荐：`pathname`）
   - 选择 Discussion 分类（推荐：`General`）
   - 复制生成的配置信息

3. **更新 config.json**
   ```json
   {
     "comments": {
       "enabled": true,
       "provider": "giscus",
       "giscus": {
         "repo": "username/blog-repo",
         "repoId": "R_kgDOH...",
         "category": "General",
         "categoryId": "DIC_kwDOH...",
         "mapping": "pathname",
         "strict": "0",
         "reactionsEnabled": "1",
         "emitMetadata": "0",
         "inputPosition": "bottom",
         "theme": "preferred_color_scheme",
         "lang": "zh-CN"
       }
     }
   }
   ```

### 💬 Utterances

Utterances 是基于 GitHub Issues 的轻量级评论系统。

**配置步骤：**

1. **安装 Utterances App**
   - 访问 [Utterances 官网](https://utteranc.es/)
   - 点击 **Install** 安装到你的仓库

2. **更新 config.json**
   ```json
   {
     "comments": {
       "enabled": true,
       "provider": "utterances",
       "utterances": {
         "repo": "username/blog-repo",
         "issueTerm": "pathname",
         "label": "comment",
         "theme": "github-light"
       }
     }
   }
   ```

### 🔧 GitTalk

GitTalk 是功能丰富的评论系统，需要创建 GitHub OAuth App。

**配置步骤：**

1. **创建 GitHub OAuth App**
   - 访问 [GitHub OAuth Apps](https://github.com/settings/applications/new)
   - 填写应用信息：
     - **Application name**: `你的博客名称 Comments`
     - **Homepage URL**: `https://username.github.io/blog-repo`
     - **Authorization callback URL**: `https://username.github.io/blog-repo`
   - 创建后获取 **Client ID** 和 **Client Secret**

2. **更新 config.json**
   ```json
   {
     "comments": {
       "enabled": true,
       "provider": "gitalk",
       "gitalk": {
         "clientID": "your-client-id",
         "clientSecret": "your-client-secret",
         "repo": "blog-repo",
         "owner": "username",
         "admin": ["username"],
         "id": "pathname",
         "distractionFreeMode": false,
         "language": "zh-CN"
       }
     }
   }
   ```

### 🚫 禁用评论

如果不需要评论功能，可以完全禁用：

```json
{
  "comments": {
    "enabled": false,
    "provider": "none"
  }
}
```

**评论系统对比：**

| 特性 | Giscus | Utterances | GitTalk |
|------|--------|------------|---------|
| 基于 | GitHub Discussions | GitHub Issues | GitHub Issues |
| 配置难度 | 简单 | 最简单 | 中等 |
| 功能丰富度 | 最高 | 中等 | 高 |
| 反应表情 | ✅ | ❌ | ✅ |
| 回复嵌套 | ✅ | ❌ | ✅ |
| 主题切换 | ✅ | ✅ | ✅ |

**推荐选择：**
- **新博客**：推荐使用 **Giscus**，功能最完整
- **简单需求**：选择 **Utterances**，配置最简单
- **高度定制**：选择 **GitTalk**，可定制性最强

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
- 推送代码到主分支（除了初始提交）
- 每天凌晨 2 点定时重建

**什么时候会跳过构建？**
- 使用模板创建仓库时的初始提交（避免无意义的构建）
- 修改 `config.json`、`README.md` 等配置文件
- 修改 `.github/` 目录下的工作流文件

**什么时候需要手动触发？**
- 修改了配置文件后想立即生效
- 需要立即重建博客
- 初次使用模板时想要构建空博客

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

---

## 许可证

本项目采用 MIT 许可证，你可以自由使用、修改和分发。

## 贡献与支持
感谢Halo的Sora模版作者
如果这个项目对你有帮助，欢迎：
- 给项目点个 ⭐ Star
- 提交 Issue 反馈问题
- 提交 Pull Request 贡献代码
- 分享给更多需要的朋友

**让我们一起让写作变得更简单、更纯粹。**
