const { createProxyMiddleware } = require("http-proxy-middleware")

module.exports = function (app) {
    app.use(
        "/api",
        createProxyMiddleware({
            target: "http://127.0.0.1:3001",
            changeOrigin: true,
            onProxyRes: function (proxyRes, req, res) {
                proxyRes.headers["Access-Control-Allow-Origin"] = "http://localhost:5173";
            },
        })
    );
};