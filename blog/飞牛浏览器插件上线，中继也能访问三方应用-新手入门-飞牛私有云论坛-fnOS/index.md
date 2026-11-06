# 飞牛浏览器插件上线，中继也能访问三方应用 - 新手入门 飞牛私有云论坛 fnOS

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2025-08-29 21:22:46 ｜ 收录源：club.fnnas.com

## 原始链接

<https://club.fnnas.com/forum.php?mod=viewthread&tid=23936>

## 原文全文

三方应用，或者docker部署在家里的nas上，假如没有公网，通过飞牛中继往往无法使用这些应用

要做反代或者穿透往往又比较复杂，以往通过浏览器应用做跳板的方式路径也比较长！

这次，我们的技术小哥开发了一个中继访问三方应用的插件！简单安装即可远程使用三方应用！

插件在chromium内核的浏览器理论都能运行

**5月15日更新**

- edge已经上线应用商店，直接点击以下链接安装：<https://microsoftedge.microsoft.com/addons/detail/fn-connect-tools/bkfknjccocbbdeadoobefeceiaooepkl>
- chrome已经上线应用商店，直接点击以下链接安装：<https://chromewebstore.google.com/detail/%E9%A3%9E%E7%89%9B-fn-connect-%E5%B0%8F%E5%8A%A9%E6%89%8B/nldficllhlhcgcalgpcngbelgfmljikk?hl=zh-CN&utm_source=ext_sidebar>

话不说的，我们直接发教程

下面以常见的Edge浏览器为例

- 下载以下安装包，解压文件，并记住解压路径

chromium内核浏览器版

附件：fn-connect-extension-v0.0.2.zip

20250513 更新支持更多应用

附件：fn-connect-extension-0.0.6.zip

火狐浏览器版本：

附件：fn-connect-extension-firefox.zip

![插件安装包与解压](images/i02-201940o9ttt8dmb98g7vb8.avif)

![浏览器扩展管理入口](images/i03-201940ebpatpa3itgttitn.avif)

- 打开浏览器，选择管理扩展

![管理扩展界面](images/i04-201940n2pjsc20upku2vuk.avif)

- 开启开发人员模式

![开启开发人员模式](images/i05-201940dghya0w3geax2w4v.avif)

- 加载解压缩的扩展

点击加载解压缩的扩展，选择到解压的路径

![加载解压缩的扩展](images/i06-201940ermi5nm4yirnn71x.avif)

到现在就安装成功啦---

我们点击扩展，可以看到工具已经安装成功

![扩展安装成功](images/i07-201940aaywg36wpqtaqltb.avif)

接下来我们就可以尝试通过中继访问已安装的三方应用了！

中途出现多账号或者应用冲突，我们也可以点击插件，清理缓存。以便正常访问！

![通过中继访问三方应用效果](images/i08-201940m3509hb46ggw339w.avif)

无论是迅雷、qb、还是navidrome都可以通过浏览器直接使用~


飞牛（fnOS）官方主理人 2025-04-28 发布的置顶帖：fn-connect 浏览器插件"小助手"上线，让无公网 IP 的 NAS 也能通过飞牛中继在浏览器里直接访问已部署的三方应用 / Docker 服务。

**解决的问题**
- 无公网时，飞牛中继默认只能访问 fnOS 自身；三方应用（迅雷、qBittorrent、Navidrome 等）走不了中继，以往要靠反代、穿透或浏览器应用做跳板，链路又长又复杂

**安装方式（双通道）**
- 应用商店直装：Edge / Chrome 商店已过审上线（5月15日更新），直接搜"fn-connect 小助手"安装
- 手动加载：下载 zip（chromium 版 v0.0.2 → v0.0.6，火狐版独立包）→ 浏览器"管理扩展"→ 开启开发者模式 → "加载解压缩的扩展"指向解压目录

**使用要点**
- 支持 Chromium 内核浏览器及 Firefox；装好后点扩展图标即可通过中继访问三方 HTTP 应用
- 多账号或应用冲突时可点插件"清理缓存"恢复访问

**局限**：仅适用 HTTP/WebSocket 类应用，纯 TCP 应用（如 Syncthing）用不了，进阶解法见 055 篇。

收藏价值：飞牛无公网环境远程访问三方应用的官方首选方案，安装步骤图文完整。


`飞牛` `fnOS` `中继` `内网穿透` `浏览器插件` `远程访问` `Docker`

---
