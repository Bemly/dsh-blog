# Get started | Cloudflare Spectrum docs

> 分类：书签 · NAS与自建服务 ｜ 收录时间：2024-09-12 18:35:57 ｜ 分类依据：标题关键词匹配

![Cloudflare 站点图标](images/i01-cloudflare-favicon.avif)


- 原始地址：<https://developers.cloudflare.com/spectrum/get-started/>
- 文档更新：2026-06-23


Cloudflare Spectrum 官方入门文档。Spectrum 的作用是**把任意 TCP/UDP 端口的流量代理进 Cloudflare 网络**，让 SSH、游戏、自建服务等非 HTTP 应用也能套上 CF 的防护与加速。归纳要点：

- **套餐限制**：Spectrum 对所有付费套餐开放；Pro/Business 仅支持部分协议，Enterprise 才支持全部 TCP/UDP 流量。
- **四种创建方式**：①直接用 IP（origin_direct，默认从 CF IP 池分配任意 IP，BYOIP/静态 IP 需走 API）；②CNAME 指向源站主机名（origin_dns，要求 CF 是该 zone 的权威 DNS）；③负载均衡器（注意 Spectrum 主机名不能与 Load Balancing 主机名相同）；④虚拟网络源站（配合 Cloudflare Tunnel 私有网络，origin 为私网 IP，仅 TCP/UDP，端口范围与多地址不支持、Proxy Protocol 必须 off）。
- **配置要点**：Dashboard 创建或 API（POST /zones/{zone_id}/spectrum/apps），常用字段 protocol（如 tcp/22）、dns.name、origin_direct/origin_dns、edge_ips、tls、proxy_protocol、ip_firewall、argo_smart_routing 等；API 至少需要 Zone Settings Write 权限。
- 建好应用后无需额外配置即可代理流量，可在仪表盘查看最近一分钟流量。

对自建服务的价值：家里 NAS/服务器的 SSH（22）、frp、游戏服等端口，通过 Spectrum 可以暴露在 CF 域名下并隐藏真实 IP，同时获得 CF 的 DDoS 防护与边缘 IP。

## 正文

Spectrum is available on all paid plans. Pro and Business support selected protocols only, whereas Enterprise supports all TCP and UDP based traffic. Refer to Configuration options for more configuration details.

To create a Spectrum application, you can either use an IP address, a CNAME Record or a load balancer. Independently of the method you use, you can create the application through the dashboard or via API.

Certain fields in Spectrum request and response bodies require an Enterprise plan. Refer to the Settings by plan page for more details.

### Create a Spectrum application using an IP address

To create a Spectrum application using an IP address, Cloudflare normally assigns you an arbitrary IP from Cloudflare's IP pool to your application. If you want to use your own IP addresses, you can use BYOIP or you can also use a Static IP. In these two last cases, you need to create your Spectrum application through the API, as these features are not available via dash. When using the API, the field `origin_direct` takes as input the IP address.

**Add your application via Dashboard**

1. In the Cloudflare dashboard, go to the Spectrum page.
2. Select **Create an Application**. If this is your first time using Spectrum, the Create an Application modal appears.
3. Select your **Application Type**.
4. Under **Domain**, enter the domain that will use Spectrum.
5. Under **Edge Port**, enter the port Cloudflare should use for your application.
6. Under **Origin**, enter your application's origin IP and port.
7. If your application requires the client IP and supports Proxy Protocol, enable Proxy Protocols. Proxy Protocol is a method for a proxy like Cloudflare to send the client IP to the origin application.
8. Select **Add**.

**Add your application via API**

Required API token permissions (at least one of the following): **Zone Settings Write**.

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/spectrum/apps" \
	--request POST \
	--header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
	--json '{
		"protocol": "tcp/22",
		"dns": {
			"type": "CNAME",
			"name": "ssh.example.com"
		},
		"origin_direct": [
			"tcp://192.0.2.1:22"
		],
		"proxy_protocol": "off",
		"ip_firewall": true,
		"tls": "full",
		"edge_ips": {
			"type": "dynamic",
			"connectivity": "all"
		},
		"traffic_type": "direct",
		"argo_smart_routing": true
	}'
```

Example data:

```json
{
	"success": true,
	"errors": [],
	"messages": [],
	"result": {
		"id": "ea95132c15732412d22c1476fa83f27a",
		"protocol": "tcp/22",
		"dns": {
			"type": "CNAME",
			"name": "ssh.example.com"
		},
		"origin_direct": [
			"tcp://192.0.2.1:22"
		],
		"proxy_protocol": "off",
		"ip_firewall": true,
		"tls": "full",
		"edge_ips": {
			"type": "dynamic",
			"connectivity": "all"
		},
		"traffic_type": "direct",
		"argo_smart_routing": true,
		"created_on": "2014-01-02T02:20:00Z",
		"modified_on": "2014-01-02T02:20:00Z"
	}
}
```

### Create a Spectrum application using a CNAME record

To create a Spectrum application using a CNAME record, you will need to create a CNAME record on your Cloudflare hosted zone that points to your origin's hostname. This is required to resolve to your hostname origin. When using a CNAME as an origin, note that Cloudflare needs to be authoritative for that zone. When using the API, the `origin_dns` field takes as input the CNAME record.

**Add your application via Dashboard**

1. In the Cloudflare dashboard, go to the Spectrum page.
2. Select **Create an Application**.
3. Select your **Application Type**.
4. Under **Domain**, enter the domain that will use Spectrum.
5. Under **Edge Port**, enter the port Cloudflare should use for your application.
6. Under **Origin**, enter your CNAME record name.
7. Select **Add**.

**Add your application via API**

Required API token permissions (at least one of the following): **Zone Settings Write**.

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/spectrum/apps" \
	--request POST \
	--header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
	--json '{
		"dns": {
			"type": "CNAME",
			"name": "spectrum-cname.example.com"
		},
		"ip_firewall": false,
		"protocol": "tcp/22",
		"proxy_protocol": "off",
		"tls": "off",
		"origin_dns": {
			"name": "cname-to-origin.example.com",
			"ttl": 1200
		},
		"origin_port": 22
	}'
```

Example data:

```json
{
	"dns": {
		"type": "CNAME",
		"name": "spectrum-cname.example.com"
	},
	"ip_firewall": false,
	"protocol": "tcp/22",
	"proxy_protocol": "off",
	"tls": "off",
	"origin_dns": {
		"name": "cname-to-origin.example.com",
		"ttl": 1200
	},
	"origin_port": 22
}
```

### Create a Spectrum application using a load balancer

To create a Spectrum application using a load balancer, you will need to generate a load balancer from the dashboard or via the API. Refer to the Load Balancing documentation for more details.

> Note: To prevent issues with DNS resolution for a Spectrum application, do not use the same Spectrum hostname as a current Load Balancing hostname.

**Add your application via Dashboard**

1. In the Cloudflare dashboard, go to the Spectrum page.
2. Select **Create an Application**.
3. Select your **Application Type**.
4. Under **Domain**, enter the domain that will use Spectrum.
5. Under **Edge Port**, enter the port Cloudflare should use for your application.
6. Under **Origin**, select **Load Balancer**.
7. Select the load balancer you want to use from the dropdown. Disabled load balancers will not show on the Load Balancer menu.
8. Select **Add**.

**Add your application via API**

Required API token permissions (at least one of the following): **Zone Settings Write**.

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/spectrum/apps" \
	--request POST \
	--header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
	--json '{
		"dns": {
			"type": "CNAME",
			"name": "spectrum-cname.example.com"
		},
		"ip_firewall": false,
		"protocol": "tcp/22",
		"proxy_protocol": "off",
		"tls": "off",
		"origin_dns": {
			"name": "cname-to-origin.example.com",
			"ttl": 1200
		},
		"origin_port": 22
	}'
```

Example data:

```json
{
	"dns": {
		"type": "CNAME",
		"name": "spectrum-cname.example.com"
	},
	"ip_firewall": false,
	"protocol": "tcp/22",
	"proxy_protocol": "off",
	"tls": "off",
	"origin_dns": {
		"name": "cname-to-origin.example.com",
		"ttl": 1200
	},
	"origin_port": 22
}
```

### Create a Spectrum application using a virtual network origin

To proxy TCP or UDP traffic to an origin on your private network, attach a Cloudflare Tunnel virtual network to a Spectrum application. Spectrum routes traffic through the connector (Cloudflare Tunnel or Cloudflare WAN connection) associated with that virtual network. This provides an alternative to the previous pattern of putting a load balancer in front of a private origin.

Virtual network origins are only supported for TCP and UDP applications. The origin must be a single private IP routable within the specified virtual network. Port ranges, hostname origins (`origin_dns`), and multiple addresses in `origin_direct` are not supported. Proxy Protocol is not currently supported, so `proxy_protocol` must be set to `off`. For details on validation errors, refer to Error codes.

For a primer on virtual networks, refer to Virtual networks.

#### Before you begin

Set up the virtual network and a route covering your origin IP before creating the Spectrum application:

- Create a virtual network and a Cloudflare Tunnel that carries it by following Manage virtual networks.
- Attach a route covering your origin's private IP to the tunnel by following Connect an IP/CIDR.

For Cloudflare WAN (formerly Magic WAN) as the connector, refer to Get started with Cloudflare WAN for setting up tunnel endpoints and routes.

**Add your application via Dashboard**

1. In the Cloudflare dashboard, go to the Spectrum page.
2. Select **Create an Application**.
3. Under **Application Type**, select **TCP** or **UDP**.
4. Under **Domain**, enter the domain that will use Spectrum.
5. Under **Edge Port**, enter the port Cloudflare should use for your application.
6. Under **Origin**, select **Virtual Network**.
7. Under **Virtual Network**, select the virtual network that contains your origin.
8. Under **IP**, enter the private IP address of your origin.
9. Under **Port**, enter a single port (port ranges are not supported).
10. Select **Add**.

**Add your application via API**

Required API token permissions (at least one of the following): **Zone Settings Write**.

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/spectrum/apps" \
	--request POST \
	--header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
	--json '{
		"protocol": "tcp/22",
		"dns": {
			"type": "CNAME",
			"name": "ssh.example.com"
		},
		"origin_direct": [
			"tcp://10.0.0.5:22"
		],
		"virtual_network_id": "f70ff985-a4ef-4643-bbbc-4a0ed4fc8415",
		"proxy_protocol": "off",
		"ip_firewall": true,
		"tls": "off",
		"edge_ips": {
			"type": "dynamic",
			"connectivity": "all"
		},
		"traffic_type": "direct"
	}'
```

Set `origin_direct` to the private IP of your origin and `virtual_network_id` to the ID of the virtual network that the IP is routable within. You can list virtual networks for your account with the List virtual networks endpoint.

Example data:

```json
{
	"success": true,
	"errors": [],
	"messages": [],
	"result": {
		"id": "ea95132c15732412d22c1476fa83f27a",
		"protocol": "tcp/22",
		"dns": {
			"type": "CNAME",
			"name": "ssh.example.com"
		},
		"origin_direct": [
			"tcp://10.0.0.5:22"
		],
		"virtual_network_id": "f70ff985-a4ef-4643-bbbc-4a0ed4fc8415",
		"proxy_protocol": "off",
		"ip_firewall": true,
		"tls": "off",
		"edge_ips": {
			"type": "dynamic",
			"connectivity": "all"
		},
		"traffic_type": "direct",
		"created_on": "2014-01-02T02:20:00Z",
		"modified_on": "2014-01-02T02:20:00Z"
	}
}
```

### View traffic

You can now proxy traffic through Cloudflare without additional configuration. As you run traffic through Cloudflare, you will see the last minute of traffic from Spectrum in the dashboard.


`Cloudflare` `Spectrum` `TCP代理` `UDP代理` `SSH` `内网穿透` `DDoS防护` `CloudflareTunnel` `文档笔记`

---
*正文取自 Cloudflare 官方文档原文，侧边栏/导航等页面垃圾已清理。*
