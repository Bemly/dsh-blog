# QuTS hero 5.2 - QNAP 企业级 ZFS 操作系统

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-05-22 20:01:00 ｜ 分类依据：标题关键词匹配

## 原始链接

<https://www.qnap.com.cn/zh-cn/operating-system/quts-hero/5.1.0>

> 注：页面链接为 5.1.0，抓取时官网已更新为 QuTS hero h5.2 内容，以下按最新版正文整理。

## QuTS hero h5.2 企业 IT 坚固后盾

使用 QuTS hero NAS，可以更有效率地存储和管理企业重要资料。QuTS hero h5.2 展现非凡的 SMB 传输性能，提升应用效率；搭配功能升级的 Security Center 安全中心，主动监控文件活动，守护 NAS 远离加密勒索软件威胁。

## SMB 传输性能

更快的访问速度，更好的系统性能。

### Kernel Mode SMB Daemon 底层加速技术

在高速的 SMB 传输应用环境中，QuTS hero h5.2 能使用 CPU 的内核模式（Kernel Mode）加速传输，并维持需要用户模式（User Mode）的 SMB 其它功能。在内核模式下，操作系统更能进行有效率的硬件资源应用与协调。

利用 Kernel Mode SMB Daemon（内核模式 SMB 常驻模式），您可进一步提升 SMB 传输性能，尤其在全快闪的存储架构上，性能提升更为显著；搭配启用 SMB Multichannel 多重通道，性能再飞跃！

**4 x 25GbE, Sequential Throughput (1M)**

| 模式 | Read | Write |
|---|---|---|
| With Kernel Mode SMB Daemon | 11265 MB/s | 11240 MB/s |
| Without Kernel Mode SMB Daemon | 4173 MB/s | 7178 MB/s |

**4 x 25GbE, Random IOPS (4K)**

| 模式 | Read | Write |
|---|---|---|
| With Kernel Mode SMB Daemon | 489451 | 729304 |
| Without Kernel Mode SMB Daemon | 88979 | 159746 |

> 测试于 QNAP 实验室。数据会因实际环境而有所不同。NAS: TS-h3077AFU 64GB DDR4 4600 RAM，Samsung 870 EVO 1TB x30，RAID 50，QXG-25G2SF-E810 NIC。

## 系统与数据安全

主动防御、与时俱进的安全性防护，资安强化事半功倍。

### Security Center 安全中心，防御加密勒索病毒

Security Center 采取数据安全主动防护措施，随时监控文件活动（File Activity Monitoring）。当侦测到 NAS 上有大量文件异动行为，系统立即采取保护措施（保护/备份/阻断），让加密勒索软件威胁、恶意软件攻击、或人为因素所导致的数据遗失风险大幅降低。

![Security Center 安全中心，防御加密勒索病毒](images/i01-security-center.avif)

### 支持新一代 TCG-Ruby SED（自我加密硬盘）

除了 TCG-OPAL 与 TCG-Enterprise 协议，QuTS hero h5.2 新增支持符合 TCG-Ruby SED（Self Encrypting Drive）的 HDD 或 SSD。TCG Ruby 提供针对 NVMe 和其它新式硬盘技术的规范，更符合当前企业存储环境的安全需求。

## 管理效率

优化操作、设置及管理的步骤与流程，方便、更省力。

### NAS 系统设置备份/还原，更弹性

当您需要将现有 NAS 的系统设置转移到另一台新 NAS，或是有多台 NAS 想要同样的系统设置，您即可在 QuTS hero 的控制面板中，进行系统设置的备份与还原。

![NAS 系统设置备份/还原](images/i02-ui-restore.avif)

### 记忆安装的 App 列表，换机时更轻松

您可将 NAS 安装的应用程序列表上传至 myQNAPcloud 服务存储，在更换新机或管理多台 NAS 时，即可利用该清单快速安装同样的 App 至其它 NAS，大幅节省您的时间。

### NAS 开、关机速度，更快

顺畅的 NAS 体验，从快速的 NAS 开、关机开始。开/关机速度提升可高达 50%。

### 使用 AD 网域登入，更方便

将您的 QNAP NAS 加入网域服务后，网域用户即可使用其网域账号及密码登入 NAS。QuTS hero h5.2 支持自动比对 AD 网域用户账号，您无需再次输入 AD 域名，只要输入网域账号与密码，即可迅速登入。

![使用 AD 网域登入](images/i03-ad-login.avif)

## 资料备份

完善保护您的工作数据，效率备份、弹性还原。

### Windows PC / 服务器整机备份

在 Windows 计算机与服务器安装 NetBak PC Agent 应用程序，即可将完整系统、硬盘、文件夹与文件备份至 QNAP NAS，并在需要时还原数据。全局重复数据删除与独特的合成增量备份技术，大幅缩短数据备份与还原时间。

![Windows PC / 服务器整机备份](images/i04-netbak-pc-agent.avif)


该收藏记录了 QNAP 企业级 ZFS 操作系统 QuTS hero 的官方功能页（收藏时为 5.1.0 版本页，现已更新至 h5.2 内容）。QuTS hero 与常规 QTS 的最大区别在于底层采用 ZFS 文件系统，自带快照、数据完整性校验、块级去重等企业级特性，适合重视数据安全的高端 NAS（如 TS-h 系列）。本次精修从官方页提取了 h5.2 的核心卖点：①SMB 性能通过 Kernel Mode SMB Daemon 内核态加速大幅提升，全闪存环境下顺序读写可从约 4-7 GB/s 拉到 11 GB/s 量级；②Security Center 安全中心支持文件活动监控，可对勒索软件大规模异动自动执行保护/备份/阻断；③新增 TCG-Ruby SED 自我加密硬盘协议支持；④管理侧强化系统设置备份还原、App 清单云同步、开关机提速、AD 网域免输域名登录；⑤Windows 整机备份（NetBak PC Agent）。对正在考虑 QNAP 高端机型或想了解 ZFS 系统价值的用户，此页可作为功能对比与选型参考。


`QNAP` `QuTS hero` `ZFS` `NAS` `SMB性能` `Security Center` `企业存储` `系统安全`
