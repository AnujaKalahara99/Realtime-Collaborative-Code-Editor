import express from "express";
import cors from "cors";
import { config } from "dotenv";
config();
import setupProxies from "./middleware/proxy.js";
import ROUTES from "./routes.js";
import setupAuth from "./middleware/auth.js";
import setupLogging from "./middleware/logging.js";
import setupRateLimit from "./middleware/ratelimit.js";

const app = express();

const corsConfig = {
  origin: "*",
  allowedHeaders: ["Origin", "Content-Length", "Content-Type", "Authorization"],
};

app.use(cors(corsConfig));
// app.use(express.json());
setupLogging(app);
setupRateLimit(app, ROUTES);
setupAuth(app, ROUTES);
setupProxies(app, ROUTES);

app.get("/health", (req, res) => {
  res.json({ message: "Welcome to the API Gateway" });
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "localhost";

app.listen(PORT, HOST, () => {
  console.log(`API Gateway is running on http://${HOST}:${PORT}`);
});
