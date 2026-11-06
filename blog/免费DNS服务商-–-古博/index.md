# 免费DNS服务商 – 古博

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-26 01:14:22 ｜ 来源站点：www.gubo.org

## 原始链接

<https://www.gubo.org/free-dns-service/>

## 原文全文

最近 Godaddy 的 DNS 服务器被联通/网通屏蔽，造成很多使用 Godaddy 域名服务的网站不能访问。天毅在这里收集了一些国内外优秀的免费域名服务提供商给大家，并且做一个大概的对比，供后来的朋友参考。

> 以下排序按推荐程度排列，推荐程度取决于作者个人试用经验感受。

### DNS.HE.NET

- 官方网站：<http://dns.he.net>
- 域名上限：50
- 管理速度：快
- 支持 ipv6：是
- 动态 ip 支持：是
- 主次服务器：免费支持 Primary Name servers 和 Secondary Name servers，用 HE.NET 的作为 secondary DNS 和 Zoneedit 的 Primary DNS 配合使用成功。Godaddy 目前此功能是收费功能
- API 支持：有 API（动态 ip 更新的方法），不是很方便（没有说明文档），使用 php 可更新，无客户端

### Zoneedit.com

- 官方网站：<http://zoneedit.com>
- 域名上限：2
- 管理速度：一般
- 支持 ipv6：是
- 动态 ip 支持：是
- 主次服务器：免费支持 Primary Name servers 和 Secondary Name servers，用 HE.NET 的作为 secondary DNS 和 Zoneedit 的 Primary DNS 配合使用成功。Godaddy 目前此功能是收费功能

### XNAME.ORG

- 官方网站：<https://www.xname.org/>
- 域名上限：未知
- 管理速度：较慢
- 支持 ipv6：是
- 动态 ip 支持：是
- 主次服务器：免费支持 Primary Name servers 和 Secondary Name servers，目前找到的仅有的一家支持 Primary Name servers 的免费服务提供商。Godaddy 目前此功能是收费功能
- API 支持：没有实时 API（但是提供有动态 ip 更新解决方案），有 php 和 python 更新方法，无 windows 客户端；说明文档

### AFRAID.ORG

- 官方网站：<http://freedns.afraid.org>
- 域名上限：无
- 管理速度：较快
- 支持 ipv6：是
- 动态 ip 支持：是
- 主次服务器：免费支持 Secondary Name servers。Godaddy 目前此功能是收费功能
- 动态 ip 的 API 支持：各种客户端都有，不愧是老牌服务提供商

### SITELUTIONS.COM

全英文，域名数量上限未知，管理速度快，有 API，据老鸟反应非常稳定。

### NAMECHEAP.COM

有动态 ip 服务，可替代花生壳，域名数量上限 100，支持 ipv6，管理速度一般，有 API（使用 API 需要有 200 美元余额或者 20 个以上的域名在 namecheap）。

### CLOUDNS.net

有不完全中文，域名数量上限 3，有欧美 4 个服务器，管理速度快，功能一般。

### DNSPOD.COM / DNSPOD.CN

全英文，国际版提供无限域名、无限记录服务，管理速度不错，据说要有 API 和动态域名服务，提供多国家设置选项。国内的用户对国内版应该是相当熟悉了，作者对国内的服务提供商（尤其是服务器在国内的）不感兴趣，所以不做详解。国际版需要挂代理或者 VPN 换成国外 IP 使用。

### FREEDNS.WS

全英文，管理速度不错，提供域名转向服务（301 和 302）。

**文章更新历史**：2016-01-04 删除 DNSever；2011-12-27 增加 he.net 和 zonedit.com 详细信息（着重 primary/secondary name server 应用）；2011-12-21 添加 XNAME 和 AFRAID；2011-07-13 添加 DNSEVER 教程与各网站网址；2011-07-11 文章初稿完成。

**相关阅读**：如何修改 Godaddy NS 记录；DNSEVER.com 免费域名 dns 服务管理图文教程。

![古博网站 站点图标](images/i01-038-favicon.avif)


古博（gubo.org）于 2011-2016 年间维护更新的「免费 DNS 服务商」对比清单。起因是 Godaddy 自带 DNS 曾被联通/网通屏蔽，作者遂收集国内外免费 DNS 提供商并给出体验排序：

| 服务商 | 域名上限 | 特点 |
|---|---|---|
| **DNS.HE.NET** | 50 | 管理快、支持 IPv6/动态 IP、免费支持 Primary+Secondary NS、有 API（无文档，PHP 可更新） |
| **Zoneedit.com** | 2 | 支持 IPv6/动态 IP，免费支持主/次 DNS |
| **XNAME.ORG** | 未知 | 管理较慢，少有免费支持 Primary NS 的服务商 |
| **AFRAID.ORG** | 无限制 | 管理较快、支持 IPv6/动态 IP、免费 Secondary NS，各平台客户端齐全 |
| **SITELUTIONS.COM** | 未知 | 管理快、有 API，老鸟反馈稳定 |
| **NAMECHEAP.COM** | 100 | 动态 IP 服务可替代花生壳，API 使用需余额或域名数量门槛 |
| **CLOUDS.NET** | 3 | 部分中文，欧美 4 个服务器，功能一般 |
| **DNSPOD.COM/.CN** | 无限（国际版） | 无限域名与记录，管理不错，国际版需代理访问 |
| **FREEDNS.WS** | - | 管理不错，提供域名转向（301/302）服务 |

**要点**：HE.NET 与 Zoneedit 可组合使用（HE 做 Secondary、Zoneedit 做 Primary），实现免费主/从 DNS 冗余；该能力在 Godaddy 当时为收费功能。这类主/次（Master/Slave）组合至今仍是提升解析可靠性的常见做法。

收藏价值：免费 DNS 服务商选型对比表（注意文章较老，部分服务现状与政策已变化，选型时需复核）。


`DNS` `免费DNS` `服务商对比` `HE.NET` `Zoneedit` `XNAME` `动态DNS` `Secondary DNS`

---
*本文由书签分类整理重写。*
