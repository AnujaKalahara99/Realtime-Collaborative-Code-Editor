import { createProxyMiddleware } from "http-proxy-middleware";

const setupProxies = (app, routes, server) => {
  routes.forEach((route) => {
    const proxyOptions = {
      ...route.proxy,
      on: {
        proxyReq: (proxyReq, req, res) => {
          // console.log(`Proxying request: ${req.method} ${req.url}`);
        },
        proxyRes: (proxyRes, req, res) => {
          console
            .log
            // `Response from proxy: ${proxyRes.statusCode} for ${req.method} ${req.url}`
            ();
        },
        error: (err, req, res) => {
          console
            .error
            // `Proxy error: ${err.message} for ${req.method} ${req.url}`
            ();
        },
      },
    };

    // Handle WebSocket connections
    if (route.proxy.ws) {
      // Set up WebSocket proxy
      const proxy = createProxyMiddleware(proxyOptions);
      app.use(route.url, proxy);

      // Handle WebSocket upgrade
      server.on("upgrade", (request, socket, head) => {
        if (request.url.startsWith(route.url)) {
          proxy.upgrade(request, socket, head);
        }
      });
    } else {
      app.use(route.url, createProxyMiddleware(proxyOptions));
    }

    console.log(`Proxy set up: ${route.url} -> ${route.proxy.target}`);
  });
};

export default setupProxies;
