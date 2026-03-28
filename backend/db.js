import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT || "5432"),
});

// Test connection on startup
pool.query("SELECT NOW()").then(() => {
  console.log("✅ Database connected");
}).catch((err) => {
  console.error("❌ Database connection failed:", err.message);
});

export default pool;
