# Network ports | Cloudflare Fundamentals docs

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-12 18:35:57 ｜ 分类依据：标题关键词匹配

![Cloudflare 站点图标](images/i01-cloudflare-favicon.avif)


- 原始地址：<https://developers.cloudflare.com/fundamentals/reference/network-ports/>
- 文档更新：2026-04-20


Cloudflare 官方文档「Network ports」，回答"Cloudflare 代理默认支持哪些端口、如何开放更多端口、如何阻止非标准端口流量"三个问题。归纳如下：

- **默认代理的端口**：HTTP 类 80/8080/8880/2052/2082/2086/2095；HTTPS 类 443/2053/2083/2087/2096/8443。其中 2052/2053/2082/2083/2086/2087/2095/2096/8880/8443 虽支持但默认**禁用缓存**（Enterprise 可用 cache rule 单独开启）。
- **开放额外端口**：若服务监听非上述端口（如 SSH 的 22），要么把子域名改成灰云（Gray Cloud）绕开 CF 直连源站，要么用 Spectrum 应用代理——Spectrum 支持所有 TCP/UDP 端口（全端口仅 Enterprise 套餐）。
- **阻止非标准端口**：付费套餐可在 WAF 启用规则 ID `100015`（旧版）或 Cloudflare Managed Ruleset 中的 `...664ed6fe`（新版，默认关闭），在应用层（L7）拦截非 80/443 的 HTTP/HTTPS 请求。
- **注意事项**：启用了中国网络（China Network）的域名，CF 中国节点仅兼容 80/443；由于 anycast 特性，非标准端口在安全扫描时可能显示开放属正常现象；Cloudflare Access 不支持 URL 带端口号，会将其剥离。

对自建服务的价值：把 NAS/服务端口（如 8443、2053）走 CF 加速或隐藏源站 IP 时，此表是"端口能不能开小云朵"的权威依据。

## 正文

Learn which network ports Cloudflare proxies by default and how to enable Cloudflare's proxy for additional ports.

### Network ports compatible with Cloudflare's proxy

By default, Cloudflare proxies traffic destined for the HTTP/HTTPS ports listed below.

**HTTP ports supported by Cloudflare**

- 80
- 8080
- 8880
- 2052
- 2082
- 2086
- 2095

**HTTPS ports supported by Cloudflare**

- 443
- 2053
- 2083
- 2087
- 2096
- 8443

**Ports supported by Cloudflare, but with caching disabled**

- 2052
- 2053
- 2082
- 2083
- 2086
- 2087
- 2095
- 2096
- 8880
- 8443

> Note: Enterprise customers that want to enable caching on these ports can do so by creating a cache rule.

### How to enable Cloudflare's proxy for additional ports

If traffic for your domain is destined for a different port than the ones listed above, for example you have an SSH server that listens for incoming connections on port 22, either:

- Change your subdomain to be gray-clouded, via your Cloudflare DNS app, to bypass the Cloudflare network and connect directly to your origin.
- Configure a Spectrum application for the hostname running the server. Spectrum supports all ports. Spectrum for all TCP and UDP ports is only available on the Enterprise plan.

### How to block traffic on additional ports

Block traffic on ports other than 80 and 443 in Cloudflare paid plans by doing one of the following:

- If you are using WAF managed rules (previous version), enable rule ID `100015` (Anomaly:Port - Non Standard Port (not 80 or 443)).
- If you are using the new Cloudflare Web Application Firewall (WAF), enable rule ID `...664ed6fe` (Anomaly:Port - Non Standard Port (not 80 or 443)), which is disabled by default. This rule is part of the Cloudflare Managed Ruleset.

Ports 80 and 443 are the only ports compatible with:

- HTTP/HTTPS traffic within China data centers for domains that have the China Network enabled

Due to the nature of Cloudflare's anycast network, ports other than 80 and 443 will be open so that Cloudflare can serve traffic for other customers on these ports. In general, Cloudflare makes available several different products on Cloudflare IPs, so you can expect tools like Netcat and security scanners to report these non-standard ports as open in specific conditions. If you have questions on security compliance, review Cloudflare's certifications and compliance resources and contact your Cloudflare enterprise account manager for more information.

The WAF's Cloudflare Managed Ruleset includes a rule that will block traffic at the application layer (layer 7 in the OSI model), preventing HTTP/HTTPS requests over non-standard ports from reaching the origin server.

> Note: Cloudflare Access does not support port numbers in URLs. Port numbers are stripped from requests for URLs protected through Cloudflare Access.

### Related resources

- Managing DNS records at Cloudflare


`Cloudflare` `端口` `网络代理` `HTTPS` `Spectrum` `WAF` `NAS反代` `文档笔记`

---
*正文取自 Cloudflare 官方文档原文，侧边栏/导航等页面垃圾已清理。*
