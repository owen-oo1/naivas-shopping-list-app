import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Dead stock
    const deadStockQuery = `
      SELECT p.product_id, p.name
      FROM Products p
      LEFT JOIN Shopping_List_Items sli ON p.product_id = sli.product_id
      WHERE sli.product_id IS NULL;
    `;
    const deadStock = await db.query(deadStockQuery);

    // Lazy staff
    const lazyStaffQuery = `
      SELECT p.name, sli.comment
      FROM Shopping_List_Items sli
      JOIN Products p ON sli.product_id = p.product_id
      WHERE sli.status = 'not_found' AND p.stock_quantity > 0;
    `;
    const lazyStaff = await db.query(lazyStaffQuery);

    // Popular products
    const popularQuery = `
      SELECT p.name, COUNT(*) AS times_requested
      FROM Shopping_List_Items sli
      JOIN Products p ON sli.product_id = p.product_id
      GROUP BY p.name
      ORDER BY times_requested DESC;
    `;
    const popular = await db.query(popularQuery);

    res.render("reports", {
      title: "Store Reports",
      deadStock: deadStock.rows,
      lazyStaff: lazyStaff.rows,
      popular: popular.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error loading reports");
  }
});

export default router;
