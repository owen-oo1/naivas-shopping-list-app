# Naivas CRM & Shopping List App — Full Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Frontend (React)](#frontend-react)
3. [Backend (Express API)](#backend-express-api)
4. [Database Schema](#database-schema)
5. [Authentication Flow](#authentication-flow)
6. [API Reference](#api-reference)
7. [Setup Guide](#setup-guide)
8. [Development Roadmap](#development-roadmap)

---

## 1. Architecture Overview

```
┌─────────────────────┐      HTTP/JSON       ┌─────────────────────┐
│   React Frontend    │  ◄──────────────────► │  Express Backend    │
│   (Vite + TS)       │      JWT Bearer       │  (Node.js)          │
│   Port 8080         │                       │  Port 3000          │
└─────────────────────┘                       └─────────┬───────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────────┐
                                              │  PostgreSQL (pg)    │
                                              │  Database: naivas   │
                                              └─────────────────────┘
```

**Stack:**
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, React Query, Recharts
- **Backend:** Express.js, pg (raw SQL), bcrypt, JWT, Passport (Google OAuth)
- **Database:** PostgreSQL 14+

---

## 2. Frontend (React)

### File Structure
```
src/
├── App.tsx                 # Root router & providers
├── index.css               # Design system (CSS tokens)
├── main.tsx                # Entry point
├── components/
│   ├── AppLayout.tsx       # Authenticated shell (sidebar + outlet)
│   ├── AppSidebar.tsx      # Role-filtered navigation sidebar
│   └── RoleGuard.tsx       # Route-level RBAC component
├── hooks/
│   └── useAuth.tsx         # Auth context (login/register/logout/hasRole)
├── lib/
│   ├── api.ts              # API service layer (all fetch calls + types)
│   └── mock-data.ts        # Fallback mock data for dev
├── pages/
│   ├── Landing.tsx         # Public landing page
│   ├── Login.tsx           # Email/password + Google sign-in
│   ├── Register.tsx        # Registration + Google sign-up
│   ├── AuthCallback.tsx    # Google OAuth redirect handler
│   ├── Dashboard.tsx       # Role-aware dashboard (manager vs customer view)
│   ├── ShoppingLists.tsx   # List management (CRUD)
│   ├── ShoppingListDetail.tsx  # Item-level management
│   ├── Reports.tsx         # Dead stock, lazy staff, popular items
│   ├── Analytics.tsx       # Charts: trends, categories, branches
│   └── Customers.tsx       # CRM customer list (manager only)
```

### Role-Based Access Control (RBAC)

| Page            | Manager | Staff | Customer |
|-----------------|---------|-------|----------|
| Dashboard       | ✅ Full  | ✅ Full | ✅ Simple |
| Shopping Lists  | ✅ All   | ✅ All  | ✅ Own    |
| Reports         | ✅       | ✅     | ❌       |
| Analytics       | ✅       | ❌     | ❌       |
| Customers       | ✅       | ❌     | ❌       |

### Key Components

**`useAuth` hook** — Manages JWT token storage in localStorage, exposes `login()`, `register()`, `logout()`, `hasRole()`.

**`RoleGuard`** — Wraps routes; redirects to `/dashboard` if user lacks required role.

**`AppSidebar`** — Dynamically filters nav items based on `hasRole()`.

---

## 3. Backend (Express API)

### File Structure
```
naivas-backend/
├── index.js              # Express server, CORS, auth routes, Google OAuth
├── db.js                 # PostgreSQL connection pool (pg)
├── middleware/
│   └── auth.js           # JWT verification, role middleware, token signing
├── routes/
│   ├── shopping.js       # Shopping list CRUD endpoints
│   ├── reports.js        # Reports & analytics (role-protected)
│   └── branches.js       # Branch listing
├── naivas_schema.sql     # Full database schema + seed data
├── .env.example          # Environment variable template
└── package.json
```

### Middleware

**`requireAuth(req, res, next)`** — Extracts and verifies JWT from `Authorization: Bearer <token>` header. Attaches `req.user = { id, email, role, name }`.

**`requireRole(...roles)`** — Factory that returns middleware checking `req.user.role` against allowed roles. Returns 403 if denied.

**`signToken(user)`** — Creates JWT with 7-day expiry containing user ID, email, role, and name.

---

## 4. Database Schema

### Tables

| Table                  | Purpose                              |
|------------------------|--------------------------------------|
| `users`                | All users (managers, staff, customers) |
| `branches`             | Naivas store locations               |
| `products`             | Product catalog with prices          |
| `shopping_lists`       | User-created shopping lists          |
| `shopping_list_items`  | Items within lists (with status)     |
| `feedback`             | Customer branch ratings (future)     |

### Enums
- `user_role`: `manager`, `staff`, `customer`
- `item_status`: `pending`, `found`, `missing`

### Key Relationships
```
users (1) ──► (N) shopping_lists (1) ──► (N) shopping_list_items
                     │                            │
                     ▼                            ▼
                  branches                     products
```

---

## 5. Authentication Flow

### Email/Password Login
1. User submits email + password to `POST /login`
2. Backend finds user by email, compares bcrypt hash
3. Returns `{ user, token }` — JWT valid for 7 days
4. Frontend stores token in `localStorage`, attaches to all API requests

### Google OAuth
1. User clicks "Sign in with Google" → redirects to `GET /auth/google`
2. Google consent screen → callback to `GET /auth/google/callback`
3. Backend creates user if new (role = 'customer'), signs JWT
4. Redirects to `{CLIENT_URL}/auth/callback?token=...&user=...`
5. `AuthCallback.tsx` parses params, stores in localStorage, redirects to `/dashboard`

---

## 6. API Reference

### Auth (Public)
| Method | Endpoint             | Body                                  | Response                |
|--------|----------------------|---------------------------------------|-------------------------|
| POST   | `/login`             | `{ username, password }`              | `{ user, token }`       |
| POST   | `/register`          | `{ name, username, password }`        | `{ user, token }`       |
| GET    | `/logout`            | —                                     | `{ message }`           |
| GET    | `/auth/google`       | —                                     | Redirect to Google      |

### Shopping Lists (Authenticated)
| Method | Endpoint                                    | Body                                      | Access          |
|--------|---------------------------------------------|-------------------------------------------|-----------------|
| GET    | `/shopping-list/lists`                      | —                                         | All (filtered)  |
| POST   | `/shopping-list/create`                     | `{ title, branch_id }`                    | All             |
| GET    | `/shopping-list/lists/:id`                  | —                                         | Owner or staff  |
| POST   | `/shopping-list/lists/add-item/:listId`     | `{ product_name, product_id, quantity }`  | All             |
| POST   | `/shopping-list/:listId/items/:itemId/done` | `{ done: boolean }`                       | All             |
| POST   | `/shopping-list/:listId/items/:itemId/comment` | `{ comment }`                          | All             |
| POST   | `/shopping-list/:listId/items/:itemId/delete` | —                                       | All             |
| GET    | `/shopping-list/products/suggest?q=`        | —                                         | All             |

### Reports (Role-Protected)
| Method | Endpoint              | Access         | Returns                                    |
|--------|-----------------------|----------------|--------------------------------------------|
| GET    | `/reports`            | Manager, Staff | Dead stock, lazy staff, popular products   |
| GET    | `/reports/analytics`  | Manager        | Monthly trends, categories, branches       |
| GET    | `/reports/customers`  | Manager        | Customer summary with spend data           |

### Branches (Authenticated)
| Method | Endpoint     | Access | Returns               |
|--------|--------------|--------|-----------------------|
| GET    | `/branches`  | All    | List of all branches  |

---

## 7. Setup Guide

### Database Setup
1. Open **pgAdmin** → connect to your PostgreSQL server
2. Create database: `CREATE DATABASE naivas;`
3. Run `naivas_schema.sql` in the query tool
4. Default admin: `admin@naivas.co.ke` / `admin123`

### Backend Setup
```bash
cd naivas-backend
npm install
cp .env.example .env
# Edit .env with your database credentials and secrets
npm run dev
```

### Frontend Setup
The React frontend is deployed on Lovable. To point it to your backend:
- Set the environment variable `VITE_API_URL` to your backend URL (e.g., `http://localhost:3000`)
- Default fallback is `http://localhost:3000`

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Authorized redirect URI: `http://localhost:3000/auth/google/callback`
5. Copy Client ID and Secret into `.env`

---

## 8. Development Roadmap

### ✅ Phase 1 — MVP (Current)
- [x] User authentication (email/password + Google OAuth)
- [x] Role-based access control (manager/staff/customer)
- [x] Shopping list CRUD with item management
- [x] Product search with suggestions
- [x] Item status tracking (pending/found/missing)
- [x] Comments on missing items
- [x] Reports: dead stock, lazy staff, popular products
- [x] Analytics: monthly trends, category breakdown, branch performance
- [x] Customer CRM view for managers

### 🔜 Phase 2 — Enhanced UX (Next 2-4 weeks)
- [ ] Password reset / forgot password flow
- [ ] Dark mode toggle
- [ ] Real-time notifications (WebSocket) when items are marked found/missing
- [ ] Shopping list sharing between users
- [ ] Barcode/QR scanner for adding products
- [ ] Export shopping lists as PDF
- [ ] Mobile-optimized shopping mode (large touch targets, swipe gestures)

### 📊 Phase 3 — Advanced Analytics (Month 2)
- [ ] Customer segmentation (frequent/high-value/at-risk)
- [ ] Predictive stock demand using historical data
- [ ] Branch comparison dashboards
- [ ] Staff performance scorecards
- [ ] Automated weekly email reports to managers
- [ ] Custom date range filters on all reports

### 🏪 Phase 4 — Operations (Month 3)
- [ ] Inventory management module (stock levels per branch)
- [ ] Supplier order suggestions based on demand
- [ ] Branch manager role with branch-scoped access
- [ ] Customer loyalty points system
- [ ] Feedback & ratings system (tables already created)
- [ ] SMS/WhatsApp notifications for list updates

### 🚀 Phase 5 — Scale & Deploy (Month 4+)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Production deployment (Railway/Render for backend, Lovable for frontend)
- [ ] Rate limiting & request throttling
- [ ] API versioning (v1/v2)
- [ ] Comprehensive test suite (Jest + Supertest)
- [ ] Admin panel for user management
- [ ] Multi-tenant support for franchise model

---

*As at: March 2026 — Naivas CRM & Shopping List App*
