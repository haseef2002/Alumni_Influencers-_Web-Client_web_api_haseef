# 🎓 Alumni Influencer Portal & Analytics Dashboard

A secure, full-stack enterprise application designed to manage alumni engagement and provide deep analytical insights into graduate career trajectories. This system leverages a high-performance Node.js API and a hybrid MySQL database to deliver real-time data visualizations.

## 🚀 Quick Start & Setup

### Prerequisites
* **Node.js** (v16.x or higher)
* **XAMPP / MySQL Server**
* **Browser:** Chrome, Edge, or Firefox

### Installation
1. **Clone the Repository**
   ```bash
   git clone [https://github.com/haseef2002/Alumni_Influencers-_Web-Client_web_api_haseefgit.git](https://github.com/haseef2002/Alumni_Influencers-_Web-Client_web_api_haseefgit.git)
   cd cw1-backend-api
Install Dependencies

Bash
npm install
Database Configuration

Open phpMyAdmin and create a database named alumni_portal.

Import the database_schema.sql file provided in the root directory.

This script builds the relational schema and injects mock data to populate the charts immediately.

Environment Setup

Create a .env file in the root folder.

Use the following template:

Code snippet
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=alumni_portal
JWT_SECRET=your_super_secret_key_here
Run the Application

Bash
node server.js
Backend API: http://localhost:5000

API Docs: http://localhost:5000/api-docs

🔒 Security Implementation (10 Marks)
This project follows industry-standard security protocols to protect PII (Personally Identifiable Information) and system integrity:

JWT Stateless Authentication: Implements JSON Web Tokens for session management. All protected routes require a valid Bearer token in the Authorization header.

Token Revocation (Blacklisting): A dedicated RevokedTokens table tracks invalidated JWTs upon logout, mitigating replay attacks.

Cryptographic Hashing: Uses bcrypt with 10 salt rounds to ensure passwords are never stored in plain text.

Client-Based Scoping: The API differentiates between clients (e.g., Web Dashboard vs. Mobile AR App). Tokens are scoped to restrict the Mobile App from accessing sensitive administrative analytics.

Access Auditing: Every request is logged in the AccessLogs table, providing a full audit trail for security monitoring.

📊 Data Management (7 Marks)
The architecture prioritizes data flexibility and retrieval speed:

Hybrid Relational-JSON Storage: Core user data is relational, while complex, variable-length data (Employment, Degrees) is stored in MySQL JSON columns. This eliminates the need for expensive multi-table joins.

Referential Integrity: Uses ON DELETE CASCADE constraints to ensure database cleanliness and prevent orphaned records.

Real-time Aggregation: The analyticsController processes JSON data on-the-fly to provide the frontend with metrics for Top Employers, Alumni Growth, and Geographic distribution.

Index Optimization: Primary and Unique keys are placed on frequently searched fields (email, user_id) to maintain O(1) performance during high traffic.

📖 API Documentation
This project includes full interactive documentation via Swagger UI. To view and test the API endpoints, start the server and navigate to:
http://localhost:5000/api-docs

📁 Folder Structure
/config: Database connection pool.

/controllers: Business logic and data aggregation.

/routes: API endpoint definitions and middleware.

/public: Frontend assets and dashboard logic.

server.js: Application entry point.

database_schema.sql: Full DB structure and seed data.
