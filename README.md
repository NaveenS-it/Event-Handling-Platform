# EventSphere — End-to-End Event Lifecycle & Ticketing Platform

## 🌟 Overview
EventSphere is a premium, secure, and fully scalable web application to manage event creation, online ticketing, mock payments, QR-code tickets generation, and user/admin dashboards. Designed with glassmorphism UI elements to embody a professional SaaS style.

## 🗂 Project Structure
The project is built upon HTML/VanillaJS for Frontend to reduce configuration overhead and maximize lightness, and Node.js + Express + MySQL on the backend for robust, transaction-safe database processing.

```
/eventsphere
 ├── frontend/
 │   ├── pages/       # HTML Pages (login, register, events, dashboard, checkout)
 │   ├── css/         # Modular CSS
 │   ├── js/          # Frontend logic (api wrapper, auth, dashboard)
 │   └── index.html   # Landing root redirect
 ├── backend/
 │   ├── config/      # Environment and Database connection
 │   ├── controllers/ # Node controllers for business logic
 │   ├── middleware/  # JWT Authentication & Error handling
 │   ├── models/      # (Schema defined in SQL for DB instead of ORM setup to optimize speed)
 │   ├── routes/      # Express robust modular routes
 │   ├── server.js    # Entry file
 │   └── package.json
 └── database/
     └── schema.sql   # Relational full DB schema
```

## 🚀 Setup Instructions

Follow these step-by-step instructions to get your local environment running.

### 1. Database Setup
1. Ensure you have **MySQL** installed and running on your machine.
2. Open your MySQL client (e.g. phpMyAdmin, MySQL Workbench, or CLI).
3. Execute the `database/schema.sql` script.
   ```sql
   mysql -u root -p < database/schema.sql
   ```
4. This script will automatically create the `eventsphere` database, build all normalized relation tables, and insert a default Admin user:
   - Email: `admin@eventsphere.com`
   - Password: `admin123`

### 2. Backend Server Setup
1. CD into the `/backend` directory:
   ```bash
   cd c:\One_Drive\OneDrive\Documents\fullstack_class\EventSphere\backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. *Server will start on `http://localhost:5000` (Make sure your `.env` values in `config/environment.js` match your MySQL setup `localhost / root / ''`).*
5. Check backend functionality by visiting `http://localhost:5000/` in the browser. 

### 3. Frontend Setup
1. Open the project root folder `c:\One_Drive\OneDrive\Documents\fullstack_class\EventSphere\` using an extension like **Live Server** in VSCode to avoid CORS local block on `file://` protocols.
2. Alternatively, open `index.html` manually in a modern browser (Ensure CORS matches).
3. To test the workflow:
   - Login as `admin@eventsphere.com`, password `admin123`.
   - Access Admin dashboard stats.
   - Use Postman to `POST /api/events` to populate the homepage, or register as Organizer.

## ✨ Core Features Built

1. **Robust Custom Authentication**: Built in-house using `bcrypt` for password hashing and `jsonwebtoken` for protected resources and RBAC (Role-Based Access Control).
2. **Glassmorphism UI**: High-end CSS using transparencies and sleek animations globally (`global.css`).
3. **Transaction Safety**: MySQL `START TRANSACTION`, `COMMIT`, `ROLLBACK` implemented during booking flows so seats/tier quantity never oversells (`booking.controller.js`).
4. **QR Codes generation**: Dynamic PDF QR visual outputs utilizing `qrcode` npm on tickets backend.
5. **REST API**: Modular APIs. Rate Limiting configured inside `server.js` using `express-rate-limit`.

Enjoy the journey! Let me know if you need any scale-ups.
