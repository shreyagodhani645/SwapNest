# SwapNest

SwapNest is a premium marketplace app for swapping and trading items, built with React, Node.js, and Oracle DB.

## Prerequisites

* **Node.js**: Installed on your system.
* **Oracle DB**: Running on Docker or locally (Port: `1521`, SID: `XEPDB1`).
* **Environment**: A `.env` file in the `backend` folder with your DB credentials.

## Quick Start (Windows)

1.  **Run the Startup Script**:
    Double-click [run_swapnest.bat](file:///c:/00Shreya/College/Year%203/SEM%206/DBMS/Project/DBMS/run_swapnest.bat) in the root directory.
    This will automatically start both the backend and frontend in separate windows.

## Manual Setup

### 1. Database Setup
Run the following SQL scripts in your Oracle DB:
- [full_schema.sql](file:///c:/00Shreya/College/Year%203/SEM%206/DBMS/Project/DBMS/backend/full_schema.sql)
- [advanced_schema.sql](file:///c:/00Shreya/College/Year%203/SEM%206/DBMS/Project/DBMS/backend/advanced_schema.sql)
- [seed_data.sql](file:///c:/00Shreya/College/Year%203/SEM%206/DBMS/Project/DBMS/backend/seed_data.sql)

### 2. Troubleshooting (Common Issues)

#### **"Database is offline" or 500/503 Errors**
This usually means the backend cannot connect to Oracle.
1.  **Check Oracle**: Ensure your Oracle Docker container or local service is **Running**.
2.  **Check Connection String**: Verify `DB_CONNECTION_STRING` in `backend/.env` matches your setup (e.g., `localhost:1521/XEPDB1`).
3.  **Check Admin Privileges**: If using Docker, ensure you have permissions to access the network bridge.

#### **"Table or view does not exist"**
This means the tables aren't created yet.
- Run the SQL scripts in `backend/` (`full_schema.sql`, `advanced_schema.sql`, `seed_data.sql`) using a tool like SQL Developer.

### 3. Backend
```bash
cd backend
npm install
npm start
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features
- **Auth**: Secure login/signup with JWT.
- **Marketplace**: Browse, search, and filter listings.
- **Wishlist**: Save items for later.
- **Chat**: Real-time messaging between users.
- **Offers**: Make and track price offers.
- **Trust Score**: Dynamic reputation system.
- **Premium UI**: Modern purple theme with smooth transitions.
