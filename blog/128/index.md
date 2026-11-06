# 雷池waf设置默认站点防止证书泄露/屏蔽CENSYS等扫描 | Record LOGS

> 分类：书签 · NAS与自建服务 ｜ 来源：技术博客文章

![Record LOGS 站点图标](images/i01-118_favicon.avif)


- 原始地址：<https://www.recordlogs.com/2023/05/28/safeline-waf-default-site/>

## 原文全文

**简介**

雷池 waf，在面板上不能设置默认站点，这就导致了直接访问 `https://your_ip` 会导致 443 端口返回的 SSL 证书暴露你 IP 对应的域名。攻击者可能会从 CENSYS 等搜索与域名相关的 IP 地址，并尝试从中找出源服务器的地址，进行进一步的探测，绕过 CDN/Cloud WAF 的防护，甚至进行泛洪攻击，会对安全性造成严重影响。

**配置雷池的 Tengine**

Tengine 作为雷池 WAF 的 7 层服务器，我们需要在雷池的安装目录（即第一次使用 docker 安装雷池时填写的目录）中，找到 Tengine (Nginx) 的目录，如 `/data/safeline/resources/nginx`。找到 Nginx 目录后，在 `sites-enabled` 下存放着各个站点的配置文件，打开其中一个，如 `IF_backend_1`，在文件最后增加如下的配置文件：

```
server {
    listen 80 default_server;
    listen [::]: 80 default_server;
    listen 443 ssl default_server;
    listen [::]: 443 ssl default_server;
    ssl_certificate /etc/nginx/certs/de.pem;
    ssl_certificate_key /etc/nginx/certs/de.key;
    #此处可更改为444或其他未定义代码，403会返回雷池拦截页面
    location / {
        return 418 ;
    }
    access_log /etc/nginx/logs/de.log;
}
```

接下来，你需要确保 `/etc/nginx/certs/de.pem` 和 `/etc/nginx/certs/de.key` 以及 `/etc/nginx/logs` 的存在。SafeLine 的容器中，`/etc/nginx` 被映射为安装目录，如 `/data/safeline/resources/nginx`，所以你需要在 `/data/safeline/resources/nginx` 中创建 logs 目录，并在 certs 下放入默认证书。一张空的自签名证书示例如下，可以作为默认证书使用（密钥在前，证书在后）：

**de.pem**

```
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDXyF6m81zOeoOPvfk6nGKtyfczRG6/yeSkcc+66vGvq0s8oB7V
cCzLl1YcNsru3ixelPR2z1zvjKqa9/Aqh8+TvP1kGGbLD/mynjnj8l+0vVzZ+vnz
AH0RN9fpqzlpHmFBHQzQ25AtIAH8pXOL1541YN0TNPRA3kHUCL0FH8CkwwIDAQAB
AoGAQ4ejh6AV5VCWJ8AOZXdXsofIYzUBa+glNAmiNx8b8BwteZWq0KVAf56nBkFn
lQXW4OrA7wXKUfW11rXNZaIHJePJXv1swkN9+Em18Hon6BrtcqnKAwzAbhok3SzY
IVjI/zrgOABH6+ii77xCRBzI1itVPNN88DAUHC7PYLYiaaECQQD7PSoij37+kMc/
wPeEkl9r3vzU0OrsCsjU8Ev714OaoL/SIuAh6nsiRh9rcbUrrpGSSzIcmsk9HMDa
hXBNkNl5AkEA298yQvssaUc4tbEWxAVfd9DsHJdCdbXfgf9Dy5/tpCzYncY7T0du
VVHqKu3jXWoMc5XlesiCOerU/DIlMM8dGwJBANQn7GLO5iC1xWvS2bF7oVSIMtzL
pvW4jaszWBbNAPccc59RkA9T4LMqn/GtTZ4bhhYRpbl+BB21IC3nrNPzU5ECQG8T
Ln0QDruQs2F2eR3F6RjKfr1i3LxCiQtPPZycypzp2vS5tDS0zVRk8XuGehoy/N9X
lnqU2NURgU92tbsWpokCQQDdc9tU3B/OM/YfzUNwvOLmUVwrJX6PFSFsOn+XHrCC
q9LcGEAHyzaf5GEWje84ee4rkv5oaZcwll3dg4IioBnC
-----END RSA PRIVATE KEY-----
```

**de.csr**

```
-----BEGIN CERTIFICATE-----
MIIBkjCB/AIJAI3bCYqa39hiMA0GCSqGSIb3DQEBBQUAMA0xCzAJBgNVBAYTAiAg
MCAXDTE4MTEyNDA5MDMzOFoYDzIwOTkxMjMxMDkwMzM4WjANMQswCQYDVQQGEwIg
IDCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEA18hepvNcznqDj735Opxircn3
M0Ruv8nkpHHPuurxr6tLPKAe1XAsy5dWHDbK7t4sXpT0ds9c74yqmvfwKofPk7z9
ZBhmyw/5sp454/JftL1c2fr58wB9ETfX6as5aR5hQR0M0NuQLSAB/KVzi9eeNWDd
EzT0QN5B1Ai9BR/ApMMCAwEAATANBgkqhkiG9w0BAQUFAAOBgQBiqHZsuVP09ubT
GzBSlAFEoqbM63sU51nwQpzkVObgGm9v9nnxS8Atid4be0THsz8nVjWcDym3Tydp
lznrhoSrHyqAAlK3/WSMwyuPnDCNM5g1RdsV40TjZXk9/md8xWxGJ6n1MoBdlK8T
H6h2ROkf59bb096TttB8lxXiT0uiDQ==
-----END CERTIFICATE-----
```

另外记得创建 Logs 目录。

**重启雷池 Tengine 使配置生效**

你需要重启 Tengine 使配置生效，值得注意的是，雷池的 Tengine 配置文件在容器重启后或更改了站点配置，会重新生成新的配置文件并覆盖，所以需要在雷池容器内执行 `nginx -t`，检查无误后执行 `nginx -s reload` 命令重启 nginx。建议备份配置文件至其他目录，在重启服务器、容器，或更改了站点配置后，需要重新覆盖配置文件并在容器内重启 nginx。以下是如何操作的示例：

```
$ sudo docker ps -a
CONTAINER ID   IMAGE                                 COMMAND                   STATUS                NAMES
7ef59a03fe31   chaitin/safeline-tengine:latest       "docker-entrypoint.s…"    Up 4 days (healthy)   safeline-tengine
ff8c5af19387   chaitin/safeline-mario:latest         "/mario/entrypoint.sh"    Up 2 days (healthy)   safeline-mario
0172e26fe8f5   postgres:15.2                          "docker-entrypoint.s…"    Up 4 days             safeline-postgres
1b857054f8bd   chaitin/safeline-fvm-manager:latest   "/app/entrypoint.sh"      Up 4 days             safeline-fvm-manager
78f39efeb529   chaitin/safeline-mgt-api:latest       "/app/entrypoint.sh"      Up 4 days             0.0.0.0:9443->1443/tcp   safeline-mgt-api
54b84762b2a6   chaitin/safeline-detector:latest      "/detector/entrypoin…"    Up 4 days (healthy)   8000-8001/tcp             safeline-detector
$ sudo docker container exec -it 7ef59a03fe31 /bin/bash
root@bj-0002-TS:/# nginx -t
nginx: [warn] conflicting server name "" on 0.0.0.0:443, ignored
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
root@bj-0002-TS:/# nginx -s reload
root@bj-0002-TS:/# exit
```

配置完毕后，直接访问 IP 地址或不存在的网站，则会返回一个空证书，并且拦截返回 418 状态码。


本文解决雷池 WAF（SafeLine，chaitin 出品）的一个安全短板：面板不支持设置"默认站点"，导致直接用 `https://你的IP` 访问时 443 端口会返回真实站点 SSL 证书，暴露源站域名，给 CENSYS 等测绘扫描、绕过 CDN 防护甚至泛洪攻击留下隐患。解法是在雷池 Tengine（Nginx）的 `sites-enabled` 中新增 `default_server` 配置块：80/443 全端口收默认站点、挂一张自签名空证书（de.pem/de.csr）、`location /` 返回 418 并单独记日志。关键坑：Tengine 配置在容器重启或站点变更后会被重新生成覆盖，所以需备份配置，并在容器内 `nginx -t` 校验后 `nginx -s reload` 使生效。配置后访问 IP 将返回空证书 + 418，不再泄露域名。对自建 WAF 反测绘很有实战价值。原文无正文配图，此处以站点图标作本地配图。


`雷池WAF` `SafeLine` `Tengine` `Nginx` `默认站点` `证书泄露` `CENSYS` `反测绘`

---
*本文由书签分类整理自动生成。*
