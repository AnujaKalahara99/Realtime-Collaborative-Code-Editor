import express from "express";
import cors from "cors";
import { config } from "dotenv";
config();
import setupProxies from "./proxy.js";
import ROUTES from "./routes.js";
import setupAuth from "./auth.js";
import setupLogging from "./logging.js";
import setupRateLimit from "./ratelimit.js";

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

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
