# Plug-in: Community Applications | Unraid 论坛讨论帖（第 121 页）

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2021-01-31 09:45:00 ｜ 来源：Unraid 官方论坛支持帖

![Unraid 官方论坛图标](images/i01-favicon.avif)


- 原始地址：<https://forums.unraid.net/topic/38582-plug-in-community-applications/page/121/#comment-848436>


![Unraid 论坛 Logo](images/i02-forum-logo.avif)

> 说明：以下为抓取自 Unraid 官方论坛原帖第 121 页的完整楼层讨论，按发帖顺序保留原文（含引用回复）。该帖主题为 Community Applications（社区应用）插件。楼层内容较多，正文仅保留讨论文本与配图，已清理页面侧边栏、导航、归档等垃圾。

### 楼层 1 · Squid（2020-04-21T16:26:54Z）
The primary server is hosted on the cloud that is currently having issues (GitHub), along with every plugin for unRaid, and a ton of the images for any containers.  Everything is slower because CA always tries the primary first to operate from.  Docker / Dashboard pages should not however be affected from the outage unless you've installed a new container during this outage.  If you have, then what you're seeing is "normal" as the system is attempting to download the icon for that new container and it takes it a bit to fail.

### 楼层 2 · Squid（2020-04-21T16:28:08Z）
5 minutes ago, CiaoCiao said:
check the image file on the usb flash drive in config/plugins/dockerman/images.
Oh yeah, the images are no longer stored on the flashdrive  (6.8.something +)  They are now stored within the docker.img file

### 楼层 3 · Cessquill（2020-04-21T16:44:49Z）
14 minutes ago, Squid said:
The primary server is hosted on the cloud that is currently having issues (GitHub)
Typical!  They have to have issues at the same time as I power down, recable and power back up again.  I can stop scratching my head now and randomly rebooting things.

### 楼层 4 · CiaoCiao（2020-04-21T16:47:53Z）
4 minutes ago, Squid said:
Oh yeah, the images are no longer stored on the flashdrive  (6.8.something +)  They are now stored within the docker.img file
For some reason everything is working fine again
🤨

### 楼层 5 · Squid（2020-04-21T16:48:43Z）
Because the outage is over

### 楼层 6 · Leverz（2020-04-22T07:25:46Z）
I updated to 6.8.3 and then updated the community application (2020.04.19). Following this, I wanted to update the applications, but I get the error message for all installed apps that have an update.
Configuration not found. Was this container created using this plugin?
I have searched the forums, and I see some topics from a few years ago, is this still the fix? Is there a document to follow or a way to copy all settings and reapply them after?

### 楼层 7 · Squid（2020-04-22T12:51:48Z）
Your flash drive is either corrupt or dropped offline.  Try a different port and reboot

### 楼层 8 · Leverz（2020-04-22T22:04:59Z）
I'm still not having any joy. Everything is working, but cannot be updated.

![Leverz 报错截图](images/i03-leverage-error.avif)

### 楼层 9 · Squid（2020-04-22T22:48:46Z）
Create a new thread in General Support and post your diagnostics

### 楼层 10 · limonchoms（2020-04-24T06:41:25Z）
Is there any way to let CA run through a proxy?
I tried to add
http_proxy=http://xxx:xxx https_proxy=http://xxx:xxx /usr/local/sbin/emhttp &
to the GO file,but it didn't work for me...
It can be used in docker and terminal，but not for CA

### 楼层 11 · Squid（2020-04-24T10:46:58Z）
On 4/24/2020 at 2:41 AM, limonchoms said:
Is there any way to let CA run through a proxy?
I tried to add
http_proxy=http://xxx:xxx https_proxy=http://xxx:xxx /usr/local/sbin/emhttp &
to the GO file,but it didn't work for me...
It can be used in docker and terminal，but not for CA
To get CA to work with a proxy, place the attached file into /config/plugins/community.applications on the flash drive.  Edit to suit
If it doesn't work PM me and we'll work out a testing routine
proxy.cfg

### 楼层 12 · limonchoms（2020-04-24T11:34:48Z）
40 minutes ago, Squid said:
Place the attached file into /config/plugins/community.applications on the flash drive.  Edit to suit
If it doesn't work PM me and we'll work out a testing routine
proxy.cfg
48 B · 0 downloads
It looks like running through the proxy
😄
Solved my problem，thx

### 楼层 13 · ap90033（2020-04-24T13:45:32Z）
Sorry if this is the wrong place,
I am setting up Traktarr. I have successfully connected to Sonarr and Radarr. I am trying setup to run automatically. Instructions say edit a file in /opt. It aint there! Help?

### 楼层 14 · Squid（2020-04-24T13:46:33Z）
Just now, ap90033 said:
Sorry if this is the wrong place,
I am setting up Traktarr. I have successfully connected to Sonarr and Radarr. I am trying setup to run automatically. Instructions say edit a file in /opt. It aint there! Help?
You need to ask in it's support thread

### 楼层 15 · trurl（2020-04-24T15:27:12Z）
1 hour ago, ap90033 said:
Sorry if this is the wrong place,
It is, as is the new thread you started in General Support. But I replied to that thread with advice on how to find the correct thread.

### 楼层 16 · bluegizmo83（2020-04-24T22:57:20Z）
This may be a dumb question, but how can I add new apps to Community Applications? Is it possible for users to contribute by adding new apps or does the dev do all that? For example, there is a Docker container that I wanted to install on my unraid, but it wasn't listed in the community applications, so I had to add it to unraid manually. I'd like to add this to the community applications if I can.

### 楼层 17 · Squid（2020-04-25T09:18:50Z）
> （此楼层内容为空，疑似已被删除或隐藏）

### 楼层 18 · kevinJohn（2020-04-28T17:52:12Z）
Hello, This is a niiiiice plugin I've ever had. But I have a big problem as some others when access the home page get a timeout err.
I try to download the CA proxy.cfg, but it shows not longer exist, can you please upload again? Thanks a log
:)

### 楼层 19 · Squid（2020-04-28T18:26:34Z）
32 minutes ago, kevinJohn said:
Hello, This is a niiiiice plugin I've ever had. But I have a big problem as some others when access the home page get a timeout err.
I try to download the CA proxy.cfg, but it shows not longer exist, can you please upload again? Thanks a log
proxy.cfg
Edit to suit and place into /config/plugins/community.applications on the flash drive.
But, if you're NOT using a proxy, then the problem is far more likely to be a failure to resolve the addresses.  Enter in 208.67.222.,222 and 208.67.220.220 into Settings - Network Settings as static DNS addresses

### 楼层 20 · [email protected]（2020-05-07T21:46:49Z）
Is CA working right now?
Getting this:
Download of appfeed failed.
Community Applications requires your server to have internet access. The most common cause of this failure is a failure to resolve DNS addresses. You can try and reset your modem and router to fix this issue, or set static DNS addresses (Settings - Network Settings) of 208.67.222.222 and 208.67.220.220 and try again.
Alternatively, there is also a chance that the server handling the application feed is temporarily down.
Last JSON error Recorded: Syntax error

### 楼层 21 · kevinJohn（2020-05-08T09:28:18Z）
11 hours ago, tknx said:
Is CA working right now?
Getting this:
Download of appfeed failed.
Community Applications requires your server to have internet access. The most common cause of this failure is a failure to resolve DNS addresses. You can try and reset your modem and router to fix this issue, or set static DNS addresses (Settings - Network Settings) of 208.67.222.222 and 208.67.220.220 and try again.
Alternatively, there is also a chance that the server handling the application feed is temporarily down.
Last JSON error Recorded: Syntax error
Thanks for your help!
I have already change my DNS to 208.67.222.222 and 208.67.220.220 and 223.5.5.5, still got the same fail
I tried ping OpenDNS server addr and get 140ms delay, I think this is why I could not reach APP STORE stably.
Maybe I will give proxy.cfg another go to see if it works to me.
Thanks again anyway

### 楼层 22 · pacew60176（2020-05-08T13:59:39Z）
is shortipy malware? the github project link redirects to a suspicious website. Community Applications app could use an "Abuse" or "Report" feature
@Squid

### 楼层 23 · JonathanM（2020-05-08T14:54:09Z）
54 minutes ago, pacew60176 said:
is shortipy malware? the github project link redirects to a suspicious website. Community Applications app could use an "Abuse" or "Report" feature
@Squid
Typo.
https://github.com/maschhoff/shortipy

### 楼层 24 · [email protected]（2020-05-08T17:45:50Z）
So my error happened due to Wireguard sort of taking over my server's IP. I turned it off and everything worked.

### 楼层 25 · Squid（2020-05-08T17:47:05Z）
Just now, tknx said:
So my error happened due to Wireguard sort of taking over my server's IP. I turned it off and everything worked.
You should ask about that in the WG support thread


这是 Unraid 官方论坛《Plug-in: Community Applications》支持帖的**第 121 页**，时间跨度为 2020-04-21 至 2020-05-08，记录了 CA 插件维护者 **Squid** 与社区用户的连续故障排查对话。该页讨论可归纳为四条主线：

1. **GitHub 宕机引发全局变慢**（楼层 1-5）：CA 主服务器托管在 GitHub 云端，宕机时所有插件与容器图标下载都变慢，属"正常现象"而非配置错误；Squid 顺带澄清 6.8.x 起容器图标不再存于 U 盘，而是存入 `docker.img` 文件。
2. **更新报 "Configuration not found"**（楼层 6-9）：用户升级到 6.8.3 + CA 2020.04.19 后所有容器更新报"Was this container created using this plugin?"，Squid 判定为 U 盘损坏或掉线，建议换 USB 口重启，并让用户到 General Support 发帖附 diagnostics 诊断包；Leverz 附了报错截图（见上）。
3. **代理与 DNS 排查**（楼层 10-12、18-21）：用户在 GO 文件加 `http_proxy/https_proxy` 对 CA 无效，Squid 给出官方方案——把 `proxy.cfg` 放入 U 盘 `config/plugins/community.applications` 并自行编辑；若未用代理，则多为 DNS 解析失败，可把静态 DNS 设为 `208.67.222.222 / 208.67.220.220`。多位用户（含中国用户）反馈改 DNS 后仍有延迟，最后一位用户发现根因是 **WireGuard 抢占了服务器 IP**，关掉后恢复正常。
4. **其他杂项**（楼层 13-17、22-25）：Traktarr 自动运行问题被引导去其专属支持帖；用户询问能否向 CA 投稿新应用（Squid 未正面回复）；用户发现某 GitHub 项目短链跳转可疑网站，JonathanM 指出是短链拼写错误（`shortipy`）；用户建议 CA 增加"Abuse/Report"举报功能。

**实用价值**：该页浓缩了 CA 插件最常见的三类故障——①外部依赖（GitHub 云）抖动导致全插件变慢；②U 盘/配置丢失导致的容器更新失败；③网络层（DNS/代理/WireGuard 抢 IP）导致的 appfeed 下载失败，并给出了对应排查路径（换 USB 口、静态 DNS、`proxy.cfg`）。对自建 Unraid 的用户有直接参考意义。


`Unraid` `Community Applications` `插件故障排查` `DNS` `代理proxy.cfg` `docker` `GitHub宕机` `WireGuard`
