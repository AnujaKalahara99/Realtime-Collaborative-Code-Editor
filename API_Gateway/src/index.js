import express from "express";
import cors from "cors";
import { config } from "dotenv";
config();
import setupProxies from "./proxy.js";
import ROUTES from "./routes.js";
import setupAuth from "./auth.js";

const app = express();

const corsConfig = {
  origin: "*",
  allowedHeaders: ["Origin", "Content-Length", "Content-Type", "Authorization"],
};

app.use(cors(corsConfig));
setupAuth(app, ROUTES);
setupProxies(app, ROUTES);

app.get("/health", (req, res) => {
  res.json({ message: "Welcome to the API Gateway" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
