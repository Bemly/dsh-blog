# ROOT后安卓用户证书偷渡为系统证书 - Chr_小屋

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2021-05-26 01:46:05 ｜ 分类依据：标题关键词匹配

## 原始链接

<https://blog.chrxw.com/archives/2019/07/08/270.html>

## 原文全文

**前言**

安卓7.0开始更改了信任策略，所以有的应用无法通过安装抓包软件的证书来抓取HTTPS的数据包，因为新式安卓应用默认只信任系统证书。

![小黑盒不能联网](images/i01-1674799589.avif)

新版小黑盒就无法直接使用Fiddler抓包，如果勾选了HTTPS解密并安装了证书就会无法通讯。

**应对**

- 降级APP
- 降级系统版本
- 将用户证书偷渡成系统证书，需要有root权限。这里将介绍这种方法。

**操作方法**

安卓系统证书跟Fiddler证书的格式不一样，需要转换。

1. 安装OPENSSL【前往官网】
2. 导出Fiddler证书

![导出证书](images/i02-3922884416.avif)

- 查看证书哈希

  `openssl x509 -inform DER -subject_hash_old -in FiddlerRoot.cer`

  圈出来的就是证书的哈希了。

![查看哈希](images/i03-3672827838.avif)

- 转换证书

  `openssl x509 -inform DER -in FiddlerRoot.cer -text > [哈希].0`

- 用记事本编辑证书

  将 -----BEGIN CERTIFICATE----- 到 -----END CERTIFICATE----- 的部分放到文件最前面

- 将证书放到手机的 `/system/etc/security/cacerts/` 下

- 重启手机，可以看到Fiddler的证书已经变成系统证书了，接下来就可以愉快的抓包了

![凭据列表](images/i04-1192323839.avif)

**后记**

请不要在自己的主力机上这么做，可能有安全隐患。


Chr_小屋（blog.chrxw.com）的一篇安卓抓包技术教程（2019-07 发布，2019-11 最后修改），核心是把 Fiddler 的用户证书"偷渡"为系统证书，从而绕过安卓 7.0+ 对 HTTPS 抓包的限制。

- **问题根源**：安卓 7.0 起应用默认只信任系统证书，用户安装的抓包证书不再被普通应用信任，导致新版小黑盒等 App 勾选 HTTPS 解密并安装证书后无法通讯
- **解决思路**：既然系统信任系统证书，就把 Fiddler 证书转换成系统证书格式（计算 subject_hash_old 得到哈希作为文件名，内容改为 PEM 格式）并放入 `/system/etc/security/cacerts/`
- **关键步骤**：安装 OpenSSL → 导出 FiddlerRoot.cer → 用 `openssl x509 -inform DER -subject_hash_old` 计算哈希 → 用 `openssl x509 ... -text` 转 PEM 存为 `[哈希].0` → 编辑器调整证书内容顺序 → 拷入系统证书目录 → 重启生效
- **安全提示**：作者明确提醒不要在主力机上这么做，改系统证书存在安全隐患

收藏价值：适合 Root 设备 + Fiddler 抓包场景；方法依赖 root 权限，实操前建议先做备份。该篇属于安卓安全/抓包技术，与"NAS 与自建服务"分类关联较弱，可考虑归入安全工具 / 安卓技术类。


`安卓` `Root` `Fiddler` `抓包` `HTTPS` `系统证书`

---
*本文由书签分类整理生成，2026-11-01 精修。*
