# 申请 AlphaSSL 通配符域名证书 | Jovialchap

> 分类：书签 · NAS与自建服务 ｜ 来源：个人博客文章

![jovialchap.com 站点图标](images/i01-116_favicon.avif)


- 原始地址：<https://jovialchap.com/apply-moeclub-alphassl/>

## 原文全文

**更新：** 萌咖商店及其证书申请接口现已下线，本文仅作为历史记录保留，不再建议照此操作。需要免费通配符证书时，可参考「使用 acme.sh 申请通配符证书」。

![AlphaSSL 题图](images/i02-01-alphassl.avif)

**背景**

一直以来，我使用的都是 Let's Encrypt、ZeroSSL 等免费申请的 90 天证书。虽然现在有可以实现自动续期的脚本（acme.sh+crontab），同时一些主机管理面板也提供有自动续期 SSL 证书的功能。但是配置起来难免比较麻烦，况且若对于每一个子域名都需要进行重复的配置，这就显得有些多余了。所以，我选择了萌咖的 AlphaSSL 通配符证书。

**证书购买**

萌咖大佬的博客几年前已经关闭，当时其商店曾提供 AlphaSSL 证书购买服务；该服务目前已经下线。

![萌咖杂货铺](images/i03-02-email.avif)

注册账号并购买之后，从网页导航栏"产品服务->我的服务"进入，点击刚才购买的服务，进去之后在"产品信息"一栏就可以看到申请 SSL 证书所需要的 API Token 了。

**前期准备**

萌咖提供了两种获取证书的方式：内置 API（无需收电子邮件）、电子邮箱获取。

由于我使用的是 Cloudflare 的 DNS 解析服务，在域名后台可以使用 Cloudflare 推出的 Email Routing 服务进行邮箱转发，这样就不必再自行搭建一个邮局系统了。

![Email Routing 配置](images/i04-03-dns.avif)

具体配置可以上网搜索，因为配置比较简单，这里不多赘述。除了以上这些，还需要注意以下两点：

1. 删除所有 CAA 解析记录 或 添加值为 `0 issuewild "globalsign.com"` 的 CAA 解析记录；
2. 暂停解析 CNAME 记录, 否则可能会无法收到证书确认邮件。

一切准备就绪后，当时可通过萌咖提供的 CSR 工具生成所需要的 CSR 文件；该工具目前已经下线。在该页面填写需要申请的通配符域名后，点击"Generate CSR"即可生成 CSR 文件。在本地新建文件"CSR.txt"、"private.txt"后，将生成的信息分别填入这两个文件中。

**申请证书**

在申请证书前，请再次确保自己已经完成了前期准备，确认 admin 开头的邮箱地址是否能正常收到邮件，同时确认是否保存了 CSR 和 Private Key。当时可通过萌咖证书申请接口提交，该接口目前已经下线。

在上方的表单中填写刚刚保存的 CSR 文件的内容，Apply Token 即为刚刚所购买的 Token。

![申请证书表单](images/i05-04-final.avif)

填写完成，点击"Get AlphaSSL!"并等待接收确认邮件。接收到邮件之后，点击里面的链接，确认信息后点击"I APPROVE"按钮确认申请。随后便会在邮箱里收到一封带有你证书信息的邮件，证书在邮件尾部。并将其保存在本地，命名为"certificate.txt"。

**结尾**

至此你手上应该有如下文件：

- CSR.txt
- private.txt
- certificate.txt

最后，我们还需要一个中间证书用于补全 SSL 证书链。将以下内容保存为"inter.txt"文件：

```
-----BEGIN CERTIFICATE-----
MIIEijCCA3KgAwIBAgIQfU1CqStDHX5kU+fBmo1YdzANBgkqhkiG9w0BAQsFADBX
MQswCQYDVQQGEwJCRTEZMBcGA1UEChMQR2xvYmFsU2lnbiBudi1zYTEQMA4GA1UE
CxMHUm9vdCBDQTEbMBkGA1UEAxMSR2xvYmFsU2lnbiBSb290IENBMB4XDTIyMTAx
MjAzNDk0M1oXDTI3MTAxMjAwMDAwMFowTDELMAkGA1UEBhMCQkUxGTAXBgNVBAoT
EEdsb2JhbFNpZ24gbnYtc2ExIjAgBgNVBAMTGUFscGhhU1NMIENBIC0gU0hBMjU2
IC0gRzQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCtJCmVZhWIPzOH
A3jP1QwkuDFT8/+DImyZlSt85UpZwq7G0Sqd+n8gLlHIZypQkad5VkT7OLU+MI78
lC7LVwxpU19ExlaWL67ANyWG8XHx3AJFQoZhuDbvUeNzRQyQs6XS5wN6uDlF0Bf1
AtCUQWrGGLGYwyC1xTrzgrFKpESsIXMqklUGTsh8i7DKZhRUVfgrPLJUkbbLUrLY
42+KRCiwfSvBloC5PgDYnj3oMZ1aTe3Wfk3l1I4D3RKaJ4PU1qHXhHJOge2bjGIG
l6MsaBN+BB2sr6EnxX0xnMIbew2oIfOFoLqs47vh/GH4JN0qql2WBHfDPVDm3b+G
QxY6N/LXAgMBAAGjggFbMIIBVzAOBgNVHQ8BAf8EBAMCAYYwHQYDVR0lBBYwFAYI
KwYBBQUHAwEGCCsGAQUFBwMCMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYE
FE/LrKjC76vdg29rv86YPVxYJXYVMB8GA1UdIwQYMBaAFGB7ZhpFDZfKiVAvfQTN
NKj//P1LMHoGCCsGAQUFBwEBBG4wbDAtBggrBgEFBQcwAYYhaHR0cDovL29jc3Au
Z2xvYmFsc2lnbi5jb20vcm9vdHIxMDsGCCsGAQUFBzAChi9odHRwOi8vc2VjdXJl
Lmdsb2JhbHNpZ24uY29tL2NhY2VydC9yb290LXIxLmNydDAzBgNVHR8ELDAqMCig
JqAkhiJodHRwOi8vY3JsLmdsb2JhbHNpZ24uY29tL3Jvb3QuY3JsMCEGA1UdIAQa
MBgwCAYGZ4EMAQIBMAwGCisGAQQBoDIKAQMwDQYJKoZIhvcNAQELBQADggEBABol
9nNkiECpWQenQ7oVP1FhvRX/LWTdzXpdMmp/SELnEJhoOe+366E0dt8tWGg+ezAc
DPeGYPmp83nAVLeDpji7Nqu8ldB8+G/B6U9GB8i2DDIAqSsFEvcMbWb5gZ2/DmRN
cifGi9FKAuFu2wyft4s4DHwzL2CJ2zjMlUOM3RaE1cxuOs+Om6MCD9G7vnkAtSiC
/OOfHO902f4yI2a48K+gKaAf3lISFXjd32pwQ21LpM3ueIGydaJ+1/z8nv+C7SUT
5bHoz7cYU27LUvh1n2WSNnC6/QwFSoP6gNKa4POO/oO13xjhrLRHJ/04cKMbRALt
JWQkPacJ8SJVhB2R7BI=
-----END CERTIFICATE-----
```

最后，如果需要的话，可以将上述的 .txt 后缀改成 .crt 与 .key。然后将这些文件配置在你的网站上。这一步使用搜索引擎即可，不多赘述。


本文是 Jovialchap 记录通过"萌咖杂货铺"申请 **AlphaSSL 通配符证书**（GlobalSign 签发）的完整流程。核心价值在于通配符证书一张即可覆盖所有子域名，免去像 Let's Encrypt/ZeroSSL 那样每个子域重复配置续期。流程：在萌咖商店购买后取 API Token → 准备 Cloudflare Email Routing 接收证书邮件（并删 CAA 或加 `0 issuewild "globalsign.com"`、暂停 CNAME 解析）→ 用 CSR 工具生成 CSR/私钥 → 提交申请后邮件点 I APPROVE 确认 → 收到证书邮件保存为 certificate.txt，再用文末给出的 GlobalSign AlphaSSL 中间证书（inter.txt）补全证书链。**重要提醒：萌咖商店及申请接口现已全部下线，本文仅作历史参考；如今申请免费通配符证书应改用 acme.sh 方案。**


`AlphaSSL` `通配符证书` `SSL` `GlobalSign` `CSR` `萌咖` `acme.sh` `Cloudflare`

---
*本文由书签分类整理自动生成。*
