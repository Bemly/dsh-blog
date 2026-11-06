# 公共DNS大全地址汇总（去广告DNS服务器） | dns.iui.im

> 分类：书签 · NAS与自建服务 ｜ 来源：工具/资料汇总页（非博客文章）

![dns.iui.im 站点图标](images/i01-119_favicon.avif)


- 原始地址：<https://dns.iui.im/>

## 原文全文

公共 DNS 服务器 IPv4 地址汇总（含 DoH / DoT 支持情况）：

| 名称 | 公共DNS服务器IPV4地址 | DoH / DoT |
|---|---|---|
| 114 DNS | 114.114.114.114 / 114.114.115.115 | - |
| 114 DNS安全版 | 114.114.114.119 / 114.114.115.119 | - |
| 114 DNS家庭版 | 114.114.114.110 / 114.114.115.110 | - |
| 阿里 AliDNS | 223.5.5.5 / 223.6.6.6 | DoH https://223.5.5.5/dns-query、https://223.6.6.6/dns-query、https://dns.alidns.com/dns-query；DoT dns.alidns.com |
| 百度 BaiduDNS | 180.76.76.76 | - |
| DNSPod DNS+ / 腾讯DNS | 119.29.29.29 / 182.254.116.116 / 119.28.28.28 / 182.254.118.118 | DoH https://doh.pub/dns-query、https://1.12.12.12/dns-query、https://120.53.53.53/dns-query、DoH(国密) https://sm2.doh.pub/dns-query；DoT dot.pub、1.12.12.12、120.53.53.53 |
| CNNIC SDNS | 1.2.4.8 / 210.2.4.8 | - |
| OneDNS | 拦截版 117.50.22.22 / 52.80.66.66；纯净版 117.50.10.10 / 52.80.52.52；家庭版 117.50.60.30 / 52.80.60.30 | DoH doh.onedns.net/dns-query（拦截版）、doh-pure.onedns.net/dns-query（纯净版）、doh-home.onedns.net/dns-query（家庭版）；DoT dot.onedns.net（拦截版）、dot-pure.onedns.net（纯净版）、dot-home.onedns.net（家庭版） |
| DNS 派 DNS PAI | 电信/移动/铁通 101.226.4.6 / 218.30.118.6；联通 123.125.81.6 / 140.207.198.6 | - |
| 牙木网络（电信） | 1.1.8.8 / 1.1.8.9 | - |
| 360DNS | 电信/移动/铁通 101.226.4.6 / 218.30.118.6；联通 123.125.81.6 / 140.207.198.6 | DoH https://doh.360.cn/dns-query；DoT dot.360.cn |
| 字节跳动 火山引擎 DNS | 180.184.1.1 / 180.184.2.2 | - |


该地址为 dns.iui.im 的公共 DNS 汇总页（**工具/资料页，非博客文章**），以表格列出国内主流公共 DNS 服务商的 IPv4 地址（114DNS 普通/安全/家庭三版、阿里 AliDNS、百度、DNSPod/腾讯、CNNIC、OneDNS 三版、DNS 派、牙木、360DNS、字节火山引擎），并标注了 AliDNS/DNSPod/OneDNS/360 的 DoH 与 DoT 端点，其中 OneDNS 提供可拦截广告的版本。适合在 NAS/路由器上配置备用 DNS 或做 DNS-over-HTTPS 加速时参考。页面无正文配图，此处以站点图标作本地配图。


`公共DNS` `DNS大全` `114DNS` `AliDNS` `DNSPod` `OneDNS` `DoH` `DoT` `去广告DNS`

---
*本文由书签分类整理自动生成。*
