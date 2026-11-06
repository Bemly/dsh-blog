# 通过 frp 实现群晖的 drive 远端同步

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2022-10-21 12:57:00 ｜ 来源：爱码网（www.likecs.com）

![爱码网 站点图标](images/i01-081_favicon.avif)


- 原始地址：<https://www.likecs.com/show-308135333.html>


### 通过 frp 实现 drive 同步

其实其他的也类似，只是指定 tcp 的端口不一致就可以。frp 实现的外网端口映射非常方便。也推广下 frp 的地址 frp-github，上边的文档很丰富，这里就不再搬运了。

### frp 配置 server端（自己的远端服务器）

```ini
## server 端配置
[common]
bind_port = 7000
#vhost_http_port = 8080
dashboard_port = 7500 # 开启dashboard
dashboard_user = username
dashboard_pwd = password
max_pool_count = 5
authentication_timeout = 900

[ssh]
listen_port = 6000
auth_token = xxxxx
```

### client端（群晖服务器）

```ini
## client 端配置
[common]
server_addr = xxxx  # 自己远端的服务器地址
server_port = 7000
auth_token = xxxxx # 可以设置这个进行auth_token认证, client也要配置相同
pool_count = 5

[ssh]
type = tcp
local_ip = xxxxxx
local_port = 22
remote_port = 6000

[nas]
#privilege_mode = true
type = tcp
local_port = 5000
remote_port = 5000

[drive]
#privilege_mode = true
type = tcp
local_port = 10002 # 这个端口是在群晖中开启的
remote_port = 3000
```

### 群晖 drive 中开启端口

如图，其中的端口设置为自己想要的端口。

> 📷 原博文此处有 1 张「群晖 Drive 端口设置」截图，因站点图床（新浪图床）已失效无法下载，此处缺图。

### 在 drive 中设置自己的远程代理的端口

> 📷 原博文此处另有 1 张「Drive 远程代理设置」截图，同样因图床失效无法下载，此处缺图。


- 核心思路：用 frp 把群晖上的 Synology Drive（同步端口 10002）映射到远端 VPS 的公网端口（如 3000），从而实现**不依赖 QuickConnect、直连式的外网 Drive 同步**；SSH（22→6000）与 NAS 管理页（5000→5000）也可一并映射。
- 配置要点：服务端 `[common]` 绑定 `bind_port=7000`，并为每个服务定义 `listen_port`（如 ssh 用 6000）；客户端按 `type=tcp + local_port + remote_port` 声明隧道，`auth_token` 两端必须一致。
- 版本提示：文中 client 端配置属于 frp 旧版（无 `serverPort`/`auth.method` 新字段）写法；新版 frp（v0.34+）中 `privilege_mode` 已移除，token 认证写法为 `auth.token`，端口字段不变，可平滑迁移。
- 群晖侧操作：需先在 Synology Drive 套件中把端口设为本地端口（文中为 10002），再在 frpc 里把 `local_port=10002` 映射到公网 `remote_port`；Drive 客户端连接时填 `远端VPS IP:3000` 即可。
- 注意：frp 服务端 `max_pool_count` 限制连接池、`authentication_timeout` 限制握手超时；公网映射后建议配合 Dashboard 监控隧道状态，并注意 frps 端防火墙放行对应端口。
- 图片情况：原文 2 张截图均已失效（原图存放在新浪图床，站点代理地址返回 404），无法下载内联，已在原文位置标注缺图说明。


`frp` `内网穿透` `群晖` `Synology` `Drive` `远程同步` `端口映射` `VPS`

---
*本笔记由书签任务人工核对整理，正文来源于爱码网原文章。*
