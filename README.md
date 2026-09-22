# 国豪野史

同济大学国豪书院的非官方网络志书，记录正史、校园野史与共同记忆。每篇专题均标注史料置信度。

网站以零依赖的 HTML、CSS 和 JavaScript 编写，由 GitHub Pages 托管：

**<https://ghc.hachile.org>**

## 本地预览

```bash
python -m http.server 8000 --directory docs
```

也可以使用任意静态文件服务器打开 `docs` 目录。

## 内容与检查

- 页面：[docs/index.html](docs/index.html)
- 样式：[docs/styles.css](docs/styles.css)
- 交互与搜索：[docs/app.js](docs/app.js)
- 条目资料：[docs/data.json](docs/data.json)
- 官网事件索引：[docs/events.json](docs/events.json)

同步国豪书院官网“书院动态”：

```bash
node scripts/sync-events.mjs
```

```bash
node scripts/check.mjs
```

条目应提供可核验来源，并区分“正史”“较可信”“有争议”和“待考”。不收录私人联系方式、课表、行程或没有可靠来源的敏感指控。

本站与同济大学及国豪书院官方无关。原创内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans) 许可。

运营：微信公众号“同济大学未来技术班非官方”；联系与勘误：<anontjer@outlook.com>。
