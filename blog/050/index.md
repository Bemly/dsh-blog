# NS1 DNS域名解析使用-Master/Slave主从DNS和世界各地分区解析 - 挖站否

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-26 01:16:28 ｜ 来源站点：wzfou.com（挖站否）

## 原始链接

<https://wzfou.com/ns1-dns/>

## 原文全文

**NS1 DNS域名解析使用-Master/Slave主从DNS和世界各地分区解析**（首发：2018年7月27日，更新：2020年09月26日，作者 Qi）

NS1.com 是国外一家提供专业的 DNS 域名解析服务商，除了付费的 DNS 域名解析外，还提供了免费的 DNS 域名解析套餐，免费额度为 **500k Queries、50 Records、1 Built-in Monitor、1 Filter Chain 和 NS1 API**，基本上可以满足日常建站的需要了。

NS1 DNS 功能齐全，比较突出的就是支持 **Master/Slave 主从 DNS**，你就可以将 NS1 DNS 当成主要的 DNS 解析服务，也可以当成从属 DNS，即第二 DNS。这样的组合一般会应用在对 DNS 解析可靠性极高的场景，还有就是用来对付网络攻击和流量攻击。

作为一个免费的 NS1 DNS，支持**分区解析**，可以精确到各大洲的各个国家，如果是美国和加拿大还可以精确到省、市。当然，亚洲的话只能精确到中国，无法精确到国内各省。但就是这样的分区解析，如果你的网站的访客是来自世界各地，NS1 DNS 还是会帮到你的。

> PS：2018年9月6日更新，如果想要使用付费的 DNS 解析服务，这里有两个比较便宜的比较适合个人的 DNS 服务：ClouDNS 和 DNS Made Easy。

### 一、NS1 DNS申请使用

网站：<https://ns1.com/>

这是 NS1 DNS 的控制面板界面，直接点击右上角按钮添加你想要使用 NS1 DNS 解析的域名。

![NS1 控制面板界面](images/i01-040-00.avif)

输入你的域名，然后你会看到有四个选项，分别是正常设置、导入 Bind 配置、第二 DNS 和 Linked zone。一般地我们选择"正常设置"即可。

![添加域名四个选项](images/i02-040-01.avif)

添加了域名后，再到你的域名注册商那里修改 NS 服务器为 NS1 DNS 的：

```
dns1.p03.nsone.net
dns2.p03.nsone.net
dns3.p03.nsone.net
dns4.p03.nsone.net
```

![添加域名完成](images/i03-040-02.avif)

以 NameCheap 修改 NS 为例，如下图：

![NameCheap 修改 NS 服务器](images/i04-040-03.avif)

### 二、NS1 DNS添加解析记录

这是 NS1 DNS 的记录解析设置页面，可以看到分四大块：添加记录、DNS设置、DNS转出和 NS。我们要添加 A、CNAME 等记录直接点击 "Records" 就可以了。

![记录解析设置页面](images/i05-040-04.avif)

这是设置记录的页面，这里选择你的记录类型，然后设置 TTL 时间，貌似没有最低时间限制，我设置了 10 秒都通过了。

![设置记录页面](images/i06-040-05.avif)

NS1 DNS 支持的解析记录非常多，包括 A、AAAA、ALIAS、AFSDB、CAA、CERT、CNAME、DS、HINFO、MX、NAPTR、NS、PTR、RP、SPF、SRV、TXT。

![支持的解析记录类型](images/i07-040-06.avif)

NS1 DNS 拥有强大的 DNS 解析统计。

![DNS 解析统计](images/i08-040-07.avif)

### 三、NS1 DNS设置分区解析

NS1 DNS 设置分区解析非常地简单，点击你要设置的解析记录，然后点击 "Record Metadata"，在这里你就可以设置不同的地区和国家使用不同的 DNS 解析记录了。

![Record Metadata 分区设置](images/i09-040-08.avif)

目前只有美国和加拿大可以精确到省，其它的只能精确到国家，亚洲也只能精确到中国。不过，就这一点已经超过了大多数的国外免费 DNS 域名解析所提供的服务了。

![分区精确到国家/省](images/i10-040-09.avif)

### 四、NS1设置Slave DNS\Secondary DNS

Slave DNS 也可以叫 Secondary DNS，即备用 DNS 或者从 DNS。首先确保你的主 DNS 支持 AXFR request，并且支持 DNS Data Transfer，并 `192.135.223.10` 加入到白名单中。我们在 NS1 DNS 添加域名时选择 "Secondary DNS" 就可以了。

![添加 Secondary DNS 选项](images/i11-040-10.avif)

填写你的主 DNS 的 IP 地址，默认是 53 端口，如果不是此端口可以改成其它的。另外如果有多个主 DNS，可以勾选 "Enable Additional Primaries"。添加完成后，稍等一会儿 NS1 Slave DNS 就会从主 DNS 处同步 DNS 记录解析了。

![填写主 DNS IP 与端口](images/i12-040-11.avif)

### 五、NS1设置Master DNS\Primary DNS

想要将 NS1 DNS 作为主 DNS，即 Master DNS 或者 Primary DNS，只需要在 DNS 管理界面点击 "Zone Transfers"，勾选 "Enable Zone Transfer"，然后填写你的从 DNS 的 IP 地址。如果 DNS 记录改变时通知从 DNS 的服务器，选择是的话就打开 "NOTIFY"。

![Zone Transfers 主从设置](images/i13-040-12.avif)

这里我以 He.net DNS 作为 Slave DNS 来演示说明，在 He.net DNS 处点击添加 Slave DNS，接着你会看到要求你填写主 DNS 的 IP 或者服务器地址，这里你就把 NS1 DNS 的 `xfr01.nsone.net (192.135.223.10)` 填写进去。

![HE.NET 添加 Slave DNS](images/i14-040-13.avif)

同时，He.net DNS 会提醒你把 He.net DNS 的 NS 服务器 IP 添加到 NS1 Master DNS 的 IP 白名单中。也就是我在上图中 "Zone Transfers" 添加的 IP 地址。双方都添加完毕后，你就可以看到 He.net DNS 作为 Slave DNS 已经添加成功了，并且将 NS1 DNS 的解析记录全部同步过来了。

![HE.NET 提示添加白名单](images/i15-040-14.avif)

![He.net DNS 同步成功](images/i16-040-15.avif)

接着还需要到 NS1 DNS 那里添加 NS 记录，NS 记录为 He.net DNS 的 NS 服务器地址。

最后，到你的域名注册处那里把 He.net DNS 的 NS 服务器地址添加进去就可以了。

### 六、总结

NS1 DNS 采用了 anycast 技术，所以 DNS 在国内的响应也是非常地快，从监控数据来看国内使用 NS1 DNS 响应都是在 70MS 以内。

NS1 DNS 目前已经支持 DNSSEC，但是需要单独联系客服开通：`support@ns1.com`，详细说明见官网：<https://ns1.com/knowledgebase/dnssec>。开通了 DNSSEC 后，你就可以在 NS1 DNS 中看到 DNSSEC 功能了，如下图：

![NS1 DNSSEC 功能](images/i17-040-18.avif)

如果有嫌麻烦的朋友，可以直接使用 Google Cloud DNS 设置 DNSSEC，默认就可以使用，不需要单独申请。总之，NS1 DNS 是一个支持解析记录齐全、NS 服务器响应快和统计功能强大的 DNS 域名解析服务。


挖站否（wzfou.com）的 NS1.com 实战教程（2018 年首发、2020 年更新），手把手演示免费 DNS 解析、Master/Slave 主从 DNS 与全球分区解析的完整配置。要点归纳：

**NS1 免费额度**：500k Queries（每月查询）/ 50 Records / 1 Built-in Monitor / 1 Filter Chain / NS1 API，日常建站够用（超出按约 1 百万查询 10 美元计费）。

**一、申请与接入**
- 官网 https://ns1.com 添加域名，可选四种模式：正常设置 / 导入 Bind 配置 / 第二 DNS（Secondary）/ Linked zone
- 到注册商把 NS 改为 `dns1.p03.nsone.net` ~ `dns4.p03.nsone.net`

**二、解析记录**
- 支持记录类型非常全：A、AAAA、ALIAS、AFSDB、CAA、CERT、CNAME、DS、HINFO、MX、NAPTR、NS、PTR、RP、SPF、SRV、TXT
- TTL 可设极短（作者实测 10 秒生效）；自带强大的 DNS 解析统计

**三、分区解析（Record Metadata）**
- 按地区/国家返回不同解析结果；美国、加拿大可精确到省/市，其他地区到国家（亚洲仅到"中国"）
- 适合全球访客站点的就近调度（免费版仅部分地区可用，完整 GeoDNS 需付费）

**四、Slave DNS（从 DNS）**
- 主 DNS 需支持 AXFR 并允许区域传输，把 NS1 的 `xfr01.nsone.net (192.135.223.10)` 加入白名单
- 添加域名时选 Secondary DNS，填主 DNS IP（默认 53 端口），多主 DNS 可勾 "Enable Additional Primaries"

**五、Master DNS（主 DNS）**
- 在 Zone Transfers 开启 "Enable Zone Transfer"，填从 DNS 的 IP，记录变更通知打开 "NOTIFY"
- 示例：NS1 做 Master、HE.NET 做 Slave——两边互加白名单后 HE.NET 自动同步全部记录；再到 NS1 添加 HE.NET 的 NS 记录、最后到注册商把 NS 改为 HE.NET 地址

**六、总结**
- NS1 采用 Anycast，国内响应快（作者实测 70ms 内）；DNSSEC 需联系客服单独开通（support@ns1.com），嫌麻烦可直接用 Google Cloud DNS 的 DNSSEC（默认可用）

收藏价值：免费 DNS + 主从冗余 + 分区解析的完整配置手册，主从 DNS 双向配置（NS1 做 Slave / 做 Master）均有截图步骤。


`DNS` `NS1` `主从DNS` `Master/Slave` `Secondary DNS` `分区解析` `AXFR` `Anycast` `DNSSEC`

---
*本文由书签分类整理重写。*
