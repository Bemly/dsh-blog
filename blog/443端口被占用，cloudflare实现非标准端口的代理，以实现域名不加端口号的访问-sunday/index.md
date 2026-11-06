# 443端口被占用，cloudflare实现非标准端口的代理，以实现域名不加端口号的访问 - sunday

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-23 23:04:46 ｜ 分类依据：标题关键词匹配

![blog.sundaysto.club 站点图标](https://www.google.com/s2/favicons?domain=blog.sundaysto.club&sz=128)

## 原始链接

<https://blog.sundaysto.club/archives/443duan-kou-bei-zhan-yong-cloudflareshi-xian-fei-biao-zhun-duan-kou-de-dai-li>

## 原文全文

443端口被占用，但是又不想换这个服务的端口，可以利用 cloudflare 代理来实现域名不加端口访问。

### 1. 域名要托管在 cloudflare，然后域名解析到你的服务器IP，打开橙色小云朵

比如你 nginx 上启动一个 8443 端口的代理，配置如下：

```nginx
server {
  listen 8443 ssl http2;
  server_name  test.example.xyz;

  gzip on;
  gzip_min_length 1k;
  gzip_comp_level 9;
  ...

  ssl_certificate /etc/nginx/ssl/cf-example.xyz.pem;
  ssl_certificate_key /etc/nginx/ssl/cf-example.xyz.key;

  ssl_protocols TLSv1.2 TLSv1.3;
  ...

  location / {
      proxy_pass http://localhost:1234/;
      proxy_set_header   X-Forwarded-Proto $scheme;
      proxy_set_header   Host              $http_host;
      proxy_set_header   X-Real-IP         $remote_addr;
  }
}
```

ssl 证书可以用 cf 的。

### 2. 在 cloudflare 的规则里设置流量目标端口

比如 nginx 设置的 8443，在这里选择「自定义筛选表达式 —— 主机名 等于 <填写你的主机名>」，然后「目标端口」填写 8443，保存即可。

这样就可以通过 `test.example.xyz` 不加端口访问部署的服务了，但是网站用不了 CF 的加速了。

Cloudflare 开启小云朵后支持的 HTTP 端口：80、8080、8880、2052、2082、2086、2095；HTTPS 端口类似。使用 https 访问非标准端口且开启小云朵时，需要在 SSL 设置里做相应配置才能正常访问。


sunday 的实用技巧：443 端口已被占用时，利用 Cloudflare 的"目标端口（Destination Port）"规则，让域名不加端口号直接访问部署在非标准端口（如 8443）的服务。要点归纳：

**实现步骤**
1. **域名托管到 Cloudflare**，解析到服务器 IP 并打开橙色小云朵（代理模式）
2. **源站 Nginx 监听非标准端口**（示例 8443 ssl），配置好证书（可用 Cloudflare 源站证书）与反代规则
3. **在 Cloudflare 规则中设置流量目标端口**：
   - 自定义筛选表达式：主机名 等于 你的主机名
   - "目标端口"填写 8443，保存

**效果与限制**
- 通过 `test.example.xyz`（不带端口）即可访问部署在 8443 的服务
- 代价：此方式下网站用不了 Cloudflare 的加速（流量仅经 CF 端口转发）
- 开启小云朵后 Cloudflare 支持的 HTTP 端口：80、8080、8880、2052、2082、2086、2095；HTTPS 端口类似（可对照 026 篇的官方端口列表）
- 用 HTTPS 访问非标准端口且开小云朵时，需要在 SSL 设置里做相应配置才能正常访问

收藏价值：多服务争抢 443 端口时的免端口访问方案，与 026（Cloudflare 端口列表）互为参考。


`Cloudflare` `非标准端口` `443端口` `代理规则` `域名访问`

---
*本文由书签分类整理自动生成。*
