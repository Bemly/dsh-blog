# BemlyNAS/Browse

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-01-20 07:07:22 ｜ 分类依据：内网/NAS地址

> ⚠️ 本条目为**内网地址**（非公开博客/文章），无公网站点图标可下载；以下为占位说明图。

![内网地址占位说明](images/i01-intranet-placeholder.avif)


- 原始地址：<http://172.31.26.233/Shares/Browse?dir=%2Fmnt%2Fuser%2Fdomains%2FCentOS>


这是一个**内网 NAS 文件浏览地址**（BemlyNAS），非公开站点，仅能在同一局域网内访问。结合 URL 结构可判断：

- **访问地址**：`http://172.31.26.233/Shares/Browse`，是 NAS 的共享文件夹浏览入口（BemlyNAS 为该 NAS 的主机名/站点名）
- **目标目录**：`dir=/mnt/user/domains/CentOS`——`/mnt/user/` 是 **Unraid** 系统的存储路径格式（而非群晖的 `/volume1`），说明该地址实际指向一台 Unraid 服务器上名为 `CentOS` 的目录；`domains` 在 Unraid 中通常用于存放虚拟机磁盘镜像（如 qcow2/vmdk）
- **用途**：在局域网内浏览/管理 Unraid 上的共享文件，可能是为了查看或下载 CentOS 虚拟机镜像

**提醒**：该地址依赖内网 IP，若服务器 IP 变化或 DHCP 重新分配，收藏会失效，可改用 Unraid 主机名访问。


这是一条**内网 NAS 文件浏览地址**收藏，而非博客文章。地址 `172.31.26.233` 指向局域网内一台名为 BemlyNAS 的 NAS，`/Shares/Browse` 是其共享目录浏览入口，目标路径 `/mnt/user/domains/CentOS` 暴露了底层系统特征：`/mnt/user/` 是 Unraid 的标准存储路径（区别于群晖的 `/volume1`），`domains` 目录在 Unraid 中用于存放虚拟机磁盘镜像。推断收藏目的是在局域网内访问/下载该 Unraid 上的 CentOS 虚拟机镜像。该条目价值在 NAS 文件管理本身，**归入「NAS与自建服务」基本合理**；注意内网 IP 会因 DHCP 变化失效，可改用主机名访问。


`Unraid` `内网NAS` `文件浏览` `虚拟机镜像` `domains目录` `内网地址`
