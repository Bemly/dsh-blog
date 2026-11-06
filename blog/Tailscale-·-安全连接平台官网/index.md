# Tailscale · 安全连接平台官网

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2022-12-16 23:18:16 ｜ 来源：Tailscale 官网（tailscale.com）

![Tailscale 站点图标](images/i01-077_favicon.avif)


- 原始地址：<https://tailscale.com/>


本链接为 **Tailscale 产品官网首页**（营销/产品页，非博客文章），抓取到的核心内容如下：

- 官网定位语：**"The best secure connectivity platform for the AI era"**（面向 AI 时代的最佳安全连接平台）；
- 产品定义：基于身份的 Zero Trust（零信任）连接平台，用于**替代传统 VPN、SASE 与 PAM**，连接远程团队、多云环境、CI/CD 流水线、边缘与 IoT 设备及 AI 工作负载；
- 市场数据：官网宣称 **50,000+ 家企业**使用，可减少连接问题耗时、免去专职 IT 配置/入网资源、降低内部支持请求量；
- 核心卖点：**几分钟完成部署**、跨平台且基础设施无关（cloud 与 on-prem 均可）、可桥接混合环境（mesh 覆盖网络连接公有云与本地）；
- 用户证言（与 NAS 强相关）：官方 Synology 套件可用、可在 8000 公里外管理家庭 NAS 并续期 Let's Encrypt 证书、可穿透多层 NAT（双 NAT/校园网/旅行路由器）连接家庭服务器。


- Tailscale 是基于 **WireGuard** 的 Mesh VPN，与书签「NAS与自建服务」高度相关：装好群晖/OpenWrt 套件后，即可在任何网络（含无公网 IP、多层 NAT 环境）安全访问家里 NAS、SSH 内网设备。
- 对自建服务的价值：① 免公网 IP/免端口映射即可远程访问；② 身份认证取代密钥管理（SSO/ACL 策略）；③ 与 Docker/k8s/CI-CD 集成，适合家庭服务器集群与云上服务互通。
- 与其他方案的对比定位：比 frp 类端口转发更"零配置、全加密"，比传统 OpenVPN 更易维护；免费额度对个人自建（个人设备 + 少量设备）足够。
- 注意事项：Tailscale 依赖官方协调服务器（DERP/控制面），完全离线/纯内网场景可用自建 Headscale 替代；国内网络环境访问协调服务器偶有波动，可搭配 DERP 自建或加速通道。
- 图片情况：官网为产品页，无"文章配图"；本笔记补充官方站点图标与官网示意图（SVG）作为配图。


`Tailscale` `WireGuard` `MeshVPN` `内网穿透` `远程访问` `ZeroTrust` `NAS` `Headscale`

---
*本笔记由书签任务人工核对整理，官网内容按产品页如实整理归纳。*
