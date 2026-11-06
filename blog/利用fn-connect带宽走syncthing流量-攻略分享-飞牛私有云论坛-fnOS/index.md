# 利用fn connect带宽走syncthing流量 - 攻略分享 飞牛私有云论坛 fnOS

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2025-09-08 07:14:21 ｜ 收录源：club.fnnas.com

## 原始链接

<https://club.fnnas.com/forum.php?mod=viewthread&tid=36434&highlight=>

## 原文全文

**背景**

飞牛上部署了bitwarden和syncthing两款应用，但家里的宽带没有公网的v4或v6 IP，在外访问飞牛只能走中继。

而syncthing的公共代理服务器质量不稳定，速度也确实不太行。话虽如此，还是感谢愿意免费分享服务器带宽的每个大好人。

前段时间飞牛出了应用走中继访问的浏览器插件，但使用场景比较受限。特别是像syncthing这种走tcp的更是没办法直接用。

本文分享下折腾的过程和结果。

**解除trim_nginx限制**

方案一：劫持动态库，不启动回滚

可以参考这篇帖子，思路超棒，预计能有效很久。

方案二：修改回滚用的备份配置文件

回滚机制分析

原始的nginx是没有配置文件回滚的，我需要分析飞牛的回滚原理。

恢复配置文件必然要做文件的打开操作，可以利用strace监控nginx的操作，然后执行一次reload，发现nginx打开了一个路径为`/usr/trim/share/.restore/ng.conf.zip`的可疑文件。

![strace 监控 nginx 回滚文件操作](images/i02-113124suhuhu5issu8uzji.avif)

ng.conf.zip内部是配置文件，大概率是用这个zip替换了nginx的配置文件。

解压ng.conf.zip

ng.conf.zip是带密码的，不知道密码就没办法修改，但trim_nginx内肯定有密码。

ldd发现其链接了不少加密库，估计是调库来解密的，那就简单了。

![解压 ng.conf.zip 相关操作](images/i03-113220f2r48lbfsszdzzd4.avif)

![trim_nginx 加密库链接信息](images/i04-113140tyq1cx1gy12ewuuh.avif)

修改trim_nginx的配置文件

拿到压缩包密码后，就可以利用nginx反代各种自己的http应用了，只不过多了一个将修改的文件加到压缩包里去的步骤。

配置文件教程一搜一大把，不再赘述。

![修改后的 nginx 配置](images/i05-113256fsss95j0kppp7wj0.avif)

至此，trim_nginx的配置文件回滚已经不影响我们对配置的修改了。

**通过fn connect访问http应用**

修改了nginx配置文件后，浏览器首次访问反代的url时会跳转到fnos web端的登录链接。必须登陆一次并保持，后续访问应用才会正常。

经网友提示（非常抱歉我的某个通信APP的账号丢失了，忘记了网友ID），fnos的web有一个cookie控制了这一现象。

`mode=relay`这条cookie的有效期从"会话"改为一个较久之后的时间，即可顺利访问反代的应用。

![mode=relay cookie 有效期修改](images/i06-113404qung0i6j6ehelnzz.avif)

到这里，已经可以使用bitwarden等需要http链接的应用了。

**http2tcp**

fn connect是http链接，且支持websocket，市面上有较多代理工具可以实现http to tcp，只需要注意需要在建立代理链接时带上cookie即可。

我对这方面不熟，使用的是 chisel。各位可以用自己熟悉或者喜欢的工具。

完成这一步，可以使用ssh了。

**syncthing部署**

私有转发服务器和发现服务器的部署教程网上很多，常规步骤不再赘述了。

需要注意：

- syncthing服务、发现服务器discosrv、转发服务器relaysrv，三个容器的网络互通
- 修改各个节点的hosts，使用统一的url。比如使用chisel的机器，指向127.0.0.1；局域网不用穿透的机器，就指向局域网地址

至此，即可实现1M左右的同步速率。

**最后**

期待飞牛同步的linux版本，这样就不用折腾了。


飞牛社区用户 devzero 于 2025-09-04 发布的高阶折腾帖：让 Syncthing 这类纯 TCP 应用也能借道 fn-connect 中继带宽做异地同步。帖子只交流思路、不贴具体命令，风险自负，新手慎操作。

**核心链路（四步）**
1. **解除 trim_nginx 限制**：飞牛中继的 nginx 带配置回滚机制（`/usr/trim/share/.restore/ng.conf.zip` 加密备份），两种思路——劫持动态库绕过回滚，或跟踪（strace）回滚流程、拿到 zip 密码后直接改配置并加回压缩包
2. **通过 fn-connect 访问 HTTP 应用**：改完 nginx 反代后首次访问会跳 fnOS 登录，把 `mode=relay` cookie 有效期从"会话"改久，即可稳定访问 Bitwarden 等应用
3. **http2tcp**：fn-connect 是 HTTP/WebSocket 通道，用 chisel 等工具做 HTTP→TCP 转换（建连时带上 cookie），SSH 等 TCP 服务随之可用
4. **Syncthing 私有化**：自建 relaysrv 转发 + discosrv 发现服务器，与 chisel 所在机器网络互通，各节点 hosts 统一指到 chisel 机器（127.0.0.1）或局域网地址，最终实现约 1M 的同步速率

**技术要点**：根因是 fnOS 中继网关（trim_nginx）对非白名单服务的限制 + fn-connect 只提供 HTTP/WS 通道；作者通过"改 nginx 配置 + cookie 续期 + chisel 协议转换 + 私有 Syncthing 基础设施"完整打通。跟帖中网友确认可用 bpftrace/gdb 追踪解密调用读出 zip 密码（密码是固定的）。

收藏价值：飞牛无公网环境下 TCP 类应用走中继的高阶参考，思路清晰但操作风险较高，需谨慎评估后尝试。


`飞牛` `fnOS` `Syncthing` `中继` `内网穿透` `chisel` `nginx` `trim_nginx` `TCP`

---
