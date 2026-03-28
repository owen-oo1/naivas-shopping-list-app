-- ============================================================
-- Naivas CRM & Shopping List — PostgreSQL Schema
-- Run this in pgAdmin to create all tables
-- ============================================================

-- 1. Role enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('manager', 'staff', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,          -- bcrypt hash or 'google_oauth'
  role       user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Branches
CREATE TABLE IF NOT EXISTS branches (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(120) NOT NULL,
  location VARCHAR(255)
);

-- 4. Products
CREATE TABLE IF NOT EXISTS products (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price    NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- 5. Shopping Lists
CREATE TABLE IF NOT EXISTS shopping_lists (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  branch_id  INT NOT NULL REFERENCES branches(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Shopping List Items
DO $$ BEGIN
  CREATE TYPE item_status AS ENUM ('pending', 'found', 'missing');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS shopping_list_items (
  id         SERIAL PRIMARY KEY,
  list_id    INT NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id),
  quantity   INT NOT NULL DEFAULT 1,
  status     item_status NOT NULL DEFAULT 'pending',
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Customer Feedback (future feature)
CREATE TABLE IF NOT EXISTS feedback (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  branch_id  INT NOT NULL REFERENCES branches(id),
  rating     INT CHECK (rating >= 1 AND rating <= 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Seed Data
-- ============================================================

-- Branches
INSERT INTO branches (name, location) VALUES
  ('Naivas Westlands', 'Westlands, Nairobi'),
  ('Naivas Karen', 'Karen, Nairobi'),
  ('Naivas Mombasa CBD', 'CBD, Mombasa'),
  ('Naivas Kisumu', 'Kisumu Town'),
  ('Naivas Nakuru', 'Nakuru Town')
ON CONFLICT DO NOTHING;

-- Sample Products
INSERT INTO products (name, category, price) VALUES
  ('Unga Maize Flour 2kg', 'Cereals & Grains', 180.00),
  ('Brookside Fresh Milk 500ml', 'Dairy', 65.00),
  ('Ketepa Tea Bags 100s', 'Beverages', 350.00),
  ('Golden Fry Cooking Oil 1L', 'Cooking Oils', 280.00),
  ('Omo Washing Powder 1kg', 'Household', 220.00),
  ('Royco Mchuzi Mix Beef', 'Spices', 10.00),
  ('Exe Sugar 1kg', 'Cereals & Grains', 160.00),
  ('Toss Detergent 500g', 'Household', 95.00),
  ('Coca-Cola 500ml', 'Beverages', 70.00),
  ('White Star Maize Meal 1kg', 'Cereals & Grains', 120.00),
  ('Dettol Soap 175g', 'Personal Care', 130.00),
  ('Colgate Toothpaste 100ml', 'Personal Care', 180.00),
  ('Soko Ugali Flour 2kg', 'Cereals & Grains', 150.00),
  ('KCC Butter 250g', 'Dairy', 320.00),
  ('Bread - Broadways 400g', 'Bakery', 60.00)
ON CONFLICT DO NOTHING;

-- Admin user (password: admin123 — change in production!)
INSERT INTO users (name, email, password, role) VALUES
  ('Admin Manager', 'admin@naivas.co.ke', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'manager')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_branch ON shopping_lists(branch_id);
CREATE INDEX IF NOT EXISTS idx_sli_list ON shopping_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_sli_product ON shopping_list_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(name gin_trgm_ops);

-- Enable trigram extension for fuzzy product search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
