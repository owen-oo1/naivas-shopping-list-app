import express from "express";
import db from "../db.js";

const router = express.Router();

// Dead stock
router.get("/dead-stock", async (req, res) => {
  try {
    const query = `
      SELECT p.product_id, p.name
      FROM Products p
      LEFT JOIN Shopping_List_Items sli ON p.product_id = sli.product_id
      WHERE sli.product_id IS NULL;
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Lazy staff
router.get("/lazy-staff", async (req, res) => {
  try {
    const query = `
      SELECT p.name, sli.comment
      FROM Shopping_List_Items sli
      JOIN Products p ON sli.product_id = p.product_id
      WHERE sli.status = 'not_found' AND p.stock_quantity > 0;
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Popular products
router.get("/popular", async (req, res) => {
  try {
    const query = `
      SELECT p.name, COUNT(*) AS times_requested
      FROM Shopping_List_Items sli
      JOIN Products p ON sli.product_id = p.product_id
      GROUP BY p.name
      ORDER BY times_requested DESC;
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;
