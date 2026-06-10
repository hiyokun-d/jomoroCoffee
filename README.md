# Jomoro Coffee — Backend

REST API backend for a coffee shop ordering system. Three independent NestJS microservices sharing a MariaDB database via XAMPP.

---

## Requirements

| Tool | Version |
|---|---|
| Node.js | 22.x |
| npm | bundled with Node.js |
| XAMPP | 8.2.12 (MariaDB 10.x) |

**Optional but recommended:**
- [Postman](https://www.postman.com/) — for testing API endpoints
- phpMyAdmin (comes with XAMPP) — for managing the database

---

## What to Expect

Three services run simultaneously on separate ports:

| Service | Port | Swagger Docs |
|---|---|---|
| Auth Service | 3001 | http://localhost:3001/api |
| Product Service | 3002 | http://localhost:3002/api |
| Transaction Service | 3003 | http://localhost:3003/api |

Each service has its own database. They communicate internally — the transaction service calls the product service to fetch product details and update stock on checkout.

---

## Setup

### 1. Install Node.js

Download and install Node.js 22.x from https://nodejs.org  
After install, verify:
```bash
node -v   # should print v22.x.x
npm -v
```

---

### 2. Setup XAMPP

1. Download and install **XAMPP 8.2.12** from https://www.apachefriends.org
2. Open **XAMPP Control Panel**
3. Click **Start** next to **MySQL** (you do NOT need Apache unless you use phpMyAdmin)
4. MySQL should show green — port 3306

---

### 3. Import the Database

Open your browser and go to: http://localhost/phpmyadmin

1. Click **Import** in the top nav
2. Click **Choose File** → select `jomoro.sql` from the project root folder
3. Click **Go**

This creates three databases:
- `jomoro_auth` — users table with a default admin account
- `jomoro_product` — categories and products tables (4 sample categories)
- `jomoro_transaction` — carts, cart items, orders, and order details tables

**Default admin account:**

| Field | Value |
|---|---|
| Email | admin@jomoro.com |
| Password | admin12pass |
| Role | ADMIN |

---

### 4. Configure Environment Variables

Each service has a `.env.example` file. You need to duplicate it and rename the copy to `.env` inside each service folder.

**Option A — File Explorer (works on all Windows):**
1. Open `auth-service` folder → find `.env.example`
2. Copy the file (Ctrl+C) → paste it in the same folder (Ctrl+V)
3. Rename the copy to `.env`
4. Repeat for `product-service` and `transaction-service`

**Option B — PowerShell:**
```powershell
Copy-Item auth-service\.env.example auth-service\.env
Copy-Item product-service\.env.example product-service\.env
Copy-Item transaction-service\.env.example transaction-service\.env
```

**Option C — Command Prompt (CMD):**
```cmd
copy auth-service\.env.example auth-service\.env
copy product-service\.env.example product-service\.env
copy transaction-service\.env.example transaction-service\.env
```

Then open each `.env` file and update the password to match your XAMPP MySQL root password:

```env
DATABASE_PASSWORD=your_xampp_mysql_password
DATABASE_URL=mysql://root:your_xampp_mysql_password@localhost:3306/jomoro_auth
```

> If you never set a MySQL password in XAMPP, the default root password is **empty**. Leave `DATABASE_PASSWORD=` blank and use `DATABASE_URL=mysql://root:@localhost:3306/jomoro_auth`.

Also set a JWT secret (any random string works):
```env
JWT_SECRET=some_random_secret_string
```

> **All three `.env` files must use the same `JWT_SECRET`.**

---

### 5. Install Dependencies

Open **three separate terminals** and run in each service folder:

```bash
# Terminal 1
cd auth-service
npm install
```

```bash
# Terminal 2
cd product-service
npm install
```

```bash
# Terminal 3
cd transaction-service
npm install
```

---

### 6. Start the Services

In each terminal (after `npm install` finishes), run:

```bash
npm run start:dev
```

Wait until each terminal prints:
```
Application is running on: http://localhost:300X
```

All three must be running at the same time for the system to work correctly.

---

## Testing the API

Open Swagger UI in your browser to test endpoints without Postman:

- Auth: http://localhost:3001/api
- Products: http://localhost:3002/api
- Transactions: http://localhost:3003/api

### Quick Flow

**As Admin — add a product:**
1. `POST /auth/login` on port 3001 with `admin@jomoro.com` / `admin12pass` → copy the token
2. `POST /admin/products` on port 3002 — add `Authorization: Bearer <token>` in the header

**As Customer — place an order:**
1. `POST /auth/register` on port 3001 → register an account
2. `POST /auth/login` → copy the token
3. `POST /cart` on port 3003 — add a product to cart
4. `POST /orders` on port 3003 — checkout

---

## Windows Troubleshooting

### MySQL won't start in XAMPP
- Another program is using port 3306 (usually Skype, or a previous MySQL install)
- Open **XAMPP Control Panel → Config → MySQL** and change the port, or stop the conflicting program
- Or open Task Manager → find `mysqld.exe` → End Task → try starting again

### `npm install` or `npm run start:dev` not recognized
- Node.js is not added to PATH — reinstall Node.js and check "Add to PATH" during install
- Close and reopen the terminal after installing

### `EACCES` or permission error on `npm install`
- Run the terminal **as Administrator**: right-click Command Prompt / PowerShell → **Run as administrator**

### `Access denied for user 'root'@'localhost'`
- Wrong password in `.env` — double-check `DATABASE_PASSWORD` in all three `.env` files
- XAMPP MySQL default root password is empty — try leaving `DATABASE_PASSWORD=` blank

### `Unknown database 'jomoro_auth'`
- The SQL file has not been imported — go back to **Step 3**

### `Error: connect ECONNREFUSED 127.0.0.1:3306`
- XAMPP MySQL is not running — open XAMPP Control Panel and start MySQL

### Port 3001 / 3002 / 3003 already in use
- Another process is using that port
- Run: `netstat -ano | findstr :3001` — find the PID
- Then: `taskkill /PID <pid> /F`
- Or add a `PORT=` line to the service's `.env` file to use a different port

### `nest` command not found during `npm run start:dev`
- NestJS CLI is installed locally per project, not globally — this is normal
- Make sure you ran `npm install` inside the service folder first
- Run `npm run start:dev` from inside the service folder (not the project root)

### Long path errors on Windows (`MAX_PATH`)
- Enable long path support: open **PowerShell as Administrator** and run:
  ```powershell
  New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
  ```
- Then re-run `npm install`

---

## Troubleshooting (General)

| Problem | Fix |
|---|---|
| `401 Unauthorized` | Token missing or expired — login again to get a new token |
| `403 Forbidden` | Using a CUSTOMER token on an admin-only endpoint |
| `404` on product endpoints during checkout | Product service must be running on port 3002 |
| Cart empty error on checkout | Add items to cart first via `POST /cart` |
