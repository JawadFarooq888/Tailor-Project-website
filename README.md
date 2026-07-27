# Tailor Boutique — E-commerce MVP

A full-stack tailor/clothing boutique store: customer storefront + admin panel, built on the MERN stack (MongoDB, Express, React, Node). This is the MVP milestone — see [Scope](#scope) for what's included now vs. planned for later phases.

## Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth (httpOnly cookies), Multer for image uploads
- **Frontend**: React (Vite), React Router, Tailwind CSS v4, Axios, Recharts (admin dashboard chart)
- **Theme**: a bespoke "tailor boutique" palette — ink charcoal, warm ivory, brass gold, deep burgundy, muted taupe — applied consistently across storefront and admin.

## Project structure

```
TailorProject/
  server/     Express REST API
  client/     React storefront + admin panel (single Vite app)
```

## Prerequisites

- Node.js 18+ (tested with Node 24)
- A MongoDB database — either:
  - **Local**: install MongoDB Community Server and make sure it's running on `mongodb://127.0.0.1:27017`, or
  - **Atlas** (free tier, no local install needed): create a cluster at mongodb.com/atlas and copy its connection string.

## Setup

### 1. Backend

```bash
cd server
npm install
```

Edit `server/.env` (already created with local defaults) and set `MONGO_URI` if you're using Atlas instead of a local database:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tailor_boutique
JWT_SECRET=change_this_to_a_long_random_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Seed the database with a sample admin account, categories, and 32 products with generous stock (a couple are seeded low/out-of-stock so you can see the inventory alerts in action):

```bash
npm run seed
```

This prints the admin login: username `admin` / password `admin123`.

Start the API:

```bash
npm run dev
```

Runs on **http://localhost:5000**.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Runs on **http://localhost:5173**. The Vite dev server proxies `/api` and `/uploads` to `localhost:5000`, so no CORS setup is needed while developing.

### 3. Try it out

- Storefront: http://localhost:5173 — browse, filter, add to cart, checkout (COD or manual bank transfer), track orders from "My Dashboard".
- Admin panel: http://localhost:5173/admin/login — log in with the seeded admin account to manage products, inventory, categories, orders (status updates auto-adjust stock), customers, and reviews.

## Scope

### Built in this MVP
- Storefront: home, category browsing, search + filters (category/price/size/color), product detail, wishlist, cart, checkout (COD / manual bank transfer), customer login/register, order history & address book, contact/about pages.
- Admin: dashboard (revenue, orders, monthly sales chart, low-stock alerts, best sellers, recent orders), product CRUD with multi-image upload, **Inventory page** (stock levels table with search/low-stock/out-of-stock filters, manual Stock In / Stock Out / Correction adjustments with a required reason, full movement history log), category CRUD, order management with status workflow, customer list, review moderation.
- Inventory logic: stock auto-decrements on order placement, auto-restores on cancel/refund, low-stock is computed live from each product's threshold, and every manual adjustment (from Admin → Inventory) is written to an audit log with who made the change and why.

### Deferred to a later phase
Purchase orders & supplier management, coupon/promo engine, a real payment gateway (Stripe/etc. — currently COD + manual bank transfer only), the tailoring/measurements booking module, PDF/Excel report exports, SMS/WhatsApp notifications, courier/tracking integration, activity logs & automated DB backups.

## Notes

- Product images uploaded via the admin panel are stored on local disk (`server/uploads/`) and served statically — fine for development; swap for cloud storage (S3, Cloudinary) before production.
- The seed script assigns one representative stock photo per category (Wikimedia Commons, freely licensed) so the storefront isn't empty on first run. Replace these with your real product photography via **Admin → Products → Edit → Upload New Images**.
- Auth uses httpOnly JWT cookies; there's a single `User` model with a `role` field (`customer` / `admin`) rather than separate collections.
