# 在 SSH 中使用别名代替 IP地址/域名 登录 | 陪她去流浪

> 分类：书签 · NAS与自建服务 ｜ 来源：个人博客文章

![陪她去流浪 站点图标](images/i01-115_favicon.avif)


- 原始地址：<https://blog.csdn.net/qq_42029471/article/details/108497425>（原博客链接，实际来源"陪她去流浪"个人博客）

## 原文全文

在终端中使用 ssh 远程登录的时候，我们经常使用如下的方式：

```bash
$ ssh pi@192.168.1.6
```

每次都输入这样长一串命令其实是很烦人的。如果再加上端口号、私钥等参数，简直太影响效率了。

我们经常在 `/etc/hosts` 文件中添加类似 `192.168.1.6 raspberrypi` 的方式来为 IP 地址绑定一个好记的域名。但是：**ssh 并不遵守这个规则**，它不识别你添加到 `/etc/hosts` 中的配置。它有它自己的配置文件，它就是：`~/.ssh/config` 文件。

如果要想把前面的 `ssh pi@192.168.1.6` 使用一个好记的别名，比如 `rpi`，则可以在 `~/.ssh/config` 添加如下的配置：

```
Host rpi
    HostName 192.168.1.6
    User pi
```

保存文件后，即可以用下面的方式登录了：

```bash
$ ssh rpi
```

配置文件中还可以支持很多其它的配置项，比如：

- `Port` 指定端口号
- `IdentityFile` 指定私钥文件

完整的 ssh_config 配置项可以参考：`man 5 ssh_config`。

上面的 `HostName` 是域名/IP地址，这里就可以填写任意的 IP地址或域名了，包括在 `/etc/hosts` 中手动添加的。

上述的 ssh 别名配置不止是用于 ssh 登录，其它需要使用 ssh 登录的命令场景也适用，比如 **rsync、scp** 等。

```bash
# 把 rpi 主机上 pi 用户家目录下的 a.txt 同步到当前目录
$ rsync rpi:a.txt .
```

可见，对 ssh 使用别名登录将大大简化命令的输入。


本文是一篇极简的 SSH 配置技巧：用 `~/.ssh/config` 的 `Host` 块为常用主机定义别名，替代每次敲一长串 `ssh user@ip -p port -i key`。关键认知是 ssh 不读 `/etc/hosts`，只认自己的配置文件。配置示例（Host rpi / HostName 192.168.1.6 / User pi）保存后即可 `ssh rpi` 直连；`Port`、`IdentityFile` 等常用项一并列出，并强调该别名同样适用于 rsync、scp 等基于 ssh 的命令，非常适合 NAS/服务器多主机管理的日常操作。


`SSH` `ssh_config` `别名` `免输IP` `rsync` `scp` `Linux技巧`

---
*本文由书签分类整理自动生成。*
