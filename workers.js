// worker.js

// ========================================
// *** 配置目标URL - 请修改为你要代理的网站 ***
// ========================================
const TARGET_URL = 'https://example.com'; // *** 重要：请将此处替换为你的目标网站URL ***

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  // We are primarily proxying GET requests to the target URL.
  // HEAD requests are also common and should be supported.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { 'Allow': 'GET, HEAD, OPTIONS' }, // Inform client about allowed methods
    });
  }  try {
    // [PROXY] 开始转发请求到目标服务器
    console.log(`[PROXY-START] 转发请求到: ${TARGET_URL}`);
    console.log(`[PROXY-METHOD] 请求方法: ${request.method}`);
    console.log(`[PROXY-AGENT] 用户代理: ${request.headers.get('User-Agent') || 'Unknown'}`);
    
    // Fetch the content from the target URL.
    // Use the same method (GET or HEAD) as the incoming request.
    const originResponse = await fetch(TARGET_URL, { method: request.method });

    // [SUCCESS] 转发成功
    console.log(`[PROXY-SUCCESS] 转发成功! 状态码: ${originResponse.status}`);
    console.log(`[PROXY-SIZE] 响应大小: ${originResponse.headers.get('Content-Length') || 'Unknown'} bytes`);

    // Create a new response based on the origin's response.
    // Make headers mutable for modification.
    const responseHeaders = new Headers(originResponse.headers);

    // Set CORS headers to allow cross-origin access to your worker.
    responseHeaders.set('Access-Control-Allow-Origin', '*'); // Allows any domain to access. For production, consider restricting this.
    
    // 添加自定义头部显示代理信息
    responseHeaders.set('X-Proxy-By', 'Cloudflare-Workers-Reverse-Proxy');
    responseHeaders.set('X-Proxy-Target', TARGET_URL);
    responseHeaders.set('X-Proxy-Status', 'success');

    // It's good practice to remove or control headers that might leak information
    // or conflict with Cloudflare's environment.
    responseHeaders.delete('X-Frame-Options'); // Example: if the origin sets this and you want to override.
    // responseHeaders.delete('Content-Security-Policy'); // If you want to set your own CSP.

    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    // ❌ 转发失败
    console.error(`❌ [Proxy] 转发失败!`);
    console.error(`🎯 [Proxy] 目标URL: ${TARGET_URL}`);
    console.error(`📋 [Proxy] 错误详情:`, error);
    
    // Log the error for debugging on the Cloudflare dashboard.
    console.error(`Error fetching from origin (${TARGET_URL}):`, error);
    // Return a user-friendly error response.
    return new Response('Failed to fetch content from the origin server.', { status: 502 }); // 502 Bad Gateway is appropriate here.
  }
}

/**
 * Handles CORS preflight (OPTIONS) requests.
 * @param {Request} request The incoming OPTIONS request.
 * @returns {Response} A response configured for CORS preflight.
 */
function handleOptions(request) {
  const headers = request.headers;
  // Ensure it's a valid CORS preflight request.
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null
    // Access-Control-Request-Headers is optional but good to handle.
  ) {
    // Define headers for the preflight response.
    const respHeaders = {
      'Access-Control-Allow-Origin': '*', // Or specify your domain for better security.
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS', // Specify methods your worker supports.
      'Access-Control-Max-Age': '86400', // Cache preflight response for 1 day (in seconds).
    };

    // If Access-Control-Request-Headers is present, reflect it back.
    const requestHeaders = headers.get('Access-Control-Request-Headers');
    if (requestHeaders) {
      respHeaders['Access-Control-Allow-Headers'] = requestHeaders;
    }

    // Return a 204 No Content response for successful preflight.
    return new Response(null, { status: 204, headers: respHeaders });
  } else {
    // This is not a CORS preflight request, but a standard OPTIONS request.
    // Respond with allowed methods for the resource.
    return new Response(null, {
      headers: {
        'Allow': 'GET, HEAD, OPTIONS',
      },
      status: 200, // OK
    });
  }
}
