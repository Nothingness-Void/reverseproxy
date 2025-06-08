# 🚀 Cloudflare 一键部署指南

本项目完全基于 Cloudflare 平台，支持多种一键部署方式，无需本地环境配置。

## 🎯 部署方式总览

| 方式 | 适用场景 | 优势 | 时间 |
|------|---------|------|------|
| **一键部署按钮** | 快速试用 | 最简单，一键完成 | 1分钟 |
| **Cloudflare Pages** | 持续集成 | 自动更新，版本管理 | 3分钟 |
| **Workers Dashboard** | 自定义配置 | 完全控制，高级设置 | 5分钟 |

## 📱 方式一：一键部署按钮（推荐新手）

### 部署反向代理服务
[![Deploy Reverse Proxy](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Nothingness-Void/reverseproxy)

**步骤：**
1. 点击上方按钮
2. 登录你的 Cloudflare 账户
3. 授权 GitHub 访问
4. 选择要部署的文件（`workers.js`）
5. 点击 "Deploy" 完成部署

**配置：**
部署完成后，在 Workers 控制台中修改环境变量：
```
TARGET_URL = "https://your-target-domain.com"
```

## 🌐 方式二：Cloudflare Pages 部署（推荐进阶）

### 步骤详解

#### 1. Fork 仓库
1. 访问 [项目仓库](https://github.com/Nothingness-Void/reverseproxy)
2. 点击右上角 "Fork" 按钮
3. Fork 到你的 GitHub 账户

#### 2. 连接到 Cloudflare Pages
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择 "Pages" > "Create a project"
3. 选择 "Connect to Git"
4. 授权 GitHub 并选择你 Fork 的仓库

#### 3. 配置构建设置
```yaml
构建命令: 留空
构建输出目录: 留空
根目录: /
Node.js 版本: 18
```

#### 4. 环境变量配置（生产环境）
```
TARGET_URL = "https://your-target-domain.com"
SERVICE_NAME = "我的工具包"
```

#### 5. 部署完成
- 自动部署完成后，你将获得一个 `https://your-project.pages.dev` 域名
- 每次推送代码到 GitHub 都会自动重新部署

## ⚙️ 方式三：Workers Dashboard 手动部署

### 反向代理服务

1. **创建 Worker**
   - 进入 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 选择 "Workers & Pages" > "Create application"
   - 选择 "Create Worker"
   - 给 Worker 命名（如：`my-proxy`）

2. **复制代码**
   - 复制 `workers.js` 的完整内容
   - 粘贴到 Worker 编辑器中
   - 修改 `TARGET_URL` 变量

3. **保存并部署**
   - 点击 "Save and Deploy"
   - 获得访问地址：`https://my-proxy.your-subdomain.workers.dev`

### 文本存储服务

1. **创建 KV 命名空间**
   - 在 Dashboard 中选择 "Workers & Pages" > "KV"
   - 点击 "Create a namespace"
   - 命名为：`TEXT_STORAGE`
   - 记录生成的 Namespace ID

2. **创建 Worker**
   - 创建新的 Worker（如：`text-storage`）
   - 复制 `text-storage.js` 的完整内容

3. **绑定 KV 存储**
   - 在 Worker 设置中选择 "Variables"
   - 添加 KV Namespace 绑定：
     ```
     Variable name: TEXT_STORAGE
     KV namespace: 选择刚创建的 TEXT_STORAGE
     ```

4. **保存并部署**
   - 点击 "Save and Deploy"
   - 访问地址：`https://text-storage.your-subdomain.workers.dev`

## 🔧 高级配置

### 自定义域名

1. **添加域名**
   - 在 Worker 设置中选择 "Triggers"
   - 点击 "Add Custom Domain"
   - 输入你的域名（如：`proxy.yourdomain.com`）

2. **DNS 配置**
   - Cloudflare 会自动添加 CNAME 记录
   - 等待 SSL 证书自动生成

### 环境变量配置

在 Worker 设置的 "Variables" 中可以配置：

**反向代理服务：**
```
TARGET_URL = "https://api.example.com"
ALLOWED_ORIGIN = "https://yourdomain.com"
```

**文本存储服务：**
```
SERVICE_NAME = "我的文本存储"
MAX_TEXT_SIZE = "10485760"
```

### 路由规则

可以为不同路径配置不同的处理逻辑：
```
/proxy/* → 反向代理服务
/storage/* → 文本存储服务
/* → 工具选择页面
```

## 📊 监控和管理

### 实时监控
- **请求统计**：在 Workers 控制台查看请求量、错误率
- **性能指标**：响应时间、CPU 使用率
- **实时日志**：查看详细的请求日志

### 使用限制
- **免费计划**：每天 100,000 次请求
- **付费计划**：每月 1000 万次请求起
- **KV 存储**：免费计划 1GB 存储空间

### 安全设置
- **访问控制**：可配置 IP 白名单
- **频率限制**：防止滥用
- **CORS 设置**：控制跨域访问

## 🚨 故障排除

### 常见问题

1. **部署失败**
   - 检查代码语法是否正确
   - 确认账户权限是否足够

2. **KV 存储错误**
   - 确认 KV namespace 已创建
   - 检查变量绑定是否正确

3. **域名访问问题**
   - 确认 DNS 解析是否生效
   - 检查 SSL 证书状态

### 调试方法
1. 查看 Workers 控制台的实时日志
2. 使用浏览器开发者工具检查网络请求
3. 检查 Cloudflare 的状态页面

## 📞 技术支持

- **官方文档**：[Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- **社区支持**：[Cloudflare 社区](https://community.cloudflare.com/)
- **项目 Issues**：[GitHub Issues](https://github.com/Nothingness-Void/reverseproxy/issues)

---

## 🎉 部署成功后

部署完成后，你将拥有：
- 🌐 **全球 CDN 加速**的服务
- 🔒 **自动 SSL 证书**保护
- 📊 **实时监控**和日志
- 🚀 **边缘计算**性能优势
- 💰 **成本极低**的运行费用

立即开始使用你的 Cloudflare Workers 工具包吧！
