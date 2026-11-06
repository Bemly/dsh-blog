# 受审查网络下的内网穿透：通过 v2ray 代理 nps/frp 通道 | 博客园

> 分类：书签 · NAS与自建服务 ｜ 来源：个人博客文章

![博客园 站点图标](images/i01-120_favicon.avif)


- 原始地址：<https://www.cnblogs.com/ryoma/p/16410774.html>

## 原文全文

![v2ray 题图](images/i02-01-featured.avif)

在受审查的网络下，常规内网穿透工具由于特征较明显容易被封锁。本文介绍一种思路，通过 **v2ray https+websocket 作为底层传输方式保护 nps 通道**，从而规避防火墙审查。

**背景**

由于组织内部服务器只有内网可以访问，一直以来使用 nps 连到自己在国内的一台小鸡上做内网穿透，转发 ssh、web 等服务。但近期由于组织内防火墙的缘故，大量 frp、nps 的反代遭到封杀，服务器被以"判断 IP 并直接丢包"的方式封锁。nps 采用 web 图形化界面，增删改查主机和穿透隧道十分便捷，在客户端上也只需要一句命令就能直接运行，但恐怕特征明显，组织内部的小防火墙也能轻松识别。

于是尝试使用 v2ray 作为媒介，`vmess+https+websocket` 的配置作为底层传输方式代理 nps 流量。能轻松应对 GFW 的协议，想必应对野鸡防火墙完全手到擒来。

鉴于使用 v2ray 可能产生的断线问题，本文末尾介绍了另一个基于 **hysteria** 代理穿透隧道的方案。

- nps 内网穿透工具：<https://github.com/ehang-io/nps>

**服务端配置**

服务端正常搭建 v2ray 即可，不需要额外配置。这里使用 x-ui 面板配置 vmess+http+websocket 服务端，并使用 nginx 反代支持 https。

![服务端 x-ui 配置](images/i03-02-npc.avif)

nginx 配置代码片段：

```nginx
location /example_ws_path { # websocket子路径建议在nginx处配
    proxy_redirect off;
    proxy_pass http://127.0.0.1:20000/; # 上面的vmess端口号
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

关于 v2ray 服务端的具体配置非本文重点，请参考网络上其他文章或 v2ray 官方文档。

- x-ui 面板：<https://github.com/vaxilu/x-ui>
- v2ray 官方指南：<https://guide.v2fly.org>

服务端正常启动 nps，客户端连接端口为默认的 8024：

![服务端 nps 启动](images/i04-03.avif)

**客户端配置**

内网机器，也就是客户端配置如下（假设服务器地址为 `server.example.com`）：

```json
{
  "logs": { "loglevel": "debug" },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "port": 8024,
      "protocol": "dokodemo-door",
      "settings": {
        "address": "server.example.com",
        "port": 8024,
        "network": "tcp,udp",
        "timeout": 0,
        "followRedirect": false,
        "userLevel": 0
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "server.example.com",
            "port": 443,
            "users": [{ "id": "d9b1afa4-2f40-4b3c-ad98-7b47ab9e4386", "alterId": 0, "security": "none" }]
          }
        ]
      },
      "streamSettings": {
        "network": "ws",
        "security": "tls",
        "wsSettings": { "path": "/example_ws_path", "headers": { "Host": "server.example.com" } }
      }
    }
  ]
}
```

其中 `outbounds` 处即连接到 v2ray 服务端上的常规配置，没有什么特别的。

在 `inbounds` 处配置了一个 **dokodemo-door** 协议，该协议可用于端口转发。配置指向服务器的 8024 端口，也就是 nps 的客户端连接端口，并将 `timeout` 调整为 0（不限制超时时间），以便保证后续 nps 连接不断。并在本地同样开启 8024 端口，作为后续 nps 客户端实际连接的端口。注意本地监听端口可以和服务器端口不一样，仅仅作为一个转发的目的。

在未配置路由的情况下，v2ray 默认会使用 outbounds 中的第一个配置项作为所有 inbounds 的出口，故上面配置的 dokodemo-door 先走 vmess 连到服务器，再连到服务器自己上的 8024 端口。

本地开启 v2ray 后，便可以进行 nps 客户端的连接了。

**nps 客户端连接**

nps 的服务端版本就叫 nps，客户端版本叫 npc，两者分离，因此先下载 npc。

在 web 面板上添加一个客户端，展开客户端命令，如图所示：

![web 面板添加客户端](images/i05-04.avif)

在内网机器上运行命令：

```bash
npc -server=127.0.0.1:8024 -vkey=xxxxxxxxxxx -type=tcp
```

把 web 面板展示的 server IP 和端口换成本地 IP 和刚刚在 v2ray 客户端上配置的 dokodemo-door 监听端口号即可。最后按照常规方式添加隧道即可建立穿透。

**解决连接中断问题**

按上面配置完之后，发现每隔一分钟左右连接会断一次，然后又重新连接。

![连接中断排查](images/i06-05.avif)

由于客户端到服务器的 v2ray 连接经过 nginx 反代，于是猜想到是 nginx 配置的问题。首先从 Stack Overflow 上某个问题了解到是配置反代时没有设置好超时时间，导致连接断开，504 Gateway Timeout。

![504 Gateway Timeout](images/i07-06.avif)

于是修改方才的 nginx 反代配置，加入超时时间设置：

```nginx
location /example_ws_path {
    proxy_redirect off;
    proxy_pass http://127.0.0.1:20000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # 加入下面的超时时间设置
    proxy_connect_timeout 300d;
    proxy_send_timeout 300d;
    proxy_read_timeout 300d;
    send_timeout 300d;
}
```

`300d` 代表 300 天（若后面不加单位则表示"秒"），这下怎么也不会超时了。

另一个地方的 timeout 可能也与此有关：

```nginx
ssl_session_timeout 10m;
```

将 `10m` 调大，比如改成 `100d`。

**讨论：直接使用 socks5 代理**

输入 `npc -h` 可以查看 npc 的帮助，其中有一个指令：

```
-proxy string   proxy socks5 url (eg:socks5://111:xxx@xxx:9007)
```

因此 npc 自身也支持经由代理连接，那么也可以不配置 dokodemo-door，仅配置本地 socks5 代理。然后使用如下格式的连接语句：

```bash
npc -server=server.example.com:8024 -vkey=xxxxxxxxxxx -type=tcp -proxy socks5://127.0.0.1:10808
```

其中假设本地 socks5 代理端口为 10808。

**讨论：nps 始终频繁断线**

测试发现在特定环境下即使按照如上方式配置超时时间，nps 仍然频繁断线。直接使用 tcp 的 vmess 协议，避免通过 nginx 反代可能可以解决问题。

推荐改用 **udp 协议的代理**。例如 v2ray 的 kcp 代理（慎用）、quic 代理等。udp 是无状态协议，不存在断线问题。

另外再介绍一个近期热门的代理工具：

- **Hysteria**：<https://github.com/HyNetwork/hysteria>。Hysteria 是一个功能丰富的，专为恶劣网络环境进行优化的网络工具（双边加速），比如卫星网络、拥挤的公共 Wi-Fi、在中国连接国外服务器等。基于修改版的 QUIC 协议。

测试表明使用 hysteria 在一定程度上大大增加了链接的稳定性，几乎不产生断线。若所使用的运营商未对 udp 协议进行 QoS，建议作为首选方案。


本文针对"组织内防火墙封杀 frp/nps 特征流量"的实战场景，提出用 **v2ray（vmess+https+websocket）把 nps 隧道流量伪装成正常 HTTPS** 的内网穿透方案。原理：服务端用 x-ui 面板起 v2ray + nginx 反代（WebSocket 子路径），客户端 v2ray 配 dokodemo-door 端口转发 + vmess 出站，把本地 8024 端口流量经 v2ray 隧道转发到服务器的 8024，npc 客户端再以 `-server=127.0.0.1:8024` 连接即可穿透。文中还给出两个踩坑点：一是 nginx 反代默认超时导致每分钟断连（504 Gateway Timeout），需把 `proxy_*_timeout` 与 `ssl_session_timeout` 调到 300d/100d；二是 nps 仍频繁断线时可改用 UDP 类代理（kcp/quic）或直接上 **Hysteria**（基于修改版 QUIC 的双边加速），测试几乎不断线。对在受限网络下维护 NAS/服务器远程访问的场景非常实用。


`内网穿透` `v2ray` `nps` `frp` `WebSocket` `nginx反代` `hysteria` `防火墙规避`

---
*本文由书签分类整理自动生成。*
