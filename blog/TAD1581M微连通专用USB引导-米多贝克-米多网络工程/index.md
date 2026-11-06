# TAD1581M微连通专用USB引导 | 米多贝克&米多网络工程

> 分类：书签 · NAS与自建服务 ｜ 来源：mi-d.cn 博客文章

![mi-d.cn 站点图标](images/i01-favicon.avif)


- 原始地址：<https://www.mi-d.cn/8877>

## 原文全文

TAD1581M微连通专用USB引导

（发布于 2023 年 9 月 14 日，作者 Tank）

**更新日志：**

- 2023-9-26 v1.2：1. 直接更新到 5.1 最新版本；2. 集成一个固定的 SN 码省去小白折腾；3. 增加修改 SN 脚本，防止购买付费套件的时候出现撞码。
- 2023-9-15 v1.1：1. 发布 V1.0 版本。

**注意事项：**

- 请购买正版支持正版，本程序只供内部体验不得对外传播。
- 不支持 hero，hero 要授权。
- 某通对 U 盘性能有要求，建议用质量可靠的 USB3.0 的高速 U 盘；自家卖的 2.0 U 盘安装也有点问题，第一次玩黑微也没搞明白，欢迎自己测试，装了几次有些成功有些不成功。如果不成功可以试试 3.0 U 盘，100% 成功。
- 购买链接：自己看教程，这已经完美版的专机。

![引导盘](images/i02-a99516e422e0e9bd2e426befb1fe4872-e1694687212473.avif)
![引导盘2](images/i03-91241cb08e0fb36e33c09b1f7bf00b2d.avif)
![引导盘3](images/i04-1694712617-QQ-20230915012911.avif)

**使用教程**

下载地址（30 天过期）：

- 123 网盘：<https://www.123pan.com/s/7doDVv-M1cQA.html>
- 百度网盘：<https://pan.baidu.com/s/1yMmNy7p6NJrna7aEucQUVA?pwd=rcqf>

自行下载好文件，使用 **rufus-4.2** 写盘 U 盘内（图片是 Rufus 写 ISO 镜像的图片，你把镜像替换成下载的镜像就行）。

![Rufus写盘](images/i05-1695571403-QQ-20230925000304.avif)

插在主机的内置 USB 口，第一次启动一直按光标下选 **Debian 11 On Ram** 回车。

![启动选单](images/i06-1694710883-QQ-20230915005117.avif)

直到显示这个画面，用户名密码都是 root，也可以使用 ssh 链接。

![登录画面](images/i07-1694711004-QQ-20230915010254.avif)

执行 **fixgpt** 命令。由于都是简单的命令，以下步骤建议使用 WinSCP 操作，WinSCP 可以在群晖包里面下载。使用 WinSCP 连接之后如图操作，比较简单。看屏幕画面显示 `This system on you: /dev/sda6`，显示 `This system on you: /dev/sda7` 就可以不用管这一步。执行以下命令 fixgpt。如果你不打算修改 NVME 的数量和 SN 码，那么你直接执行 reboot，重启之后选第一个选项就可以正常使用了。如果你想修改，那么重启之后再进一次 Debian 11 On Ram。

![fixgpt操作](images/i08-1695715649-QQ-20230926153327.avif)

**修改 NVME 盘位的数量：**

- 只需要 3nvme 无需此操作；
- PCIE4 主板最外侧 PCIE 拆分双 NVME；
- 切换 5nvme 或 7nvme。

重启之后重新进 debian11 ram shell，登录提示是 `This system on you: /dev/sda7`：

```
mkdir /mnt/sda7
mount /dev/sda7 /mnt/sda7
cd /mnt/sda7/patch/
```

推荐用 WinSCP 操作，然后将 etc 内的 model-5nvme.conf 或 model-7nvme.conf 重命名为 model.conf 后……

![修改NVME配置](images/i09-1694711575-QQ-20230915011243.avif)

Win 用户直接下载 QNAPQfinderPro 然后搜索安装：

- <https://download.qnap.com.cn/Storage/Utility/QNAPQfinderProWindows-7.9.1.0817.msi>

其它平台自行到官网下载 QNAPQfinderPro：

- <https://origin-www.qnap.com.cn/zh-cn/download?model=ts-h886&category=firmware>

不支持 hero，hero 要授权。注意不是搜索到 IP 就能马上打开，这玩意扫到 IP 可能还得多等五六分钟以上才能打开 WEB 页面，请静静等待，能扫出 IP 就一定能装。

![QfinderPro搜索](images/i10-1695733116-QQ-20230926203726.avif)

剩下的……**存储 完美**。

![存储](images/i11-1695733118-QQ-20230926203435.avif)

**温控系统风扇控制正常，显卡正常识别。**

![温控与显卡](images/i12-1695733722-QQ-20230926210657.avif)

**板载网卡和 PCIE 网卡都正常识别。**

![网卡识别](images/i13-1695810135-QQ-20230927141530.avif)

**显卡型号识别正常，网卡的 SR-IOV 也正常显示。**

![显卡与SR-IOV](images/i14-1695810250-QQ-20230927141110.avif)


本文是 mi-d.cn 发布的 **TAD1581M 主板（微连通/QNAP 系）专用 USB 引导制作教程**，面向自组"黑微"NAS 场景。核心流程：用 Rufus 将定制镜像写入 U 盘 → 内置 USB 口启动并选择 Debian 11 On Ram → root 登录执行 fixgpt →（可选）修改 NVME 盘位数量（3/5/7nvme 对应不同 model 配置）与 SN 码 → 用 QNAPQfinderPro 搜索并安装系统。教程附 13 张实操截图，覆盖写盘、启动选单、WinSCP 操作、NVME 配置改名、QfinderPro 搜索及最终识别验证（存储、温控、显卡、板载/PCIE 网卡、SR-IOV）。注意事项提醒：需用 USB3.0 高速 U 盘、不支持 hero 机型、SN 撞码问题由 v1.2 版本解决。


`TAD1581M` `微连通` `USB引导` `黑微` `QNAP` `Debian` `fixgpt` `NVME` `NAS装机` `mi-d.cn`

---
*本文由书签分类整理自动生成。*
