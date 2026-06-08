# Jomoro Koffee — Backend Documentation

## Stack

| Tool | Version |
|---|---|
| Node.js | 22.16.0 |
| NestJS | 11.x |
| Prisma | 7.x (prisma-client-js) |
| Database | MariaDB via XAMPP 8.2.12 |
| Auth | JWT + Passport |

---

## Services

| Service | Port | Swagger UI |
|---|---|---|
| Auth Service | 3001 | http://localhost:3001/api |
| Product Service | 3002 | http://localhost:3002/api |
| Transaction Service | 3003 | http://localhost:3003/api |

---

## Prerequisites

- XAMPP installed and running (MySQL/MariaDB started)
- Node.js 22.x installed
- Sequel Ace (or phpMyAdmin) to manage the database

---

## Database Setup

1. Open **Sequel Ace**
2. Connect with:
   - Host: `localhost`
   - Username: `root`
   - Password: `!Root12345!`
   - Port: `3306`
3. Go to **File → Import...**
4. Select `jomoro.sql` from the project root
5. Click **Open**

This creates:
- `jomoro_auth` — users table + default admin account
- `jomoro_product` — categories + products tables (4 sample categories included)
- `jomoro_transaction` — carts, cart_items, orders, order_details tables

### Default Admin Account

| Field | Value |
|---|---|
| Email | admin@jomoro.com |
| Password | admin12pass |
| Role | ADMIN |

---

## Running the Services

Open **3 separate terminals** and run one service per terminal.

```bash
# Terminal 1 — Auth Service
cd auth-service
npm run start:dev
```

```bash
# Terminal 2 — Product Service
cd product-service
npm run start:dev
```

```bash
# Terminal 3 — Transaction Service
cd transaction-service
npm run start:dev
```

Wait for all three to print `Application is running on: http://localhost:300X`.

---

## API Reference

### Auth Service — Port 3001

#### POST /auth/register
Register a new customer account.

**Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "mypass12"
}
```

**Validations:**
- `first_name` / `last_name` — letters only, no numbers or symbols
- `email` — must end with `.com`, `.net`, `.org`, or `.id`
- `password` — min 8 characters, at least 2 digits, no spaces

**Success response:**
```json
{ "message": "Registration successful" }
```

---

#### POST /auth/login
Login and receive a JWT token.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "mypass12"
}
```

**Success response:**
```json
{ "token": "<jwt_token>" }
```

Use this token in all protected endpoints as:
```
Authorization: Bearer <jwt_token>
```

---

#### GET /profiles
Get the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Success response:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "role": "CUSTOMER"
}
```

---

### Product Service — Port 3002

#### GET /products
Returns all products with their category.

#### GET /products/:id
Returns a single product by ID.

#### GET /categories
Returns all categories.

#### GET /categories/:categoryId/products
Returns all products under a specific category.

---

#### POST /admin/products *(Admin only)*
Create a new product.

**Headers:** `Authorization: Bearer <admin_token>`

**Body:**
```json
{
  "name": "Iced Caramel Latte",
  "description": "A rich and creamy caramel latte served over ice",
  "price": 35000,
  "stock": 50,
  "image_url": null,
  "category_id": 2
}
```

**Validations:**
- `name` — at least 3 words
- `description` — at least 20 characters
- `price` — positive integer, minimum 1
- `stock` — integer between 0 and 999
- `category_id` — must reference an existing category

---

#### POST /admin/products/:id/update *(Admin only)*
Update an existing product. Same body and validations as create.

#### POST /admin/products/:id/reduce *(Admin only)*
Reduce product stock.

**Body:**
```json
{ "quantity": 5 }
```

Returns error if quantity exceeds current stock.

#### POST /admin/products/:id/delete *(Admin only)*
Delete a product.

---

### Transaction Service — Port 3003

All endpoints require `Authorization: Bearer <token>`.

#### GET /cart
Returns the authenticated user's cart with product name, price, and quantity fetched from Product Service.

**Success response:**
```json
{
  "items": [
    {
      "product_id": 1,
      "name": "Iced Caramel Latte",
      "price": 35000,
      "quantity": 2
    }
  ]
}
```

---

#### POST /cart
Add a product to cart.

**Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Validations:**
- Product must not already be in cart
- Quantity must not exceed available stock

---

#### POST /cart/:product_id/update
Update quantity of a cart item.

**Body:**
```json
{ "quantity": 3 }
```

#### POST /cart/:product_id/delete
Remove a specific item from cart.

#### POST /cart/clear
Remove all items from cart.

---

#### GET /orders
Returns all orders placed by the authenticated user.

#### POST /orders/:id
Returns full details of a specific order (product name, quantity, price per item).

**Success response:**
```json
{
  "order_id": 1,
  "created_at": "2026-06-09T10:00:00.000Z",
  "details": [
    {
      "product_id": 1,
      "name": "Iced Caramel Latte",
      "quantity": 2,
      "price": 35000
    }
  ]
}
```

---

#### POST /orders
**Checkout** — converts cart into an order.

- Returns error if cart is empty
- Creates order and order details records
- Reduces product stock in Product Service
- Clears the cart

**Success response:**
```json
{
  "message": "Order placed successfully",
  "order_id": 1
}
```

---

## Testing Flow (Step by Step)

### As Admin — add products

1. Login with `admin@jomoro.com` / `admin12pass` → `POST /auth/login` on port 3001
2. Copy the token
3. On port 3002 → `POST /admin/products` with the token → create a product
4. Verify → `GET /products` (no token needed)

### As Customer — place an order

1. Register → `POST /auth/register` on port 3001
2. Login → `POST /auth/login` → copy token
3. Add to cart → `POST /cart` on port 3003 with token
4. View cart → `GET /cart`
5. Checkout → `POST /orders`
6. View order → `GET /orders` then `POST /orders/:id`

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Connection refused` on start | XAMPP MySQL is not running — start it first |
| `Access denied for user 'root'` | Wrong password in `.env` — update `DATABASE_PASSWORD` in all 3 `.env` files |
| `Unknown database 'jomoro_auth'` | SQL file not imported yet — import `jomoro.sql` via Sequel Ace |
| `401 Unauthorized` | Token missing or expired — login again to get a new token |
| `403 Forbidden` | Using a CUSTOMER token on an admin endpoint — use admin account |
| Port already in use | Another process uses 3001/3002/3003 — stop it or change `PORT` in `.env` |
