const ROUTES = [
  {
    url: "/codespaces",
    auth: true,
    creditCheck: false,
    rateLimit: {
      windowMs: 60 * 1000,
      limit: 100,
    },
    proxy: {
      target: "http://localhost:5000/codespaces",
      changeOrigin: true,
      pathRewrite: {
        [`^/codespaces`]: "",
      },
    },
  },
  {
    url: "/free",
    auth: false,
    creditCheck: false,
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      limit: 5,
    },
    proxy: {
      target: "http://144.24.128.44:4001/run",
      changeOrigin: true,
      pathRewrite: {
        [`^/free`]: "",
      },
    },
  },
  {
    url: "/premium",
    auth: true,
    creditCheck: true,
    proxy: {
      target: "https://www.google.com",
      changeOrigin: true,
      pathRewrite: {
        [`^/premium`]: "",
      },
    },
  },
  {
    url: "/ws",
    auth: false,
    creditCheck: false,
    rateLimit: {
      windowMs: 60 * 1000,
      limit: 1000,
    },
    proxy: {
      target: "ws://144.24.128.44:4455",
      target: "ws://localhost:4455",
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        [`^/ws`]: "",
      },
    },
  },
];

export default ROUTES;
