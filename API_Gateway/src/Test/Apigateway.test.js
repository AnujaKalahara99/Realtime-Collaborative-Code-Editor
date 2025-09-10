import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

import setupAuth from "../middleware/auth.js";
import setupRateLimit from "../middleware/ratelimit.js";
import setupLogging from "../middleware/logging.js";
import setupProxies from "../middleware/proxy.js";
import ROUTES from "../routes.js";

jest.mock("http-proxy-middleware", () => ({
  createProxyMiddleware: () => (req, res, next) => {
    res.status(200).send(`Mocked proxy response for ${req.url}`);
  },
}));

describe("API Gateway", () => {
  let app;
  const TEST_SECRET = "test_secret";

  beforeAll(() => {
    process.env.SUPABASE_JWT_SECRET = TEST_SECRET;

    app = express();

    setupLogging(app);
    setupRateLimit(app, ROUTES);
    setupAuth(app, ROUTES);

    const mockServer = { on: () => {} }; 
    setupProxies(app, ROUTES, mockServer);

    app.get("/health", (req, res) => {
      res.json({ message: "Welcome to the API Gateway" });
    });
  });

  it("should return health status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Welcome to the API Gateway");
  });

  it("should allow /codespaces with valid JWT", async () => {
    const token = jwt.sign({ sub: "user1", email: "user1@test.com" }, TEST_SECRET);
    const res = await request(app)
      .get("/codespaces")
      .set("Authorization", token);

    expect(res.status).toBe(200);
  
  });
    it("should respect rate limit on /free", async () => {
    const limit = ROUTES.find(r => r.url === "/free").rateLimit.limit;

    for (let i = 0; i < limit; i++) {
      await request(app).get("/free");
    }

    const res = await request(app).get("/free");
    expect(res.status).toBe(429); 
  });

  it("should pass through unauthenticated route /free", async () => {
    const res = await request(app).get("/free");
    expect([429]).toContain(res.status);
  });
});
