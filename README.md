# 🎓 Alumni Influencer Portal & Analytics Dashboard

### 📄 Overview

The Alumni Influencer Portal is a secure enterprise-grade platform built to manage graduate engagement and track career trajectories. The system features a **Node.js API**, a **Hybrid MySQL database**, and a real-time **Analytics Dashboard**. It is designed to serve multiple clients with different permission levels, including a Web Admin Dashboard and a restricted Mobile AR App.

---

### 🚀 Startup Instructions

1. **Clone the Repository**
```bash
git clone https://github.com/haseef2002/Alumni_Influencers-_Web-Client_web_api_haseefgit.git
cd cw1-backend-api

```


2. **Install Dependencies**
```bash
npm install

```


3. **Database Setup**
* Create a MySQL database named `alumni_portal`.
* Import `database_schema.sql` to build tables and inject presentation data.


4. **Run the Application**
```bash
node server.js

```


* **API Base URL:** `http://localhost:5000`
* **Swagger Docs:** `http://localhost:5000/api-docs`



---

### 📁 Project Structure

* **`/config`**: Database connection pool and environment configuration.
* **`/controllers`**: Business logic for analytics, authentication, and bidding.
* **`/routes`**: API endpoint definitions and routing logic.
* **`/middleware`**: Security filters, JWT verification, and scoping checks.
* **`/public`**: Frontend assets (HTML, CSS, Vanilla JS, Chart.js).
* **`server.js`**: Server initialization and middleware pipeline.
* **`database_schema.sql`**: Complete database structure and seed data.

---

### ✨ Key Features

* **Interactive Analytics:** Visualizes alumni growth, top employers, and global distribution.
* **Blind Bidding System:** Allows alumni to compete for the "Featured Alumnus" slot.
* **Smart Filtering:** Advanced search by graduation year and degree programme.
* **Security Auditing:** Continuous logging of API access for threat monitoring.

---

### 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MySQL (Relational + JSON Hybrid)
* **Frontend:** HTML5, Tailwind CSS, Chart.js
* **API Documentation:** Swagger UI / OpenAPI 3.0
* **Security:** JWT (Stateless), Bcrypt (Hashing)

---

### 🔑 Environmental Variables

Create a `.env` file in the root directory with the following keys:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=alumni_portal
JWT_SECRET=your_secure_secret_key

```

---

### 🔗 Main Endpoints

* **Auth:** `POST /api/auth/register`, `POST /api/auth/login`
* **Profiles:** `GET /api/profiles/me`, `POST /api/profiles/me`
* **Analytics:** `GET /api/analytics/dashboard-data` (Protected)
* **Bidding:** `POST /api/bids`, `GET /api/bids/me` (Protected)
* **Security:** `POST /api/auth/revoke` (Logout/Revocation)

---

### 🛡️ Security Notes & Implementation

This system implements a defense-in-depth strategy:

* **JWT Stateless Authentication:** Secure session management without server-side state.
* **Bcrypt Hashing:** Passwords undergo 10 rounds of salting and hashing before storage.
* **Token Revocation (Blacklisting):** A `RevokedTokens` table stores invalidated JWTs upon logout, preventing replay attacks.
* **Audit Logging:** The `AccessLogs` table tracks every authenticated endpoint access, recording the user ID and timestamp for security forensic analysis.

---

### 🗝️ API Key Scoping & Permissions

The system uses **Client-Based Scoping** to manage multiple frontend applications:

* **Web Admin Dashboard:** Tokens are issued with full access scopes (`read:analytics`, `write:profile`), allowing access to the complex data charts.
* **Mobile AR App:** Tokens are restricted to a "limited access" scope. This client can only read specific alumni data and is explicitly blocked from accessing the Analytics Dashboard endpoints via middleware checks.

---

### 📊 Data Management

The database architecture prioritizes speed and flexibility:

* **Hybrid JSON Storage:** To handle variable profile data (degrees, employment history), the system uses **MySQL Native JSON** columns. This avoids the performance cost of 5+ joining tables.
* **Referential Integrity:** Enforced via `ON DELETE CASCADE` constraints, ensuring that if a user is deleted, all related bids, profiles, and logs are purged to prevent orphaned data.
* **Data Sanitization:** All incoming requests are validated to prevent SQL Injection and ensure data type consistency within the JSON objects.

---

### 💰 Bidding Rule Implementation

The "Featured Alumnus" selection follows a strictly validated blind-bidding process:

1. **Validation:** The system ensures bids are positive decimal values and tied to an authenticated user.
2. **Persistence:** Bids are stored with a `pending` status until the selection cycle finishes.
3. **Selection Logic:** A background logic identifies the maximum bid, updates the status to `won`, and automatically increments the `appearance_count` in the winner's profile.

---

### 📈 Analytic Dashboard Implementation

The dashboard logic bridges the gap between raw data and visual insights:

* **Backend Aggregation:** The `analyticsController` parses JSON employment strings into frequency maps (tallying companies and locations).
* **Top-N Filtering:** The API sorts and slices the data (e.g., "Top 5 Employers") before sending it to the client to minimize payload size.
* **Frontend Fault Tolerance:** The dashboard uses "Smart Fallbacks" in Chart.js. If data is missing for a specific metric, the UI renders an "Awaiting Data" placeholder instead of a broken chart.
