import express from "express";
import db from "./db.js";
import shoppingRoutes from "./routes/shopping.js";
import reportRoutes from "./routes/reports.js";
import feedbackRoutes from "./routes/feedback.js";

const app = express();
app.use(express.json());
app.use("/shopping", shoppingRoutes);
app.use("/reports", reportRoutes);
app.use("/feedback", feedbackRoutes);

app.get("/", (req, res) => {
  res.send("Naivas API is running ✅");
});

app.get("/products", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Products");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
