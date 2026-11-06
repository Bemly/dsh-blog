# 阿里公共DNS

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-26 00:18:45 ｜ 来源站点：alidns.com（阿里云知识中心）

## 原始链接

<https://alidns.com/articles/6018321800a44d0e45e90d71>

## 原文全文

**阿里云公共DNS安全传输服务介绍（DoH/DoT）**

### 概述

阿里公共DNS致力于为广大的互联网用户提供快速、稳定和安全的DNS解析。然而传统的DNS查询和应答采用UDP和TCP明文传输，存在网络监听、DNS劫持、中间设备干扰的风险：

- **网络监听风险**：即便用户采用HTTPS加密的方式访问站点，DNS查询应答并没有采用加密传输
- **DNS劫持**：传统DNS应答数据会被篡改，用户的访问会被路由到钓鱼网站和恶意站点
- **中间设备干扰**：主要是一些防火墙对DNS查询的干扰，基于域名的过滤，还有大包MTU分片的影响等

为了应对以上挑战，阿里公共DNS遵守DoH（RFC8484）和DoT(RFC7858)标准对外提供DNS的安全传输服务，支持 **DNS over HTTPS、DNS JSON API、DNS over TLS** 三种安全传输模式。DNS的安全传输服务可以适用于移动应用程序、浏览器、操作系统、物联网设备和网关路由器等多个场景。通过传输加密的方式发送DNS查询，加强了用户访问互联网的安全性、解析稳定和隐私保护。

除了隐私加密以外，DNS安全传输服务采用TCP和HTTP连接用户端和DNS服务器，一方面可以服务精准的基于位置的DNS解析和流量调度，另一方面基于DNS端到端的连接特性，DNS的动态变更可以实现秒级端到端生效。

> 注意：在DoH和DoT传输服务中，阿里公共DNS支持 TLS 1.2 和TLS 1.3。

### 1. DNS over HTTPS（DoH）

阿里公共DNS通过RFC 8484指定的经过TLS加密的HTTP连接提供DNS解析。

**DoH 的 URI 接口**（仅提供TLS API）：

```
https://dns.alidns.com/dns-query?
https://alidns_ip/dns-query?
```

注意：其中 `alidns_ip` 是 `dns.alidns.com` 的 A 和 AAAA 记录，可以是以下四个地址之一：`223.5.5.5`、`223.6.6.6`、`2400:3200::1`、`2400:3200:baba::1`。

请求方式：GET

| 参数 | 类型 | 描述 | 示例 | 默认值 |
|---|---|---|---|---|
| dns | string | base64url编码的DNS请求内容 | `dig alibaba.com A, dns=uGkBAAABAAAAAAAAB2FsaWJhYmEDY29tAAABAAE` | 必须包含 |

请求示例：`https://dns.alidns.com/dns-query?dns=uGkBAAABAAAAAAAAB2FsaWJhYmEDY29tAAABAAE`

返回的DNS二进制数据：

```
b869 8180 0001 0004 0000 0001 0761 6c69
6261 6261 0363 6f6d 0000 0100 0107 616c
6962 6162 6103 636f 6d00 0001 0001 0000
012c 0004 6a0b d097 0761 6c69 6261 6261
0363 6f6d 0000 0100 0100 0001 2c00 04cb
77d7 5207 616c 6962 6162 6103 636f 6d00
0001 0001 0000 012c 0004 6a0b df65 0761
6c69 6261 6261 0363 6f6d 0000 0100 0100
0001 2c00 04cb 7781 6d00 0029 1000 0000
0000 000c 0008 0008 0001 2018 6a0b 22e6
```

注：根据RFC8484的定义，DoH服务适用于两类场景：一种是DNS HTTPS隧道，一种是应用层访问DNS数据。DNS wireformat二进制格式对应用不够友好，比如要处理DNS名字压缩机制等。DNS JSON API是为了提供给应用更友好的接入方式。

### 2. DNS JSON API

**DNS JSON API 的 URL 接口**（提供TLS和非TLS API）：

```
https://dns.alidns.com/resolve?
https://alidns_ip/resolve?
http://dns.alidns.com/resolve?
http://alidns_ip/resolve?
```

注意：其中 `alidns_ip` 是 `dns.alidns.com` 的 A 和 AAAA 记录，可以是以下四个地址之一：`223.5.5.5`、`223.6.6.6`、`2400:3200::1`、`2400:3200:baba::1`。

请求方式：GET

| 参数 | 类型 | 描述 | 示例 | 使用方法和默认值 |
|---|---|---|---|---|
| name | string | 请求域名 | `name=www.taobao.com.` | 必选，无默认值 |
| type | number | 请求类型 | `type=1` | 可选，1 |
| edns_client_subnet | IP | ECS IP | `edns_client_subnet=1.2.3.4/24` | DNS代理使用，普通客户端不适用 |

**关于 edns_client_subnet 参数**：`edns_client_subnet` 是为了支持DNS ECS功能（RFC7871），将用户的子网信息传递给权威DNS，做更精确的DNS解析和流量调度。其中掩码越长地址信息越精确，掩码越短用户隐私效果越好。建议使用 `/24` 掩码长度。该参数是特地为DNS代理（proxy）使用DNS JSON API场景设计，即用户发送DNS查询给DNS代理，DNS代理通过该参数携带用户的子网信息传递给阿里公共DNS，最后传递到权威DNS服务器。例如 `edns_client_subnet=1.2.3.4/24`，权威服务器会收到基于 `1.2.3.0/24` 地址前缀信息来帮助用户选择DNS链路。

**关于 type 参数支持类型**：

| 记录类型 | ID | 意义 | 示例（以 taobao.com / www.taobao.com 为例） |
|---|---|---|---|
| A | 1 | IPv4 地址 | 101.37.183.171 |
| NS | 2 | NS 记录 | ns1.taobao.com. |
| CNAME | 5 | 域名 CNAME 记录 | www.taobao.com.danuoyi.tbcache.com. |
| SOA | 6 | ZONE 的 SOA 记录 | ns4.taobao.com. hostmaster.alibabadns.com. 2018011109 3600 1200 3600 360 |
| TXT | 16 | TXT 记录 | "v=spf1 include:spf1.staff.mail.aliyun.com -all" |
| AAAA | 28 | IPv6 地址 | 240e:e1:f300:1:3::3fa |

请求示例：`http://dns.alidns.com/resolve?name=www.taobao.com.&type=1`

返回示例：

```json
{
  "Status":0,
  "TC":false,
  "RD":true,
  "RA":true,
  "AD":false,
  "CD":false,
  "Question":{ "name":"www.taobao.com.", "type":1 },
  "Answer":[
    { "name":"www.taobao.com.", "TTL":45, "type":5, "data":"www.taobao.com.danuoyi.tbcache.com." },
    { "name":"www.taobao.com.danuoyi.tbcache.com.", "TTL":45, "type":1, "data":"47.246.24.234" },
    { "name":"www.taobao.com.danuoyi.tbcache.com.", "TTL":45, "type":1, "data":"47.246.24.233" }
  ]
}
```

注：用户可以在客户端应用或APP中调用DoH和DNS JSON API解析DNS。

### 3. DNS over TLS（DoT）

阿里公共DNS通过RFC 7858指定的经过TLS加密的TCP连接提供DNS解析。提供两种模式接入：域名方式和IP方式。基本流程是：

1. 终端设备配置DoT的解析服务器 `dns.alidns.com` 或 `alidns_ip`
2. 如果配置的是 `alidns.com`，客户端先解析 `alidns.com` 获得地址 `alidns_ip`
3. 获得DoT解析服务器IP地址之后，终端设备再建立与DoT解析服务器在**端口 853** 的TCP连接
4. 经过TLS握手协商，终端设备与DoT解析服务器建立TLS连接
5. 通过该TLS连接，终端设备可以发送DNS查询到远端DoT解析服务器

对使用安卓手机的用户来说，可以设置在手机设置界面设置阿里公共DNS的域名和地址来获取DNS的DoT安全传输服务。

> **配图说明**：原页面中"华为手机的DoT网络设置"等 2 张正文截图托管在阿里云 OSS 上，因 bucket 访问策略（AccessDenied）无法下载，正文图缺失，仅保留站点图标：

![阿里公共DNS 站点图标](images/i01-036-favicon.avif)


阿里云官方知识中心文章「阿里云公共DNS安全传输服务介绍（DoH/DoT）」，是配置智能设备/路由器/应用使用加密 DNS 的官方接口文档。要点归纳：

**为什么需要加密 DNS**
- 传统 DNS 用 UDP/TCP 明文传输，存在网络监听、DNS 劫持（解析被篡改指向钓鱼站）、中间设备干扰（防火墙过滤/MTU 分片）三大风险

**阿里公共 DNS 三种安全传输模式**
1. **DoH（DNS over HTTPS，RFC 8484）**：`https://dns.alidns.com/dns-query?dns=<base64url编码的DNS报文>`（仅 TLS）；服务器 IP 固定为 223.5.5.5、223.6.6.6、2400:3200::1、2400:3200:baba::1；GET 请求，返回 DNS wireformat 二进制，适合 DNS 隧道场景
2. **DNS JSON API**：`https://dns.alidns.com/resolve?name=xxx&type=1`（提供 TLS 与非 TLS）；参数 name（域名）、type（A=1/NS=2/CNAME=5/SOA=6/TXT=16/AAAA=28）、edns_client_subnet（ECS 精确调度，建议 /24）；返回 JSON，对应用更友好
3. **DoT（DNS over TLS，RFC 7858）**：服务器 `dns.alidns.com` 或 IP，**端口 853**；流程为解析域名 → TCP 853 → TLS 握手 → 加密查询；安卓/华为手机可在系统网络设置中直接配置

**注意**：DoH/DoT 均支持 TLS 1.2 与 TLS 1.3；加密传输还带来基于位置解析/流量调度与秒级端到端生效的附加价值。

收藏价值：自建 DNS/路由器/智能设备配置加密 DNS 的一手接口文档（接口至今可用）。


`DNS` `阿里公共DNS` `DoH` `DoT` `加密DNS` `DNS JSON API` `223.5.5.5` `ECS`

---
*本文由书签分类整理重写。*
