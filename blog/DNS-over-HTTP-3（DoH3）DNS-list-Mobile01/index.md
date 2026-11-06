# DNS-over-HTTP/3（DoH3）DNS list - Mobile01

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-26 00:20:33 ｜ 来源站点：www.mobile01.com（Mobile01 论坛）

## 原始链接

<https://www.mobile01.com/topicdetail.php?f=110&t=6724477>

## 抓取说明（重要）

> **正文与配图均未获取。** 抓取过程中对 mobile01.com 的 HTTPS 请求持续失败（TLS 握手被网络中间设备阻断，SSL handshake failed；改用明文 HTTP 时连接在传输中途被重置，仅返回浏览器内置错误页）；已尝试强制 IPv4、阅读代理（r.jina.ai）与多路 favicon 服务（Google/DuckDuckGo/favicon.im）兜底，均不可达。该站点当前在本网络环境下无法访问，无法下载任何正文配图，本笔记无配图，仅保留主题线索。


Mobile01 论坛帖子「DNS-over-HTTP/3（DoH3）DNS list」，主题是收集可用的 **DoH3（DNS over HTTP/3）服务器列表**，供用户配置加密 DNS 客户端使用。

背景知识：DoH3 即基于 HTTP/3（QUIC）传输的加密 DNS 查询。相比 DoH（HTTP/2 over TLS），QUIC 建连更快（合并握手、0-RTT）、无 TCP 队头阻塞、连接迁移更平滑，是新一代加密 DNS 方案；当时部分公共 DNS（Google、Quad9、Cloudflare 等）已提供 DoH3 端点。帖子整理了各服务商的 DoH3 地址与配置方法。

**说明**：原文正文未抓取成功（站点网络不可达），保留为线索链接；需要可用 DoH3 服务器列表时可回访该帖或参考各公共 DNS 官方文档（如 Cloudflare `https://cloudflare-dns.com/dns-query`、Google `https://dns.google/dns-query` 的 HTTP/3 端点）。


`DNS` `DoH3` `HTTP/3` `QUIC` `加密DNS` `Mobile01`

---
*本文由书签分类整理重写。*
