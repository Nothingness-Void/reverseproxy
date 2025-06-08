# Cloudflare Workers 工具包

一个功能强大的 Cloudflare Workers 工具集合，包含多个实用工具：

## 🛠️ 可用工具

### 1. 🌐 反向代理服务
快速代理任意网站的强大工具
- 🚀 快速部署到 Cloudflare Workers
- 🌐 支持 CORS 跨域请求
- 📡 支持 GET、HEAD、OPTIONS 方法
- 🛡️ 错误处理和安全头部管理
- ⚡ 全球边缘网络加速

### 2. 📝 文本存储服务
类似 GitHub RAW 的文本存储和分享功能
- 📝 类似 GitHub RAW 的文本存储功能
- 🔗 简洁的访问链接（如：`/raw/abc123`）
- 📊 支持多种文本格式（JSON、HTML、CSS、JS 等）
- 🗃️ 基于 Cloudflare KV 的持久化存储
- 🔄 完整的 RESTful API（增删查改）
- 📏 最大支持 10MB 文本文件

## 🎯 项目结构

```
├── workers.js                    # 反向代理服务
├── text-storage.js              # 文本存储服务
├── index.js                     # 工具包入口（可选）
├── wrangler.toml                # 反向代理配置
├── wrangler-text-storage.toml   # 文本存储配置
├── wrangler-index.toml          # 工具包入口配置
├── CLOUDFLARE-DEPLOY.md         # Cloudflare 部署指南
├── TEXT-STORAGE-DEPLOY.md       # 文本存储部署指南
├── EXAMPLES.md                  # 使用示例文档
├── package.json                 # 项目配置
└── README.md                    # 项目说明
```

## 🚀 快速开始

### 方法一：选择单个工具部署

#### 部署反向代理服务

[![Deploy Reverse Proxy](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Nothingness-Void/reverseproxy)

**配置说明：**
```javascript
// 修改 workers.js 中的目标URL
const TARGET_URL = 'https://your-target-domain.com';
```

#### 部署文本存储服务

1. 克隆仓库：
```bash
git clone https://github.com/Nothingness-Void/reverseproxy.git
cd reverseproxy
```

2. 创建 KV 存储：
```bash
wrangler kv:namespace create "TEXT_STORAGE"
```

3. 更新配置并部署：
```bash
# 在 wrangler-text-storage.toml 中填入 KV namespace ID
wrangler deploy --config wrangler-text-storage.toml
```

详细说明请参考：[🚀 Cloudflare 一键部署指南](CLOUDFLARE-DEPLOY.md)

### 方法二：Fork 仓库后一键部署

1. Fork 此仓库到你的 GitHub 账户
2. 在 Cloudflare Dashboard 中创建 Workers 服务
3. 连接你的 GitHub 仓库进行自动部署

### 方法三：使用 Cloudflare Pages（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 "Pages" 页面
3. 点击 "连接到 Git"
4. 选择你 Fork 的仓库
5. 配置构建设置后部署

完整部署指南：[📖 查看详细部署说明](CLOUDFLARE-DEPLOY.md)

## 📖 使用说明

### 反向代理服务

部署成功后，你的反向代理将在以下地址可用：
```
https://your-worker-name.your-subdomain.workers.dev
```

配置说明：
```javascript
// 修改 workers.js 中的 TARGET_URL 变量
const TARGET_URL = 'https://your-target-domain.com';
```

### 文本存储服务

#### API 使用示例

**存储文本：**
```bash
curl -X POST "https://your-text-storage.workers.dev/api/store" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello, World!"}'
```

**获取文本：**
```bash
curl "https://your-text-storage.workers.dev/raw/{text-id}"
```

**删除文本：**
```bash
curl -X DELETE "https://your-text-storage.workers.dev/api/delete/{text-id}"
```

更多详细说明请参考：[📝 文本存储部署指南](TEXT-STORAGE-DEPLOY.md)

## 🔧 环境变量

### 反向代理服务
- `TARGET_URL`: 目标代理地址（可选，如果不使用代码中的硬编码值）

### 文本存储服务
- `SERVICE_NAME`: 服务名称（可选）
- `MAX_TEXT_SIZE`: 最大文本大小限制（可选，默认 10MB）

## 🛡️ 安全建议

1. **反向代理服务**：
   - 生产环境中考虑限制 `Access-Control-Allow-Origin`
   - 监控代理请求，防止滥用
   - 考虑添加请求频率限制

2. **文本存储服务**：
   - 不要存储敏感信息
   - 考虑实施访问控制
   - 定期清理不需要的数据

## 📊 监控和日志

所有服务都包含详细的日志记录：
- `[PROXY-START]` - 代理请求开始
- `[PROXY-SUCCESS]` - 代理请求成功
- `[TEXT-STORED]` - 文本存储成功
- `[TEXT-RETRIEVED]` - 文本获取成功

在 Cloudflare Dashboard 的 Workers 页面可以查看实时日志。

## 许可证

MIT License