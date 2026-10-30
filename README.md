# 王晓玉作品集

这是一个静态多页网站，入口是 `index.html`，由 HTML、CSS、JavaScript 和图片组成。

## 图片素材

- 网页使用的项目图片在 `assets/project-decks/`，格式为 AVIF。
- 原始大图保存在本地 `original-assets/project-decks/`，不会上传到 GitHub。
- 在 macOS 上，可运行 `./scripts/optimize-assets.sh` 从原图重新生成网页图片。

## 本地预览

打开 `http://localhost:4173/index.html` 查看本地网站。

## 发布与维护

GitHub Pages 从 `main` 分支根目录发布。修改网站后，用 GitHub Desktop 提交并推送到 `main`；也可以直接在 GitHub 网页编辑文件。页面会自动更新。
