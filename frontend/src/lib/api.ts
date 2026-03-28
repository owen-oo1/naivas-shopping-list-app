// API Service Layer — point VITE_API_URL to your Express backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Request failed');
  }
  return res.json();
}

// Auth
export const api = {
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/login', { method: 'POST', body: JSON.stringify({ username: email, password }) }),

  register: (name: string, email: string, password: string) =>
    request<{ user: User; token: string }>('/register', { method: 'POST', body: JSON.stringify({ name, username: email, password }) }),

  logout: () => request('/logout'),

  // Shopping Lists
  getLists: () => request<ShoppingList[]>('/shopping-list/lists'),

  createList: (title: string, branch: string) =>
    request<ShoppingList>('/shopping-list/create', { method: 'POST', body: JSON.stringify({ title, branch: branch }) }),

  getListItems: (listId: string) =>
    request<ShoppingListDetail>(`/shopping-list/lists/${listId}`),

  addItem: (listId: string, productName: string, productId: string, quantity: number) =>
    request(`/shopping-list/lists/add-item/${listId}`, { method: 'POST', body: JSON.stringify({ product_name: productName, product_id: productId, quantity }) }),

  toggleItemDone: (listId: string, itemId: string, done: boolean) =>
    request(`/shopping-list/${listId}/items/${itemId}/done`, { method: 'POST', body: JSON.stringify({ done }) }),

  updateComment: (listId: string, itemId: string, comment: string) =>
    request(`/shopping-list/${listId}/items/${itemId}/comment`, { method: 'POST', body: JSON.stringify({ comment }) }),

  deleteItem: (listId: string, itemId: string) =>
    request(`/shopping-list/${listId}/items/${itemId}/delete`, { method: 'POST' }),

  searchProducts: (query: string) =>
    request<Product[]>(`/shopping-list/products/suggest?q=${encodeURIComponent(query)}`),

  // Reports (manager/staff only)
  getReports: () => request<Reports>('/reports'),

  // Analytics (manager/staff only)
  getAnalytics: () => request<AnalyticsData>('/reports/analytics'),

  // Customers (manager only)
  getCustomers: () => request<CustomerSummary[]>('/reports/customers'),

  // Branches
  getBranches: () => request<Branch[]>('/branches'),
};

// Types
export type UserRole = 'manager' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Branch {
  id: number;
  name: string;
  location?: string;
}

export interface ShoppingList {
  id: string;
  title: string;
  branch: string;
  branch_id?: number;
  created_at: string;
  item_count?: number;
  total?: number;
}

export interface ShoppingListItem {
  list_item_id: string;
  product_name: string;
  category?: string;
  quantity_requested: number;
  price?: number;
  comment?: string;
  status: 'pending' | 'found' | 'missing';
  created_date: string;
  totals?: number;
}

export interface ShoppingListDetail {
  id: string;
  title: string;
  branch: string;
  shopping_list: ShoppingListItem[];
  catalogue: Product[];
}

export interface Product {
  product_id: string;
  name: string;
  category?: string;
  price?: number;
}

export interface Reports {
  deadStock: { product_id: string; name: string }[];
  lazyStaff: { name: string; comment: string }[];
  popular: { name: string; times_requested: number }[];
}

export interface AnalyticsData {
  trends: { month: string; requests: number; fulfilled: number; revenue: number }[];
  categories: { category: string; count: number; revenue: number }[];
  branches: { branch: string; lists: number; items: number; revenue: number }[];
}

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  total_lists: number;
  total_spent: number;
  last_active: string;
}
