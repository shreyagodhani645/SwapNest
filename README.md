# SwapNest

SwapNest is a premium marketplace app for swapping and trading items, built with React, Node.js, and **Oracle Database**.

## 🔐 Login credentials

### Admin Login
- **Email/Username**: `admin@swapnest.com`
- **Password**: `admin123`
- **Login URL**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

### User Login
- **Username**: `alice_w` (or `alice@example.com`)
- **Password**: `password123`
- **Other Demo Users**: `bob_m`, `charlie_d`, `diana_p` (all use `password123`)

## Project Structure

```
DBMS/
├── backend/           # Node.js/Express backend
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Express middleware
│   ├── routes/        # API route definitions
│   ├── uploads/       # Uploaded files
│   ├── *.js           # Backend scripts
│   ├── *.sql          # Database schema and seed files
│   └── package.json   # Backend dependencies
├── frontend/          # React frontend
│   ├── src/           # React source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── index.html         # Project landing page
├── package.json       # Project-level dependencies (if any)
└── README.md          # Project documentation
```

## Prerequisites

* **Node.js**: Installed on your system.
* **Oracle Database**: Running locally (default port: `1521`, SID: `XE` or `ORCLCDB`).
* **Environment**: A `.env` file in the `backend` folder with your Oracle DB credentials.

## Quick Start (Windows)

1.  **Run the Startup Script**:
    Double-click `run_swapnest.bat` in the root directory.
    This will automatically start both the backend and frontend in separate windows.

## Manual Setup

### 1. Database Setup

Run the following SQL scripts in your Oracle DB using SQL Developer or SQL*Plus:
1. `backend/full_schema.sql` (Creates base tables/sequences)
2. `backend/advanced_schema.sql` (Adds complex relations/stored procs)
3. `backend/dbms_objects.sql` (Adds functions/triggers/indexes)
4. `backend/seed_data.sql` (Seeds dummy data)
5. `node backend/create_admin.js` (Creates the admin user)

### 2. Troubleshooting (Common Issues)


#### **"Database is offline" or 500/503 Errors**
This usually means the backend cannot connect to Oracle.
1.  **Check Oracle**: Ensure your Oracle service is **Running**.
2.  **Check Connection String**: Verify `DB_CONNECT_STRING` in `backend/.env` match your setup (e.g., `localhost:1521/XEPDB1`).


#### **"Table or view does not exist"**
This means the tables aren't created yet.
- Run the SQL scripts in `backend/` as mentioned above.


### 3. Backend
```bash
cd backend
npm install
# Configure .env
node setup_db.js   # Initializes DB schema
node server.js     # Starts backend server
```

### 4. Frontend
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

## Technologies Used
- **Backend:** Node.js, Express, Oracle DB
- **Frontend:** React, Vite, Tailwind CSS
- **Other:** JWT for authentication, Multer for file uploads, WebSockets for chat

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is for educational purposes.
