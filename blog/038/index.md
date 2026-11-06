# 解决 Vercel 部署网站在国内被墙 | Zoey's Blog

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-12 18:35:57 ｜ 分类依据：标题关键词匹配

![blog-zoey.top 站点已失效占位图](images/i01-site-offline-placeholder.avif)


- 原始地址：<https://blog-zoey.top/posts/vercel-dns-china>


> ⚠️ **站点已失效**：本笔记对应博客 `blog-zoey.top` 当前域名无法解析（NXDOMAIN），原页面与 Wayback 存档均不可达，无法抓取原文正文；以下内容为基于文章标题与 Vercel 部署实践的归纳，保留作为 Vercel 国内部署排障参考。

文章主题是「解决 Vercel 部署网站在国内被墙」。核心问题：Vercel 默认域名（`*.vercel.app`）在国内访问不稳定甚至被墙，需要给站点绑定自有域名并配合国内可达的解析链路才能稳定访问。常见做法归纳：

- **绑定自定义域名**：在 Vercel 项目 Settings → Domains 中绑定自己的域名，彻底绕开被墙的 `.vercel.app` 默认域名。
- **国内 DNS 解析**：将自定义域名解析到 Vercel 分配的 IP（或使用 CNAME 指向 Vercel 边缘），可在阿里云/腾讯云等国内 DNS 服务商处配置，规避默认域名解析被污染的问题。
- **CDN 中转**：通过 Cloudflare 等 CDN 代理转发，隐藏 Vercel 节点、利用 CDN 的国内可达线路改善访问；或利用 Vercel 的 `vercel-dns` 边缘节点直接加速。

对自建服务用户的启示：凡是部署在境外 PaaS（Vercel/Netlify/Railway 等）上的站点，默认域名大概率国内不通，**自定义域名 + 国内 DNS + CDN 中转**是标准解法，此笔记可作为该场景的备忘。


`Vercel` `国内访问` `被墙` `域名绑定` `DNS解析` `CDN中转` `站点失效`

---
*站点已失效（域名无法解析、原文不可达），本页配图为占位说明图；归纳内容基于标题与 Vercel 部署常识，仅供参考。*
