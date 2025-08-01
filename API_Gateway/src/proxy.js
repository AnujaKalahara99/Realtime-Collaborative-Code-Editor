import { createProxyMiddleware } from "http-proxy-middleware";

const setupProxies = (app, routes) => {
  routes.forEach((route) => {
    app.use(
      route.url,
      createProxyMiddleware({
        ...route.proxy,
        on: {
          proxyReq: (proxyReq, req, res) => {
            console.log(`Proxying request: ${req.method} ${req.url}`);
          },
          proxyRes: (proxyRes, req, res) => {
            console.log(
              `Response from proxy: ${proxyRes.statusCode} for ${req.method} ${req.url}`
            );
          },
          error: (err, req, res) => {
            console.error(
              `Proxy error: ${err.message} for ${req.method} ${req.url}`
            );
          },
        },
      })
    );
    console.log(`Proxy set up: ${route.url} -> ${route.proxy.target}`);
  });
};

export default setupProxies;
