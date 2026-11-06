# 我的 Synology NAS 使用哪种 CPU？

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2022-12-06 15:39:55 ｜ 来源：Synology 知识中心（kb.synology.cn）

![Synology 站点图标](images/i01-079_favicon.avif)


- 原始地址：<https://kb.synology.cn/zh-cn/DSM/tutorial/What_kind_of_CPU_does_my_NAS_have>


# 我的 Synology 存储系统使用什么类型的 CPU？

## 目的
您可以在下方的表格中找到每台 Synology 存储系统所使用的 CPU 型号、封装架构和内存类型。

> **提示**：

您所在地区可能未提供某些型号。要了解更多信息，请联系您当地的经销商。

## PAS 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| PAS7700 | AMD EPYC 7443P | 24 | 48 | 是 | x86_64 | Epyc7003 | DDR4 ECC RDIMM 64 GB |

## FS 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| FS6420 | AMD EPYC 7303 | 16 | 32 | 是 | x86_64 | Epyc7003 | DDR4 ECC RDIMM 64 GB |
| FS6400 | Intel Xeon Silver 4110 x 2 | 8 | 16 | 是 | x86_64 | Purley | DDR4 ECC RDIMM 32 GB |
| FS3600 | Intel Xeon D-1567 | 12 | 24 | 是 | x86_64 | Broadwellnk | DDR4 ECC RDIMM 16 GB |
| FS3420 | Intel Xeon D-1739 | 8 | 16 | 是 | x86_64 | Icelaked | DDR4 ECC RDIMM 32 GB |
| FS3410 | Intel Xeon D-1541 | 8 | 16 | 是 | x86_64 | Broadwellnkv2 | DDR4 ECC RDIMM 16 GB |
| FS3400 | Intel Xeon D-1541 | 8 | 16 | 是 | x86_64 | Broadwell | DDR4 ECC RDIMM 16 GB |
| FS3017 | Intel Xeon E5-2620 v3 x 2 | 6 | 12 | 是 | x86_64 | Grantley | DDR4 ECC RDIMM 64 GB |
| FS2500 | AMD Ryzen V1780B | 4 | 8 | 是 | x86_64 | V1000 | DDR4 ECC UDIMM 8 GB |
| FS2017 | Intel Xeon D-1541 | 8 | 16 | 是 | x86_64 | Broadwell | DDR4 ECC RDIMM 16 GB |
| FS1018 | Intel Pentium D1508 | 2 | 4 | 是 | x86_64 | Broadwellnk | DDR4 ECC SODIMM 8 GB |
| FS200T | Intel Celeron J4125 | 4 | 4 | 是 | x86_64 | Geminilakenk | DDR4 4GB |

## HD 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| HD6500 | Intel Xeon Silver 4210R x 2 | 10 | 20 | 是 | x86_64 | Purley | DDR4 ECC RDIMM 64 GB |

## SA 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| SA6400 | AMD EPYC 7272 | 12 | 24 | 是 | x86_64 | Epyc7002 | DDR4 ECC RDIMM 32 GB |
| SA3610 | Intel Xeon D-1567 | 12 | 24 | 是 | x86_64 | Broadwellnkv2 | DDR4 ECC RDIMM 16 GB |
| SA3600 | Intel Xeon D-1567 | 12 | 24 | 是 | x86_64 | Broadwellnk | DDR4 ECC RDIMM 16 GB |
| SA3410 | Intel Xeon D-1541 | 8 | 16 | 是 | x86_64 | Broadwellnkv2 | DDR4 ECC RDIMM 16 GB |
| SA3400 | Intel Xeon D-1541 | 8 | 16 | 是 | x86_64 | Broadwellnk | DDR4 ECC RDIMM 16 GB |
| SA3400D | Intel Xeon D-1541 x 2 | 8 | 16 | 是 | x86_64 | Broadwellntbap | DDR4 ECC UDIMM 8 GB x 2 |
| SA3200D | Intel Xeon D-1521 x 2 | 4 | 8 | 是 | x86_64 | Broadwellntbap | DDR4 ECC UDIMM 8 GB x 2 |

## x26 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS11626xs+ | AMD EPYC 7303 | 16 | 32 | 是 | x86_64 | Epyc7003 | DDR4 ECC RDIMM 64 GB |
| RS6426xs+ | Intel Xeon D-1739 | 8 | 16 | 是 | x86_64 | Icelaked | DDR4 ECC RDIMM 16 GB |
| RS4826xs+ | Intel Xeon D-1739 | 8 | 16 | 是 | x86_64 | Icelaked | DDR4 ECC RDIMM 16 GB |
| RS3626xs | Intel Xeon D-1726 | 6 | 12 | 是 | x86_64 | Icelaked | DDR4 ECC UDIMM 8 GB |
| RS1626xs+ | Intel Xeon D-1726 | 6 | 12 | 是 | x86_64 | Icelaked | DDR4 ECC RDIMM 16 GB |
| RS1226+ RS1226RP+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000nk | DDR4 ECC SODIMM 4 GB |
| RS826+ RS826RP+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000 | DDR4 ECC SODIMM 4 GB |

## x25 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS2825RP+ | AMD Ryzen V1780B | 4 | 8 | 是 | x86_64 | V1000nk | DDR4 ECC UDIMM 8 GB |
| DS1825+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000nk | DDR4 ECC SODIMM 8 GB |
| DS1825neo+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000nk | DDR4 Non-ECC SODIMM 4 GB |
| DS1525+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000nk | DDR4 ECC SODIMM 8 GB |
| DS1525neo+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000nk | DDR4 Non-ECC SODIMM 4 GB |
| DS925+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000nk | DDR4 ECC SODIMM 4 GB |
| DS925neo+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000nk | DDR4 Non-ECC SODIMM 4 GB |
| DS725+ | AMD Ryzen R1600 | 2 | 4 | 是 | x86_64 | R1000nk | DDR4 ECC SODIMM 4 GB |
| DS725neo+ | AMD Ryzen R1600 | 2 | 4 | 是 | x86_64 | R1000nk | DDR4 Non-ECC SODIMM 4 GB |
| DS425+ | Intel Celeron J4125 | 4 | 4 | 是 | x86_64 | Geminilakenk | DDR4 2 GB |
| DS225+ | Intel Celeron J4125 | 4 | 4 | 是 | x86_64 | Geminilakenk | DDR4 2 GB |

## x24 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| DS224+ | Intel Celeron J4125 | 4 | 4 | 是 | x86_64 | Geminilake | DDR4 2 GB |
| DS124 | Realtek RTD1619B | 4 | 4 | 是 | armv8 | rtd1619b | DDR4 1 GB |

## x23 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS2423RP+II | AMD Ryzen V1780B | 4 | 8 | 是 | x86_64 | V1000nk | DDR4 ECC UDIMM 8 GB |
| RS2423RP+ | AMD Ryzen V1780B | 4 | 8 | 是 | x86_64 | V1000 | DDR4 ECC UDIMM 8 GB |
| RS2423+ | AMD Ryzen V1780B | 4 | 8 | 是 | x86_64 | V1000 | DDR4 ECC UDIMM 8 GB |
| DS1823xs+ | AMD Ryzen V1780B | 4 | 8 | 是 | x86_64 | V1000 | DDR4 ECC SODIMM 8 GB |
| DS923+ | AMD Ryzen R1600 | 2 | 4 | 是 | x86_64 | R1000 | DDR4 ECC SODIMM 4 GB |
| DS723+ | AMD Ryzen R1600 | 2 | 4 | 是 | x86_64 | R1000 | DDR4 ECC SODIMM 2 GB |
| DS423+ | Intel Celeron J4125 | 4 | 4 | 是 | x86_64 | Geminilake | DDR4 2 GB |
| DS423 | Realtek RTD1619B | 4 | 4 | 是 | armv8 | rtd1619b | DDR4 2 GB |
| DS223 | Realtek RTD1619B | 4 | 4 | 是 | armv8 | rtd1619b | DDR4 2 GB |

## x22 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| DVA1622 | Intel Celeron J4125 | 4 | 4 | 是 | x86_64 | Geminilake | DDR4 6GB |
| RS822+ RS822RP+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000 | DDR4 ECC SODIMM 2 GB |
| RS422+ | AMD Ryzen R1600 | 2 | 4 | 是 | x86_64 | R1000 | DDR4 ECC 2 GB |
| DS3622xs+ | Intel Xeon D-1531 | 6 | 12 | 是 | x86_64 | Broadwellnk | DDR4 ECC SODIMM 16 GB |
| DS2422+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000 | DDR4 ECC SODIMM 4 GB |
| DS1522+ | AMD Ryzen R1600 | 2 | 4 | 是 | x86_64 | R1000 | DDR4 ECC SODIMM 8 GB |

## x21 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS4021xs+ | Intel Xeon D-1541 | 8 | 16 | 是 | x86_64 | Broadwellnk | DDR4 ECC UDIMM 16 GB |
| RS3621xs+ | Intel Xeon D-1541 | 8 | 16 | 是 | x86_64 | Broadwellnk | DDR4 ECC UDIMM 8 GB |
| RS3621RPxs | Intel Xeon D-1531 | 6 | 12 | 是 | x86_64 | Broadwellnk | DDR4 ECC UDIMM 8 GB |
| RS2821RP+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000 | DDR4 ECC UDIMM 4 GB |
| RS2421+ RS2421RP+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000 | DDR4 ECC UDIMM 4 GB |
| RS1221+ RS1221RP+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000 | DDR4 ECC SODIMM 4 GB |
| DS1821+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000 | DDR4 ECC SODIMM 4 GB |
| DS1621xs+ | Intel Xeon D-1527 | 4 | 8 | 是 | x86_64 | Broadwellnk | DDR4 ECC SODIMM 8 GB |
| DS1621+ | AMD Ryzen V1500B | 4 | 8 | 是 | x86_64 | V1000 | DDR4 ECC SODIMM 4 GB |
| DVA3221 | Intel Atom C3538 | 4 | 4 | 是 | x86_64 | Denverton | DDR4 非 ECC SODIMM 8 GB |

## x20 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS820+ RS820RP+ | Intel Atom C3538 | 4 | 4 | 是 | x86_64 | Denverton | DDR4 非 ECC 2 GB |
| DS1520+ | Intel Celeron J4125 | 4 | 4 | 是 | x86_64 | Geminilake | DDR4 8 GB |
| DS920+ | Intel Celeron J4125 | 4 | 4 | 是 | x86_64 | Geminilake | DDR4 4 GB |
| DS720+ | Intel Celeron J4125 | 4 | 4 | 是 | x86_64 | Geminilake | DDR4 2 GB |
| DS620slim | Intel Celeron J3355 | 2 | 2 | 是 | x86_64 | Apollolake | DDR3L SODIMM 2 GB |
| DS420+ | Intel Celeron J4025 | 2 | 2 | 是 | x86_64 | Geminilake | DDR4 2 GB |
| DS420j | Realtek RTD1296 | 4 | 4 | 是 | armv8 | rtd1296 | DDR4 1 GB |
| DS220+ | Intel Celeron J4025 | 2 | 2 | 是 | x86_64 | Geminilake | DDR4 2 GB |
| DS220j | Realtek RTD1296 | 4 | 4 | 是 | armv8 | rtd1296 | DDR4 512 MB |
| DS120j | Marvell A3720 | 2 | 2 | 是 | armv8 | armada37xx | DDR3 512 MB |

## x19 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS1619xs+ | Intel Xeon D-1527 | 4 | 8 | 是 | x86_64 | Broadwellnk | DDR4 ECC UDIMM 8 GB |
| RS1219+ | Intel Atom C2538 | 4 | 4 | 是 | x86_64 | Avoton | DDR3 2 GB |
| RS819 | Realtek RTD1296 | 4 | 4 | 是 | armv8 | rtd1296 | DDR4 2 GB |
| DS2419+II | Intel Atom C3538 | 4 | 4 | 是 | x86_64 | Denverton | DDR4 非 ECC SODIMM 4 GB |
| DS2419+ | Intel Atom C3538 | 4 | 4 | 是 | x86_64 | Denverton | DDR4 非 ECC SODIMM 4 GB |
| DS1819+ | Intel Atom C3538 | 4 | 4 | 是 | x86_64 | Denverton | DDR4 非 ECC SODIMM 4 GB |
| DS1019+ | Intel Celeron J3455 | 4 | 4 | 是 | x86_64 | Apollolake | DDR3L SODIMM 8 GB |
| DS419slim | Marvell Armada 385 88F6820 | 2 | 2 | 是 | ARMv7 | armada38x | DDR3L 512 MB |
| DS119j | Marvell A3720 | 2 | 2 | 是 | armv8 | armada37xx | DDR3L 256 MB |
| DVA3219 | Intel Atom C3538 | 4 | 4 | 是 | x86_64 | Denverton | DDR4 非 ECC SODIMM 4 GB |

## x18 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS3618xs | Intel Xeon D-1521 | 4 | 8 | 是 | x86_64 | Broadwell | DDR4 ECC UDIMM 8 GB |
| RS2818RP+ | Intel Atom C3538 | 4 | 4 | 是 | x86_64 | Denverton | DDR4 非 ECC UDIMM 4 GB |
| RS2418+ RS2418RP+ | Intel Atom C3538 | 4 | 4 | 是 | x86_64 | Denverton | DDR4 非 ECC UDIMM 4 GB |
| RS818+ RS818RP+ | Intel Atom C2538 | 4 | 4 | 是 | x86_64 | Avoton | DDR3 2 GB |
| DS3018xs | Intel Pentium D1508 | 2 | 4 | 是 | x86_64 | Broadwellnk | DDR4 SODIMM 8 GB |
| DS1618+ | Intel Atom C3538 | 4 | 4 | 是 | x86_64 | Denverton | DDR4 非 ECC SODIMM 4 GB |
| DS918+ | Intel Celeron J3455 | 4 | 4 | 是 | x86_64 | Apollolake | DDR3L SODIMM 4 GB |
| DS718+ | Intel Celeron J3455 | 4 | 4 | 是 | x86_64 | Apollolake | DDR3L SODIMM 2 GB |
| DS418 | Realtek RTD1296 | 4 | 4 | 是 | armv8 | rtd1296 | DDR4 2 GB |
| DS418play | Intel Celeron J3355 | 2 | 2 | 是 | x86_64 | Apollolake | DDR3L SODIMM 2 GB |
| DS418j | Realtek RTD1293 | 2 | 2 | 是 | armv8 | rtd1296 | DDR4 1 GB |
| DS218+ | Intel Celeron J3355 | 2 | 2 | 是 | x86_64 | Apollolake | DDR3L SODIMM 2 GB |
| DS218 | Realtek RTD1296 | 4 | 4 | 是 | armv8 | rtd1296 | DDR4 2 GB |
| DS218play | Realtek RTD1296 | 4 | 4 | 是 | armv8 | rtd1296 | DDR4 1 GB |
| DS218j | Marvell Armada 385 88F6820 | 2 | 2 | 是 | ARMv7 | Armada38x | DDR3 512 MB |
| DS118 | Realtek RTD1296 | 4 | 4 | 是 | armv8 | rtd1296 | DDR4 1 GB |

## x17 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS18017xs+ | Intel Xeon D-1531 | 6 | 12 | 是 | x86_64 | Broadwell | DDR4 ECC RDIMM 16 GB |
| RS4017xs+ | Intel Xeon D-1541 | 8 | 16 | 是 | x86_64 | Broadwell | DDR4 ECC UDIMM 8 GB |
| RS3617xs+ | Intel Xeon D-1531 | 6 | 12 | 是 | x86_64 | Broadwell | DDR4 ECC UDIMM 8 GB |
| RS3617RPxs | Intel Xeon D-1521 | 4 | 8 | 是 | x86_64 | Broadwell | DDR4 ECC UDIMM 8 GB |
| RS3617xs | Intel Xeon E3-1230 v2 | 4 | 8 | 是 | x86_64 | Bromolow | DDR3 ECC 4 GB |
| RS217 | Marvell Armada 385 88F6820 | 2 | 2 | 是 | ARMv7 | Armada38x | DDR3 512 MB |
| DS3617xsII | Intel Xeon D-1527 | 4 | 8 | 是 | x86_64 | Broadwell | DDR4 ECC SODIMM 16 GB |
| DS3617xs | Intel Xeon D-1527 | 4 | 8 | 是 | x86_64 | Broadwell | DDR4 ECC SODIMM 16 GB |
| DS1817+ | Intel Atom C2538 | 4 | 4 | 是 | x86_64 | Avoton | DDR3 2 GB/8 GB |
| DS1817 | Annapurna Labs Alpine AL-314 | 4 | 4 | 是 | armv7 | Alpine | DDR3L 4 GB |
| DS1517+ | Intel Atom C2538 | 4 | 4 | 是 | x86_64 | Avoton | DDR3 2 GB/8 GB |
| DS1517 | Annapurna Labs Alpine AL-314 | 4 | 4 | 是 | armv7 | Alpine | DDR3L 2 GB |

## x16 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS18016xs+ | Intel Xeon E3-1230 v2 | 4 | 8 | 是 | x86_64 | Bromolow | DDR3 ECC 8 GB |
| RS2416+ RS2416RP+ | Intel Atom C2538 | 4 | 4 | 是 | x86_64 | Avoton | DDR3 2 GB |
| RS816 | Marvell Armada 385 88F6820 | 2 | 2 | 是 | ARMv7 | Armada38x | DDR3 1 GB |
| DS916+ | Intel Pentium N3710 | 4 | 4 | 是 | x86_64 | Braswell | DDR3 2 GB/8 GB |
| DS716+II | Intel Celeron N3160 | 4 | 4 | 是 | x86_64 | Braswell | DDR3 2 GB |
| DS716+ | Intel Celeron N3150 | 4 | 4 | 是 | x86_64 | Braswell | DDR3 2 GB |
| DS416 | Annapurna Labs Alpine AL-212 | 2 | 2 | 是 | armv7 | Alpine4k | DDR3 1 GB |
| DS416play | Intel Celeron N3060 | 2 | 2 | 是 | x86_64 | Braswell | DDR3 1 GB |
| DS416j | Marvell Armada 388 88F6828 | 2 | 2 | 是 | ARMv7 | Armada38x | DDR3 512 MB |
| DS416slim | Marvell Armada 385 88F6820 | 2 | 2 | 是 | ARMv7 | Armada38x | DDR3 512 MB |
| DS216+II | Intel Celeron N3060 | 2 | 2 | 是 | x86_64 | Braswell | DDR3 1 GB |
| DS216+ | Intel Celeron N3050 | 2 | 2 | 是 | x86_64 | Braswell | DDR3 1 GB |
| DS216 | Marvell Armada 385 88F6820 | 2 | 2 | 是 | ARMv7 | Armada38x | DDR3 512 MB |
| DS216play | STM STiH412 | 2 | 2 | 是 | ARMv7 | Monaco | DDR3 1 GB |
| DS216j | Marvell Armada 385 88F6820 | 2 | 2 | 是 | ARMv7 | Armada38x | DDR3 512 MB |
| DS216se | Marvell Armada 370 88F6707 | 1 | 1 | 是 | ARMv7 | Armada370 | DDR3 256 MB |
| DS116 | Marvell Armada 385 88F6820 | 2 | 2 | 是 | ARMv7 | Armada38x | DDR3 1 GB |

## x15 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS815+ RS815RP+ | Intel Atom C2538 | 4 | 4 | 是 | x86_64 | Avoton | DDR3 2 GB |
| RS815 | Marvell Armada XP MV78230 | 2 | 2 | 是 | ARMv7 | Armadaxp | DDR3 1 GB |
| RC18015xs+ | Intel Xeon E3-1230 v2 | 4 | 8 | 是 | x86_64 | Bromolow | DDR3 ECC 8 GB |
| DS3615xs | Intel Core i3-4130 | 2 | 4 | 是 | x86_64 | Bromolow | DDR3 ECC 4 GB |
| DS2415+ | Intel Atom C2538 | 4 | 4 | 是 | x86_64 | Avoton | DDR3 2 GB |
| DS2015xs | Annapurna Labs Alpine AL-514 | 4 | 4 | 是 | armv7 | Alpine | DDR3 4 GB |
| DS1815+ | Intel Atom C2538 | 4 | 4 | 是 | x86_64 | Avoton | DDR3 2 GB |
| DS1515+ | Intel Atom C2538 | 4 | 4 | 是 | x86_64 | Avoton | DDR3 2 GB |
| DS1515 | Annapurna Labs Alpine AL-314 | 4 | 4 | 是 | armv7 | Alpine | DDR3 2 GB |
| DS715 | Annapurna Labs Alpine AL-314 | 4 | 4 | 是 | armv7 | Alpine | DDR3 2 GB |
| DS415+ | Intel Atom C2538 | 4 | 4 | 是 | x86_64 | Avoton | DDR3 2 GB |
| DS415play | Intel Atom CE5335 | 2 | 4 | 是 | i686 | Evansport | DDR3 1 GB |
| DS215+ | Annapurna Labs Alpine AL-212 | 2 | 2 | 是 | armv7 | Alpine4k | DDR3 1 GB |
| DS215j | Marvell Armada 375 88F6720 | 2 | 2 | 是 | ARMv7 | Armada375 | DDR3 512 MB |
| DS115 | Marvell Armada 375 88F6720 | 2 | 2 | 是 | ARMv7 | Armada375 | DDR3 512 MB |
| DS115j | Marvell Armada 370 88F6707 | 1 | 1 | 是 | ARMv7 | Armada370 | DDR3 256 MB |

## x14 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS3614xs+ | Intel Xeon E3-1230 v2 | 4 | 8 | 是 | x86_64 | Bromolow | DDR3 ECC 8 GB |
| RS3614xs RS3614RPxs | Intel Core i3-4130 | 2 | 4 | 是 | x86_64 | Bromolow | DDR3 ECC 4 GB |
| RS2414+ RS2414RP+ | Intel Atom D2700 | 2 | 4 | 是 | x86_64 | Cedarview | DDR3 2 GB |
| RS814+ RS814RP+ | Intel Atom D2700 | 2 | 4 | 是 | x86_64 | Cedarview | DDR3 2 GB |
| RS814 | Marvell Armada XP MV78230 | 2 | 2 | 是 | ARMv7 | Armadaxp | DDR3 1 GB |
| RS214 | Marvell Armada 370 88F6707 | 1 | 1 | 是 | ARMv7 | Armada370 | DDR3 512 MB |
| DS414 | Marvell Armada XP MV78230 | 2 | 2 | 是 | ARMv7 | Armadaxp | DDR3 1 GB |
| DS414j | Mindspeed Comcerto C2000 | 2 | 2 | 是 | ARMv7 | Comcerto2k | DDR3 512 MB |
| DS414slim | Marvell Armada 370 88F6707 | 1 | 1 | 是 | ARMv7 | Armada370 | DDR3 512 MB |
| DS214+ | Marvell Armada XP MV78230 | 2 | 2 | 是 | ARMv7 | Armadaxp | DDR3 1 GB |
| DS214 | Marvell Armada XP MV78230 | 2 | 2 | 是 | ARMv7 | Armadaxp | DDR3 512 MB |
| DS214play | Intel Atom CE5335 | 2 | 4 | 是 | i686 | Evansport | DDR3 1 GB |
| DS214se | Marvell Armada 370 88F6707 | 1 | 1 | 是 | ARMv7 | Armada370 | DDR3 256 MB |
| DS114 | Marvell Armada 370 88F6707 | 1 | 1 | 是 | ARMv7 | Armada370 | DDR3 512 MB |

## x13 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS10613xs+ | Intel Xeon E3-1230 v2 | 4 | 8 | 是 | x86_64 | Bromolow | DDR3 ECC 8 GB |
| RS3413xs+ | Intel Xeon E3-1230 v2 | 4 | 8 | 是 | x86_64 | Bromolow | DDR3 ECC 8 GB |
| DS2413+ | Intel Atom D2700 | 2 | 4 | 是 | x86_64 | Cedarview | DDR3 2 GB |
| DS1813+ | Intel Atom D2700 | 2 | 4 | 是 | x86_64 | Cedarview | DDR3 2 GB |
| DS1513+ | Intel Atom D2700 | 2 | 4 | 是 | x86_64 | Cedarview | DDR3 2 GB |
| DS713+ | Intel Atom D2700 | 2 | 4 | 是 | x86_64 | Cedarview | DDR3 1 GB |
| DS413 | Freescale P1022 | 2 | 2 | 是 | ppc | Qoriq | DDR3 1 GB |
| DS413j | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 512 MB |
| DS213+ | Freescale P1022 | 2 | 2 | 是 | ppc | Qoriq | DDR3 512 MB |
| DS213 | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 512 MB |
| DS213air | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 256 MB |
| DS213j | Marvell Armada 370 88F6707 | 1 | 1 | 是 | ARMv7 | Armada370 | DDR3 512 MB |

## x12 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS3412xs RS3412RPxs | Intel Core i3-2100 | 2 | 4 | 是 | x86_64 | Bromolow | DDR3 ECC 2 GB |
| RS2212+ RS2212RP+ | Intel Atom D2700 | 2 | 4 | 是 | x86_64 | Cedarview | DDR3 1 GB |
| RS812+ RS812RP+ | Intel Atom D2700 | 2 | 4 | 是 | x86_64 | Cedarview | DDR3 1 GB |
| RS812 | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 512 MB |
| RS212 | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 256 MB |
| DS3612xs | Intel Core i3-2100 | 2 | 4 | 是 | x86_64 | Bromolow | DDR3 ECC 2 GB |
| DS1812+ | Intel Atom D2700 | 2 | 4 | 是 | x86_64 | Cedarview | DDR3 1 GB |
| DS1512+ | Intel Atom D2700 | 2 | 4 | 是 | x86_64 | Cedarview | DDR3 1 GB |
| DS712+ | Intel Atom D425 | 1 | 2 | 是 | x86_64 | X86 | DDR3 1 GB |
| DS412+ | Intel Atom D2700 | 2 | 4 | 是 | x86_64 | Cedarview | DDR3 1 GB |
| DS212+ | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 512 MB |
| DS212 | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 256 MB |
| DS212j | Marvell Kirkwood 88F6281 | 1 | 1 | ✗ | armv5 | 88f628x | DDR2 256 MB |
| DS112+ | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 512 MB |
| DS112 | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 256 MB |
| DS112j | Marvell Kirkwood 88F6702 | 1 | 1 | ✗ | armv5 | 88f628x | DDR2 128 MB |

## x11 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS3411xs RS3411RPxs | Intel Core i3-2100 | 2 | 4 | 是 | x86_64 | Bromolow | DDR3 ECC 2 GB |
| RS2211+ RS2211RP+ | Intel Atom D525 | 2 | 4 | 是 | x86_64 | X86 | DDR2 1 GB |
| RS411 | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 256 MB |
| DS3611xs | Intel Core i3-2100 | 2 | 4 | 是 | x86_64 | Bromolow | DDR3 ECC 2 GB |
| DS2411+ | Intel Atom D525 | 2 | 4 | 是 | x86_64 | X86 | DDR2 1 GB |
| DS1511+ | Intel Atom D525 | 2 | 4 | 是 | x86_64 | X86 | DDR2 1 GB |
| DS411+II | Intel Atom D525 | 2 | 4 | 是 | x86_64 | X86 | DDR2 1 GB |
| DS411+ | Intel Atom D510 | 2 | 4 | 是 | x86_64 | X86 | DDR2 1 GB |
| DS411 | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 512 MB |
| DS411j | Marvell Kirkwood 88F6281 | 1 | 1 | ✗ | armv5 | 88f628x | DDR2 128 MB |
| DS411slim | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 256 MB |
| DS211+ | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 512 MB |
| DS211 | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 256 MB |
| DS211j | Marvell Kirkwood 88F6281 | 1 | 1 | ✗ | armv5 | 88f628x | DDR2 128 MB |
| DS111 | Marvell Kirkwood 88F6282 | 1 | 1 | ✗ | armv5 | 88f628x | DDR3 256 MB |

## x10 系列

| 型号 | CPU 型号 | 核心数 （单一 CPU） | 线程数 （单一 CPU） | FPU | CPU架构 | 套件架构 | RAM |
|---|---|---|---|---|---|---|---|
| RS810+ RS810RP+ | Intel Atom D510 | 2 | 4 | 是 | x86_64 | X86 | DDR2 1 GB |
| DS1010+ | Intel Atom D510 | 2 | 4 | 是 | x86_64 | X86 | DDR2 1 GB |
| DS710+ | Intel Atom D410 | 1 | 2 | 是 | x86_64 | X86 | DDR2 1 GB |
| DS410 | Freescale MPC8533E | 1 | 1 | 是 | PowerPC | Ppc853x | DDR 512 MB |
| DS410j | Marvell Kirkwood 88F6281 | 1 | 1 | ✗ | armv5 | 88f628x | DDR2 128 MB |
| DS210+ | Freescale MPC8533E | 1 | 1 | 是 | PowerPC | Ppc853x | DDR 512 MB |
| DS210j | Marvell Kirkwood 88F6281 | 1 | 1 | ✗ | armv5 | 88f628x | DDR2 128 MB |
| DS110+ | Freescale MPC8533E | 1 | 1 | 是 | PowerPC | Ppc853x | DDR 512 MB |
| DS110j | Marvell Kirkwood 88F6281 | 1 | 1 | ✗ | armv5 | 88f628x | DDR2 128 MB |


- 页面性质：Synology 官方知识中心（KB）的一篇**查询型文档**，用于按型号查每台群晖 NAS 使用的 CPU 型号、封装架构与内存类型，是判断机型性能、套件兼容性（套件架构）和升级选型的第一手资料。
- 关键字段解读：**套件架构（Package Architecture）**决定哪些 DSM 套件可用（如 Bromolow / Cedarview / Icelaked / Epyc7003 等）；**FPU 是否支持**影响浮点计算类套件；**CPU 架构**区分 x86_64 / armv5 / PowerPC，跨架构的 `.spk` 套件不能混装。
- 规律小结：企业级机型（FS/SA/HD/UC/x26 系列）普遍使用 Intel Xeon / AMD EPYC，支持 ECC 内存；家用机型（DS/RS 入门级）多为 Intel Atom / Celeron / Marvell ARM，内存多为非 ECC 板载/SO-DIMM；近年新机型（22 系列起）已转向 Intel Pentium/Celeron（Geminilake 等）。
- 实用场景：① 升级内存前确认 RAM 规格与是否 ECC；② 确认是否支持 Docker/虚拟机（通常需 x86_64）；③ 二手购机时对照 CPU 判断性价比；④ 查找黑群晖对应引导/套件架构。
- 图片情况：原文为纯表格型知识页，无正文配图；本笔记补充了站点图标与官方 Logo 作为配图。


`Synology` `NAS` `CPU型号` `套件架构` `知识中心` `DSM` `硬件规格`

---
*本笔记由书签任务人工核对整理，正文表格完整转录自 Synology 知识中心原文。*
