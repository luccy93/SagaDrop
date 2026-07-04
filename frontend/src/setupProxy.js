const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Use pathFilter instead of app.use("/api", ...) so Express
  // does NOT strip the /api prefix before forwarding to FastAPI.
  app.use(
    createProxyMiddleware({
      target: "http://localhost:8000",
      changeOrigin: true,
      pathFilter: "/api",
    })
  );
};
