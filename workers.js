// worker.js

const TARGET_URL = 'https://';

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
  }

  try {
    // Fetch the content from the target URL.
    // Use the same method (GET or HEAD) as the incoming request.
    const originResponse = await fetch(TARGET_URL, { method: request.method });

    // Create a new response based on the origin's response.
    // Make headers mutable for modification.
    const responseHeaders = new Headers(originResponse.headers);

    // Set CORS headers to allow cross-origin access to your worker.
    responseHeaders.set('Access-Control-Allow-Origin', '*'); // Allows any domain to access. For production, consider restricting this.

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
