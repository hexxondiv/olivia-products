# API Setup Instructions

## Problem
The React development server (localhost:3000) cannot serve PHP files directly. API requests need to be proxied to your PHP server.

## Solution Options

### Option 1: Using setupProxy.js (Recommended)

1. **Install the required package:**
   ```bash
   npm install http-proxy-middleware --save-dev
   # or
   yarn add http-proxy-middleware --dev
   ```

2. **Restart the React development server:**
   ```bash
   npm start
   # or
   yarn start
   ```

3. **The proxy is already configured** in `src/setupProxy.js` to forward `/api/*` requests to `http://localhost`

4. **If your Apache serves from a subdirectory** (e.g., `/olivia-products/`), update `src/setupProxy.js`:
   ```javascript
   pathRewrite: {
     '^/api': '/olivia-products/api',
   },
   ```

### Option 2: Using Environment Variable

If the proxy doesn't work, you can set the API URL directly:

1. **Create a `.env` file** in the project root:
   ```
   REACT_APP_API_URL=http://localhost/olivia-products/api/submit-order.php
   # or if Apache serves from root:
   REACT_APP_API_URL=http://localhost/api/submit-order.php
   ```

2. **Restart the React development server** for changes to take effect.

### Option 3: Using Simple Proxy (Fallback)

The `package.json` already includes a simple proxy:
```json
"proxy": "http://localhost"
```

This should work if:
- Apache is running on port 80 (default)
- The API is accessible at `http://localhost/api/submit-order.php`

## Testing

1. Make sure Apache is running and PHP is enabled
2. Test the API endpoint directly in your browser:
   ```
   http://localhost/olivia-products/api/submit-order.php
   ```
   (You should see a JSON error about method not allowed, which is expected for GET requests)

3. Start the React development server:
   ```bash
   npm start
   ```

4. Try submitting an order from the checkout page

## Troubleshooting

### 404 Not Found
- Check if Apache is running: `sudo systemctl status apache2`
- Verify the API file exists: `ls -la /var/www/html/olivia-products/api/submit-order.php`
- Check Apache configuration for the correct DocumentRoot

### CORS Errors
- The API already includes CORS headers
- If you still see CORS errors, check the `Access-Control-Allow-Origin` header in `api/submit-order.php`

### Proxy Not Working
- Make sure `http-proxy-middleware` is installed
- Restart the React dev server after installing
- Check the browser console for proxy errors
- Try Option 2 (Environment Variable) instead

## Production

In production, the API URL should work directly since both React and PHP are served from the same domain. The proxy is only needed for development.

