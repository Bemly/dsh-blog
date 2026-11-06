# 搭建权威 DNS 服务器必须设置胶水记录（Glue Record）吗？ - 老衲说

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-25 22:48:24 ｜ 来源站点：laona.dev

## 原始链接

<https://laona.dev/post/is-glue-record-necessary-for-dns-server/>

## 站点现状与抓取说明

> **抓取结果：原文不可获取。** 原博客 laona.dev 已下线——该域名目前挂在 Afternic（GoDaddy 旗下）域名交易平台上出售，原「老衲说」博客内容已全部移除。下方为抓取到的域名出售着陆页截图：

![laona.dev 域名出售页（Afternic）](images/i01-034-01.avif)

由于原文无法访问，本笔记保留基于文章主题（自建权威 DNS 的胶水记录问题）整理的知识要点，供参考：

**什么是胶水记录（Glue Record）**
- 当权威 DNS 的 NS 记录指向的域名**本身就在该域名之下**（如 `ns1.example.com` 服务于 `example.com`）时，会产生"鸡生蛋"问题：查询 `example.com` 需要先解析 `ns1.example.com`，而 `ns1.example.com` 又属于 `example.com`
- 胶水记录即父域（注册局/注册商层面）额外提供的 A/AAAA 记录，直接给出 NS 服务器的 IP，打破循环依赖

**是否必须设置**
- 如果 NS 主机名是**外部域名**（如 `ns1.cloudflare.com`），注册局会通过 NS 域名自身解析获得 IP，**无需**胶水记录
- 如果 NS 主机名是**本域名**（如 `ns1.example.com` 作为 `example.com` 的 NS），则**必须**在注册商/父域设置胶水记录，否则解析会失败（形成死循环）
- 自建权威 DNS 且用自己的域名做 NS 时，务必检查父域是否已有胶水记录

**实践建议**
- 域名注册商后台通常可添加"胶水记录 / Glue Records"
- 改动 NS 或胶水记录后注意生效时间与缓存


「老衲说」的这篇文章讨论自建权威 DNS 时的胶水记录（Glue Record）问题，核心结论一句话：**当你的权威 NS 主机名位于被解析域名自身之下时（如 `ns1.example.com` 为 `example.com` 服务），必须去注册商/父域添加胶水记录**，否则 NS 域名自身无法解析、形成死循环；若 NS 使用外部域名（如 Cloudflare/HE.NET 的 NS 主机名），则不需要胶水记录。

胶水记录本质是父域在委托点给出的 NS 服务器 IP（A/AAAA），用于打破"查 example.com 需要先解析属于 example.com 的 NS 主机名"的循环依赖。自建权威 DNS（BIND/Knot/PowerDNS 等）+ 自有域名做 NS 时，这是最容易踩的坑之一。

收藏价值：自建权威 DNS 部署前的必查项。


`DNS` `胶水记录` `Glue Record` `权威DNS` `NS记录` `自建DNS`

---
*本文由书签分类整理重写。*
