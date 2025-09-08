import express from "express";
import db from "../db.js";

const router = express.Router();

//  Get all shopping lists
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Shopping_List");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Add a new shopping list for a user
router.post("/", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const result = await db.query(
      "INSERT INTO Shopping_List (user_id) VALUES ($1) RETURNING *",
      [user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;
