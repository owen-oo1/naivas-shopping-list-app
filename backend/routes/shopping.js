import { Router } from "express";
import db from "../db.js";

const router = Router();

// GET /shopping-list/lists — user's lists (managers see all)
router.get("/lists", async (req, res) => {
  try {
    let query, params;
    if (req.user.role === "manager" || req.user.role === "staff") {
      const user = 'management';
      query = `
        SELECT sl.id, sl.title, b.name AS branch, sl.branch_id, sl.created_at,
               COUNT(sli.id) AS item_count,
               COALESCE(SUM(sli.quantity_requested * p.price), 0) AS total
        FROM shopping_lists sl
        LEFT JOIN branches b ON sl.branch_id = b.branch_id
        LEFT JOIN shopping_list_items sli ON sl.id = sli.list_id
        LEFT JOIN products p ON sli.product_id = p.product_id
        GROUP BY sl.id, b.name
        ORDER BY sl.created_at DESC`;
      params = [];

      console.log(`Success ---- ${user} viewing shopping lists`);
    } else {
      const user = 'customer';
      query = `
        SELECT sl.id, sl.title, b.name AS branch, sl.branch_id, sl.created_at,
               COUNT(sli.id) AS item_count,
               COALESCE(SUM(sli.quantity_requested * p.price), 0) AS total
        FROM shopping_lists sl
        LEFT JOIN branches b ON sl.branch_id = b.branch_id
        LEFT JOIN shopping_list_items sli ON sl.id = sli.list_id
        LEFT JOIN products p ON sli.product_id = p.product_id
        WHERE sl.user_id = $1
        GROUP BY sl.id, b.name
        ORDER BY sl.created_at DESC`;
      params = [req.user.id];

      console.log(`Success ---- ${user} viewing shopping lists`);
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch lists" });
  }
});

// POST /shopping-list/create
router.post("/create", async (req, res) => {
  const { title, branch } = req.body;
  if (!title || !branch) {
    return res.status(400).json({ message: "Title and branch are required" });
  }
  try {
    const branchResults = await db.query("SELECT branch_id FROM branches WHERE name = $1", [branch]);
    const branchId = branchResults.rows[0].branch_id;
    const result = await db.query(
      "INSERT INTO shopping_lists (title, user_id, branch, branch_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, req.user.id, branch, branchId]
    );
    const list = result.rows[0];
    res.status(201).json({ ...list, branch: branch || "" });
    console.log(`Success ---- ${title} shopping list creted by user on ${branch} branch successfully`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create list" });
  }
});

// GET /shopping-list/lists/:id — single list with items
router.get("/lists/:id", async (req, res) => {
  try {
    const listResult = await db.query(
      `SELECT sl.id, sl.title, b.name AS branch
       FROM shopping_lists sl
       LEFT JOIN branches b ON sl.branch_id = b.branch_id
       WHERE sl.id = $1`, [req.params.id]
    );
    if (listResult.rows.length === 0) {
      return res.status(404).json({ message: "List not found" });
    }
    const list = listResult.rows[0];

    // Verify ownership for customers
    if (req.user.role === "customer") {
      const ownerCheck = await db.query("SELECT user_id FROM shopping_lists WHERE id = $1", [req.params.id]);
      if (ownerCheck.rows[0]?.user_id !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const itemsResult = await db.query(
      `SELECT sli.id AS list_item_id, p.name AS product_name, p.category,
              sli.quantity_requested AS quantity_requested, p.price, sli.comment,
              sli.status, sli.created_at AS created_date,
              (sli.quantity_requested * p.price) AS totals
       FROM shopping_list_items sli
       JOIN products p ON sli.product_id = p.product_id
       WHERE sli.list_id = $1
       ORDER BY sli.created_at`, [req.params.id]
    );

    const products = await db.query(
      `SELECT product_id, name, category, price FROM products `
    );

    res.json({ ...list, shopping_list: itemsResult.rows, catalogue: products.rows});
    console.log(`Success ---- User viewing live shopping list page`)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch list" });
  }
});

// POST /shopping-list/lists/add-item/:listId
router.post("/lists/add-item/:listId", async (req, res) => {
  const { product_name, product_id, quantity } = req.body;
  try {
    const category_obj = await db.query(
      `SELECT category FROM public.products 
      WHERE product_id = $1`, [product_id]
    );
    const category = category_obj.rows[0].category
    const result = await db.query(
      `INSERT INTO shopping_list_items (list_id, product_id, quantity_requested, product_name, category)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.listId, product_id, quantity || 1, product_name, category]
    );
    res.status(201).json(result.rows[0]);
    console.log(`Success ---- Item ${product_id} added successfully`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add item" });
  }
});

// POST /shopping-list/:listId/items/:itemId/done
router.post("/:listId/items/:itemId/done", async (req, res) => {
  const { done } = req.body;
  const status = done ? "found" : "pending";
  try {
    await db.query("UPDATE shopping_list_items SET status = $1 WHERE id = $2 AND list_id = $3",
      [status, req.params.itemId, req.params.listId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update item" });
  }
});

// POST /shopping-list/:listId/items/:itemId/comment
router.post("/:listId/items/:itemId/comment", async (req, res) => {
  const { comment } = req.body;
  try {
    await db.query("UPDATE shopping_list_items SET comment = $1 WHERE id = $2 AND list_id = $3",
      [comment, req.params.itemId, req.params.listId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update comment" });
  }
});

// POST /shopping-list/:listId/items/:itemId/delete
router.post("/:listId/items/:itemId/delete", async (req, res) => {
  try {
    await db.query("DELETE FROM shopping_list_items WHERE id = $1 AND list_id = $2",
      [req.params.itemId, req.params.listId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

// GET /shopping-list/products/suggest?q=
router.get("/products/suggest", async (req, res) => {
  const q = req.query.q || "";
  try {
    const result = await db.query(
      "SELECT id AS product_id, name, category, price FROM products WHERE name ILIKE $1 LIMIT 15",
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
});

export default router;
