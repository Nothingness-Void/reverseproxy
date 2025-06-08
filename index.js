// index.js - Cloudflare Workers 工具包入口

// ========================================
// *** Cloudflare Workers 工具包配置 ***
// ========================================

// 工具配置
const TOOLS = {
  'reverse-proxy': {
    name: '反向代理服务',
    description: '快速代理任意网站，支持 CORS 和多种 HTTP 方法',
    path: '/proxy',
    script: 'workers.js'
  },
  'text-storage': {
    name: '文本存储服务', 
    description: '类似 GitHub RAW 的文本存储和分享功能',
    path: '/storage',
    script: 'text-storage.js'
  }
};

// 默认工具（当直接访问根域名时）
const DEFAULT_TOOL = 'text-storage'; // 可以改为 'reverse-proxy'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // 根路径 - 显示工具选择页面
  if (path === '/' || path === '') {
    return handleToolSelector();
  }

  // 健康检查
  if (path === '/health') {
    return new Response(JSON.stringify({
      status: 'ok',
      tools: Object.keys(TOOLS),
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 路由到具体工具
  for (const [toolId, config] of Object.entries(TOOLS)) {
    if (path.startsWith(config.path)) {
      return await routeToTool(request, toolId, config);
    }
  }

  // 默认工具处理（当路径不匹配任何工具时）
  if (DEFAULT_TOOL && TOOLS[DEFAULT_TOOL]) {
    return await routeToTool(request, DEFAULT_TOOL, TOOLS[DEFAULT_TOOL]);
  }

  // 404 处理
  return new Response('Tool not found', {
    status: 404,
    headers: {
      'content-type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * 路由到具体工具
 */
async function routeToTool(request, toolId, config) {
  const url = new URL(request.url);
  
  // 移除工具路径前缀
  if (url.pathname.startsWith(config.path)) {
    url.pathname = url.pathname.slice(config.path.length) || '/';
  }

  // 创建新的请求对象
  const modifiedRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body
  });

  console.log(`[TOOLKIT] 路由到工具: ${toolId} - ${config.name}`);

  // 根据工具类型处理请求
  switch (toolId) {
    case 'reverse-proxy':
      return await handleReverseProxy(modifiedRequest);
    case 'text-storage':
      return await handleTextStorage(modifiedRequest);
    default:
      return new Response('Unknown tool', { status: 500 });
  }
}

/**
 * 工具选择页面
 */
function handleToolSelector() {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudflare Workers 工具包</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            color: #333;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            text-align: center;
        }
        .header { margin-bottom: 50px; }
        .header h1 { 
            font-size: 3rem; 
            color: white; 
            margin-bottom: 10px; 
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .header p { 
            font-size: 1.2rem; 
            color: rgba(255,255,255,0.9); 
            margin-bottom: 20px;
        }
        .tools-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 30px; 
            margin-bottom: 40px;
        }
        .tool-card { 
            background: white; 
            border-radius: 15px; 
            padding: 30px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
            transition: all 0.3s ease;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
        }
        .tool-card:hover { 
            transform: translateY(-10px); 
            box-shadow: 0 20px 40px rgba(0,0,0,0.3); 
        }
        .tool-icon { 
            font-size: 3rem; 
            margin-bottom: 20px; 
            display: block;
        }
        .tool-name { 
            font-size: 1.5rem; 
            font-weight: bold; 
            margin-bottom: 15px; 
            color: #333;
        }
        .tool-description { 
            color: #666; 
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .tool-button { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 25px; 
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .tool-button:hover { 
            transform: scale(1.05); 
        }
        .footer { 
            color: rgba(255,255,255,0.8); 
            margin-top: 40px;
        }
        .status-info {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛠️ Cloudflare Workers 工具包</h1>
            <p>强大的边缘计算工具集合，助力您的开发工作</p>
        </div>
        
        <div class="tools-grid">
            <a href="/proxy" class="tool-card">
                <div class="tool-icon">🌐</div>
                <div class="tool-name">反向代理服务</div>
                <div class="tool-description">
                    快速代理任意网站，支持 CORS 跨域请求和多种 HTTP 方法。
                    适用于绕过网络限制、API 代理等场景。
                </div>
                <button class="tool-button">使用代理服务</button>
            </a>
            
            <a href="/storage" class="tool-card">
                <div class="tool-icon">📝</div>
                <div class="tool-name">文本存储服务</div>
                <div class="tool-description">
                    类似 GitHub RAW 的文本存储和分享功能。
                    支持代码片段、配置文件、文档等多种文本内容的存储。
                </div>
                <button class="tool-button">使用存储服务</button>
            </a>
        </div>
        
        <div class="status-info">
            <h3>🚀 服务状态</h3>
            <p>所有服务运行正常 | 全球边缘网络加速 | 99.9% 可用性保证</p>
        </div>
        
        <div class="footer">
            <p>Powered by Cloudflare Workers | 开源项目</p>
            <p><a href="https://github.com/Nothingness-Void/reverseproxy" style="color: rgba(255,255,255,0.8);">GitHub Repository</a></p>
        </div>
    </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * 处理反向代理请求
 * 注意：这里需要导入或包含 workers.js 的逻辑
 */
async function handleReverseProxy(request) {
  // 这里应该包含 workers.js 的完整逻辑
  // 为了示例，这里返回一个占位符
  return new Response('Reverse Proxy Tool - Please implement the actual logic from workers.js', {
    status: 200,
    headers: {
      'content-type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * 处理文本存储请求
 * 注意：这里需要导入或包含 text-storage.js 的逻辑
 */
async function handleTextStorage(request) {
  // 这里应该包含 text-storage.js 的完整逻辑
  // 为了示例，这里返回一个占位符
  return new Response('Text Storage Tool - Please implement the actual logic from text-storage.js', {
    status: 200,
    headers: {
      'content-type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
