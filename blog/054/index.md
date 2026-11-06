# DNS Record Limit 2021 - Website, Application, Performance / DNS & Network - Cloudflare Community

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-26 09:55:00 ｜ 分类依据：域名归属映射

> 说明：community.cloudflare.com 全站被 Cloudflare 挑战（Turnstile）保护，浏览器过盾后仍停留在验证页，无法抓取帖子正文原文；站点图标亦无法直连获取，此处使用 Cloudflare 官方 favicon 替代。以下正文基于社区帖子公开讨论内容与 Cloudflare 官方开发者文档重建整理。


- 原始地址：<https://community.cloudflare.com/t/dns-record-limit-2021/260534>

## 原文全文

**帖子背景（2021 年 4 月，用户 mk12 提问）**

发帖人发现部分 2019 年的旧帖提到 Cloudflare DNS 限制为「免费版 1,000 条、付费版 3,500 条」，但官方 FAQ 中已找不到该说明，因此提问：这些限制是否已被移除？

**社区 MVP 回复要点（michael、sdayman 等）**

- 单次 BIND 文件导入的限制：免费版 **200 条**，Pro / Business / Enterprise **3,500 条**；如需更多可把记录拆分为多个文件多次导入。
- 单个 zone 的总记录数限制：免费版 **1,000 条**，付费版（Pro / Business / Enterprise）**3,500 条**。
- 提高上限（limit increase）仅考虑 **Enterprise 客户**。

**Cloudflare 官方现行文档口径（developer docs，DNS records quota）**

| 套餐 | 单 Zone 记录上限 | 说明 |
| --- | --- | --- |
| Free（2024-09-01 之前创建的 zone） | 1,000 条 | 旧免费 zone 保留此上限 |
| Free（2024-09-01 及之后创建的 zone） | 200 条 | 新版免费 zone 上限已下调 |
| Pro | 3,500 条 | 单 zone 上限 |
| Business | 3,500 条 | 单 zone 上限 |
| Enterprise | 按账户计量（默认 1,000,000 条） | public zone 与 internal zone 分开计算 |

补充机制：

- 当用量达到配额 **85%** 时，Dashboard 的 DNS 记录页会显示警告。
- Email Routing 等服务自动添加的 TXT / MX 记录也会计入配额（含少量 buffer，zone 可能略超上限）；但用户自行通过 Dashboard / API 新增记录时，zone 仍须在限额内。
- 提升上限：免费 / Pro / Business 均无自助或申请通道；Enterprise 可联系 Cloudflare 账户团队（account team）申请提升，官方表示可支持「数百万条」DNS 记录。


Cloudflare 社区帖子「DNS Record Limit 2021」：讨论 Cloudflare DNS 单 zone 记录数配额。核心结论：

- **2021 年口径**：免费 zone 上限 1,000 条、付费 3,500 条；BIND 批量导入单次更严（免费 200 条、付费 3,500 条），超限可拆多个文件多次导入。
- **现行口径（2024-09-01 起）**：免费新建 zone 已降至 **200 条**，旧 zone 保留 1,000 条；Pro / Business 仍为 3,500 条；Enterprise 改为按账户计量，默认 **100 万条**，可联系账户团队申请提升。
- **实用提示**：免费用户 zone 记录较多时应清理冗余记录或考虑升级；批量导入注意 200 条/次的拆分上限；配额用到 85% 时 Dashboard 会有警告，Email Routing 自动记录也占配额。

收藏价值：与 042 / 043（DNS 记录原理）、045 / 046（Cloudflare IP 范围）配套，了解 Cloudflare DNS 运维的数量边界。


`DNS` `Cloudflare` `记录数限制` `配额` `社区讨论`

---
*本文由书签分类整理自动生成。*
