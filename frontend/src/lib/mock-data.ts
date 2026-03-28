import type { ShoppingList, ShoppingListItem, Reports, Product } from './api';

export const mockLists: ShoppingList[] = [
  { id: '1', title: 'Weekly Groceries', branch: 'Naivas Westlands', created_at: '2026-03-15', item_count: 12, total: 4850 },
  { id: '2', title: 'Office Supplies', branch: 'Naivas Junction', created_at: '2026-03-14', item_count: 6, total: 2300 },
  { id: '3', title: 'Party Prep', branch: 'Naivas Prestige', created_at: '2026-03-12', item_count: 18, total: 8920 },
];

export const mockItems: ShoppingListItem[] = [
  { list_item_id: '1', product_name: 'Bread - White Sliced', category: 'Bakery', quantity_requested: 2, price: 65, status: 'found', created_date: '2026-03-15', totals: 130 },
  { list_item_id: '2', product_name: 'Milk - Fresh 500ml', category: 'Dairy', quantity_requested: 3, price: 75, status: 'found', created_date: '2026-03-15', totals: 225 },
  { list_item_id: '3', product_name: 'Eggs - Tray of 30', category: 'Dairy', quantity_requested: 1, price: 450, status: 'pending', created_date: '2026-03-15', totals: 450 },
  { list_item_id: '4', product_name: 'Rice - 2kg Pishori', category: 'Grains', quantity_requested: 1, price: 380, status: 'found', created_date: '2026-03-15', totals: 380 },
  { list_item_id: '5', product_name: 'Cooking Oil - 1L', category: 'Cooking', quantity_requested: 2, price: 320, status: 'missing', created_date: '2026-03-15', totals: 640, comment: 'Shelf was empty' },
  { list_item_id: '6', product_name: 'Sugar - 1kg', category: 'Baking', quantity_requested: 1, price: 170, status: 'found', created_date: '2026-03-15', totals: 170 },
  { list_item_id: '7', product_name: 'Tomatoes - 1kg', category: 'Vegetables', quantity_requested: 2, price: 120, status: 'found', created_date: '2026-03-15', totals: 240 },
  { list_item_id: '8', product_name: 'Onions - 1kg', category: 'Vegetables', quantity_requested: 1, price: 90, status: 'pending', created_date: '2026-03-15', totals: 90 },
];

export const mockReports: Reports = {
  deadStock: [
    { product_id: 'P101', name: 'Expired Yogurt Brand X' },
    { product_id: 'P202', name: 'Old Stock Cereal' },
    { product_id: 'P303', name: 'Discontinued Soap Bar' },
  ],
  lazyStaff: [
    { name: 'Cooking Oil - 1L', comment: 'Shelf was empty but item in storeroom' },
    { name: 'Tissue Paper - 6 Pack', comment: 'Not restocked for 2 days' },
    { name: 'Fresh Milk 500ml', comment: 'Display fridge was off' },
  ],
  popular: [
    { name: 'Bread - White Sliced', times_requested: 342 },
    { name: 'Milk - Fresh 500ml', times_requested: 298 },
    { name: 'Eggs - Tray of 30', times_requested: 256 },
    { name: 'Rice - 2kg Pishori', times_requested: 198 },
    { name: 'Sugar - 1kg', times_requested: 187 },
    { name: 'Cooking Oil - 1L', times_requested: 165 },
    { name: 'Tomatoes - 1kg', times_requested: 143 },
    { name: 'Maize Flour - 2kg', times_requested: 134 },
  ],
};

export const mockProducts: Product[] = [
  { product_id: 'P1', name: 'Bread - White Sliced', category: 'Bakery', price: 65 },
  { product_id: 'P2', name: 'Bread - Brown Sliced', category: 'Bakery', price: 70 },
  { product_id: 'P3', name: 'Milk - Fresh 500ml', category: 'Dairy', price: 75 },
  { product_id: 'P4', name: 'Milk - Fresh 1L', category: 'Dairy', price: 130 },
  { product_id: 'P5', name: 'Eggs - Tray of 30', category: 'Dairy', price: 450 },
  { product_id: 'P6', name: 'Rice - 2kg Pishori', category: 'Grains', price: 380 },
  { product_id: 'P7', name: 'Cooking Oil - 1L', category: 'Cooking', price: 320 },
  { product_id: 'P8', name: 'Sugar - 1kg', category: 'Baking', price: 170 },
  { product_id: 'P9', name: 'Tomatoes - 1kg', category: 'Vegetables', price: 120 },
  { product_id: 'P10', name: 'Onions - 1kg', category: 'Vegetables', price: 90 },
];

// Analytics mock data for charts
export const mockTrendData = [
  { month: 'Oct', requests: 1200, fulfilled: 1050, revenue: 285000 },
  { month: 'Nov', requests: 1400, fulfilled: 1200, revenue: 320000 },
  { month: 'Dec', requests: 1800, fulfilled: 1500, revenue: 410000 },
  { month: 'Jan', requests: 1350, fulfilled: 1180, revenue: 298000 },
  { month: 'Feb', requests: 1500, fulfilled: 1320, revenue: 345000 },
  { month: 'Mar', requests: 1650, fulfilled: 1480, revenue: 378000 },
];

export const mockCategoryData = [
  { category: 'Dairy', count: 456, revenue: 82000 },
  { category: 'Bakery', count: 389, revenue: 45000 },
  { category: 'Vegetables', count: 342, revenue: 38000 },
  { category: 'Grains', count: 298, revenue: 95000 },
  { category: 'Cooking', count: 267, revenue: 72000 },
  { category: 'Baking', count: 198, revenue: 28000 },
];

export const mockBranchData = [
  { branch: 'Westlands', lists: 145, items: 1240, revenue: 345000 },
  { branch: 'Junction', lists: 128, items: 980, revenue: 290000 },
  { branch: 'Prestige', lists: 112, items: 890, revenue: 265000 },
  { branch: 'Embakasi', lists: 98, items: 760, revenue: 210000 },
  { branch: 'Thika Road', lists: 87, items: 650, revenue: 185000 },
];
