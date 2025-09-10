import express from "express";
import db from "./db.js";
import shoppingRoutes from "./routes/shopping.js";
import reportRoutes from "./routes/reports.js";
import feedbackRoutes from "./routes/feedback.js";

const app = express();
app.use(express.json());
app.use("/shopping-list", shoppingRoutes);
app.use("/reports", reportRoutes);
app.use("/feedback", feedbackRoutes);

// EJS setup
app.set("view engine", "ejs");
app.set("views", "./views");

// Middlewares
app.use(express.urlencoded({ extended: true })); // for form POSTs from EJS
app.use(express.json());
app.use(express.static("public")); // serve public/css/styles.css etc.

app.get("/", (req, res) => {
  res.render("index", { title: "Naivas App" });
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
