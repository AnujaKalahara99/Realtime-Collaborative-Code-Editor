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
      target:
        process.env.NODE_ENV === "production"
          ? "http://codespace-service:5000/codespaces"
          : "http://localhost:5000/codespaces",
      changeOrigin: true,
      pathRewrite: {
        [`^/codespaces`]: "",
      },
    },
  },
  {
    url: "/api",
    auth: true,
    creditCheck: false,
    rateLimit: {
      windowMs: 60 * 1000,
      limit: 100,
    },
    proxy: {
      target:
        process.env.NODE_ENV === "production"
          ? "http://codespace-service:5000/api"
          : "http://localhost:5000/api",
      changeOrigin: true,
      pathRewrite: {
        [`^/api`]: "",
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
    url: "/ws",
    auth: false,
    creditCheck: false,
    rateLimit: {
      windowMs: 60 * 1000,
      limit: 1000,
    },
    proxy: {
      target:
        process.env.NODE_ENV === "production"
          ? "ws://ws-server:4455"
          : "ws://localhost:4455",
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        [`^/ws`]: "",
      },
    },
  },
  {
    url: "/versioning",
    auth: true,
    creditCheck: false,
    rateLimit: {
      windowMs: 60 * 1000,
      limit: 1000,
    },
    proxy: {
      target:
        process.env.NODE_ENV === "production"
          ? "http://144.24.150.8:6000/versioning"
          : "http://192.168.56.82:6000/versioning",
      changeOrigin: true,
      pathRewrite: {
        [`^/versioning`]: "",
      },
    },
  },
];

export default ROUTES;
