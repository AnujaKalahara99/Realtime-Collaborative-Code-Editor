import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { createServer } from "http";
config();
import setupProxies from "./middleware/proxy.js";
import ROUTES from "./routes.js";
import setupAuth from "./middleware/auth.js";
import setupLogging from "./middleware/logging.js";
import setupRateLimit from "./middleware/ratelimit.js";

const app = express();
const server = createServer(app);

const corsConfig = {
  origin: "*",
  allowedHeaders: ["Origin", "Content-Length", "Content-Type", "Authorization"],
};

app.use(cors(corsConfig));
// app.use(express.json());
setupLogging(app);
setupRateLimit(app, ROUTES);
setupAuth(app, ROUTES);
setupProxies(app, ROUTES, server);

app.get("/health", (req, res) => {
  res.json({ message: "Welcome to the API Gateway" });
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "localhost";

server.listen(PORT, HOST, () => {
  console.log(`API Gateway is running on http://${HOST}:${PORT}`);
  console.log(`WebSocket proxy available at ws://${HOST}:${PORT}/ws`);
});
