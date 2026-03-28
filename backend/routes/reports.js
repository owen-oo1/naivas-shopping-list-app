import { Router } from "express";
import db from "../db.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();

// GET /reports — manager/staff only
router.get("/", requireRole("manager", "staff"), async (_req, res) => {
  try {
    // Dead stock: products never requested
    const deadStock = await db.query(
      `SELECT p.id AS product_id, p.name FROM products p
       LEFT JOIN shopping_list_items sli ON p.id = sli.product_id
       WHERE sli.id IS NULL ORDER BY p.name LIMIT 20`
    );

    // Lazy staff: items marked missing with comments
    const lazyStaff = await db.query(
      `SELECT p.name, sli.comment FROM shopping_list_items sli
       JOIN products p ON sli.product_id = p.id
       WHERE sli.status = 'missing' AND sli.comment IS NOT NULL AND sli.comment != ''
       ORDER BY sli.created_at DESC LIMIT 20`
    );

    // Popular products
    const popular = await db.query(
      `SELECT p.name, COUNT(*) AS times_requested
       FROM shopping_list_items sli
       JOIN products p ON sli.product_id = p.id
       GROUP BY p.name ORDER BY times_requested DESC LIMIT 20`
    );

    res.json({
      deadStock: deadStock.rows,
      lazyStaff: lazyStaff.rows,
      popular: popular.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});

// GET /reports/analytics — manager only
router.get("/analytics", requireRole("manager"), async (_req, res) => {
  try {
    // Monthly trends
    const trends = await db.query(
      `SELECT TO_CHAR(sl.created_at, 'Mon YYYY') AS month,
              COUNT(DISTINCT sl.id) AS requests,
              COUNT(CASE WHEN sli.status = 'found' THEN 1 END) AS fulfilled,
              COALESCE(SUM(sli.quantity * p.price), 0) AS revenue
       FROM shopping_lists sl
       LEFT JOIN shopping_list_items sli ON sl.id = sli.list_id
       LEFT JOIN products p ON sli.product_id = p.id
       GROUP BY TO_CHAR(sl.created_at, 'Mon YYYY'), DATE_TRUNC('month', sl.created_at)
       ORDER BY DATE_TRUNC('month', sl.created_at) DESC LIMIT 12`
    );

    // Category breakdown
    const categories = await db.query(
      `SELECT p.category, COUNT(*) AS count, COALESCE(SUM(sli.quantity * p.price), 0) AS revenue
       FROM shopping_list_items sli
       JOIN products p ON sli.product_id = p.id
       WHERE p.category IS NOT NULL
       GROUP BY p.category ORDER BY count DESC`
    );

    // Branch performance
    const branches = await db.query(
      `SELECT b.name AS branch, COUNT(DISTINCT sl.id) AS lists,
              COUNT(sli.id) AS items,
              COALESCE(SUM(sli.quantity * p.price), 0) AS revenue
       FROM branches b
       LEFT JOIN shopping_lists sl ON b.id = sl.branch_id
       LEFT JOIN shopping_list_items sli ON sl.id = sli.list_id
       LEFT JOIN products p ON sli.product_id = p.id
       GROUP BY b.name ORDER BY revenue DESC`
    );

    res.json({
      trends: trends.rows,
      categories: categories.rows,
      branches: branches.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

// GET /reports/customers — manager only
router.get("/customers", requireRole("manager"), async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email,
              COUNT(DISTINCT sl.id) AS total_lists,
              COALESCE(SUM(sli.quantity * p.price), 0) AS total_spent,
              MAX(sl.created_at) AS last_active
       FROM users u
       LEFT JOIN shopping_lists sl ON u.id = sl.user_id
       LEFT JOIN shopping_list_items sli ON sl.id = sli.list_id
       LEFT JOIN products p ON sli.product_id = p.id
       WHERE u.role = 'customer'
       GROUP BY u.id ORDER BY total_spent DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

export default router;
