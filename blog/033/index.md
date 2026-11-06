# Arch Linux 安装 | 潇然工作室

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-11 22:32:41 ｜ 分类依据：域名归属映射

![www.xrgzs.top 站点图标](https://www.google.com/s2/favicons?domain=www.xrgzs.top&sz=128)

## 原始链接

<https://www.xrgzs.top/posts/arch-linux-install>

## 原文全文

Arch Linux 安装 | 潇然工作室

Arch Linux 安装

个人整理笔记，目前仅供自用，不断修正中

本人认为 Arch Linux 只是个玩具，安装 Arch Linux 只为学习 Linux 系统结构（表示非常馋ArchWikiCN，许多关于Linux的问题都可以在里面得到全面解答），一般建议体验 Arch Linux 直接使用 manjaro，正式环境如网站服务器还是用~~CentOS(寄)、~~Debian 靠谱些，有官方deb包可以直接装，Arch Linux 也没自由到哪里去

准备

一定要明确你是以怎样的方式引导Arch Linux

ls /sys/firmware/efi/efivars

UEFI Boot会输出一堆东西（efi 变量），Legacy Boot会报错

联网

安装过程要求必须连接到互联网！！！

连网线

自动连接，无需配置

连WiFi

使用 iwctl 进行连接：

iwctl # 进入交互式命令行

device list # 列出无线网卡设备名，比如无线网卡看到叫 wlan0

station wlan0 scan # 扫描网络

station wlan0 get-networks # 列出所有 wifi 网络

station wlan0 connect wifi-name # 进行连接，注意这里无法输入中文。回车后输入密码即可

exit # 连接成功后退出

若无线网卡无法显示，请参考：

https://wiki.archlinuxcn.org/wiki/网络配置/无线网络配置#检查设备状态

显示IP地址

ip a

如果有显示，说明已经通过DHCP获取到ip地址

测试网络连通性

ping www.aliyun.com

校时

timedatectl set-timezone Asia/Shanghai

timedatectl status

timedatectl set-ntp true

Linux须知

文件系统和用户

Linux系统下，不存在C盘、D盘、E盘，所有的硬件软件都是以文件形式存在的，最上层的目录是根目录，路径为 / ，并以一个树形结构从此向下一级一级区分，包括分区，如/dev/sda1，即第a块硬盘的第1个分区，而且不存在/dev/sda1/…/的，读取分区需要将其挂载到文件夹，如mount /dev/sda1 /mnt

对于 Linux 的树形文件结构，存在相对路径与绝对路径之分：

绝对路径代表从根目录 / 开始的完整路径：

比如 /home/myusername/Download

相对路径代表从当前目录或当前目录的上级目录，到目标目录的一个部分路径：

. 代表当前目录

.. 代表当前目录的上级目录

比如当前你所在的目录为 /home/myusername ，那么绝对路径下的 /home/myusername/Download 文件夹的相对路径即为 ./Download

比如你当前所在的路径为 /home/myusername/Download ，向上寻找到 /home/myusername/Desktop 的相对路径即为 ../Desktop

简单来说，Linux 中存在两类用户：

第一类用户即为 root 用户，也称为超级用户，它拥有系统中最高的权限

第二类用户就是除了 root 用户之外的普通用户，它们可以拥有不同等级的权限

使用 root 权限时需要十分小心

理论上来说，任何图形化界面中的操作都可以用对应的命令行命令完成。如果你打开某个程序报错，不妨试试找到它的对应启动命令，在终端中执行此命令，并观察它运行时的错误日志输出，查阅相关资料，解决问题

终端操作基础

ls /some_path # 查看某个文件夹下的文件与子文件夹。/ 代表根目录，是 Linux 最顶端的路径，以此开头则为绝对路径

pwd # 查看当前终端所在路径

cd /home/testuser # 切换目录命令。将当前终端切换到某一个路径下

cp ./a.py ./b.py # 复制命令。将当前路径下的 a.py 复制一份并命名为 b.py。./ 代表当前文件夹所在路径，以此开头则为相对路径

cp -r ./a ./b # 复制整体文件夹

rm b.py # 删除命令。删除 b.py

mv a.py b.py # 移动（重命名）命令。将 a.py 更名为 b.py

mkdir my_folder # 新建名为 my_folder 的文件夹

sudo some_command # 使普通用户以 root 权限执行某些命令

参考：Linux 命令行与 Shell 脚本教程

vim 的使用

我们需要掌握一个能在终端中进行文本编辑的软件，这里介绍 vim。

创建并编辑名为 hello.txt 的文件：

vim hello.txt

此时可以看到进入了一个空的界面：

此时处在 vim 的 命令模式 。在 命令模式 下，可以用一些快捷指令来对文本进行操作

输入 a 进入 vim 的 编辑模式 ，此时即可输入任意文本进行编辑

在输入完成后按下 Esc 键，即可从 编辑模式 退出到 命令模式 。此时输入 :wq 即可保存并退出 vim

下面介绍一些在命令模式下常用的命令：

:wq —— 保存退出

:q! —— 不保存，强制退出

dd —— 删除一行

2dd —— 删除两行

gg —— 回到文本第一行

shift + g —— 转到文本最后一行

/xxx —— 在文中搜索 xxx 内容。回车 Enter 搜索，按 n 键转到下一个

?xxx —— 反向搜索

可以在终端中输入以下命令来学习完整的 vim 教程：

vimtutor

系统服务的介绍与操作

Linux 系统中运行着各种服务，你需要掌握查询，变更服务状态的方式。同时对创建服务最好也有大致的了解。

这里讲述命令 systemctl 的用法。以 dhcpcd 服务为例：

systemctl start dhcpcd # 启动服务

systemctl stop dhcpcd # 停止服务

systemctl restart dhcpcd # 重启服务

systemctl reload dhcpcd # 重新加载服务以及它的配置文件

systemctl status dhcpcd # 查看服务状态

systemctl enable dhcpcd # 设置开机启动服务

systemctl enable --now dhcpcd # 设置服务为开机启动并立即启动这个单元

systemctl disable dhcpcd # 取消开机自动启动

systemctl daemon-reload dhcpcd # 重新载入 systemd 配置。扫描新增或变更的服务单元、不会重新加载变更的配置

参考：

https://wiki.archlinux.org/index.php/Systemd#Basic_systemctl_usage

https://www.freedesktop.org/software/systemd/man/systemd.service.html#Examples

分区

查看硬盘

lsblk 或

fdisk -l

这里我们的硬盘是/dev/sda，一定要看清楚你的盘到底是哪块，请勿无脑复制粘贴，小心格式错盘造成数据丢失

新建分区

先给出最精简的分区表

Legacy Boot + MBR

一个EXT4格式的主分区挂载到“/”（根目录），用于存放系统、软件包和引导文件

一个SWAP格式的交换分区，即虚拟内存，大小一般 <= 电脑内存，这里是以分区形式使用，可用交换文件swapfile替代

![Legacy Boot + MBR 分区示例](images/i01-8d036076e27af2b7423ac976070a82b6.avif)

主板BIOS通过读取硬盘最开始保留扇区内的引导文件，引导到“/dev/sda1”上的GRUB2启动管理器，然后根据“/boot/grub/grub.cfg”文件的配置引导到Linux

UEFI Boot + GPT

还需要一个FAT32格式的ESP分区，挂载到“/boot/efi”，不用分太大，500m即可

![UEFI Boot + GPT 分区示例](images/i02-ddd7794f9e1b44a9e87cd86348aef973.avif)

home分区

另可添加 home 分区，挂载到“/home”，存放个人文件，系统滚挂后个人文件不会丢

![home 分区与分区工具示意图](images/i03-d40b6352c22918a63295a9faaa8ea461.avif)

可以用cfdisk /dev/sda进入伪图形界面进行分区，实在不会或有问题的，重启进WinPE启动盘用DiskGenius，删掉所有分区和保留扇区后进行分区

这里使用fdisk

fdisk /dev/sda

分别输入并回车：

m：查看帮助, 根据帮助进行分区

o：创建MBR分区表，如果你是 UEFI Boot + GPT，输入g

m：记性不好，再看一遍帮助

n：新建分区

p：新建主分区

1：新建第1个主分区，MBR分区表主分区默认能创建4个

2048（保持默认，直接回车）：新建主分区的开始扇区为2048

+20G：如果需要指定分区大小，如20G，就输入+20G，默认直接回车会占用整块硬盘

如需SWAP交换分区，重复4-8，如果拿捏不好分区大小，可以先n第2个p +2G, 再n第1个p直接回车

w：将分区表写入硬盘

格式化分区

创建好分区后，还需要格式化分区以创建文件系统

查看硬盘分区

lsblk 或

fdisk -l

这里我们是Legacy Boot + MBR环境，安装分区是/dev/sda1，使用交换文件，请勿无脑复制粘贴

把/dev/sda1格式化成EXT4：

mkfs.ext4 /dev/sda1

如果要使用交换分区，把/dev/sda2格式化成SWAP：

mkswap /dev/sda2

如果是UEFI Boot + GPT，把/dev/sda1格式化成SWAP：

mkfs.fat -F32 /dev/nvme0n1p2

上面给出的请勿无脑复制，需要对应上面图片的分区表按需调整

挂载分区

待会儿安装程序pacstrap会将系统文件安装到/mnt目录，因此我们需要挂载要存放系统文件的分区到/mnt目录：

mount /dev/sda1 /mnt

如果刚才只创建了一个分区/dev/sda1，想使用交换文件，执行下面的命令创建一个2048MB的swapfile到刚刚挂载的/mnt：

dd if=/dev/zero of=/mnt/swapfile bs=1M count=2048 status=progress

chmod 0600 /mnt/swapfile

mkswap -U clear /mnt/swapfile

swapon /mnt/swapfile

echo /mnt/swapfile none swap defaults 0 0 >>/etc/fstab

如果配置了home目录，还需：

mount /dev/sda2 /mnt/home

安装

换源

如果不换源，国内部分会慢得要死！！！

禁用 reflector 服务

在特定情况下，reflector会误删某些有用的源信息，这里进入安装环境后的第一件事就是将其禁用。

systemctl stop reflector.service

方式1

参考：http://mirrors.ustc.edu.cn/help/archlinux.html

vim /etc/pacman.d/mirrorlist

在文件的最顶端添加

Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch

Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch

Server = https://repo.huaweicloud.com/archlinux/$repo/os/$arch

Server = http://mirror.lzu.edu.cn/archlinux/$repo/os/$arch

方式2

用不成

使用命令

pacman-mirrors -i -c China -m rank

执行后会弹出一个对话框，可以选择ustc源

方式3

直接执行echo命令强制换成USTC源

echo "Server = https://mirrors.ustc.edu.cn/archlinux/\$repo/os/\$arch">/etc/pacman.d/mirrorlist

装必需包

安装 base 软件包和 Linux 内核以及常规硬件的固件（相比官方教程，增加了linux-headers和base-devel）

最新内核（会滚挂）：

pacstrap -K /mnt base linux linux-headers linux-firmware base-devel

lts稳定内核（推荐）：

pacstrap -K /mnt base linux-lts linux-lts-headers linux-firmware base-devel

可以将 linux 替换为其他内核软件包：

linux、linux-headers：Stable — 原版的 Linux 内核和模块，采用了一些补丁

linux-lts、linux-lts-headers：linux-lts — 受长期支持（LTS）的 Linux 内核和模块

参考：https://wiki.archlinuxcn.org/wiki/内核

linux-zen 内核不支持 nvidia 显卡

希望稳定使用，就选 linux-lts 内核

安装后仍然可以更换内核

在虚拟机或容器中安装时，可以不安装固件软件包 linux-firmware

配置

生成fstab

生成分区自动挂载 fstab 文件

genfstab -U /mnt >> /mnt/etc/fstab

用 -U 或 -L 选项设置 UUID 或卷标

刚才的虚拟内存文件会自动转换目录，即由/mnt/swapfile变为/swapfile

如需查看或更改更多挂载信息，如挂载ntfs分区，可以vim /mnt/etc/fstab

change root

改变根目录 chroot 到新安装的系统

arch-chroot /mnt

不能用chroot

此时，原来安装盘下的 /mnt 目录就变成了新系统的 / 目录

装常用包

pacman -S vim networkmanager dhcpcd iwd sudo bluez usbmuxd ttf-dejavu wqy-zenhei noto-fonts-emoji ntfs-3g sof-firmware

[x] vim：文本编辑器，可换为nano，更适合新手

[x] networkmanager：联网用，网络管理组件

[x] dhcpcd：联网用，DHCP动态获取IP地址需要

[x] iwd：作为networkmanager的backend进行使用，连WiFi需要

[x] sudo：非root用户暂时获取root权限需要

[x] bluez：蓝牙模块需要

[x] usbmuxd：usb连接手机共享网络需要

[x] ttf-dejavu：开源字体

[x] wqy-zenhei：中文字体，显示中文需要

[x] noto-fonts-emoji：emoji字体，显示表情包需要

[x] ntfs-3g：挂载ntfs磁盘需要

[x] sof-firmware：声卡支持

用软链接让vim替代vi

ln -s /bin/vim /bin/vi

改时区

设置时区为中国上海

ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

使用如下命令，生成 /etc/adjtime，将系统时间(UTC)同步到硬件时间：

hwclock --systohc

以下命令待测，无需理会：

timedatectl set-local-rtc 0

如需将硬件时间设置为 localtime，解决Windows下时间错乱输入（需要Boot到系统）

timedatectl set-local-rtc 1

如果不存在 /etc/adjtime，systemd 会假定硬件时间按 UTC 设置。

改地区

如果不安装图形界面，不推荐设置中文，否则会无法显示文字

推荐设置为en_GB.UTF-8

编辑 /etc/locale.gen，去掉 en_US.UTF-8 UTF-8 以及 zh_CN.UTF-8 UTF-8 行前的注释符号（#）

或执行以下命令

echo en_US.UTF-8 UTF-8>/etc/locale.gen

echo en_GB.UTF-8 UTF-8>>/etc/locale.gen

echo zh_CN.UTF-8 UTF-8>>/etc/locale.gen

locale-gen

echo LANG=en_GB.UTF-8>/etc/locale.conf

不推荐在此设置任何中文 locale，会导致 tty 乱码

而中文的问题，一般会通过修改 ~/.xprofile（DE） 或者 ~/.xinitrc（WM） 进行解决

改主机名

修改主机名（设备名称）为archlinux，可自行更换

echo archlinux >/etc/hostname

添加hosts信息

echo -e "127.0.0.1\tlocalhost\n::1\tlocalhost\n127.0.0.1\tarchlinux.localdomain archlinux">>/etc/hosts

改密码

为 root 用户设置密码

passwd

修复引导

安装相关软件包

pacman -S grub efibootmgr os-prober

-S 选项后指定要通过pacman包管理器安装的包：

[x] grub —— 启动引导器

[x] efibootmgr —— efibootmgr 被 grub 脚本用来将启动项写入 NVRAM

[x] os-prober —— 为了能够引导 win10，需要安装 os-prober 以检测到它

安装grub到硬盘，注意不是分区

grub-install /dev/sda

启用os-prober支持自动添加其他系统启动项（如果是单系统可忽略）

echo GRUB_DISABLE_OS_PROBER=false>>/etc/default/grub

或进行如下修改

vim /etc/default/grub

[x] 修改 GRUB_CMDLINE_LINUX_DEFAULT 一行等号后面的参数

[ ] （非必须）去掉最后的 quiet 参数，开启啰嗦模式

[ ] （非必须）把 loglevel 的数值从 3 改成 5。这样是为了后续如果出现系统错误，方便排错

[x] 加入 nowatchdog 参数，这可以显著提高开关机速度

[x] 为了引导 win10，则还需要添加新的一行 GRUB_DISABLE_OS_PROBER=false，启用os-prober支持自动添加其他系统启动项（如果是单系统可忽略）

最后生成 GRUB 所需的配置文件：

grub-mkconfig -o /boot/grub/grub.cfg

某些主板安装完成没有启动条目的解决方案：在默认启动路径下安装 GRUB

重新插入安装优盘，按原先顺序挂载目录（不需要再次创建文件夹了），chroot 到 /mnt，然后你可以直接把已经生成好的 efi 文件移动到默认目录下，如下命令所示：

mv /boot/EFI/grub /boot/EFI/BOOT

mv /boot/EFI/GRUB/grubx64.efi /boot/EFI/BOOT/BOOTX64.EFI

只有安装完成后你的主板不出现启动条目才需要尝试如下命令，正常安装无需执行

参考：https://wiki.archlinuxcn.org/wiki/GRUB/wiki/GRUB#缺省/后备启动路径

退出重启

exit

umount -R /mnt

reboot

启动

输入用户root，然后输入刚才设置的密码

联网

默认是不能联网的，需要执行：

systemctl enable --now NetworkManager

激活服务

systemctl start iwd

systemctl enable iwd

systemctl start systemd-resolved

systemctl enable systemd-resolved

systemctl enable bluetooth

systemctl enable NetworkManager

systemctl enable dhcpcd

配置

vim /etc/iwd/main.conf

[General]

EnableNetworkConfiguration=true

NameResolvingService=systemd

vim /etc/NetworkManager/NetworkManager.conf

[device]

wifi.backend=iwd

或用echo自动加入以上配置

echo -e "[General]\nEnableNetworkConfiguration=true\nNameResolvingService=systemd">/etc/iwd/main.conf

echo -e "[device]\nwifi.backend=iwd">>/etc/iwd/main.conf

重启后即可联网（仅WiFi，网线不用）

reboot

设备驱动

如果没有使用root用户登录，注意命令前需自行补上sudo，或直接sudo -i；大多数命令重启后生效，可以自行reboot

虚拟机

VirtualBox

pacman -S virtualbox-guest-utils

systemctl enable vboxservice.service

VMware

参考：https://wiki.archlinux.org/title/VMware/Install_Arch_Linux_as_a_guest

拖拽复制粘贴

pacman -S open-vm-tools gtkmm3

systemctl enable vmtoolsd

systemctl enable vmware-vmblock-fuse

systemctl start vmtoolsd

systemctl start vmware-vmblock-fuse

如果还不能复制（能复制可忽略）

使 vmware-user 在 X11 之后运行：

确保 /etc/xdg/autostart/vmware-user.desktop 存在（我的默认存在），如果文件不存在，请运行：

cp /etc/vmware-tools/vmware-user.desktop /etc/xdg/autostart/vmware-user.desktop

或添加 vmware-user 到 Xinitrc

文件不支持复制

时间同步

vmware-toolbox-cmd timesync enable

hwclock --hctosys --localtime

Xorg 配置（不使用桌面环境不用安装）

安装以下驱动和依赖

pacman -S xf86-input-vmmouse xf86-video-vmware mesa gtkmm gtk2

vim /etc/mkinitcpio.conf

通过 mkinitcpio.conf 加载以下模块：

MODULES=(vsock vmw_vsock_vmci_transport vmw_balloon vmw_vmci vmwgfx)

然后运行：

mkinitcpio -p linux

为了让 X server 拥有 root 权限来加载驱动，可能还需要编辑下面的配置：

vim /etc/X11/Xwrapper.config

needs_root_rights=yes

CPU微码

Intel CPU

pacman -S intel-ucode

AMD CPU

pacman -S amd-ucode

安装微码软件包后，重新生成 GRUB 配置以激活加载微码更新：

grub-mkconfig -o /boot/grub/grub.cfg

显卡驱动

Intel核显驱动

用Intel核显就装

pacman -S mesa lib32-mesa vulkan-intel lib32-vulkan-intel

不建议安装 xf86-video-intel，而应使用 Xorg 的 modesetting 驱动（也就是什么都不用装的意思）

注意，只有 Intel HD 4000 及以上的核显才支持 vulkan

AMD显卡驱动

在 TECHPOWERUP 进行查询显卡架构

用AMD显卡（GCN架构）的就装开源驱动 AMDGPU

pacman -S mesa lib32-mesa xf86-video-amdgpu vulkan-radeon lib32-vulkan-radeon

用ATI老显卡（GCN 1-2、HD 5000-2000、X1000及之前）的就装开源 ATI 驱动

pacman -S mesa lib32-mesa xf86-video-ati

Nvidia显卡驱动

![Nvidia 显卡驱动安装说明](images/i04-095fdd4bfc097b03ddbff882f90ea421.avif)

参考：https://wiki.archlinuxcn.org/wiki/NVIDIA

对于 Turing (NV160/TUXXX) 系列或更新的显卡，需要安装 nvidia-open 驱动

pacman -S nvidia-open nvidia-settings lib32-nvidia-utils

DKMS：

pacman -S nvidia-open-dkms nvidia-settings lib32-nvidia-utils

其他较新型号的独立显卡使用以下命令直接安装如下几个包即可：

pacman -S nvidia-open nvidia-settings lib32-nvidia-utils

DKMS：

pacman -S nvidia-dkms nvidia-settings lib32-nvidia-utils

如果是 GeForce 630 以下到 GeForce 400 系列的老卡，使用以下命令安装 nvidia-390xx-dkmsaur 及其 32 位支持包：

yay -S nvidia-390xx-dkms nvidia-settings lib32-nvidia-390xx-utils

注意这里使用了yay，需要配置archlinuxcn源

再老的显卡直接使用以下命令安装 开源驱动 即可：

pacman -S mesa lib32-mesa xf86-video-nouveau

如果刚才是lts内核就装

pacman -S mesa nvidia-lts nvidia-settings nvidia-utils nvidia-prime

nvidia-dkms 与 nvidia-lts 不兼容，如果装lts驱动的话无需安装dkms 。

nvidia 驱动的安装与前面选择的内核有关

如果你安装的是 linux-lts 内核，那么需要将nvidia更换为nvidia-lts

linux-zen 不支持nvidia显卡（务必对号入座）

如果你选择安装 linux 新内核，则需要在启动选项中添加ibt=off ，否则无法进入系统

双显卡

参考：

https://wiki.archlinuxcn.org/wiki/PRIME

https://github.com/Askannz/optimus-manager/wiki

https://arch.icekylin.online/guide/rookie/graphic-driver.html#双显卡-核显-独显

声卡驱动

PipeWire（推荐）

pacman -S pipewire alsa-utils pipewire-pulse pipewire-jack pipewire-alsa

PulseAudio

pacman -S alsa-utils pulseaudio pavucontrol

如有提示，选择默认（直接回车）

创建用户

添加一个名为user的用户进入wheel用户组，并将bash作为启动命令

useradd -m -G wheel -s /bin/bash user

设置user用户的密码

passwd user

配置wheel用户组的sudo权限

echo "%wheel ALL=(ALL:ALL) ALL">>/etc/sudoers

重启系统（如需继续安装GUI，可以不用重启）

reboot

此时的系统已经基本可以使用了，但是还没有配置图形界面，如果你不需要图形界面，就只需登陆user用户就可以使用了

注意：从这里开始，如果登陆的是普通用户，所有的pacman和systemctl等修改到系统的命令都需要加sudo

如果嫌麻烦，可以：

echo alias pacman='sudo pacman'>>~/.bashrc

echo alias systemctl='sudo systemctl'>>~/.bashrc

GUI

参考：https://wiki.archlinuxcn.org/wiki/建议阅读#图形界面

换成中文

echo LANG=zh-CN.UTF-8>/etc/locale.conf

安装窗口图形系统

窗口图形系统有两种选择：Xorg（X11）和Wayland

Wayland是比较先进的，虽然可以使用 Wayland 启动 KDE Plasma，但仍存在一些缺失的功能和已知问题。建议使用 Xorg 以获得最完整和稳定的体验

执行下面命令安装 Xorg 的一些组件：

pacman -S xorg xorg-server xorg-apps xorg-xinit xorg-xclock xterm

如有提示，选择默认（直接回车）

安装完成后，可执行 startx 测试 Xorg 是否正常工作。（执行 exit 退出 Xorg 测试界面）

安装桌面环境

安装桌面环境前，请确保安装xorg和声卡驱动

KDE

执行下面命令 一次性安装全部 KDE Plasma 应用：（可选）

pacman -S plasma sddm kde-applications

systemctl enable sddm

下面是安装个人喜欢的一些 KDE 应用，执行

pacman -S plasma sddm dolphin konsole kate kcalc kscreen ark okular spectacle gwenview

systemctl enable sddm

reboot

一条一条执行，如有提示，选择默认（直接回车）

[x] plasma：桌面环境

[x] sddm：登录管理器，KDE配套的

[x] dolphin：文件管理器

[x] konsole：kde下的终端，功能多但是比较慢，也可以使用其他终端：

[ ] alacritty

[ ] kitty

[x] kate：文本编辑器，很强大，但是资料比较少，需要自己配置

[x] vim：刚才已经装过了

[ ] neovim、gvim、nano

[ ] gedit

[ ] （sublime,vscode需要在AUR源或者Clansty源中安装）

[x] kcalc：计算器

[x] kscreen：屏幕修改分辨率和刷新率

[x] ark：解压与压缩

[x] okular：PDF查看器

[x] spectacle：截图工具，上面三件套配合KDE很方便

[x] gwenview：看图工具

KDE 全部应用详见 https://apps.kde.org/zh-cn/

执行下面命令安装 Firefox

sudo pacman -S firefox

一次性安装全部中文字体

sudo pacman -S wqy-microhei wqy-microhei-lite wqy-bitmapfont wqy-zenhei ttf-arphic-ukai ttf-arphic-uming ttf-sarasa-gothic adobe-source-han-sans-cn-fonts adobe-source-han-serif-cn-fonts noto-fonts-cjk

[x] wqy-microhei

[x] wqy-microhei-lite

[x] wqy-bitmapfont

[x] wqy-zenhei

[x] ttf-arphic-ukai

[x] ttf-arphic-uming

[x] ttf-sarasa-gothic

[x] adobe-source-han-sans-cn-fonts

[x] adobe-source-han-serif-cn-fonts

[x] noto-fonts-cjk

GNOME

pacman -S gnome

systemctl enable gdm

reboot

i3

略

软件

添加archlinuxcn源，并配置yay

还要添加 Arch Linux CN 源，这个不添加会导致pacman无法安装yay

sudo vim /etc/pacman.conf

在文件末尾添加：

[archlinuxcn]

SigLevel = Optional TrustAll

Server = https://mirrors.ustc.edu.cn/archlinuxcn/$arch

SigLevel 那一行如果后面安装 archlinuxcn-keyring 时不会报错的话，可以不加

取消这两行前面的注释，不然有一部分32位包无法安装

# [muiltilib]

# Include = /etc/pacman.d/mirrorlist

安装 archlinuxcn-keyring 包导入 GPG key

sudo pacman -Syyu

sudo pacman -S archlinuxcn-keyring

从 AUR 安装软件包，需要先安装 AUR Helper，这里以最有名的 yay 为例。

使用pacman安装yay：

sudo pacman -S yay

使用下面命令安装 yay（Binary 版本，无需自己编译）：

pacman -S --needed git base-devel

git clone https://aur.archlinux.org/yay-bin.git

cd yay-bin

makepkg -si

软件包管理器简介

Pacman

在 archlinux 上安装的软件都通过 Pacman 来进行管理

更新系统

sudo pacman -Syyu

更新软件包数据库

sudo pacman -Syy

更新已安装的软件

sudo pacman -Syu

查看不需要的包

sudo pacman -Qtd

安装软件

sudo pacman -S 软件名

搜索软件

sudo pacman -Ss 软件名

搜索安装的所有软件包，grep只显示指定软件名

sudo pacman -Q|grep 软件名

卸载软件包并删除配置文件

sudo pacman -Rsunc 软件名

yay

yay 是一个用 Go 语言开发的 AUR Helper，具有高级依赖解决、PKGBUILD 下载、AUR 包名自动补全、移除生成依赖等功能。

参考：https://github.com/Jguer/yay

安装 AUR 软件

yay 的用法和 Pacman 是基本一样的。有额外几条常用命令：

yay # 等同于 yay -Syu

yay 软件名 # 等同于 yay -Ss 软件名 && yay -S 软件名

yay -Ps # 打印系统统计信息

yay -Yc # 清理不需要的依赖

注意：执行 yay 的所有命令时，前面不需要加 sudo

下面举几个安装 AUR 软件的例子：

yay -S microsoft-edge-stable-bin #安装 Microsoft Edge

yay -S wps-office-cn wps-office-mui-zh-cn ttf-wps-fonts #安装 WPS Office

yay -S visual-studio-code-bin #安装 Visual Studio Code

所有 AUR 软件可在 https://aur.archlinux.org/ 上查询

更新/升级 AUR 软件

执行下面命令更新 AUR 软件包数据库：

yay -Syy

备注：其中 -S 表示 sync（同步），-y 表示从服务器下载新的软件包数据库，-yy 表示强制更新软件包数据库。

执行下面命令，更新 AUR 软件包数据库并升级所有已安装的软件包：

yay -Syyu

备注：-u 表示 upgrade（升级）。

一般情况下，执行

yay -Syyu

即可。

卸载 AUR 软件

个人建议卸载 AUR 软件时，连所有依赖项和配置文件一起删除。

执行下面命令即可：

yay -Rscnu 包名

备注：-R 表示 Remove（移除），-s 删除不需要的依赖关系，-c（cascade）删除软件包及所有依赖于此的软件包，-n 表示 nosave（删除配置文件），-u 表示 unneeded（删除不需要的软件包）。

搜索 AUR 软件

执行下面命令搜索在线 AUR 软件包：

yay -Ss 关键词

执行下面命令搜索本地 AUR 软件包：

yay -Qs 关键词 #模糊匹配

yay -Q 包名 #精确匹配

备注：-Q 表示 Query（查询），-s 表示 search（搜索）。

安装本地软件包

执行下面命令安装本地软件包：

yay -U 软件包路径

清理无用软件包与缓存

执行下面命令清理安装包缓存：

yay -Scc

执行下面命令清理孤立软件包：

yay -Rscnu $(yay -Qdtq)

本文仅讨论了 yay 的常用命令，如果需要查询所有命令，可执行

yay --help

显示 yay 的帮助信息。

使用yay安装软件必须先安装打包工具，不然安装会在prepare阶段出错！！！

sudo pacman -S base-devel

此外，还可以使用图形化的包管理软件（Pacman / yay 的图形前端）Octopi。

yay -S octopi

安装中文拼音输入法

云拼音

yay -S manjaro-asian-input-support-fcitx5 fcitx5 fcitx5-configtool fcitx5-chinese-addons fcitx5-qt fcitx5-gtk

搜狗拼音

yay -S fcitx fcitx-configtool fcitx-qt5 manjaro-asian-input-support-fcitx fcitx-sogoupinyin

两个任选一个就行了，建议用云拼音。

安装zsh

通过以下命令安装 zsh 相关的包：

sudo pacman -S zsh zsh-autosuggestions zsh-syntax-highlighting zsh-completions

[x] zsh-autosuggestions —— 命令自动补全插件

[x] zsh-syntax-highlighting —— 语法上高亮插件

[x] zsh-completions —— 补充补全定义

安装 autojump 插件：

sudo pacman -S autojump

更改账户的默认 Shell：

非 root 账户

# 查看安装了哪些 Shell

chsh -l

# 修改当前账户的默认 Shell

chsh -s /usr/bin/zsh

root（可以不为 root 账户更改默认 shell）

chsh -l # 查看安装了哪些 Shell

sudo chsh -s /usr/bin/zsh root

注销并重新登录 > 打开终端，此时会弹出如下界面进行设置：

按下 0 将创建一个只包含注释的 ~/.zshrc 文件，在下次启动时不会再次弹出设置选项。

按下 1 即可进入设置：根据提示完成设置即可。也可以创建一个只包含注释的 ~/.zshrc 文件以使用默认值。

若希望重新设置，只需要把 ~/.zshrc 文件删掉即可。

为了让插件生效，需要修改 ~/.zshrc。使用 vim 编辑 ~/.zshrc 文件：

vim ~/.zshrc

将以下内容分别添加到需要设置 zsh 账户的 ~/.zshrc 中：

source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh

source /usr/share/autojump/autojump.zsh

关闭并重新打开终端

适合安装的软件

字体管理器：

sudo pacman -S font-manager

U盘启动镜像：

yay -S ventoy-bin

谷歌浏览器：

sudo pacman -S google-chrome

网页APP管理器：

yay -S webapp-manager

百度网盘：

yay -S baidunetdisk-bin

远程桌面：

yay -S remmina

远程登录：

yay -S teamviewer

下载工具：

sudo pacman -S motrix

md文档编辑器：

sudo pacman -S typora

文本编辑器：

sudo pacman -S kate

wps，安装时版本选择建议选2(本地版，可登录wps云同步文档)：

yay -S wps-office-cn wps-office-mui-zh-cn ttf-wps-fonts

媒体播放器：

yay -S qmplay2

网易云音乐：

sudo pacman -S netease-cloud-music

图像处理：

sudo pacman -S gimp

画图：

yay -S pinta

krita画图：

yay -S karita

录屏：

yay -S vokoscreen

专业录屏：

yay -S obs-studio

音频处理：

yay -S audacity

火焰截图：

sudo pacman -S flameshot

安装 Windows 10 字体

挂载 Win10 镜像

Win10 镜像可从 https://next.itellyou.cn/ 下载。

下载完成后就要挂载 Win10 镜像了。

执行下面命令创建挂载点：

sudo mkdir /mnt/iso

然后执行下面命令挂载 Win10 镜像：

sudo mount -o loop 镜像路径 /mnt/iso

备注：-o 表示 options（选项），参数 loop 表示将一个文件作为硬盘分区挂载

解压 Win10 镜像

挂载完成后，需要安装 wimlib/wimtools 来解压 install.wim/install.esd 文件。请根据自己使用的发行版选择命令安装：

sudo pacman -S wimlib #Arch/Manjaro/... 安装命令

sudo apt install wimtools #Debian/Ubuntu/Deepin/UOS/... 安装命令

sudo yum install wimlib #RedHat/CentOS/Fedora/... 安装命令

先创建一个用于临时放置字体的文件夹：

mkdir Win10Fonts

执行命令，解压 install.wim/install.esd 中的 Fonts 文件夹**（原版 Win10 镜像一般是 install.wim）**：

sudo wimextract /mnt/iso/sources/install.wim 1 /Windows/Fonts --dest-dir=Win10Fonts

#适用 install.wim

sudo wimextract /mnt/iso/sources/install.esd 1 /Windows/Fonts --dest-dir=Win10Fonts

#适用 install.esd

安装 Win10 字体

在系统字体目录新建一个文件夹用于存放 Win10 字体：

sudo mkdir /usr/share/fonts/Win10Fonts

将解压得到的 ttf、ttc 字体复制到系统字体目录：

sudo cp -r Win10Fonts/*.ttf /usr/share/fonts/Win10Fonts/

sudo cp -r Win10Fonts/*.ttc /usr/share/fonts/Win10Fonts/

更改权限：

sudo chmod 644 /usr/share/fonts/Win10Fonts/*

刷新字体缓存：

sudo fc-cache -fv

试着打开一下 WPS Office，那些熟悉的 Windows 字体是不是出现了呢？

笔记本推荐安装TLP电源管理

sudo pacman -S tlp tlp-rdw

yay -S tlpui

启动tlp服务

sudo systemctl enable tlp.service

sudo systemctl enable NetworkManager-dispatcher.service

# 屏蔽以下服务以避免冲突，确保 TLP 无线设备的开关选项可以正确运行

sudo systemctl mask systemd-rfkill.service

sudo systemctl mask systemd-rfkill.socket

安装后，TLP 将在开机时自动启动。为了避免第一次重启系统，可以使用以下命令手动启动：

sudo tlp start

检查 TLP 工作状态

tlp-stat -s

注意看输出结果，它会要求输入其他的命令，照输就行。

检查要不要安装附加组件

sudo tlp-stat -b

按照输出用yay安装就行了

使用 TLP 显示相关系统信息

sudo tlp-stat -b # 显示电池信息

sudo tlp-stat -d # 显示磁盘信息

sudo tlp-stat -e # 显示 PCI 设备信息

sudo tlp-stat -g # 显示 GPU 信息

sudo tlp-stat -p # 显示 CPU 信息

tlp-stat -s # 显示系统数据信息 / 验证 TLP 服务运行状况

参考：https://arch.icekylin.online/guide/advanced/power-ctl.html

避免关机时间过长

编辑系统配置文件

sudo vim /etc/systemd/system.conf

将文件中的DefaultTimeoutStartSec和DefaultTimeoutStopSec改成5s

DefaultTimeoutStartSec=5s

DefaultTimeoutStopSec=5s

最后执行 daemon-reload 使其生效。

sudo systemctl daemon-reload

上述解决方案其实只是将这个等待时间缩小了，并没有解决实际问题。如果你想排查问题真正的原因所在，耐心等待其结束关机，然后重新启动电脑，执行以下命令：

journalctl -p5

按/(斜杠键)搜索Killing关键字，找到你关机的时间附近所在的匹配行，你可以在附近看到到底是哪一个进程导致了 timeout,然后再去排查这个进程有什么问题即可。

启动时打开数字锁定键

参考：https://wiki.archlinuxcn.org/wiki/启动时打开数字锁定键

参考：

https://wiki.archlinuxcn.org/

https://arch.icekylin.online/

https://zhuanlan.zhihu.com/p/513859236


潇然工作室的 Arch Linux 安装笔记（作者自用整理、持续修正中），是中文环境下相当完整的一份从零安装 Arch 的实操记录，覆盖准备、分区、安装、配置、引导、驱动、桌面与常用软件全流程。作者观点：Arch 适合学习 Linux 系统结构，日常使用建议 Manjaro，生产服务器推荐 Debian。要点归纳：

**安装准备**
- 判断引导方式：`ls /sys/firmware/efi/efivars`——UEFI 输出一堆变量，Legacy 报错
- 联网：网线即插即用；WiFi 用 `iwctl`（device list → station wlan0 scan → get-networks → connect）
- 校时：`timedatectl set-timezone Asia/Shanghai` + `set-ntp true`

**Linux 基础与终端教学**：文件系统树、绝对/相对路径；root 与普通用户权限；ls/pwd/cd/cp/rm/mv/mkdir/sudo 等命令；vim 操作（`a` 编辑、`:wq` 保存、dd/gg/G）；systemd 服务管理（`systemctl start/stop/enable/status`）。

**分区**
- Legacy + MBR：EXT4 根分区 + SWAP（或 swapfile 替代）；UEFI + GPT：额外 FAT32 ESP（500M，挂 `/boot/efi`）；可选独立 home 分区，系统滚挂不丢个人文件
- 工具 `cfdisk` / `fdisk`（m/o/n/p/w）；反复提醒看清盘符、勿无脑复制命令导致错盘
- 格式化挂载：`mkfs.ext4` / `mkswap` / `mkfs.fat -F32`，挂到 `/mnt`；交换文件方案用 `dd` + `chmod 0600` + `mkswap -U clear` + `swapon` 并写入 fstab

**安装与配置**：`pacstrap -K` 装 base + 内核（作者推荐 linux-lts 稳定内核，linux-zen 不支持 Nvidia）；`genfstab -U` 生成 fstab；`arch-chroot` 进系统；装常用包（vim/networkmanager/iwd/sudo/中文字体等）；时区上海、locale 建议 en_GB.UTF-8（装 GUI 前不设中文避免 tty 乱码）、主机名、root 密码；GRUB 引导（grub-install + 启用 os-prober 引导 Win10，主板不识别时用后备启动路径修复）；重启后 `systemctl enable --now NetworkManager`、iwd 配置联网。

**驱动与硬件**：VirtualBox/VMware 虚拟机工具；Intel/AMD CPU 微码；显卡驱动分 Intel 核显（mesa+vulkan，不装 xf86-video-intel）、AMD（GCN 架构装 AMDGPU，老卡 ATI 开源驱动）、Nvidia（Turing+ 用 nvidia-open，老卡 nvidia-390xx-dkms，lts 内核对应 nvidia-lts，双显卡参考 PRIME/optimus-manager）；声卡推荐 PipeWire。

**桌面与软件**：Xorg（建议 Xorg 而非 Wayland，稳定）；KDE（plasma+sddm）与 GNOME、i3；archlinuxcn 源 + yay（AUR 助手，含常见软件安装示例）；fcitx5 云拼音/搜狗输入法；zsh 配置（autojump、语法高亮）；Win10 字体提取安装；笔记本 TLP 电源管理；关机超时调优（DefaultTimeoutStopSec=5s）；数字锁定键等小优化。

收藏价值：一份可直接照着做的 Arch 安装手册，命令齐全且包含大量避坑提示（内核/显卡/Nvidia/GRUB 引导等）。


`Arch Linux` `安装教程` `Linux基础` `分区` `GRUB` `显卡驱动` `yay` `潇然工作室`

---
*本文由书签分类整理自动生成。*
