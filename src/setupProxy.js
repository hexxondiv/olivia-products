const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to the PHP server
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_BASE_URL || 'http://localhost',
      changeOrigin: true,
      // If your Apache serves from /olivia-products/, uncomment the pathRewrite below
      // pathRewrite: {
      //   '^/api': '/olivia-products/api',
      // },
    })
  );
};

