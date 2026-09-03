# 柳示其 LLLiui777 个人作品集网站

影视摄影师 / 摄影指导 / 导演的个人作品集，全部为纯静态文件，可直接打开，也可整套上传到任意静态托管平台。

页面结构：全屏动态影像首屏 → 可左右拖拽/滑动浏览的静帧影像条 → 作品静帧全览 → 完整作品集视频 → 关于与联系。点击静帧可打开灯箱，灯箱支持方向键与触摸滑动翻页。

## 本地预览

直接用浏览器打开 `index.html` 即可。

## 修改联系方式

打开 `assets/js/data.js`，在顶部 `window.SITE` 中填写：

```js
window.SITE = {
  "email": "2111210455@qq.com",
  "phone": "17781466867",
  "social": "LLLiui777",
  "resume": "assets/resume/resume-2026.jpg"
};
```

- `email` 生成邮件链接，`phone` 生成拨号链接，`social` 显示为小红书 / 抖音 / IG 账号，`resume` 链接到简历图片。
- 不需要的渠道可以留空，空渠道不会显示。

## 修改作品与静帧

- 页面作品数据位于 `assets/js/data.js` 的 `window.WORKS`。
- 每个作品的静帧存放在 `assets/works/<作品id>/`，每个静帧有两份：完整图和 `-t` 结尾的缩略图。
- 如需换图：把新文件放进对应目录，再在 `window.WORKS` 对应 `frames` 数组里更新 `full` 与 `thumb` 文件名。
- 新增作品：参照现有条目复制一段，把图片放进新目录并创建缩略图即可。

## 作品集视频

- 网页播放的是 `assets/video/reel-2026-1080.mp4`（1080p H.264，约 46MB），由 4K 原片压缩而来。
- 原片路径：`/Users/llliui777/Desktop/中转站/柳示其摄影指导作品集2026.mp4`，未做任何改动。
- 如需替换成其他版本，直接覆盖同名文件即可；海报帧为 `assets/video/reel-poster.jpg`。

## 部署

把整个文件夹上传到任意静态网站托管服务（Netlify、Vercel、GitHub Pages、腾讯云 COS 等），发布目录指向本文件夹即可。

## 目录结构

```text
index.html
assets/
  brand/        主视觉、OpenGraph 与 favicon
  css/style.css
  js/data.js    联系方式与作品数据
  js/main.js    页面与灯箱逻辑
  works/        按作品整理的静帧
  video/        2026 作品集网页版与海报
  works-manifest.json
```
