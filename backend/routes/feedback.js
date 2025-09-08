import express from "express";
import db from "../db.js";

const router = express.Router();

// feedback for an item in a shopping list
router.post("/", async (req, res) => {
  try {
    const { list_id, product_id, status, comment } = req.body;

    const result = await db.query(
      `UPDATE Shopping_List_Items
       SET status = $1, comment = $2
       WHERE list_id = $3 AND product_id = $4
       RETURNING *`,
      [status, comment, list_id, product_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Shopping list item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get all feedback for a list
router.get("/:list_id", async (req, res) => {
  try {
    const { list_id } = req.params;

    const result = await db.query(
      `SELECT sli.list_item_id, p.name, sli.status, sli.comment
       FROM Shopping_List_Items sli
       JOIN Products p ON sli.product_id = p.product_id
       WHERE list_id = $1`,
      [list_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;
