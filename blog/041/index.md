# centos 批量添加绑定 ipv6 地址 | 豫章小站

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-12 18:35:57 ｜ 分类依据：标题关键词匹配


- 原始地址：<https://blog.mydns.vip/4056.html>


豫章小站的运维实操笔记：给 CentOS 服务器**批量添加/绑定 IPv6 地址**，给出两条路径——用现成脚本和手改网卡配置。归纳要点：

- **脚本方式（推荐）**：下载作者维护的 `setipv6.sh`（GitHub/Gitee 双地址），单个 IP 用 `sh setipv6.sh -s <ip>`，批量 IP 段用 `sh setipv6.sh -b <起始IP> <结束IP>`，执行完重启网卡生效。
- **CentOS 8 差异**：8 系的 IP 地址**以空格为间隔**，需手工修改脚本后再执行；立即生效用 `nmcli c up eth0` / `nmcli device reapply eth0`，不生效可 `nmcli c reload && nmcli c up "System eth0"`。
- **手改网卡文件（CentOS 7）**：编辑 `/etc/sysconfig/network-scripts/ifcfg-eth0`，静态 IPv4 加 `IPADDR/NETMASK`，多 IPv6 用 `IPV6ADDR_SECONDARIES="地址1 地址2"`，DNS 写 `/etc/resolv.conf`，最后 `service network restart`。
- **踩坑提示**：作者自述 CentOS 7 批量绑定 IPv6 时**第一个地址不生效、ping 不通**，原因未定位——遇到同类问题可作为排查线索。

价值点：适合需要给服务器批量挂 IPv6 段（如邮件、多站点、防御场景）的用户，脚本方式比手改配置省事，且明确区分了 CentOS 7/8 的行为差异。

## 正文

### 一：脚本方式添加

```bash
wget https://raw.githubusercontent.com/mydnsvip/Public/master/setipv6.sh
# 备用下载地址：https://gitee.com/mydnsvip/mydnsvip/raw/master/setipv6.sh
```

下载以后执行（添加单个）：

```bash
sh ./setipv6.sh -s xx.xx.xxx.xxxx.xxxx.xxxx
```

如果是多个需要批量添加 ip 段，执行：

```bash
sh ./setipv6.sh -b ipstart ipend
```

说明：`ipstart` 是 ip 段第一个 ipv6 地址，`ipend` 是 ip 段最后一个 ipv6 地址。

执行完以后重启网卡。

**注意：**

centos8 ip 地址是以空格为间隔的，如果是 centos 8 的服务器，请手工修改下脚本，修改保存以后再执行。

![centos8 批量绑定 ipv6 示意图](images/i01-centos8-ipv6-01.avif)

centos8 重启立即生效：

```bash
nmcli c up eth0
nmcli device reapply eth0
nmcli device connect eth0
```

如果不生效，可以试下下面的命令：

```bash
nmcli c reload
nmcli c up "System eth0"
```

- centos8 的网卡管理方式：<https://blog.mydns.vip/4052.html>
- centos8 配置多 ip：<https://blog.mydns.vip/4048.html>

### 二：centos7 手动配置

豫章小站作者配置 centos8 绑定 ipv6 时遇到一个小问题，批量绑定的 ipv6 第一个不生效，无法 ping 通，没有找到原因。以 centos7 为例：

```bash
vi /etc/sysconfig/network-scripts/ifcfg-eth0
```

配置信息如下：

```
DEVICE=eth0
BOOTPROTO=static
IPADDR=211.149.xxx.xxx
NETMASK=255.255.255.0
```

如果是多个 ipv6 地址，添加 `IPV6ADDR_SECONDARIES` 配置：

```
IPV6ADDR_SECONDARIES="2607:f0d0:1002:xx::1xx0/64 2607:f0d0:1002:xx::1xx1/64"
```

DNS 设置（`/etc/resolv.conf`）：

```
nameserver 223.5.5.5
nameserver 114.114.114.114
```

重启网卡：

```bash
service network restart
```


`CentOS` `IPv6` `批量绑定` `网卡配置` `setipv6.sh` `nmcli` `运维笔记`

---
*正文取自豫章小站原文，侧边栏/打赏等页面垃圾已清理；正文配图已下载至 032-images/ 并按原文位置内联。*
