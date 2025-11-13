/**
 * API Configuration Utility
 * 
 * Centralized API URL configuration for CMS components.
 * Uses /api which is proxied by setupProxy.js to /olivia-products/api
 * 
 * In development: /api -> proxied to http://localhost/olivia-products/api
 * In production: /api -> served from same domain
 */

export const getApiUrl = (): string => {
  // In production, always use relative path /api
  // In development, use /api which will be proxied by setupProxy.js
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  // If REACT_APP_API_URL is set, use it (for custom configurations)
  // Otherwise, use /api which works with the proxy setup
  let apiUrl = process.env.REACT_APP_API_URL || '/api';
  
  // If the URL contains a PHP file (like submit-order.php), it's a specific endpoint URL
  // For CMS components, we need just the base API URL, so use /api for proxy compatibility
  if (apiUrl.includes('.php')) {
    // The env var is set to a specific endpoint file
    // For CMS, we always want the base /api path which the proxy will handle
    apiUrl = '/api';
  } else if (apiUrl.startsWith('http://localhost') || apiUrl.startsWith('http://127.0.0.1') || apiUrl.startsWith('https://localhost')) {
    // If it's a full localhost URL without a PHP file, extract the path
    // But if it contains /olivia-products/api, use /api for proxy compatibility
    try {
      const urlObj = new URL(apiUrl);
      if (urlObj.pathname.includes('/olivia-products/api')) {
        // Use /api - the proxy will rewrite it to /olivia-products/api
        apiUrl = '/api';
      } else {
        apiUrl = urlObj.pathname;
      }
    } catch (e) {
      // If URL parsing fails, default to /api
      apiUrl = '/api';
    }
  }
  
  // Ensure it's exactly /api for proxy compatibility
  // Remove trailing slashes
  apiUrl = apiUrl.replace(/\/+$/, '');
  if (!apiUrl || apiUrl === '/') {
    apiUrl = '/api';
  }
  
  // Log in development to help debug API issues
  if (process.env.NODE_ENV === 'development') {
    console.log('[API Config] Using API URL:', apiUrl);
  }
  
  return apiUrl;
};

/**
 * Get full API endpoint URL
 */
export const getApiEndpoint = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

