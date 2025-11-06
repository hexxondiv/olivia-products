const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to the PHP server
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_BASE_URL || 'http://localhost',
      changeOrigin: true,
      // Rewrite path to include /olivia-products/ subdirectory
      pathRewrite: {
        '^/api': '/olivia-products/api',
      },
    })
  );
};

