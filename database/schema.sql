-- ================================================
-- Naivas Customer Relationship & Shopping List App
-- Database Schema (PostgreSQL)
-- ================================================

-- Users Table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('customer', 'admin', 'staff', 'manager')) DEFAULT 'customer'
);

-- Products Table
CREATE TABLE Products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    price NUMERIC(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0
);

-- Shopping List Table
CREATE TABLE Shopping_List (
    list_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Shopping List Items Table
CREATE TABLE Shopping_List_Items (
    list_item_id SERIAL PRIMARY KEY,
    list_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_requested INT DEFAULT 1,
    status VARCHAR(20) CHECK (status IN ('found', 'not_found')) DEFAULT 'found',
    comment TEXT,
    FOREIGN KEY (list_id) REFERENCES Shopping_List(list_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

-- Feedback Log Table
CREATE TABLE Feedback_Log (
    feedback_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);
