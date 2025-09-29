import express from "express";
import db from "../db.js";

const router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

router.get("/createhome", ensureAuthenticated, (req, res) => {
  res.render("home.ejs");
})

// 🏠 Home: create new shopping list
router.post("/create", ensureAuthenticated, async (req, res) => {
  if (req.user.email) {
    const { title, branch, action } = req.body;
    const userId = req.user.user_id;
    
    if (action === "create") {
      try {
        // Create new shopping list
        const nextListIdResult = await db.query(
          "SELECT COALESCE(MAX(list_id), 0) + 1 AS next_list_id FROM shopping_list WHERE user_id = $1",
          [userId]
        );
        const nextListId = nextListIdResult.rows[0].next_list_id;

        await db.query(
          "INSERT INTO shopping_list (user_id, list_id, title, branch) VALUES ($1, $2, $3, $4)",
          [userId, nextListId, title, branch]
        );

        res.redirect(`/shopping-list/lists/add-item/${nextListId}`);
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Error creating list");
      }
    } else if (action === "skip") {
      // Show previous shopping lists
      try {
        console.log(userId);
        res.redirect("/shopping-list/lists");
      } catch (err) {      
        console.error(err.message);
        res.status(500).send("Error loading lists");
      }
    }
  } else {
    res.redirect("/login");
  }
});

// 🛒 View all the previous shopping lists  by date
router.get("/lists", ensureAuthenticated, async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  const userId = req.user.user_id;

  try {
    const branch_details = await db.query(
      `
        SELECT title, branch, list_id
        FROM shopping_list
        WHERE user_id = $1;
      `
      , [userId]
    );

    const shoppinglists = await db.query(
      `
        SELECT sli.list_id, DATE(sli.feedback_date) AS created_date, COALESCE(p.name, 'DAILY TOTAL') AS product_name, p.category, sli.quantity_requested, p.price, sli.comment, sli.status, SUM(p.price * sli.quantity_requested) AS totals
        FROM products p
        JOIN shopping_list_items sli ON sli.product_id = p.product_id
        WHERE sli.user_id = $1
        GROUP BY
          sli.list_id,
          GROUPING SETS (
            (sli.list_id, DATE(sli.feedback_date), p.name, p.category, sli.quantity_requested, p.price, sli.comment, sli.status),
            (sli.list_id, DATE(sli.feedback_date))
          )
        ORDER BY
          sli.list_id, created_date, GROUPING(p.name), product_name;
      `
      , [userId]
    );

    const branch = branch_details.rows;
    const shopping_list = shoppinglists.rows;
    const listsWithItems = branch.map(list => ({
      ...list,
      shopping_list: shopping_list.filter(item => item.list_id === list.list_id)
    }));

    res.render("shopping-list", {
      title: branch.title,
      branch: branch.branch,
      listId: branch.list_id,
      lists: listsWithItems,
      showAddItemForm: false
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error loading shopping list");
  }
});

// Get route to display the users input
router.get("/lists/add-item/:id", ensureAuthenticated, async (req, res) => {
  const userId = req.user.user_id;
  const listId = req.params.id;

  try {
    // Get the list details
    const branch_details = await db.query(
      `SELECT title, branch FROM shopping_list WHERE user_id = $1 AND list_id = $2;`,
      [userId, listId]
    );

    // Get the items for this list
    const shoppinglists = await db.query(
      `SELECT sli.list_item_id, sli.list_id, DATE(sli.feedback_date) AS created_date, COALESCE(p.name, 'DAILY TOTAL') AS product_name, p.category, sli.quantity_requested, p.price, sli.comment, sli.status, SUM(p.price * sli.quantity_requested) AS totals
       FROM products p
       JOIN shopping_list_items sli ON sli.product_id = p.product_id
       WHERE sli.user_id = $1 AND sli.list_id = $2
       GROUP BY
         sli.list_id,
         GROUPING SETS (
           (sli.list_id, sli.list_item_id, DATE(sli.feedback_date), p.name, p.category, sli.quantity_requested, p.price, sli.comment, sli.status),
           (sli.list_id, DATE(sli.feedback_date))
         )
       ORDER BY
         sli.list_id, created_date, GROUPING(p.name), product_name;`,
      [userId, listId]
    );

    const branch = branch_details.rows[0] || {};
    const shopping_list = shoppinglists.rows;

    res.render("shopping-list", {
      title: branch.title,
      branch: branch.branch,
      listId: listId,
      lists: [{
        ...branch,
        list_id: listId,
        shopping_list
      }],
      showAddItemForm: true
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error loading shopping list");
  }
});

// ➕ Add item
router.post("/lists/add-item/:id", ensureAuthenticated, async (req, res) => {

  const userId = req.user.user_id;
  const productId = parseInt(req.body.product, 10);
  const quantity = parseInt(req.body.quantity, 10);
  const listId = parseInt(req.params.id, 10);

  if (!productId || !quantity || !listId) {
    return res.status(400).send("Missing or invalid product, quantity, or list ID");
  }

  try {
    await db.query(
      "INSERT INTO shopping_list_items (list_id, product_id, quantity_requested, user_id, status) VALUES ($1, $2, $3, $4, $5)",
      [listId, productId, quantity, userId, "not_found"]
    );
    // Redirect back to the GET route to show the updated list
    res.redirect(`/shopping-list/lists/add-item/${listId}`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error adding items");
  }
});

// product suggestion
router.get("/products/suggest", ensureAuthenticated, async (req, res) => {
  const search = req.query.q || "";
  try {
    const result = await db.query(
      "SELECT product_id, name FROM products WHERE name ILIKE $1 LIMIT 10",
      [`%${search}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error fetching suggestions" });
  }
});


// ✅ Toggle done
router.post("/:list_id/items/:item_id/done", ensureAuthenticated, async (req, res) => {

  const listId = req.params.list_id;
  const listItemId = req.params.item_id;
  const { done } = req.body;

  try {
    
    await db.query(
      "UPDATE shopping_list_items SET status = $1 WHERE list_item_id = $2",
      [done === "true" ? "found" : "not_found", listItemId]
    );

    console.log("Toggling item:", listItemId, "to", done === "true" ? "found" : "not_found");

    res.redirect(`/shopping-list/lists/add-item/${listId}`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error updating item status");
  }
});

// Customer Comment

router.post("/:list_id/items/:item_id/comment", ensureAuthenticated, async (req, res) => {
  const { list_id, item_id } = req.params;
  const { comment } = req.body;
  const result = await db.query(
    "UPDATE shopping_list_items SET comment = $1 WHERE list_item_id = $2 Returning *",
    [comment, item_id]
  );

  const updatedItem = result.rows[0];

  await db.query(
    "INSERT INTO feedback_log (user_id, product_id, comment) VALUES($1, $2, $3)",
    [updatedItem.user_id, updatedItem.product_id, comment]
  );
  res.redirect(`/shopping-list/lists/add-item/${list_id}`);
});

// 🗑️ Delete item
router.post("/:list_id/items/:item_id/delete", ensureAuthenticated, async (req, res) => {
  try {
    const listId = req.params.list_id;
    const itemId = req.params.item_id;

    await db.query("DELETE FROM shopping_list_items WHERE list_item_id = $1", 
      [itemId]
    );

    res.redirect(`/shopping-list/lists/add-item/${listId}`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error deleting item");
  }
});

export default router;
