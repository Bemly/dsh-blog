# LotServer一键安装脚本 免断流版锐速为服务器网络加速 – v2cross

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-07 00:56:54 ｜ 分类依据：标题关键词匹配

![v2cross.com 站点图标](https://www.google.com/s2/favicons?domain=v2cross.com&sz=128)

## 原始链接

<https://v2cross.com/2446.html>

## 原文全文

LotServer一键安装脚本 免断流版锐速为服务器网络加速 – v2cross

![原文文首配图：Vultr 服务器套餐广告](images/i01-1652086382-bd4ae665a9a0f33.avif)

![原文文首配图：搬瓦工服务器套餐广告](images/i02-1652086385-0cebc8b358d88ba.avif)

![原文文首配图：搬瓦工优惠码推广](images/i03-1652086389-3a9d9678e3d6fe5.avif)

![原文文首配图：Vultr 评测推荐](images/i04-1652086393-a184527d1d7589e.avif)

![原文文首配图：LotServer 网络加速宣传图](images/i05-1652086399-10679a8a1c781e7.avif)

关于LotServer

LotServer是一款网络加速工具，用于VPS服务器上，可以大幅提升网络传输质量，减少丢包。

LotServer的优点：

对国外VPS服务器的网络传输，有非常明显的改善作用。

只需安装在服务器就可以实现网络加速，无需客户端，更加方便灵活。

可以加快服务器上架设网站的访问速度。

可以对Shadowsokcs/SSR/V2ray等科学上网工具进行网络加速。

LotServer的不足：

对服务器所有TCP流量进行加速，对于UDP流量没有加速效果。

对于VPS服务器的内核版本有一定要求，部分内核下可能会安装失败。

LotServer与锐速的区别

锐速也是一款网络加速工具，英文名称ServerSpeeder，其一键安装脚本可以参考这篇文章。

LotServer与锐速的相同点：

1.两者从本质上来说，其实算是同一款软件，内核基本是一样的，只是披着不同的外衣，或者也可以说锐速是LotServer的马甲软件。

2.两者都是商业软件，并不开源，目前网上的流传的都是破解版本。

3.两者对Linux系统的支持都不完善，只可以在特定内核下安装使用。

LotServer与锐速的不同点：

1.锐速由于破解并不完善，会造成使用中断流的问题，而LotServer不存在这一问题。

2.LotServer支持更多的系统内核，安装成功率更高。

3.锐速已经停止更新，LotServer仍然在开发维护。

LotServer一键安装脚本

此一键脚本来自Vicer，在此表示感谢。

环境要求：

1.架构：不支持OpenVZ架构的VPS服务器，支持KVM/Xen。

2.系统：支持CentOS、Debian、Ubuntu等Linux系统，建议在64位系统下运行脚本，安装成功率更高。

3.内核：如果是不支持的内核，脚本会提示无法安装，所以大胆尝试就是。具体支持的内核列表见文末。

符合条件的国外VPS服务器可以参考：适合搭建SSR的国外VPS服务器推荐汇总

LotServer一键安装脚本：

1.Putty连接VPS服务器，复制如下脚本运行：

bash <(wget --no-check-certificate -qO- https://github.com/MoeClub/lotServer/raw/master/Install.sh) install

2.出现下图所示界面提示时，按Enter键继续：

> ⚠️ 原文此处配图（ssr.tools 图床的 2019-05-06_155526.jpg）源站已失效，多次重试及 archive.org 均无法下载，故此处缺图。

3.正常情况下，很快就会安装完成，并出现下图提示：

![安装完成界面提示](images/i06-1652151538-27d74c07d52959e.avif)

4.LotServer安装完成后，就可以对VPS服务器的网络进行加速了。一般情况下，默认设置就可以了，以后每次开机时，LotServer会随系统自启。

LotServer常用功能

LotServer常用功能命令如下：

# 启动命令：

/appex/bin/lotServer.sh start

# 停止加速：

/appex/bin/lotServer.sh stop

# 状态查询：

/appex/bin/lotServer.sh status

# 重新启动：

/appex/bin/lotServer.sh restart

LotServer配置文件路径：

/appex/etc/config，修改配置后重启LotServer使设置生效。

LotServer的参数配置可以参考：https://github.com/MoeClub/lotServer/blob/master/lotServer.pdf

LotServer一键完全卸载命令：

bash <(wget --no-check-certificate -qO- https://github.com/MoeClub/lotServer/raw/master/Install.sh) uninstall

LotServer支持的系统内核

以下为LotServer支持的系统及内核版本，各项目之间用 / 隔开。

Linux 操作系统 / Linux 版本 / 内核版本 / 位数

Amazon / 14.03 / 3.10.35-43.137.amzn1.x86_64 / 64-bits

Amazon / 2014.09 / 3.14.19-17.43.amzn1.x86_64 / 64-bits

Amazon / 2015.09 / 3.10.42-52.145.amzn1.x86_64 / 64-bits

Amazon / 2015.09 / 3.14.48-33.39.amzn1.x86_64 / 64-bits

Amazon / 2015.09 / 4.1.10-17.31.amzn1.x86_64 / 64-bits

Amazon / 2015.09 / 4.1.13-19.30.amzn1.x86_64 / 64-bits

Amazon / 2015.09 / 4.1.17-22.30.amzn1.x86_64 / 64-bits

Amazon / 2015.09 / 4.1.7-154.234.amzn1.x86_64 / 64-bits

Amazon / 2018.03 / 4.4.11-23.53.amzn1.x86_64 / 64-bits

CentOS / 5 / 2.6.18-164.el5pae / 32-bits

CentOS / 5 / 2.6.18-308.4.1.el5xen / 64-bits

CentOS / 5 / 2.6.18-53.el5 / 32-bits

CentOS / 5 / 2.6.18-53.el5 / 64-bits

CentOS / 5 / 2.6.18-53.el5xen / 64-bits

CentOS / 5.1 / 2.6.18-371.el5 / 32-bits

CentOS / 5.11 / 2.6.18-398.el5 / 64-bits

CentOS / 5.11 / 2.6.18-406.el5.centos.plus / 64-bits

CentOS / 5.2 / 2.6.18-92.el5 / 64-bits

CentOS / 5.4 / 2.6.18-164.el5 / 32-bits

CentOS / 5.4 / 2.6.18-164.el5 / 64-bits

CentOS / 5.4 / 2.6.18-164.el5PAE / 32-bits

CentOS / 5.4 / 2.6.18-308.el5 / 64-bits

CentOS / 5.4 / 2.6.32.el5 / 64-bits

CentOS / 5.4 / 2.6.32.el5 / 64-bits

CentOS / 5.4 / 2.6.32.el5 / 64-bits

CentOS / 5.4 / 2.6.37-6.el5.x86_64 / 64-bits

CentOS / 5.4 / 2.6.37.el5 / 64-bits

CentOS / 5.5 / 2.6.18-194.el5 / 64-bits

CentOS / 5.5 / 2.6.18-194.el5xen / 64-bits

CentOS / 5.5 / 2.6.32.el5 / 64-bits

CentOS / 5.5 / 2.6.37 / 64-bits

CentOS / 5.5 / 2.6.37-1 / 64-bits

CentOS / 5.5 / 2.6.37-2 / 64-bits

CentOS / 5.5 / 2.6.37-3 / 64-bits

CentOS / 5.5 / 2.6.37-4 / 64-bits

CentOS / 5.5 / 2.6.37-5 / 64-bits

CentOS / 5.5 / 2.6.37-6 / 64-bits

CentOS / 5.6 / 2.6.18-238.el5 / 64-bits

CentOS / 5.6 / 3.14.5-x86_64-linode42 / 64-bits

CentOS / 5.7 / 2.6.18-274.el5 / 64-bits

CentOS / 5.7 / 2.6.18-274.el5xen / 32-bits

CentOS / 5.7 / 2.6.18-274.el5xen / 64-bits

CentOS / 5.7 / 2.6.39-900.109.1.reiserfs.el5uek / 64-bits

CentOS / 5.8 / 2.6.18-308.el5 / 64-bits

CentOS / 5.8 / 2.6.18-308.el5xen / 64-bits

CentOS / 5.8 / 2.6.18-371.1.2.el5 / 64-bits

CentOS / 5.8 / 2.6.18-371.9.1.el5 / 64-bits

CentOS / 5.8 / 2.6.18-400.1.1.el5 / 64-bits

CentOS / 5.9 / 2.6.18-348.1.1.el5 / 64-bits

CentOS / 5.9 / 2.6.18-348.1.1.el5xen / 32-bits

CentOS / 5.9 / 2.6.18-348.18.1.el5xen / 64-bits

CentOS / 5.9 / 2.6.18-348.el5 / 64-bits

CentOS / 5.9 / 2.6.18-398.el5PAE / 32-bits

CentOS / 6.0 / 2.6.32-131.17.1.el6.x86_64 / 64-bits

CentOS / 6.0 / 2.6.32-71.el6.x86_64 / 64-bits

CentOS / 6.1 / 2.6.32-131.el6.x86_64 / 64-bits

CentOS / 6.10 / 2.6.32-754.el6.x86_64 / 64-bits

CentOS / 6.10 / 4.17.8-1.el6.elrepo.x86_64 / 64-bits

CentOS / 6.2 / 2.6.32-220.13.1.el6.x86_64 / 64-bits

CentOS / 6.2 / 2.6.32-220.2.1.el6.x86_64 / 64-bits

CentOS / 6.2 / 2.6.32-220.7.1.el6.x86_64 / 64-bits

CentOS / 6.2 / 2.6.32-220.el6.x86_64 / 64-bits

CentOS / 6.2 / 2.6.32-279.19.9.el6.ucloud.i686 / 32-bits

CentOS / 6.2 / 2.6.32-900.220.23.1.letv.el6.x86_64 / 64-bits

CentOS / 6.2 / 2.6.32-letv.2.220.4.1.el6.x86_64 / 64-bits

CentOS / 6.3 / 2.6.32-042stab065.3 / 64-bits

CentOS / 6.3 / 2.6.32-279.23.1.mi5.el6.x86_64 / 64-bits

CentOS / 6.3 / 2.6.32-279.el6.x86_64 / 64-bits

CentOS / 6.3 / 2.6.32-902.279.9.1.letv.el6.x86_64 / 64-bits

CentOS / 6.3 / 3.12.6-han / 64-bits

CentOS / 6.3 / 4.11.1-1.el6.elrepo.x86_64 / 64-bits

CentOS / 6.4 / 2.6.32-042stab072.10 / 64-bits

CentOS / 6.4 / 2.6.32-042stab106.4 / 64-bits

CentOS / 6.4 / 2.6.32-358.14.1.el6 / 64-bits

CentOS / 6.4 / 2.6.32-358.14.1.el6.x86_64 / 64-bits

CentOS / 6.4 / 2.6.32-358.18.1.el6.x86_64 / 64-bits

CentOS / 6.4 / 2.6.32-358.2.1.el6.x86_64 / 64-bits

CentOS / 6.4 / 2.6.32-358.23.2.el6.i686 / 32-bits

CentOS / 6.4 / 2.6.32-358.23.2.el6.x86_64 / 64-bits

CentOS / 6.4 / 2.6.32-358.el6.x86_64 / 64-bits

CentOS / 6.4 / 2.6.32-431.el6.i686 / 32-bits

CentOS / 6.4 / 2.6.32-431.el6.x86_64 / 64-bits

CentOS / 6.4 / 2.6.32-504.3.3.el6.x86_64 / 64-bits

CentOS / 6.4 / 2.6.32-903.279.9.1.letv.el6.x86_64 / 64-bits

CentOS / 6.4 / 2.6.32-925.431.23.3.letv.el6.x86_64 / 64-bits

CentOS / 6.4 / 3.12.el6 / 64-bits

CentOS / 6.5 / 2.6.32-042stab084.26 / 64-bits

CentOS / 6.5 / 2.6.32-042stab090.5 / 64-bits

CentOS / 6.5 / 2.6.32-042stab092.1 / 64-bits

CentOS / 6.5 / 2.6.32-279.19.8.el6.ucloud / 64-bits

CentOS / 6.5 / 2.6.32-431.11.15.el6.ucloud.x86_64 / 64-bits

CentOS / 6.5 / 2.6.32-431.11.25.el6.ucloud.x86_64 / 64-bits

CentOS / 6.5 / 2.6.32-431.11.5.el6.ucloud / 64-bits

CentOS / 6.5 / 2.6.32-431.20.3.el6.x86_64 / 64-bits

CentOS / 6.5 / 2.6.32-504.el6 / 64-bits3.11.47.1

CentOS / 6.5 / 2.6.32-504.el6.x86_64 / 64-bits

CentOS / 6.5 / 2.6.32-923.431.20.3.letv.el6.x86_64 / 64-bits

CentOS / 6.5 / 3.10.104-1.el6.elrepo.x86_64 / 64-bits

CentOS / 6.5 / 3.10.59 / 64-bits

CentOS / 6.5 / 3.12.6 / 64-bits

CentOS / 6.5 / 3.12.6-v1.3 / 64-bits

CentOS / 6.5 / 3.18.27.upyun / 64-bits

CentOS / 6.5 / 3.19.1-x86_64-linode53 / 64-bits

CentOS / 6.5 / 4.0.2-x86_64-linode56 / 64-bits

CentOS / 6.5 / 4.4.0-x86_64-linode63 / 64-bits

CentOS / 6.6 / 2.6.32-042stab108.8 / 64-bits

CentOS / 6.6 / 2.6.32-504.3.3.el6.centos.plus.x86_64 / 64-bits

CentOS / 6.6 / 2.6.32-504.3.3.el6.x86_64 / 64-bits

CentOS / 6.6 / 2.6.32-504.el6 / 32-bits

CentOS / 6.6 / 2.6.32-504.el6.i686 / 32-bits

CentOS / 6.6 / 2.6.32-573.1.1.el6.x86_64 / 64-bits

CentOS / 6.6 / 2.6.32-926.504.30.3.letv.el6.x86_64 / 64-bits

CentOS / 6.7 / 2.6.32-042stab112.15 / 64-bits

CentOS / 6.7 / 2.6.32-573.26.1.el6.x86_64 / 64-bits

CentOS / 6.7 / 2.6.32-696.el6.x86_64 / 64-bits

CentOS / 6.7 / 3.10.0-327.10.1.el6 / 64-bits

CentOS / 6.7 / 3.10.0-327.10.1.el6 / 64-bits

CentOS / 6.7 / 3.10.0-327.10.1.el6 / 64-bits

CentOS / 6.7 / 3.10.0-327.10.1.el6.r01_NG.x86_64 / 64-bits

CentOS / 6.7 / 3.12.6 / 64-bits

CentOS / 6.7 / 3.12.6-112 / 64-bits

CentOS / 6.7 / 4.17.14-1.el6.x86_64 / 64-bits

CentOS / 6.8 / 2.6.32-642.el6.x86_64 / 64-bits

CentOS / 6.8 / 3.10.105-1.el6.elrepo.x86_64 / 64-bits

CentOS / 6.8 / 3.12.6 / 64-bits

CentOS / 6.8 / 4.1.42-1.el6.x86_64 / 64-bits

CentOS / 6.8 / 4.17.11-1.el6.elrepo.x86_64 / 64-bits

CentOS / 6.8 / 4.4.170-1.el6.elrepo.x86_64 / 64-bits

CentOS / 6.8 / 4.9.7-1.el6.elrepo.x86_64 / 64-bits

CentOS / 6.9 / 2.6.32-696.1.1.el6.x86_64 / 64-bits

CentOS / 7 / 3.18.1-x86_64-linode50 / 64-bits

CentOS / 7 / 3.18.5-x86_64-linode52 / 64-bits

CentOS / 7.0 / 3.10.0-123.el7.x86_64 / 64-bits

CentOS / 7.0 / 3.10.0-862.3.3.el7.x86_64 / 64-bits

CentOS / 7.0 / 3.10.0-862.el7.x86_64 / 64-bits

CentOS / 7.0 / 4.9.6-1.el7.elrepo.x86_64 / 64-bits

CentOS / 7.0 / 4.9.7-1.el7.elrepo.x86_64 / 64-bits

CentOS / 7.1 / 3.10.0-229.1.2.el7.x86_64 / 64-bits

CentOS / 7.1 / 3.10.0-327.3.1.el7.x86_64 / 64-bits

CentOS / 7.1 / 3.10.75-2.el7.x86_64 / 64-bits

CentOS / 7.2 / 3.10.0-1-tlinux2_ntrace_cdn-0008.tl2 / 64-bits

CentOS / 7.2 / 3.10.0-327.el7.x86_64 / 64-bits

CentOS / 7.2 / 3.10.0-514.el7.x86_64 / 64-bits

CentOS / 7.2 / 3.10.104-1-tlinux2-0041.live.appex.tl2 / 64-bits

CentOS / 7.2 / 3.10.104-1-tlinux2-0041.live.appex2.tl2 / 64-bits

CentOS / 7.2 / 4.9.0-1.el7.elrepo.x86_64 / 64-bits

CentOS / 7.3 / 3.10.0-514.2.2.el7.x86_64 / 64-bits

CentOS / 7.4 / 3.10.0-693.1.1.el7.x86_64 / 64-bits

CentOS / 7.4 / 3.10.0-693.25.4.el7.x86_64 / 64-bits

CentOS / 7.4 / 4.11.2-1.el7.elrepo.x86_64 / 64-bits

CentOS / 7.4 / 4.20.12-1.el7.elrepo.x86_64 / 64-bits

CentOS / 7.6 / 3.10.0-957.el7.centos.plus.i686 / 32-bits

CentOS / 7.6 / 3.10.0-957.el7.x86_64 / 64-bits

CentOS / 7.6 / 4.20.11-1.el7.elrepo.x86_64 / 64-bits

CloudLinux_Server / 6.6 / 4.0.2-x86_64-linode56 / 64-bits

Debian / 6.0 / 3.2.0-0.bpo.4-amd64 / 64-bits

Debian / 7 / 3.14.5-x86_64-linode42 / 64-bits

Debian / 7 / 3.18.1-x86_64-linode50 / 64-bits

Debian / 7 / 3.18.5-x86_64-linode52 / 64-bits

Debian / 7 / 3.2.0-4-amd64 / 64-bits

Debian / 8 / 3.16.0-4-amd64 / 64-bits

Debian / 8 / 4.0.2-x86_64-linode56 / 64-bits

Debian / 8 / 4.4.10-1-pve / 64-bits

Debian / 9.3 / 4.9.0-4-amd64 / 64-bits

EulerOS / 2.0 / 3.10.0-862.14.0.1.h43.eulerosv2r7.x86_64 / 64-bits

Fedora / 12 / 2.6.31.5-127.fc12.i686.PAE / 32-bits

Gentoo / gentoo / 3.2.12-gentoo / 64-bits

Hikvision / 3.4.35 / Hikvision / 64-bits

neokylin / 3.2 / 2.6.32-279.5.ky3.1 / 32-bits

NewStart_CGS / 4 / 2.6.32-220.el6.x86_64 / 64-bits

NewStart_CGS_Linux_V4 / Released_By_ZTE / Kernel / 32-bits

Oracle / 6.2 / 2.6.39-200.24.1.el6uek.x86_64 / 64-bits

OWLinux / 4.0.3 / 2.6.26.8.1.OWLsmp / 64-bits

OWLinux / 4.2.1.2 / 2.6.32-220 / 64-bits

OWLinux / 4.2.1.2 / 3.4.13-3.1 / 64-bits

OWLinux / 4.2.1.2 / 3.4.13-3.1.OWLsmp / 64-bits

Poky / 1.6 / 3.10.34-ltsi-yocto-standard / 32-bits

Red_Hat_Enterprise / 5 / 2.6.18-53.el5 / 32-bits

Red_Hat_Enterprise / 5 / 2.6.18-53.el5 / 64-bits

Red_Hat_Enterprise / 5.2 / 2.6.18-92.el5 / 64-bits

Red_Hat_Enterprise / 5.4 / 2.6.18-164.el5 / 32-bits

Red_Hat_Enterprise / 5.4 / 2.6.18-164.el5 / 64-bits

Red_Hat_Enterprise / 5.4 / 2.6.18-164.el5PAE / 32-bits

Red_Hat_Enterprise / 5.4 / 2.6.32.el5 / 64-bits

Red_Hat_Enterprise / 5.5 / 2.6.18-194.el5 / 64-bits

Red_Hat_Enterprise / 5.5 / 2.6.18-194.el5xen / 64-bits

Red_Hat_Enterprise / 5.6 / 2.6.18-238.el5 / 64-bits

Red_Hat_Enterprise / 5.7 / 2.6.18-274.el5 / 64-bits

Red_Hat_Enterprise / 5.7 / 2.6.18-274.el5xen / 32-bits

Red_Hat_Enterprise / 5.7 / 2.6.18-274.el5xen / 64-bits

Red_Hat_Enterprise / 5.8 / 2.6.18-308.el5 / 64-bits

Red_Hat_Enterprise / 5.8 / 2.6.18-308.el5xen / 64-bits

Red_Hat_Enterprise / 6 / 2.6.32-56 / 64-bits

Red_Hat_Enterprise / 6.0 / 2.6.32-71.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 6.1 / 2.6.32-131.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 6.1 / 2.6.32-220.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 6.2 / 2.6.32-2.0.0.1.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 6.2 / 2.6.32-2.0.0.8.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 6.2 / 2.6.32-220.23.1.tb1.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 6.3 / 2.6.32-276.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 6.3 / 2.6.32-279.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 6.4 / 2.6.32-358.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 6.4 / 2.6.32-431.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 6.4 / 2.6.39-400.17.1.el6uek.x86_64 / 64-bits

Red_Hat_Enterprise / 6.5 / 2.6.32-431.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 6.6 / 2.6.32-504.3.3.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 6.6 / 2.6.32-504.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 6.6 / 2.6.32-573.1.1.el6.x86_64 / 64-bits

Red_Hat_Enterprise / 7.0 / 3.10.0-123.el7.x86_64 / 64-bits

Red_Hat_Enterprise / 7.0 / 4.9.6-1.el7.elrepo.x86_64 / 64-bits

Red_Hat_Enterprise / 7.1 / 3.10.0-229.1.2.el7.x86_64 / 64-bits

Red_Hat_Enterprise / 7.2 / 3.10.0-327.el7.x86_64 / 64-bits

Red_Hat_Enterprise / 7.2 / 3.10.0-514.el7.x86_64 / 64-bits

Red_Hat_Enterprise / 7.3 / 3.10.0-514.6.1.el7.x86_64 / 64-bits

Red_Hat_Enterprise / 7.4 / 3.10.0-693.1.1.el7.x86_64 / 64-bits

Red_Hat_Enterprise / 7.4 / 3.10.0-693.17.1.el7.x86_64 / 64-bits

Red_Hat_Enterprise / 7.6 / 3.10.0-957.el7.x86_64 / 64-bits

Surfos / 6.2 / 3.8.4 / 64-bits

SUSE_Linux_Enterprise / 11 / 2.6.32.12-0.7-default / 64-bits

SUSE_Linux_Enterprise / 11 / 2.6.32.59-0.7-default / 64-bits

SUSE_Linux_Enterprise / 11 / 3.0.101-0.47.105.1.13184.1.PTF-default / 64-bits

SUSE_Linux_Enterprise / 11 / 3.0.13-0.27-default / 64-bits

SUSE_Linux_Enterprise / 11 / 3.0.76-0.11-default / 64-bits

SUSE_Linux_Enterprise / 11.4 / 3.0.101-63-default / 64-bits

Tencent_tlinux / 2.0 / 3.10.0-1-tlinux2_cdn_nosign-0001.tl2 / 64-bits

Tencent_tlinux / 2.0 / 3.10.0-1-tlinux2_ntrace_cdn-0001.tl2 / 64-bits

Tencent_tlinux / 2.0 / 3.10.104-1-tlinux2-0041.live.appex.0809.tl2 / 64-bits

Tencent_tlinux / 2.0 / 3.10.104-1-tlinux2-0041.live.appex.tl2 / 64-bits

Tencent_tlinux / 2.0 / 3.10.104-1-tlinux2-0041.live.appex2.tl2 / 64-bits

Tencent_tlinux / 2.0 / 3.10.104-1-tlinux2-0041.live.appex3.tl2 / 64-bits

Ubuntu / 10.04.4 / 2.6.32-38-generic-pae / 32-bits

Ubuntu / 11.10 / 3.0.0-12-server / 64-bits

Ubuntu / 11.10 / 3.0.0-14-virtual / 64-bits

Ubuntu / 12.04 / 3.2.0-23-generic / 64-bits

Ubuntu / 12.04 / 3.2.0-24-virtual / 32-bits

Ubuntu / 12.04 / 3.2.0-4-686-pae / 32-bits

Ubuntu / 12.04 / 3.2.0-56-virtual / 64-bits

Ubuntu / 12.04 / 3.2.0-59-generic / 64-bits

Ubuntu / 12.04 / 3.2.0-60-generic / 64-bits

Ubuntu / 12.04 / 3.2.0-61-generic / 64-bits

Ubuntu / 12.04 / 3.2.0-70-generic / 64-bits

Ubuntu / 12.04 / 3.5.0-23-generic / 64-bits

Ubuntu / 12.04 / 3.5.0-23-generic / 32-bits

Ubuntu / 12.04 / 3.5.0-45-generic / 64-bits

Ubuntu / 12.04 / 3.5.0-54-generic / 64-bits

Ubuntu / 12.04 / 3.8.0-35-generic / 64-bits

Ubuntu / 12.04 / 3.8.0-44-generic / 64-bits

Ubuntu / 12.04 / 4.0.2-x86_64-linode56 / 64-bits

Ubuntu / 12.04.1 3.2.0-31-generic / 64-bits

Ubuntu / 12.04.2 3.2.0-40-generic / 64-bits

Ubuntu / 12.04.5 3.2.0-106-generic / 64-bits

Ubuntu / 13.10 / 4.9.0-040900rc8-generic 64-bits

Ubuntu / 14.04 / 3.13.0-117-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-24-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-24-generic / 32-bits

Ubuntu / 14.04 / 3.13.0-29-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-29-generic / 32-bits

Ubuntu / 14.04 / 3.13.0-32-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-36-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-37-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-40-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-43-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-44-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-45-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-46-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-48-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-55-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-74-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-79-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-83-generic / 64-bits

Ubuntu / 14.04 / 3.13.0-85-generic / 64-bits

Ubuntu / 14.04 / 3.16.0-28-generic / 64-bits

Ubuntu / 14.04 / 3.16.0-30-generic / 64-bits

Ubuntu / 14.04 / 3.16.0-38-generic / 64-bits

Ubuntu / 14.04 / 3.16.0-43-generic / 64-bits

Ubuntu / 14.04 / 3.16.5-linode46 / 64-bits

Ubuntu / 14.04 / 3.16.5-linode65 / 32-bits

Ubuntu / 14.04 / 3.18.1-x86_64-linode50 / 64-bits

Ubuntu / 14.04 / 3.18.5-x86_64-linode52 / 64-bits

Ubuntu / 14.04 / 3.19.0-25-generic / 64-bits

Ubuntu / 14.04 / 3.19.0-80-generic / 64-bits

Ubuntu / 14.04 / 3.8.13-generic / / 32-bits

Ubuntu / 14.04 / 4.2.0-35-generic / 64-bits

Ubuntu / 14.04 / 4.4.0-38-generic / 64-bits

Ubuntu / 14.04.4 3.13.0-147-generic / 64-bits

Ubuntu / 14.04.4 3.13.0-92-generic / 64-bits

Ubuntu / 14.04.5 3.16.0-77-generic / 64-bits

Ubuntu / 15.10 / 4.2.0-16-generic-imq / 64-bits

Ubuntu / 15.10 / 4.2.8-ckt8 / / 64-bits

Ubuntu / 16.04 / 4.4.0-142-generic / 64-bits

Ubuntu / 16.04 / 4.4.0-47-generic / 64-bits

Ubuntu / 16.04 / 4.8.0-36-generic / 64-bits

Ubuntu / 18.04 / 4.15.0-30-generic / 64-bits

Alibaba_Group_Enterprise_Linux_Server / 6.2 / 2.6.32-220.1.alios6.x86_64 / 64-bits


v2cross 分享的 LotServer 一键安装教程（脚本来自 Vicer）。LotServer 是锐速（ServerSpeeder）的"马甲"升级版，安装在 VPS 服务器上对 TCP 流量做网络加速，减少丢包、提升传输质量。要点归纳：

**LotServer vs 锐速**
- 本质上是同一款软件（内核基本一样，锐速是马甲），均为商业软件不开源，网上流传的是破解版
- 锐速破解不完善会断流，LotServer 不断流；LotServer 支持更多内核、安装成功率更高
- 锐速已停止更新，LotServer 仍在维护
- 都只加速 TCP，对 UDP 无效

**安装要求**
- 架构：不支持 OpenVZ，支持 KVM/Xen
- 系统：CentOS / Debian / Ubuntu，64 位系统成功率更高
- 内核有兼容列表，不支持的会提示无法安装

**一键安装**
```
bash <(wget --no-check-certificate -qO- https://github.com/MoeClub/lotServer/raw/master/Install.sh) install
```
卸载用同脚本加 `uninstall` 参数。

**常用命令**
- 启停/状态：`/appex/bin/lotServer.sh start|stop|status|restart`
- 配置文件：`/appex/etc/config`，改后重启服务生效

**配图情况**：原文文首为 5 张广告/宣传图（Vultr、搬瓦工及 LotServer 宣传），已按原文顺序内联；步骤 2 的界面提示截图（ssr.tools 图床）源站已失效，未能保留；步骤 3 的安装完成界面截图已内联。

**备注**：安装的是第三方破解版商业加速软件，仅适合折腾/加速用途，生产环境需自行评估风险。


`LotServer` `锐速` `ServerSpeeder` `VPS加速` `TCP加速` `一键脚本`

---
*本文由书签分类整理自动生成。*
