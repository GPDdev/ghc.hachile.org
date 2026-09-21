# 国豪野史

记录同济大学国豪书院正史、轶事与共同记忆的非官方 MediaWiki 站点。

项目使用 MediaWiki 1.46.0、SQLite 和 Docker Compose。首次启动会自动完成建库、创建管理员并导入初始条目；运行数据保存在 Docker 卷中，不提交到 Git。

## 本地启动

需要 Docker 与 Docker Compose。

```bash
cp .env.example .env
# 修改 .env 中的管理员密码
docker compose up -d --build
```

打开 <http://localhost:8080>。停止服务：

```bash
docker compose down
```

`docker compose down -v` 会删除数据库与上传文件，请勿在有内容后运行。

## 部署到 ghc.hachile.org

1. 在服务器克隆仓库并复制 `.env.example` 为 `.env`。
2. 把 `MW_SERVER` 改为 `https://ghc.hachile.org`，设置强管理员密码。
3. 运行 `docker compose up -d --build`。
4. 用 Caddy、Nginx 等把 HTTPS 请求反向代理到 `127.0.0.1:8080`。

Caddy 最小配置：

```caddyfile
ghc.hachile.org {
    reverse_proxy 127.0.0.1:8080
}
```

MediaWiki 与上传文件分别保存在 `wiki-data`、`wiki-images` 命名卷。升级或迁移前请同时备份这两个卷。

## 初始内容

初始条目放在 [`seed/pages`](seed/pages)，清单在 [`seed/manifest.txt`](seed/manifest.txt)。它们只在全新数据卷的第一次启动时导入；上线后的编辑直接保存在 Wiki 数据库中。

当前收录包括书院成立、国豪学堂、国豪精英班、培养体系、启航仪式，以及书院夜话、“国豪号”毕业帆船等公开报道中的校园故事。条目使用脚注标明出处，并区分“正史”“轶事”“待考”。

运行仓库自检：

```bash
node scripts/check.mjs
```

## 编辑与安全

- 匿名用户可阅读但不能编辑或注册；管理员可创建账号。
- 不收录私人联系方式、课表、行程和没有可靠来源的敏感指控。
- 本站与同济大学及国豪书院官方无关。
- 原创内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans) 许可。

