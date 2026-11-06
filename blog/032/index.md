# 解决雷池 WAF 重定向问题 | 潇然工作室

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-11 22:31:38 ｜ 分类依据：域名归属映射

![www.xrgzs.top 站点图标](https://www.google.com/s2/favicons?domain=www.xrgzs.top&sz=128)

## 原始链接

<https://www.xrgzs.top/posts/safeline-waf-redirect-rules>

## 原文全文

解决雷池 WAF 重定向问题 | 潇然工作室

解决雷池 WAF 重定向问题

问题

![源站 → 雷池 WAF → Cloudflare CDN 的接入拓扑](images/i01-waf-redirect-topology.avif)

源站服务器是 HTTP Only 的，通过 8000 端口接入雷池 WAF，然后接入 Cloudflare CDN

这里假设源站为http://192.168.1.1:8000 ，雷池 WAF 为http://20.0.0.1:80 ，CDN 访问为https://example.com

此时假如源站有个接口为http://192.168.1.1:8000/api ，由于未设置伪静态，会跳转到目录http://192.168.1.1:8000/api/ ，此时在外访问https://example.com/api 就会跳转到http://example.com:8000/api/ ，但在外直接访问https://example.com/api/ 却正常

如果源站为http://192.168.1.1:80 ，雷池WAF也为相同的端口号http://20.0.0.1:80 ，CDN 访问为https://example.com ，此时在外访问https://example.com/api 就会跳转到http://example.com:8000/api/

有时即使访问正常，浏览器打开开发者工具会发现要在http和https反复横跳多次后才能跳转到目标网页

解决

要解决这个问题，我们需要修改雷池WAF的Nginx配置文件

本人已经尝试修改 CDN 规则、源站套证书、443端口回源，均无法解决，除非使网站全程 HTTPS Only

如雷池安装到 /data 目录，那么对应Nginx配置文件就在 /data/safeline/resources/nginx/sites-enabled

root@waf-server:~# ls /data/safeline/resources/nginx/sites-enabled

IF_backend_1 IF_backend_14 IF_backend_4 IF_backend_6 IF_backend_8 generated

IF_backend_10 IF_backend_3 IF_backend_5 IF_backend_7 IF_backend_9

具体是哪个配置文件，可以在WAF的Web后台点击对应站点进行查看，如：
https://192.168.1.1:9443/sites/detail?id=10

说明对应配置文件为 10

打开配置文件可以发现有很多设置，可能每次在Web后台修改都会自动重新修改，不过我们发现还有一个目录叫做 custom_params，里面可以直接增加反代相关 location 节的参数

root@waf-server:~# ls /data/safeline/resources/nginx/custom_params

backend_1 backend_100085 backend_12 backend_14 backend_3 backend_5 backend_7 backend_9

backend_10 backend_11 backend_13 backend_2 backend_4 backend_6 backend_8

我们只需要在对应ID的配置内加上重定向语法即可，这个网上一搜一大把，主要靠 rewrite和 proxy_redirect 实现，可以实现很多效果

处理协议：

proxy_redirect http:// $http_X_Forwarded_Proto://;

# proxy_redirect http:// https://;

当然此处给出的不一定是最完美的，请根据实际需求修改

最后执行命令重启 Nginx 使修改后的配置生效
root@waf-server:~# docker restart safeline-tengine

safeline-tengine

或者先测试配置后重载：

# 测试nginx配置是否正确

docker exec -it safeline-tengine /usr/sbin/nginx -t

# 重新加载配置

docker exec -it safeline-tengine /usr/sbin/nginx -s reload

重启 Nginx 后如果所有站点都无法访问，说明配置有误，请删除或修改错误的配置直到重启 Nginx 后服务正常访问

此时通过 curl 测试访问，就可以得到预期的结果
curl -v https://example.com/api

< Location: https://example.com/api/

参考

https://www.hyos.top/posts/waf-posts/test-post/

https://www.cnblogs.com/kevingrace/p/8073646.html


潇然工作室的排障笔记：源站仅 HTTP、前面挂雷池 WAF 再套 Cloudflare CDN 时，访问出现错误重定向（如 `https://example.com/api` 被 301 跳转到 `http://example.com:8000/api/`），浏览器在 http/https 间反复横跳。问题根因与解决方案归纳：

**问题现象**
- 源站 HTTP Only（如 `192.168.1.1:8000`）→ 雷池 WAF（`20.0.0.1:80`）→ Cloudflare CDN（`https://example.com`）
- 源站接口无伪静态时自动 301 到 `http://192.168.1.1:8000/api/`，外层访问就被带偏成 `http://example.com:8000/api/`
- 作者实测：改 CDN 规则、源站套证书、443 回源都无法解决，除非全站 HTTPS Only

**解决方案：修改雷池 WAF 的 Nginx 配置**
- 配置文件目录：`/data/safeline/resources/nginx/sites-enabled`（对应每个站点的 ID，可在 WAF 后台「站点详情」URL 里看到 id）
- 自定义参数目录：`/data/safeline/resources/nginx/custom_params`（Web 后台每次修改会重写 sites-enabled，custom_params 可持久保留自定义 location 参数）
- 在对应站点配置中追加 `proxy_redirect` 按协议重写：
  ```
  proxy_redirect http:// $http_X_Forwarded_Proto://;
  # proxy_redirect http:// https://;
  ```
- 重启 Nginx 生效：
  ```
  docker restart safeline-tengine
  # 或先测配置再重载：
  docker exec -it safeline-tengine /usr/sbin/nginx -t
  docker exec -it safeline-tengine /usr/sbin/nginx -s reload
  ```
- 验证：`curl -v https://example.com/api` 返回 `Location: https://example.com/api/`

**注意**：重启后所有站点都无法访问说明配置有误，需修正配置再重启。

收藏价值：雷池 WAF + CDN 场景下 HTTPS 重定向问题的标准解法，含配置持久化技巧（custom_params）。


`雷池WAF` `Cloudflare` `CDN` `重定向` `Nginx` `proxy_redirect`

---
*本文由书签分类整理自动生成。*
