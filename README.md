# Media Lock: Full Stack Monetization Application

A complete production-grade application enabling users to register, upload premium images behind a coin-lock preview, and purchase access to see original media. Transaction history ledger logs and coin balances are managed atomically.

---

## 1. Backend Service Configuration

### Tech Stack
- **Runtime**: Node.js (configured with native ES Modules)
- **Framework**: Express.js
- **Database**: MySQL (promisified connection pools & transactions)
- **Media Processing**: Multer (file parsing) & Sharp (resizing/blurring)
- **Validation**: Express-Validator
- **Logging**: Morgan

### Steps to Run
1. **Database Setup**:
   - Ensure a MySQL service instance is running locally on port `3306`.
   - Run the initialization script located in [schema.sql](file:///D:/akul/PROJECTS/Media_lock/schema.sql) to create the tables, enum types, indices, and constraints.
2. **Environment Setup**:
   - Create a `.env` file in the root directory (based on `.env.example` template) and configure:
     ```env
     PORT=5000
     NODE_ENV=development
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_mysql_password
     DB_NAME=paid_media_locker
     DB_PORT=3306
     JWT_SECRET=your_jwt_secret_key_here
     JWT_EXPIRES_IN=7d
     INITIAL_COIN_BALANCE=100
     ```
3. **Install & Run Backend**:
   - Open a terminal in the root directory:
     ```bash
     npm install
     npm run dev
     ```
   - The server boots at `http://localhost:5000`.

---

## 2. Frontend React Native (Expo) Client Configuration

### Tech Stack
- **Framework**: React Native & Expo (SDK 57)
- **Navigation**: Expo Router (File-based navigation stacks & bottom tabs)
- **Form Controls**: React Hook Form + Zod validation schemas
- **Storage**: AsyncStorage
- **HTTP Client**: Axios (request/response auth token interceptors)

### Steps to Run
1. **Configure Local Network IP**:
   - Expo Go runs on your physical device and connects to your local machine via LAN.
   - Open [api.js](file:///D:/akul/PROJECTS/Media_lock/frontend/src/constants/api.js) and update the `baseUrl` configuration to point to your machine's network IP (e.g., `http://192.168.1.X:5000/api/v1`).
   - If testing exclusively inside an **Android Emulator**, you can leave it at the default loopback IP: `http://10.0.2.2:5000/api/v1`.
2. **Install & Run Client**:
   - Open a terminal inside the `frontend` folder:
     ```bash
     cd frontend
     npm install --legacy-peer-deps
     npm run start
     ```
   - Press **`a`** to open in Android Emulator, or scan the QR code using the **Expo Go** application on your iOS or Android physical device.

---

## 3. Key Completed API Endpoints
*   `POST /api/v1/auth/register` — User registration (credited with initial coins).
*   `POST /api/v1/auth/login` — User login (returns signed JWT token).
*   `GET /api/v1/media` — Paginated media feed (resolves locks based on requester identity).
*   `POST /api/v1/media/upload` — Upload premium images (saves preview/blurred thumbnails).
*   `POST /api/v1/media/:id/unlock` — Purchases image (deducts coins, credits seller, logs audit transaction).
*   `GET /api/v1/media/:id/original` — Streams high-resolution original image if unlocked/owned.
*   `GET /api/v1/wallet` — Retrieves current coins balance.
*   `GET /api/v1/wallet/transactions` — Retrieves transaction history ledger (newest first).
