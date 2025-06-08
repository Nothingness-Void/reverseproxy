# 🚀 Cloudflare Workers 工具包使用示例

本文档提供详细的使用示例和最佳实践。

## 🌐 反向代理服务示例

### 基础配置

```javascript
// workers.js
const TARGET_URL = 'https://api.github.com'; // 代理 GitHub API
```

### 使用场景

#### 1. API 代理
```bash
# 原始请求（可能被 CORS 阻止）
curl https://api.github.com/users/octocat

# 通过代理请求
curl https://your-proxy.workers.dev/users/octocat
```

#### 2. 网站代理
```javascript
const TARGET_URL = 'https://example.com';
```

访问 `https://your-proxy.workers.dev` 将显示 `example.com` 的内容。

#### 3. 绕过地理限制
代理可能在某些地区不可访问的网站。

### 日志监控

在 Cloudflare Dashboard 中可以看到：
```
[PROXY-START] 转发请求到: https://api.github.com
[PROXY-METHOD] 请求方法: GET
[PROXY-AGENT] 用户代理: curl/7.68.0
[PROXY-SUCCESS] 转发成功! 状态码: 200
[PROXY-SIZE] 响应大小: 1234 bytes
```

## 📝 文本存储服务示例

### API 使用

#### 1. 存储代码片段

```bash
# 存储 JavaScript 代码
curl -X POST "https://your-storage.workers.dev/api/store" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "console.log(\"Hello, World!\");",
    "id": "hello-world-js"
  }'

# 响应
{
  "success": true,
  "id": "hello-world-js",
  "url": "https://your-storage.workers.dev/raw/hello-world-js",
  "directUrl": "https://your-storage.workers.dev/hello-world-js",
  "size": 29,
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

#### 2. 存储配置文件

```bash
# 存储 JSON 配置
curl -X POST "https://your-storage.workers.dev/api/store" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "{\"api_key\": \"xxx\", \"timeout\": 5000}",
    "id": "app-config"
  }'
```

#### 3. 获取存储的内容

```bash
# 获取代码片段
curl "https://your-storage.workers.dev/raw/hello-world-js"
# 输出: console.log("Hello, World!");

# 获取配置文件
curl "https://your-storage.workers.dev/raw/app-config"
# 输出: {"api_key": "xxx", "timeout": 5000}
```

#### 4. 在网页中使用

```html
<!DOCTYPE html>
<html>
<head>
    <title>动态加载脚本</title>
</head>
<body>
    <script>
        // 动态加载存储的 JavaScript 代码
        fetch('https://your-storage.workers.dev/raw/hello-world-js')
            .then(response => response.text())
            .then(code => {
                eval(code); // 注意：实际使用中要注意安全性
            });
    </script>
</body>
</html>
```

### 高级使用

#### 1. 批量操作

```bash
# 列出所有存储的文本
curl "https://your-storage.workers.dev/api/list"

# 响应
{
  "success": true,
  "count": 2,
  "texts": [
    {
      "id": "hello-world-js",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "size": 29,
      "contentType": "text/javascript; charset=utf-8"
    },
    {
      "id": "app-config",
      "createdAt": "2024-01-01T12:01:00.000Z",
      "size": 42,
      "contentType": "application/json; charset=utf-8"
    }
  ]
}
```

#### 2. 删除文本

```bash
curl -X DELETE "https://your-storage.workers.dev/api/delete/hello-world-js"

# 响应
{
  "success": true,
  "message": "Text deleted successfully"
}
```

### 内容类型自动检测

系统会自动检测并设置正确的 Content-Type：

- **HTML**: `text/html; charset=utf-8`
- **JavaScript**: `text/javascript; charset=utf-8`
- **CSS**: `text/css; charset=utf-8`
- **JSON**: `application/json; charset=utf-8`
- **纯文本**: `text/plain; charset=utf-8`

## 🛠️ 工具包入口使用

访问工具包入口页面：
```
https://your-toolkit.workers.dev
```

提供美观的工具选择界面，用户可以：
- 选择使用反向代理服务（`/proxy` 路径）
- 选择使用文本存储服务（`/storage` 路径）
- 查看服务状态和健康检查

## 📊 监控和调试

### 日志查看

在 Cloudflare Dashboard > Workers > 你的 Worker > 监控 中可以查看：

1. **请求统计**
2. **错误率**
3. **实时日志**
4. **性能指标**

### 常用日志标识

- `[PROXY-START]` - 代理开始
- `[PROXY-SUCCESS]` - 代理成功
- `[TEXT-STORED]` - 文本存储成功
- `[TEXT-RETRIEVED]` - 文本获取成功
- `[TEXT-DELETED]` - 文本删除成功

## 🚀 生产环境最佳实践

### 安全配置

1. **CORS 配置**
```javascript
// 生产环境中限制 CORS
responseHeaders.set('Access-Control-Allow-Origin', 'https://yourdomain.com');
```

2. **频率限制**
```javascript
// 可以添加简单的频率限制
const clientIP = request.headers.get('CF-Connecting-IP');
// 实现频率限制逻辑
```

### 监控告警

设置 Cloudflare 告警：
- 错误率超过 5%
- 请求延迟超过 1 秒
- CPU 使用率超过 80%

### 备份策略

通过 Cloudflare Dashboard 定期备份 KV 存储数据：
1. 进入 Workers & Pages > KV
2. 选择你的 namespace
3. 导出所有键值对

---

## 📞 支持和反馈

如有问题或建议，请：
1. 查看 [GitHub Issues](https://github.com/Nothingness-Void/reverseproxy/issues)
2. 提交新的 Issue
3. 参与讨论和改进

感谢使用 Cloudflare Workers 工具包！
