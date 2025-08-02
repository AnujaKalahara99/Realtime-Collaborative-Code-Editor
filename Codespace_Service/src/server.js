import express from "express";
import cors from "cors";
import codespaceRoutes from "./routes/codespaceRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/codespaces", codespaceRoutes);
app.use("/codespaces", memberRoutes);
app.use(errorHandler);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Codespace Service running on port ${PORT}`);
});
