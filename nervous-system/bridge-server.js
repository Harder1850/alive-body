import express from "express";
import { consultBrain } from "./alive-bridge.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", layer: "body-nervous-system" });
});

app.post("/consult", async (req, res) => {
  try {
    const result = await consultBrain(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`ALIVE Body bridge listening on http://localhost:${PORT}`);
});
