-- ================================================
-- Naivas Shopping List App - Test Queries
-- ================================================

-- 1. Dead stock: products never requested by customers
SELECT p.product_id, p.name
FROM Products p
LEFT JOIN Shopping_List_Items sli ON p.product_id = sli.product_id
WHERE sli.product_id IS NULL;

-- 2. Lazy staff: product exists in stock but marked as not found
SELECT p.name, sli.comment
FROM Shopping_List_Items sli
JOIN Products p ON sli.product_id = p.product_id
WHERE sli.status = 'not_found' AND p.stock_quantity > 0;

-- 3. Popular products: most requested items
SELECT p.name, COUNT(*) AS times_requested
FROM Shopping_List_Items sli
JOIN Products p ON sli.product_id = p.product_id
GROUP BY p.name
ORDER BY times_requested DESC;

-- 4. Customer complaints log
SELECT u.name AS customer, p.name AS product, f.comment, f.created_at
FROM Feedback_Log f
JOIN Users u ON f.user_id = u.user_id
JOIN Products p ON f.product_id = p.product_id;
