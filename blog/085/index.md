# Origin DNS error | openit-documentation.pages.dev | Cloudflare

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2022-12-24 10:33:53 ｜ 来源：书签标题为 Cloudflare 错误页

![openitsub.com 站点图标](images/i01-075_favicon.avif)


- 原始地址：<https://www.openitsub.com/>


书签标题为「Origin DNS error | openit-documentation.pages.dev | Cloudflare」，本身是 Cloudflare Pages 托管域（`openit-documentation.pages.dev`）的**源站 DNS 解析错误页面**，并非正常博客页面。

本次核实情况：

- `www.openitsub.com` 域名解析返回 **NXDOMAIN（域名已注销/不再存在）**；
- `openit-documentation.pages.dev` 同样无法解析，对应 Cloudflare Pages 项目已删除或停用；
- 多次尝试 curl（含强制 IPv4、r.jina.ai 代理、直接访问 pages.dev 域名）均无法建立连接，站点已整体下线；
- 根据书签结构与「openit」命名推断，该域名原可能与 OpenIT 订阅/机场类项目及其文档站相关，但**无法获取原文内容，不作进一步臆测**。


- 该书签记录的是访问 openit 文档站时遇到的 Cloudflare「源站 DNS 错误」提示页，原站点现已完全下线（域名注销）。
- 对自建服务的启示：当自建站使用 Cloudflare Pages/代理时若出现 Origin DNS error，通常是源站域名解析失败（域名过期、DNS 记录被删除或源站服务器地址变更），需要检查 DNS 解析记录与 Cloudflare 侧配置。
- 若日后需要同类资源，可通过「openit」关键词在 GitHub 等平台检索其公开文档与订阅信息。
- 图片说明：站点已下线，本笔记配图为第三方图标服务缓存的历史站点图标。


`Cloudflare` `域名解析` `站点下线` `openit` `DNS`

---
*本笔记由书签任务人工核对整理。*
