// text-storage.js - GitHub RAW 风格的文本存储服务

// ========================================
// *** 文本存储服务配置 ***
// ========================================
const SERVICE_NAME = 'CloudFlare-Text-Storage';
const MAX_TEXT_SIZE = 10 * 1024 * 1024; // 10MB 最大文本大小
const DEFAULT_CONTENT_TYPE = 'text/plain; charset=utf-8';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return handleCORS();
  }

  try {
    // 根路径 - 显示使用说明
    if (path === '/' || path === '') {
      return handleHomePage();
    }

    // 健康检查
    if (path === '/health') {
      return new Response('OK', { 
        status: 200,
        headers: getCORSHeaders()
      });
    }

    // API 路径处理
    if (path.startsWith('/api/')) {
      return handleAPIRequest(request, path);
    }

    // 文本获取路径 (类似 GitHub raw)
    // 格式: /raw/{id} 或 /{id}
    const textId = path.startsWith('/raw/') ? path.slice(5) : path.slice(1);
    
    if (textId && request.method === 'GET') {
      return handleGetText(textId);
    }

    // 404 处理
    return new Response('Not Found', { 
      status: 404,
      headers: getCORSHeaders()
    });

  } catch (error) {
    console.error('[TEXT-STORAGE-ERROR]', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

/**
 * 处理 API 请求
 */
async function handleAPIRequest(request, path) {
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length < 2) {
    return new Response('Invalid API path', { 
      status: 400,
      headers: getCORSHeaders()
    });
  }

  const endpoint = segments[1]; // api 后的第一个段

  switch (endpoint) {
    case 'store':
      if (request.method === 'POST') {
        return handleStoreText(request);
      }
      break;
    
    case 'delete':
      if (request.method === 'DELETE') {
        const textId = segments[2];
        return handleDeleteText(textId);
      }
      break;

    case 'list':
      if (request.method === 'GET') {
        return handleListTexts();
      }
      break;
  }

  return new Response('Method Not Allowed', { 
    status: 405,
    headers: getCORSHeaders()
  });
}

/**
 * 存储文本
 */
async function handleStoreText(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let textContent;
    let customId;

    // 支持多种内容类型
    if (contentType.includes('application/json')) {
      const json = await request.json();
      textContent = json.content || json.text;
      customId = json.id;
    } else {
      textContent = await request.text();
    }

    if (!textContent) {
      return new Response('No content provided', { 
        status: 400,
        headers: getCORSHeaders()
      });
    }

    // 检查大小限制
    if (textContent.length > MAX_TEXT_SIZE) {
      return new Response('Content too large', { 
        status: 413,
        headers: getCORSHeaders()
      });
    }

    // 生成 ID（如果没有提供自定义 ID）
    const textId = customId || generateId();
    
    // 检查 KV 存储是否可用
    if (typeof TEXT_STORAGE === 'undefined') {
      return new Response('Storage not configured', { 
        status: 503,
        headers: getCORSHeaders()
      });
    }

    // 存储元数据
    const metadata = {
      createdAt: new Date().toISOString(),
      size: textContent.length,
      contentType: detectContentType(textContent)
    };

    // 存储到 KV
    await TEXT_STORAGE.put(textId, textContent, { metadata });

    console.log(`[TEXT-STORED] ID: ${textId}, Size: ${textContent.length} bytes`);

    return new Response(JSON.stringify({
      success: true,
      id: textId,
      url: `${new URL(request.url).origin}/raw/${textId}`,
      directUrl: `${new URL(request.url).origin}/${textId}`,
      size: textContent.length,
      createdAt: metadata.createdAt
    }), {
      status: 201,
      headers: {
        ...getCORSHeaders(),
        'content-type': 'application/json'
      }
    });

  } catch (error) {
    console.error('[STORE-ERROR]', error);
    return new Response('Failed to store text', { 
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

/**
 * 获取文本
 */
async function handleGetText(textId) {
  try {
    if (!textId) {
      return new Response('Text ID required', { 
        status: 400,
        headers: getCORSHeaders()
      });
    }

    // 检查 KV 存储是否可用
    if (typeof TEXT_STORAGE === 'undefined') {
      return new Response('Storage not configured', { 
        status: 503,
        headers: getCORSHeaders()
      });
    }

    const result = await TEXT_STORAGE.getWithMetadata(textId);
    
    if (!result.value) {
      return new Response('Text not found', { 
        status: 404,
        headers: getCORSHeaders()
      });
    }

    console.log(`[TEXT-RETRIEVED] ID: ${textId}, Size: ${result.value.length} bytes`);

    const contentType = result.metadata?.contentType || DEFAULT_CONTENT_TYPE;

    return new Response(result.value, {
      status: 200,
      headers: {
        ...getCORSHeaders(),
        'content-type': contentType,
        'x-text-id': textId,
        'x-created-at': result.metadata?.createdAt || 'unknown',
        'x-text-size': result.metadata?.size?.toString() || result.value.length.toString()
      }
    });

  } catch (error) {
    console.error('[GET-ERROR]', error);
    return new Response('Failed to retrieve text', { 
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

/**
 * 删除文本
 */
async function handleDeleteText(textId) {
  try {
    if (!textId) {
      return new Response('Text ID required', { 
        status: 400,
        headers: getCORSHeaders()
      });
    }

    if (typeof TEXT_STORAGE === 'undefined') {
      return new Response('Storage not configured', { 
        status: 503,
        headers: getCORSHeaders()
      });
    }

    await TEXT_STORAGE.delete(textId);
    console.log(`[TEXT-DELETED] ID: ${textId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Text deleted successfully'
    }), {
      status: 200,
      headers: {
        ...getCORSHeaders(),
        'content-type': 'application/json'
      }
    });

  } catch (error) {
    console.error('[DELETE-ERROR]', error);
    return new Response('Failed to delete text', { 
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

/**
 * 列出所有文本（分页）
 */
async function handleListTexts() {
  try {
    if (typeof TEXT_STORAGE === 'undefined') {
      return new Response('Storage not configured', { 
        status: 503,
        headers: getCORSHeaders()
      });
    }

    const list = await TEXT_STORAGE.list({ limit: 100 });
    
    const texts = list.keys.map(key => ({
      id: key.name,
      createdAt: key.metadata?.createdAt,
      size: key.metadata?.size,
      contentType: key.metadata?.contentType
    }));

    return new Response(JSON.stringify({
      success: true,
      count: texts.length,
      texts: texts
    }), {
      status: 200,
      headers: {
        ...getCORSHeaders(),
        'content-type': 'application/json'
      }
    });

  } catch (error) {
    console.error('[LIST-ERROR]', error);
    return new Response('Failed to list texts', { 
      status: 500,
      headers: getCORSHeaders()
    });
  }
}

/**
 * 首页使用说明
 */
function handleHomePage() {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${SERVICE_NAME}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; }
        .api-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .endpoint { background: white; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #007bff; }
        .method { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; margin-right: 10px; }
        .post { background: #28a745; color: white; }
        .get { background: #007bff; color: white; }
        .delete { background: #dc3545; color: white; }
        code { background: #f1f3f4; padding: 2px 6px; border-radius: 3px; }
        .example { background: #e9ecef; padding: 10px; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📝 ${SERVICE_NAME}</h1>
        <p>类似 GitHub RAW 的文本存储服务</p>
    </div>

    <div class="api-section">
        <h2>🚀 API 使用说明</h2>
        
        <div class="endpoint">
            <span class="method post">POST</span>
            <strong>/api/store</strong>
            <p>存储文本内容</p>
            <div class="example">
                <strong>请求示例:</strong><br>
                <code>curl -X POST -H "Content-Type: application/json" -d '{"content":"Hello World"}' /api/store</code>
            </div>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/raw/{id}</strong> 或 <strong>/{id}</strong>
            <p>获取存储的文本内容</p>
            <div class="example">
                <strong>请求示例:</strong><br>
                <code>curl /raw/abc123</code>
            </div>
        </div>

        <div class="endpoint">
            <span class="method delete">DELETE</span>
            <strong>/api/delete/{id}</strong>
            <p>删除存储的文本</p>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/list</strong>
            <p>列出所有存储的文本</p>
        </div>
    </div>

    <div class="api-section">
        <h2>💡 使用示例</h2>
        <p><strong>1. 存储文本:</strong></p>
        <div class="example">
            <code>
            fetch('/api/store', {<br>
            &nbsp;&nbsp;method: 'POST',<br>
            &nbsp;&nbsp;headers: { 'Content-Type': 'application/json' },<br>
            &nbsp;&nbsp;body: JSON.stringify({ content: 'Your text here' })<br>
            })
            </code>
        </div>
        
        <p><strong>2. 获取文本:</strong></p>
        <div class="example">
            <code>fetch('/raw/your-text-id')</code>
        </div>
    </div>

    <div class="api-section">
        <h2>📋 限制说明</h2>
        <ul>
            <li>最大文本大小: ${(MAX_TEXT_SIZE / 1024 / 1024).toFixed(1)}MB</li>
            <li>支持的内容类型: 纯文本、JSON、HTML、CSS、JavaScript 等</li>
            <li>自动检测内容类型</li>
            <li>支持 CORS 跨域访问</li>
        </ul>
    </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...getCORSHeaders(),
      'content-type': 'text/html; charset=utf-8'
    }
  });
}

/**
 * 生成随机 ID
 */
function generateId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${timestamp}-${random}`;
}

/**
 * 检测内容类型
 */
function detectContentType(content) {
  // 简单的内容类型检测
  if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
    return 'text/html; charset=utf-8';
  }
  if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
    try {
      JSON.parse(content);
      return 'application/json; charset=utf-8';
    } catch (e) {
      // 不是有效的 JSON
    }
  }
  if (content.includes('function') || content.includes('=>') || content.includes('const ') || content.includes('let ')) {
    return 'text/javascript; charset=utf-8';
  }
  if (content.includes('{') && content.includes('}') && (content.includes('color:') || content.includes('margin:') || content.includes('padding:'))) {
    return 'text/css; charset=utf-8';
  }
  return DEFAULT_CONTENT_TYPE;
}

/**
 * CORS 处理
 */
function handleCORS() {
  return new Response(null, {
    status: 200,
    headers: getCORSHeaders()
  });
}

/**
 * 获取 CORS 头部
 */
function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
}