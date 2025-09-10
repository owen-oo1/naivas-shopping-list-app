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

// Get shopping list for a specific customer (and render EJS)
router.get("/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;
    const result = await db.query(
      `SELECT sli.list_item_id, sli.product_id, p.name, sli.status, sli.comment
      FROM Shopping_List_Items sli
      JOIN Shopping_List sl ON sli.list_id = sl.list_id
      JOIN Products p ON sli.product_id = p.product_id
      WHERE sl.user_id = $1`,
      [userId]
    );

    res.render("shopping-list", { 
      title: "Shopping list",
      items: result.rows, 
      userId,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error loading shopping list");
  }
});


export default router;
