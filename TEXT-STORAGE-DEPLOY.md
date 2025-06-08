# 📝 文本存储服务部署指南

文本存储服务是一个类似 GitHub RAW 的文本存储和分享工具，基于 Cloudflare Workers 和 KV 存储构建。

## 🚀 快速部署

### 步骤 1: 创建 KV 命名空间

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择你的账户
3. 进入 "Workers & Pages" > "KV"
4. 点击 "Create a namespace"
5. 命名空间名称: `TEXT_STORAGE`
6. 记下创建的 KV namespace ID

### 步骤 2: 配置 wrangler.toml

编辑 `wrangler-text-storage.toml` 文件，填入你的 KV namespace ID：

```toml
name = "text-storage"
main = "text-storage.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "TEXT_STORAGE"
id = "你的KV_NAMESPACE_ID"  # 填入步骤1中获得的ID
```

### 步骤 3: 部署到 Cloudflare Workers

```bash
# 使用指定的配置文件部署
wrangler deploy --config wrangler-text-storage.toml

# 或者使用提供的批处理文件
./deploy-simple.bat
```

## 🔧 详细配置

### KV 存储配置

文本存储服务依赖 Cloudflare KV 进行数据持久化。每个文本会存储以下信息：

- **Key**: 文本ID（自动生成或自定义）
- **Value**: 文本内容
- **Metadata**: 创建时间、大小、内容类型

### 环境变量配置

你可以在 `wrangler-text-storage.toml` 中配置以下环境变量：

```toml
[vars]
SERVICE_NAME = "我的文本存储"
MAX_TEXT_SIZE = 10485760  # 10MB
```

### 自定义域名（可选）

如果你有自定义域名，可以在 `wrangler-text-storage.toml` 中添加路由：

```toml
routes = [
  "storage.yourdomain.com/*"
]
```

## 📡 API 使用说明

### 存储文本

```bash
# 存储纯文本
curl -X POST "https://your-worker.your-subdomain.workers.dev/api/store" \
  -H "Content-Type: text/plain" \
  -d "Hello, World!"

# 存储 JSON 数据
curl -X POST "https://your-worker.your-subdomain.workers.dev/api/store" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello, World!", "id": "custom-id"}'
```

### 获取文本

```bash
# 通过 /raw/ 路径获取
curl "https://your-worker.your-subdomain.workers.dev/raw/{text-id}"

# 或直接通过 ID 获取
curl "https://your-worker.your-subdomain.workers.dev/{text-id}"
```

### 删除文本

```bash
curl -X DELETE "https://your-worker.your-subdomain.workers.dev/api/delete/{text-id}"
```

### 列出所有文本

```bash
curl "https://your-worker.your-subdomain.workers.dev/api/list"
```

## 🌟 功能特性

- **📝 文本存储**: 支持最大 10MB 的文本文件
- **🔗 简洁链接**: 类似 GitHub RAW 的访问方式
- **📊 智能检测**: 自动检测内容类型（HTML、CSS、JS、JSON等）
- **🗃️ 持久化**: 基于 Cloudflare KV 的可靠存储
- **🔄 RESTful API**: 完整的增删查改操作
- **🌐 CORS 支持**: 支持跨域访问
- **📱 响应式**: 美观的 Web 界面

## 💡 使用场景

- **代码片段分享**: 快速分享代码片段
- **配置文件托管**: 托管配置文件和脚本
- **静态内容**: 托管 HTML、CSS、JS 文件
- **API 响应模拟**: 存储 JSON 数据用于测试
- **文档分享**: 分享 Markdown 或纯文本文档

## 🛡️ 安全注意事项

- 不要存储敏感信息（密码、密钥等）
- 考虑实施访问控制（如 API 密钥验证）
- 定期清理不需要的文本
- 监控存储使用量

## 📊 监控和维护

### 查看日志
在 Cloudflare Dashboard 的 Workers 页面可以查看实时日志：
- `[TEXT-STORED]` - 文本存储成功
- `[TEXT-RETRIEVED]` - 文本获取成功
- `[TEXT-DELETED]` - 文本删除成功

### KV 使用量监控
在 Cloudflare Dashboard 的 KV 页面可以查看：
- 存储的键值对数量
- 存储空间使用量
- 请求统计

## 🔄 更新和维护

```bash
# 更新代码后重新部署
wrangler deploy --config wrangler-text-storage.toml

# 查看部署状态
wrangler whoami
wrangler list
```

## 📞 故障排除

### 常见问题

1. **"Storage not configured" 错误**
   - 检查 KV namespace 是否正确配置
   - 确认 KV namespace ID 正确

2. **403 或 401 错误**
   - 检查 Cloudflare API Token 权限
   - 确认账户权限设置

3. **文本无法存储**
   - 检查文本大小是否超过限制
   - 确认 KV 存储配额

### 调试模式

```bash
# 本地开发和测试
wrangler dev --config wrangler-text-storage.toml
```

---

## 📄 许可证

MIT License - 详见 `LICENSE` 文件