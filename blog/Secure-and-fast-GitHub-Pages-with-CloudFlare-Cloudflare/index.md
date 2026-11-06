# Secure and fast GitHub Pages with CloudFlare | Cloudflare Blog

> 分类：书签 · NAS与自建服务 ｜ 来源：Cloudflare 官方博客（英文原文）

![blog.cloudflare.com 站点图标](images/i01-114_favicon.avif)


- 原始地址：<https://blog.cloudflare.com/secure-and-fast-github-pages-with-cloudflare/>

## 原文全文

GitHub offers a web hosting service whereby you can serve a static website from a GitHub repository. This platform, GitHub Pages, can be used with CloudFlare whilst using a custom domain name.

In this tutorial, I will show you how to use CloudFlare and GitHub together. By taking advantage of CloudFlare's global network, you can utilise our CDN service to improve your site's performance and security.

Whilst GitHub Pages doesn't ordinarily support SSL on custom domains, CloudFlare's Universal SSL allows your users to access your site over SSL, thus opening up the performance advantages of HTTP/2.

GitHub Pages is designed to host sites that only serve static HTML. The ability to only host static content isn't as big of a restriction as you might think. Static site generators avoid repetitive update tasks of updating "latest posts" feeds, pagination or sitemaps; whilst generating static HTML that can be uploaded to any web hosting service without a scripting engine. Unlike ancient desktop tools like FrontPage and Dreamweaver which lacked a content model, modern static site generators have the design decisively separate from content.

Typically, CMS-based sites must query a database for content, then render the HTML to be served to the end user; all this to serve the same content for request after request. Even with caching this combination is hardly elegant for sites where only the administrator changes the content.

With static sites the web server merely needs to serve static HTML to an end user. This has profound performance benefits; static sites walk whilst dynamic sites crawl. Above this, the ability to track all site changes in a Git repository adds better control when it comes to collaborative editing. With static sites there is no CMS, no database; just HTML. No need to worry about patching PHP or plugins with insecure database queries.

Clearly static sites can't do everything, namely anything that's dynamic; though you can utilise JavaScript APIs to add some dynamic functionality if that's a route you want to pursue.

**Step 0: Preparing your site**

![Step 0 植物博客示例](images/i02-01.avif)

For this tutorial, I will be using Jekyll as a static site generator. Jekyll works by taking a bunch of markdown files and outputting the HTML necessary for a static blog. There is a great list of generators on a site called StaticGen, including a static site generator written in Go called Hugo. I'm using Jekyll here due to the integration with GitHub Pages.

If you want to host a JavaScript app or a simple static site, just skip this step. Assuming you have a Ruby version greater than 2.0.0, then you can just install Jekyll by running: `gem install jekyll`.

For this example I'm going to be creating a blog about plants using Jekyll. To create the blog simply run: `jekyll new plants`, which will output something like `New jekyll site installed in /Users/junade/plants`.

From here I can cd into the plants directory and serve the blog on my local computer: `cd plants` then `jekyll serve`. You should be able to access the site from localhost at port 4000: `http://127.0.0.1:4000`. You can edit variables in `_config.yml` and add posts in `_posts` directory.

Whilst ordinarily you would need to generate your site's HTML using `jekyll build` then upload it to the web server of your choice, GitHub allows for raw Jekyll projects to be uploaded to its service; it will handle the building and serving of the HTML itself from the Jekyll project.

**Step 1: Setting up our repository**

Create a GitHub repository which contains the files of the site we want to serve (such as our Jekyll source or our HTML). As my GitHub username is IcyApril, I can create a repository called `icyapril.github.io`. Be sure that the repository name is all lowercase.

![GitHub 仓库设置](images/i03-02.avif)

In this repository, whatever is in the main branch ends up published on `icyapril.github.io`. If you haven't already, let's initiate a repository where our site files are:

```
git init
git add -A
git commit -m "Initial commit."
```

We can now push files to our host by adding the origin as GitHub; make sure the URL of the origin is customised to be your own repository:

```
git remote add origin git@github.com:IcyApril/icyapril.github.io.git
git push -u origin master
```

You should now see your site when you visit `[username].github.io`.

**Step 2: Setting up our DNS**

I'll assume you have registered a domain and added it to your CloudFlare account. In order for GitHub to accept traffic from this domain, we need to create a CNAME file in our repository which contains the hostname to accept traffic for.

The following rules apply:

- If the CNAME file contains `example.com`, then `www.example.com` will redirect to `example.com`.
- If the CNAME file contains `www.example.com`, then `example.com` will redirect to `www.example.com`.

In the Git repository we created in the previous section, let's add a CNAME file:

```
echo "www.ju.je" > CNAME
git add -A
git commit -m "Added CNAME file."
git push origin master
```

We can add the records to point our DNS records to our GitHub Pages account (we can use a CNAME at the root thanks to CNAME Flattening):

![DNS CNAME 记录](images/i04-03.avif)

You can find the most up-to-date IP Addresses from the GitHub Pages documentation.

**Step 3: Time for SSL**

Unfortunately GitHub Pages doesn't yet support SSL on GitHub Pages for custom domains which would ordinarily rule out using HTTP/2. Whilst the HTTP/2 specification (RFC 7540) allows for HTTP/2 over plain-text, all popular browsers require HTTP/2 to run on top of Transport Layer Security; meaning HTTP/2 only being able to run over HTTPS is the de-facto standard.

Fortunately, CloudFlare's Universal SSL option allows us provide a signed SSL certificate to site visitors. This allows us to gain the performance benefits of HTTP/2 and potentially improve search engine rankings.

![Universal SSL 示意](images/i05-04.avif)

In the Crypto tab of your CloudFlare site you should ensure your SSL mode is set to **Full** but not Full (Strict):

![SSL 模式设置为 Full](images/i06-05.avif)

We can now add a Page Rule to enforce HTTPS, as you add other Page Rules make sure this is the primary Page Rule:

![强制 HTTPS 的 Page Rule](images/i07-06.avif)

We can also create a Page Rule to ensure that non-www is redirected to www securely when using HTTPS:

![非 www 跳转 www 的 Page Rule](images/i08-07.avif)

Enabling HTTP Strict Transport Security (HSTS) will help ensure that your visitors have to communicate to your site over HTTPS, by telling browsers that they should always communicate over encrypted HTTPS. Be careful if you choose to set this though, it may render your site inaccessible if you wish to choose to ever turn HTTPS off.

**Step 4: Cache all the things**

CloudFlare has a "Cache Everything" option in Page Rules. For static sites, it allows your HTML to be cached and served directly from CloudFlare's CDN.

![Cache Everything 配置](images/i09-08.avif)

When deploying your site you can use the Purge Cache option in the Cache tab on CloudFlare to remove the cached version of the static pages. If you're using a Continuous Integration system to deploy your site, you can use our API to clear the cache programmatically.

**Shortcomings**

![WikiMedia 上的 WillMcC](images/i10-09.avif)

Firstly a word on security. If you are deploying a JavaScript app which communicates with remote APIs, be sure not to use this for sensitive data submissions. As GitHub themselves put it: "GitHub Pages sites shouldn't be used for sensitive transactions like sending passwords or credit card numbers." Also bear in mind your website source files are publicly accessible in a Git repository, so be extra careful about what you put there.

There are some things we can't do; GitHub Pages doesn't let us set custom headers, which unfortunately means we can't do HTTP/2 Server Push right now.

**Conclusion**

GitHub Pages, CloudFlare and a static site generator combine to create fast, secure, free hosting for static sites.


本文是 Cloudflare 官方博客早年（作者 Junade Ali）的经典教程：用 **Jekyll + GitHub Pages + CloudFlare** 搭建"又快又安全又免费"的静态站点。核心思路是 GitHub Pages 只托管静态 HTML，配合静态站点生成器（Jekyll/Hugo）免去 CMS 数据库开销；借助 CloudFlare CDN 与 **Universal SSL** 为自定义域名提供证书，从而解锁 HTTP/2 与搜索引擎排名收益。操作分 4 步：Step 0 本地 Jekyll 建站；Step 1 建 GitHub 仓库推送（`用户名.github.io` 命名规则）；Step 2 仓库内加 CNAME 文件 + DNS 用 CNAME Flattening 指向 GitHub Pages；Step 3 Crypto 中 SSL 模式选 Full（非 Full Strict）、加 Page Rule 强制 HTTPS 与 www 跳转、可选启用 HSTS；Step 4 用 Page Rule 的 Cache Everything 让 HTML 由 CDN 直接缓存，部署后用 Purge Cache 或 API 清缓存。文末指出局限：GitHub Pages 不能用于敏感数据提交、无法设置自定义 Header 故暂不支持 HTTP/2 Server Push。虽然写作年代较早（界面术语偏旧），但整套思路至今仍适用于静态站 + CDN 加速场景。


`GitHub Pages` `Cloudflare` `Jekyll` `静态站点` `Universal SSL` `CNAME` `Page Rule` `HTTP/2` `CDN`

---
*本文由书签分类整理自动生成。*
