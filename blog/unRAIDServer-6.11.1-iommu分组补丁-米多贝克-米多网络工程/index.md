# unRAIDServer-6.11.1-iommu分组补丁 | 米多贝克&米多网络工程

> 分类：书签 · NAS与自建服务 ｜ 来源：mi-d.cn 博客文章

![mi-d.cn 站点图标](images/i01-favicon.avif)


- 原始地址：<https://www.mi-d.cn/3892>

## 原文全文

unRAIDServer-6.11.1-iommu分组补丁

（发布于 2022 年 10 月 30 日，作者 Tank）

![UNRAID](images/i02-1639482738-UNRAID-370x270.avif)

这个补丁好像不带 iommu，只是 **R8125 和 R8152 网卡驱动补丁**，还需要另外测试。不过我打了这个补丁之后，使用教程里面的方法确实可以分开直通硬件了。

如有 BUG 可以给我留言，或自行去论坛留言：

- <https://forums.unraid.net/topic/123638-unraid-6112-最新的r8125和r8152网卡驱动补丁/>

补丁下载：<https://tank.lanzouv.com/iwLkK0evc3md>
使用教程：<https://mi-d.cn/2989>

我只搬运我自己用得上的补丁，有需要其它版本的补丁可以自行到后面的链接下载：

**TANK 提供搬运**
- 蓝奏·云存储 高速网盘：<https://tank.lanzouv.com/b0agzo92h>

**作者提供**
- 谷歌网盘：<https://drive.google.com/drive/folders/1wA9UNejVllZfBTjDQ-pquJ-Bx4Tlqluk>
- 百度网盘：<https://pan.baidu.com/s/1987agT_JHTv6QT3ds1olqg?pwd=zapu>


本文为 mi-d.cn 搬运分享的 **unRAID 6.11.1 网卡驱动补丁**。作者明确指出该补丁并不含 iommu 分组功能，实质是 **R8125 / R8152 网卡驱动补丁**；但在打补丁后，配合 mi-d.cn/2989 教程可以实现网卡硬件分开直通。文末提供 TANK 搬运（蓝奏云）与作者原发（谷歌盘、百度盘）等多条下载渠道，便于获取其它版本补丁。适合 unRAID 6.11.x 用户遇到 2.5G 网卡无法直通/驱动异常时参考。


`unRAID` `R8125` `R8152` `网卡驱动` `IOMMU直通` `补丁` `mi-d.cn`

---
*本文由书签分类整理自动生成。*
