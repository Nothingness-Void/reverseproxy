# Cloudflare Workers 反向代理

一个简单而强大的 Cloudflare Workers 反向代理服务，支持 CORS 和多种 HTTP 方法。

## 功能特性

- 🚀 快速部署到 Cloudflare Workers
- 🌐 支持 CORS 跨域请求
- 📡 支持 GET、HEAD、OPTIONS 方法
- 🛡️ 错误处理和安全头部管理
- ⚡ 全球边缘网络加速

## 一键部署

### 方法一：使用 Deploy Button

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/你的用户名/reverseproxy)

### 方法二：使用 Wrangler CLI

1. 安装 Wrangler CLI：
```bash
npm install -g wrangler
```

2. 登录 Cloudflare：
```bash
wrangler auth login
```

3. 克隆仓库：
```bash
git clone https://github.com/你的用户名/reverseproxy.git
cd reverseproxy
```

4. 修改配置文件 `wrangler.toml`（如果没有则创建）：
```toml
name = "my-reverse-proxy"
main = "workers.js"
compatibility_date = "2023-12-01"
```

5. 部署：
```bash
wrangler deploy
```

## 配置说明

在部署前，请修改 `workers.js` 文件中的 `TARGET_URL` 变量：

```javascript
const TARGET_URL = 'https://your-target-domain.com';
```

将 `https://your-target-domain.com` 替换为你要代理的目标网站。

## 使用方法

部署成功后，你的反向代理将在以下地址可用：
```
https://your-worker-name.your-subdomain.workers.dev
```

所有请求将被转发到你配置的目标URL。

## 环境变量

你可以在 Cloudflare Workers 控制台中设置环境变量：

- `TARGET_URL`: 目标代理地址（可选，如果不使用代码中的硬编码值）

## 许可证

MIT License