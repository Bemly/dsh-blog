# Home - Hysteria 2（英文文档）

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-02-01 20:30:27 ｜ 分类依据：标题关键词匹配

![Hysteria 2 英文文档站图标](images/i01-favicon.avif)


- 原始地址：<https://v2.hysteria.network/>


**Hysteria is a powerful, lightning fast and censorship resistant proxy. And probably the cutest, too.**

Open-source MIT licensed. Code on GitHub.

### Feature Highlights

- **Jack of all trades**：Wide range of modes including SOCKS5, HTTP Proxy, TCP/UDP Forwarding, Linux TProxy, TUN - with more features being added constantly
- **Blazing fast**：Powered by a customized QUIC protocol, Hysteria is designed to deliver unparalleled performance over unreliable and lossy networks
- **Censorship resistant**：The protocol masquerades as standard HTTP/3 traffic, making it very difficult for censors to detect and block without widespread collateral damage
- **Cross-platform**：Builds for every major platform and architecture. Deploy anywhere & use everywhere. Plus a long list of 3rd-party apps
- **Easy integration**：Built-in support for custom authentication, traffic statistics & access control - easy to integrate into your infrastructure
- **Chill and supportive**：Well-documented specifications and code for developers to contribute and/or build their own apps, plus a helpful community

### Docs Navigation（cleaned sidebar outline）

- **Getting Started**：Installation / Server Installation Script / Server / Client / 3rd-party apps
- **Advanced**：Full Server Config / Full Client Config / ACME DNS Config / ECH / ACL / Traffic Stats API / FD Control Protocol / TProxy / Port Hopping / Mimic (Fake TCP) / Hysteria Realms / Environment Variables / Speed Test / Performance / Troubleshooting
- **Misc**：Hysteria 2 vs 1 / What if I hate YAML? / About HTTP/3 / Can I use a CDN?
- **Developers**：Build / Protocol / URI Scheme
- Plus：Changelog / GitHub / TCP Brutal / Artworks / Donation

**Get connected**：Telegram Channel / Telegram Group / GitHub Discussions

> Note：This is the official English documentation homepage of Hysteria 2 (a docs/tool site, not a blog article). Feature list and body text preserved as-is; sidebar trimmed to navigation outline.


这是 Hysteria 2 英文官方文档首页，与中文版（v2.hysteria.network/zh/）内容一一对应，仅语言不同。对自建服务用户而言，英文文档通常比中文版更新更快，且包含更完整的协议与开发者细节：

1. **协议层面**：Hysteria 2 用魔改 QUIC 伪装成标准 HTTP/3，天然抗封锁且弱网性能好，适合跨国线路；
2. **部署形态**：支持 Server + Client 双端，第三方应用生态完善（iOS/Android/桌面都有客户端），Server 可跑在 VPS、软路由、NAS 等任意设备；
3. **进阶玩法**：TProxy 透明代理、Port Hopping 端口跳跃、Mimic 伪装 TCP、Realms（NAT 打洞）等特性适合做复杂组网；
4. **集成能力**：自带认证、流量统计、ACL，方便对接已有后端做多用户分发。

建议把中英文两个首页对照收藏：日常上手读中文版，查最新配置项与协议变更时看英文版（更新更及时）。本文与 016 为同一站点中英两版，内容互相对应，按编号分别保留。


`Hysteria2` `proxy` `QUIC` `HTTP3` `censorship resistance` `self-hosted` `VPN` `docs`

---
*本文由书签分类整理自动生成，文档首页正文经人工核对站点原文整理。*
