# 为 Clash 订阅链接服添加免费 SSL 证书 | SpiffyEight77's Blog

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-12 18:35:57 ｜ 分类依据：标题关键词匹配

![SpiffyEight77's Blog 站点图标](images/i01-spiffyeight77-favicon.avif)


- 原始地址：<https://spiffyeight77.com/zh/posts/zh/2021/05/为-clash-订阅链接服添加免费-ssl-证书/>


SpiffyEight77 的实操文章：给"Clash 订阅链接服务"套上免费 SSL 证书。核心是**自建一套订阅生成链路**——v2-ui 管理节点、subconverter 把节点转成 Clash 订阅格式、sub-web 提供可视化订阅页，然后用 acme.sh 的 DNS API 模式向 Let's Encrypt 申请证书，最后用 Nginx 反代把 https 域名接到订阅服务。归纳要点：

- **链路部署**：先装 Docker + Nginx；v2-ui 用官方脚本装；subconverter 用 `docker run -d -p 25500:25500 tindy2013/subconverter:latest` 起后端；sub-web 是前端，建议 fork 后改 `.env` 把默认 API 指向自建 subconverter，再部署到 Netlify。
- **证书申请**：把域名解析到 VPS 后，用 acme.sh 以 **DNS API 模式**（`--dns dns_cf`）申请证书——只要填 `CF_Key` / `CF_Email`，无需 80 端口验证，适合纯 API 场景；成功后会输出证书路径。
- **接入**：Nginx 监听 443，配置 `ssl_certificate` 指向 acme.sh 生成的证书，反代到 sub-web 服务，即可用 https 域名访问并生成 Clash 订阅链接。

价值点在于把"节点管理 + 订阅生成 + HTTPS"串成一条自动化链路，订阅链接走自家域名后更稳定、可加密传输；证书免费且可自动续期，适合自建代理/机场分发场景。

## 正文

> 原文日期：2021-05-06 ｜ 分类：Network

### 前言

五一假期宅家，计划重新部署一套 v2-ui 作为备用，另外部署 sub-web 和 subconverter 来生成 Clash 订阅链接，根据官方文档描述 Caddy2 可以从 Let's Encrypt 申请证书。后来改用 Nginx + acme.sh 的 DNS API 方式完成证书申请，记录步骤如下。

### 服务部署

#### 前置部署

```bash
curl -sSL https://get.docker.com/ | sh   # Install Docker
apt install nginx
```

#### v2-ui

参考官方 README 部署：

```bash
bash <(curl -Ls https://blog.sprov.xyz/v2-ui.sh)
```

#### subconverter

subconverter 是用来制作 Clash 订阅链接的后端 API，参考官方 README 的 docker 部署：

```bash
docker run -d --restart=always -p 25500:25500 tindy2013/subconverter:latest
```

#### sub-web

sub-web 是 subconverter 的可视化前端界面，推荐 fork 之后修改 `.env` 后端默认 API 为上面部署的 subconverter ip/域名，最后部署到 Netlify。

### 通过 DNS API 从 Let's Encrypt 申请证书

首先在 Cloudflare 把域名解析指向到部署服务的 VPS IP，接着参考官方文档安装 acme.sh：

```bash
curl https://get.acme.sh | sh
```

这边使用的是 DNS API 申请证书，域名是在 Cloudflare 下管理，参考官方文档进行申请：

```bash
export CF_Key="sdfsdfsdfljlbjkljlkjsdfoiwje"
export CF_Email="[email protected]"

acme.sh --issue --dns dns_cf -d example.com -d www.example.com   # 正确运行后会显示证书路径
```

#### Nginx 反向代理

```nginx
server {
    listen 443 ssl;
    server_name example.com;
    ssl_certificate      /path/to/cert.pem;      # acme.sh 生成的证书路径
    ssl_certificate_key  /path/to/key.pem;
    location / {
        proxy_pass http://127.0.0.1:25500;       # subconverter 后端
    }
}
```

### 最后

可以通过访问部署的 sub-web 来愉快地生成 Clash 订阅链接了。

### Reference

- v2-ui
- sub-web
- subconverter
- acme.sh
- xray issue


`Clash` `订阅链接` `SSL证书` `acme.sh` `Let's Encrypt` `v2-ui` `subconverter` `sub-web` `Nginx反代` `DNS验证`

---
*正文取自 SpiffyEight77's Blog 原文，尾部上一篇/下一篇等页面垃圾已清理；文中示例代码按原文整理为代码块。*
