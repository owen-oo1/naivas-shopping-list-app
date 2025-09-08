-- ================================================
-- Naivas Shopping List App - Sample Data Seeding
-- ================================================

-- Insert sample users
INSERT INTO Users (name, email, password, role) VALUES
('Alice Mwangi', 'alice@example.com', 'hashedpassword1', 'customer'),
('Brian Otieno', 'brian@example.com', 'hashedpassword2', 'customer'),
('Clara Njeri', 'clara@example.com', 'hashedpassword3', 'staff'),
('David Kamau', 'david@example.com', 'hashedpassword4', 'manager');

-- Insert sample products
INSERT INTO Products (name, category, price, stock_quantity) VALUES
('Milk 1L', 'Dairy', 65.00, 50),
('Bread', 'Bakery', 55.00, 30),
('Eggs (tray)', 'Poultry', 350.00, 20),
('Rice 5kg', 'Grains', 600.00, 40),
('Cooking Oil 2L', 'Cooking', 700.00, 15),
('Kale (sukuma wiki)', 'Vegetables', 40.00, 0); -- out of stock intentionally

-- Insert sample shopping lists
INSERT INTO Shopping_List (user_id) VALUES
(1),
(2);

-- Insert sample shopping list items
INSERT INTO Shopping_List_Items (list_id, product_id, quantity_requested, status, comment) VALUES
(1, 1, 2, 'found', NULL),      -- Alice bought 2 Milks
(1, 2, 1, 'not_found', 'No bread on shelf'),
(2, 4, 1, 'found', NULL),      
(2, 6, 3, 'not_found', 'No sukuma in stock');

-- Insert feedback
INSERT INTO Feedback_Log (user_id, product_id, comment) VALUES
(1, 2, 'Bread often missing in the morning'),
(2, 6, 'Kale is out of stock too frequently');
