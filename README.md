# FoodRush 🍔 — Full-Stack Food Delivery Platform

A production-ready, scalable food delivery web application inspired by Zomato/Swiggy. Built with **React + Vite**, **Node.js + Express**, and **MongoDB**.

---

## ✨ Features

### 👤 Customer Side
- Browse & search restaurants (by cuisine, city, rating)
- View full menu with categories, veg/non-veg filters
- Add to cart with restaurant conflict detection
- Checkout with address & payment method selection
- Live order tracking (simulated status progression)
- Order history view

### 🍽 Restaurant Owner
- Private dashboard with analytics (revenue, orders, rating)
- Full menu CRUD (add, edit, delete, toggle availability)
- Manage and update incoming orders

### 🔐 Admin Panel
- Platform-wide stats (users, restaurants, revenue)
- User management (activate/deactivate)
- Restaurant approval system
- Monitor all orders

### ⚙️ Core
- JWT authentication (access + refresh tokens)
- Role-based access control (user / restaurant / admin)
- Zod validation on all API inputs
- Rate limiting on sensitive routes
- Dark / Light mode toggle
- Mobile-first responsive design

---

## 🗂 Project Structure

```
Pranesh Project/
├── backend/
│   ├── src/
│   │   ├── config/       # db.js
│   │   ├── controllers/  # auth, restaurant, menu, order, payment, admin
│   │   ├── middleware/   # authMiddleware, errorHandler, rateLimiter, validator
│   │   ├── models/       # User, Restaurant, MenuItem, Order
│   │   ├── routes/       # all route files
│   │   └── utils/        # generateToken, seedData
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/          # apiClient, auth, restaurants, orders
│   │   ├── components/   # Navbar, RestaurantCard, MenuItemCard, OrderTracker...
│   │   ├── pages/
│   │   │   ├── auth/     # LoginPage, RegisterPage
│   │   │   ├── user/     # Home, Restaurants, Detail, Cart, Checkout, Track, History
│   │   │   ├── restaurant/ # Dashboard, Menu, Orders
│   │   │   └── admin/    # Dashboard, Users, Restaurants, Orders
│   │   └── store/        # authStore, cartStore, orderStore (Zustand)
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm

### 1. Backend Setup

```bash
cd backend
npm install
# Copy env (already created for you):
# Edit .env if needed (MONGO_URI, JWT_SECRET)
npm run dev
```

### 2. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
| Credential | Email | Password |
|---|---|---|
| Admin | admin@foodrush.com | Admin@123 |
| Restaurant Owner | spicegarden@foodrush.com | Owner@123 |
| Customer | user@foodrush.com | User@123 |

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/refresh` | — | Refresh access token |
| GET | `/api/auth/profile` | User | Get profile |
| GET | `/api/restaurants` | — | List restaurants |
| GET | `/api/restaurants/featured` | — | Featured restaurants |
| GET | `/api/restaurants/:id` | — | Restaurant + menu |
| POST | `/api/restaurants` | Restaurant | Create restaurant |
| GET | `/api/menu/:restaurantId` | — | Get menu |
| POST | `/api/menu` | Restaurant | Create menu item |
| PUT | `/api/menu/:id` | Restaurant | Update menu item |
| DELETE | `/api/menu/:id` | Restaurant | Delete menu item |
| POST | `/api/orders` | User | Place order |
| GET | `/api/orders/my` | User | My orders |
| PATCH | `/api/orders/:id/status` | Restaurant | Update status |
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/users` | Admin | All users |
| PATCH | `/api/admin/restaurants/:id/approve` | Admin | Approve restaurant |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh) + bcryptjs |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend && npm run build
# Push to GitHub, connect to Vercel
# Set VITE_API_URL env var if hosting backend separately
```

### Backend → Render / Railway
1. Push backend to GitHub
2. Create Web Service on Render
3. Set environment variables from `.env.example`
4. Set Start Command: `node server.js`

---

## 🔮 Future Enhancements

- [ ] Real Razorpay / Stripe integration
- [ ] WebSocket-based live order tracking
- [ ] Push notifications (FCM)
- [ ] AI-based recommendation engine
- [ ] Restaurant photo gallery
- [ ] Review & rating system after delivery
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

## 📄 License

MIT © FoodRush 2024
