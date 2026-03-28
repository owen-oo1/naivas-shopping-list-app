import { Router } from "express";
import db from "../db.js";

const router = Router();

// GET /branches
router.get("/", async (_req, res) => {
  try {
    const result = await db.query("SELECT id, name, location FROM branches ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch branches" });
  }
});

export default router;
