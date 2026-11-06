# 物理机安装黑群晖DS918+没有硬解的破解方法

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2022-05-18 09:47:00 ｜ 来源：信息笔记博客（www.zxbblog.com）

![信息笔记 站点图标](images/i01-080_favicon.avif)


- 原始地址：<https://www.zxbblog.com/?id=138>


博主网盘的"J3455专用的1.04b引导"文件，本来是可以支持硬解的，但是有群友跟博主反映：为什么我用了不行？经过博主一段时间的调查研究，发现这个J3455专用的1.04b引导，版本是6.2-23739，如果你在全新安装的时候，手动上传"DS918-6.2-23739.pat"这个安装包进行安装，那就没有问题。如果你点立即安装，或者手动上传的安装包版本高于引导文件的版本，那么系统会自动去平衡你的引导文件版本，所以引导文件就被系统替换掉了，变成了没有硬解。

刚才说了原理，现在讲一下破解的方法（思路）：既然是系统替换的，那么我们可以在升级之前把相应的文件先备份好，升级之前把文件替换回去。或者安装到最新版本以后，把文件替换回去，来个偷龙转凤、狸猫换太子。

需要替换的这个文件在这下载：**extra.lzma**。

### 替换方法一：SSH命令大法

> 重要提醒：由于涉及到删除文件和替换文件的操作，如果你对Linux的操作比较熟悉，可以用此方法。否则，用错命令有可能会造成系统进不去了。

先下载 extra.lzma 文件放到群晖（博主临时上传到 /volume1/video 文件夹）：

```bash
admin@GXNAS:~$ sudo -i
Password:
root@GXNAS:~# echo 1 > /proc/sys/kernel/syno_install_flag
root@GXNAS:~# mkdir -p /tmp/synoboot2
root@GXNAS:~# mount /dev/synoboot2 /tmp/synoboot2
root@GXNAS:~# cd /tmp/synoboot2
root@GXNAS:/tmp/synoboot2~# ls
checksum.syno extra2.lzma extra.lzma grub_cksum.syno rd.gz Sone.9 zImage
root@GXNAS:/tmp/synoboot2~# chown -R root:root /volume1/video/extra.lzma
root@GXNAS:/tmp/synoboot2~# chmod +x /volume1/video/extra.lzma
root@GXNAS:/tmp/synoboot2~# cp /volume1/video/extra.lzma /tmp/synoboot2
root@GXNAS:/tmp/synoboot2~# rm /tmp/synoboot2/extra2.lzma
root@GXNAS:/tmp/synoboot2~# rm -rf /usr/lib/modules/update/*
root@GXNAS:/tmp/synoboot2~# reboot
```

### 替换方法二：DG替换大法

> 重要提醒：由于以下操作涉及到文件替换，请谨慎！否则搞错了有可能会造成系统进不去了。

1. 先下载 extra.lzma 文件放到电脑上；
2. 把群晖的引导U盘插到电脑上，打开DG浏览U盘的第2个分区，会看到 checksum.syno、extra2.lzma、extra.lzma、grub_cksum.syno、rd.gz、Sone.9、zImage 这些文件：

![DG 浏览引导U盘第2分区（原博文配图）](images/i02-080_1.avif)

3. 把下载到电脑的 extra.lzma 文件上传到U盘里面，覆盖；
4. 引导U盘插回黑群晖，重启。

### 重启后验证是否恢复硬解

```bash
admin@GXNAS:~$ sudo -i
Password:
root@GXNAS:~# :/$ ls /dev/dri
card0 controlD64 renderD128
root@GXNAS:/$ sudo cat /sys/kernel/debug/dri/0/i915_frequency_info
PM IER=0x00000000 IMR=0xffffffff ISR=0x00000000 IIR=0x00000000, MASK=0x00003ffe
pm_intr_keep: 0x80000000
GT_PERF_STATUS: 0x000000b9
Render p-state ratio: 0
Render p-state VID: 185
Render p-state limit: 0
RPSTAT1: 0x03000000
RPMODECTL: 0x00000d92
RPINCLIMIT: 0x00004740
RPDECLIMIT: 0x00007f80
RPNSWREQ: 100MHz
CAGF: 100MHz
RP CUR UP EI: 480 (400us)
RP CUR UP: 269 (224us)
RP PREV UP: 0 (0us)
Up threshold: 95%
RP CUR DOWN EI: 485 (404us)
RP CUR DOWN: 269 (224us)
RP PREV DOWN: 0 (0us)
Down threshold: 85%
Lowest (RPN) frequency: 100MHz
Nominal (RP1) frequency: 250MHz
Max non-overclocked (RP0) frequency: 750MHz
Max overclocked frequency: 750MHz
Current freq: 100 MHz
Actual freq: 100 MHz
Idle freq: 100 MHz
Min freq: 100 MHz
Boost freq: 750 MHz
Max freq: 750 MHz
efficient (RPe) frequency: 250 MHz
Current CD clock frequency: 624000 kHz
Max CD clock frequency: 624000 kHz
Max pixel clock frequency: 624000 kHz
```

至此，破解成功！

需要注意的是：以后要升级系统的时候，先备份文件，升级完成再替换回去，重启群晖又可以正常硬解了。

以上方法仅用于 **J3455 物理机安装 DS918+ 并且已经洗白的黑群晖**。


- 问题根源：J3455 专用 1.04b 引导版本为 6.2-23739。全新安装时手动上传同版本 `DS918-6.2-23739.pat` 则硬解正常；若点"立即安装"或上传更高版本 pat，群晖系统会把引导文件自动替换成不匹配的版本，导致 `/dev/dri` 硬解消失。
- 破解思路：把引导分区 `/dev/synoboot2` 中损坏的 `extra.lzma` 换回原版（同时删除 `extra2.lzma` 并清空 `/usr/lib/modules/update/` 里的更新模块），重启即恢复。
- 两条路线：① SSH 命令法（适合熟悉 Linux 的用户，全程在群晖内操作）；② DG 替换法（无需 SSH，把引导 U 盘插电脑用 DiskGenius 直接覆盖第 2 分区的 extra.lzma，适合小白）。
- 验证方法：`ls /dev/dri` 出现 `card0 / controlD64 / renderD128`，并用 `cat /sys/kernel/debug/dri/0/i915_frequency_info` 看到 i915 频率信息，即说明 J3455 核显驱动加载成功、硬解恢复。
- 维护注意：后续每次系统升级都会再次替换引导文件，升级前须先备份 extra.lzma，升级完成后替换回去并重启。
- 适用范围明确：仅限 J3455 物理机 + DS918+ 引导 + 已洗白的黑群晖；其他机型/引导请勿照搬。


`黑群晖` `DS918+` `J3455` `硬解` `extra.lzma` `核显驱动` `Synology` `引导修复`

---
*本笔记由书签任务人工核对整理，正文来源于信息笔记博客原文章。*
