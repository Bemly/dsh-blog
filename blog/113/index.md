# NAS Unraid6.10.2开心版升级体验 | dwf135

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2023-10-12 11:25:30 ｜ 分类依据：标题关键词匹配

![www.dwf135.cn 站点图标](images/i01-favicon.avif)


- 原始地址：<http://www.dwf135.cn/2820.html>

## 原文全文

NAS Unraid6.10.2开心版升级体验

Unraid6.10.2 开心版发布了，一直还在用 Unraid6.9.2，这次正好升级一下，来体验新功能。6.10 仪表盘新增了 CPU 曲线、网速曲线等。虚拟机添加了 Windows11 模板，其他的小改动很多。可自行体验。

**升级教程：**

首先关闭 unraid，拔掉 U 盘，插入另一台 windows 上，使用 diskgenius 给 U 盘做个备份镜像，以免升级过程中翻车，或是出现 BUG。

![备份U盘镜像](images/i02-2022-06-06_182020.avif)

下载 unRAIDServer-6.10.2-x86_64 开心版（仅供学习交流使用，请在下载 24 小时内删除，觉得不错可购买正版支持）：

- <http://d6.cx/d/123/Soft/blog/unRAIDServer-6.10.3-x86_64_crack.zip>
- <https://d8.d6.cx/NAS/Unraid/>

解压，把除 config 文件夹外的所有文件解压覆盖到 U 盘根目录。

打开 U 盘的 config 目录，再打开 6.10.2 的 config 目录，把这三个文件覆盖到 U 盘 config 目录里面。

![覆盖config文件](images/i03-2022-06-06_183900.avif)

打开根目录的 unraid tool（6.9.2 里面有），复制 U 盘的 GUID 码，编辑 U 盘 config 目录的 go 文件，把默认的 1D6B-0104-A11F-AF09DD45C4A8 替换成你 U 盘的。保存修改。

![修改GUID](images/i04-2022-06-06_182552.avif)

启动正常。

![启动正常](images/i05-2022-06-06_182900.avif)

**全新安装方法：**

把所有文件解压到 U 盘根目录，运行 make_bootable.bat，一直回车即可。如果 U 盘名称没有自动改成 UNRAID 的话自行改一下。然后打开 Unraid Tool 复制 GUID 码，修改 go 文件即可。Unraid tool 可以到 6.9.2 里面获取。

**硬盘安装方法：**

看 go 文件描述。

**鸣谢：**

感谢恩山大佬 muziling 的分享：<https://www.right.com.cn/forum/thread-8235281-1-1.html>

本文作者为 dwf135，转载请注明。


本文为 dwf135 博客分享的 **Unraid 6.9.2 → 6.10.2 "开心版"升级实操体验**。作者用 DiskGenius 备份 U 盘镜像后，将除 config 外的文件解压覆盖到 U 盘根目录，再从 6.10.2 的 config 中覆盖三个关键文件，并通过 unraid tool 复制本机 GUID 修改 go 文件完成升级，附 4 张截图演示各步骤。文章还给出全新安装（make_bootable.bat）与硬盘安装两种方式，并鸣谢恩山论坛 muziling 分享。6.10 版本的新特性（CPU/网速曲线仪表盘、Windows 11 虚拟机模板）也一并说明，适合 Unraid 玩家升级参考。


`unRAID` `6.10.2` `开心版` `升级教程` `GUID` `U盘启动` `NAS` `dwf135`

---
*本文由书签分类整理自动生成。*
