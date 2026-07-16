# Media Lock - Backend Architecture & File Details

This document provides a detailed breakdown of every directory, file, and configuration created during the initial setup of the **Media Lock** backend foundation.

---

## 1. Directory Structure Overview

The project is structured under the `src/` folder to maintain separation of concerns:

```text
D:\akul\PROJECTS\Media_lock
├── src/
│   ├── config/             # Infrastructure connection and package config
│   ├── constants/          # Application-wide static enum constants
│   ├── controllers/        # HTTP controllers mapping requests to service logic
│   ├── middleware/         # Custom Middlewares (auth, validation, error handler)
│   ├── models/             # Schema mappings (reserved for future entity details)
│   ├── repositories/       # MySQL raw queries / Data access layer
│   ├── routes/             # API routing endpoints (versioned under /api/v1/)
│   ├── services/           # Core domain logic
│   ├── uploads/            # Isolated image folders (original vs public previews)
│   ├── utils/              # Application utility tools
│   ├── validations/        # express-validator criteria definitions
│   ├── app.js              # Express app setup and middleware configuration
│   └── server.js           # Server runner and connection pool tests
├── .env.example            # Environment configuration template
├── .gitignore              # Files excluded from Git tracking
├── package.json            # NPM dependencies and execution scripts
└── README.md               # Quick setup and run instructions
```

---

## 2. File-by-File Breakdown

### Root Configuration Files
1. **`package.json`**
   - Configured with `"type": "module"` to enable modern native ES Modules syntax (`import`/`export` instead of `require`).
   - Declares script commands:
     - `npm start`: Runs the server directly using Node.js.
     - `npm run dev`: Automatically restarts the server on changes using `nodemon`.
   - Core production dependencies installed: `express`, `mysql2`, `cors`, `morgan`, `dotenv`, `multer`, `sharp`, `express-validator`, `bcryptjs`, `jsonwebtoken`, `express-rate-limit`.

2. **`.gitignore`**
   - Ignores generic OS caches (`.vscode`, `.idea`), local environment configurations (`.env`), logs, and `node_modules`.
   - Explicitly ignores actual uploaded files in `src/uploads/originals/*` and `src/uploads/previews/*` while preserving the folder skeletons by tracking the `.gitkeep` files.

3. **`.env.example`**
   - Serves as a configuration template for local development, defining variables for database hosts, ports, JWT expiration constraints, and wallet variables.

---

### Core Entry Points (`src/`)

4. **`src/app.js`**
   - Bootstraps the Express application.
   - Configures global middleware:
     - CORS settings (reading from `ALLOWED_ORIGIN`).
     - Request logging via Morgan.
     - JSON body-parser and url-encoded form-data parsers.
   - Serves files in `src/uploads/previews/` publicly under the static path `/uploads/previews`.
   - Hooks up the `/api/v1/` routes for modular routers.
   - Defensively catches non-matching routes (404s) and forwards them as custom errors to the global error middleware.

5. **`src/server.js`**
   - Acts as the application's executable server file.
   - Binds the Express app to the configured port.
   - Tests the database connection pool health during boot-up, logging status messages rather than allowing unhandled database failures to crash the API.
   - Listens to terminal signals (`SIGTERM`, `SIGINT`) to gracefully shut down the Express server and safely release MySQL connection pool allocations.

---

### Configuration Layer (`src/config/`)

6. **`src/config/db.js`**
   - Configures and exports a promisified connection pool using `mysql2/promise`.
   - Configures pool parameters (`connectionLimit: 10`, keep-alive checks, and timeout limits) for performance and resource safety.

7. **`src/config/multer.js`**
   - Configures upload settings for image files.
   - Sets the upload disk destination to `src/uploads/originals`.
   - Renames incoming files dynamically using random generation tags and extensions to avoid collisions.
   - Implements a filter limiting uploads to valid image formats (JPEG, JPG, PNG, WEBP, GIF) and sets an upper limit size of 10MB.

8. **`src/config/sharp.js`**
   - Houses parameters for preprocessing media uploads before serving previews.
   - Defines preview dimensions (600x600 inside), JPEG conversion quality (60%), and Gaussian blur parameters (`blurSigma: 15`) to obfuscate paid media until purchased.

---

### Routing Layer (`src/routes/`)

9. **`src/routes/auth.js`**
   - Maps authentication endpoints (`/register`, `/login`, and `/me`).
   - Hooks up the `/me` endpoint with the `protect` authentication guard.

10. **`src/routes/media.js`**
    - Declares routes for uploading images (secured by the multer upload middleware), browsing feed cards, pulling item details, unlocking, and streaming original content.

11. **`src/routes/wallet.js`**
    - Defines endpoints to get user balances and fetch full transaction histories.

12. **`src/routes/users.js`**
    - Declares profile-centric operations (e.g. fetching other users' public profile records).

---

### Middleware Layer (`src/middleware/`)

13. **`src/middleware/authentication/auth.js`**
    - A placeholder guard function (`protect`). Future steps will populate this to verify incoming authorization headers, decode JWT tokens, query database credentials, and populate `req.user`.

14. **`src/middleware/validation/validate.js`**
    - Serves as the validator checker. Resolves request-level schemas from `express-validator` and throws a standardized `400 Bad Request` AppError listing all invalid fields.

15. **`src/middleware/error/errorHandler.js`**
    - Captures all operational and system exceptions thrown in controllers.
    - Format outputs dynamically:
      - **Development**: Returns full validation messages, error properties, and execution stack traces.
      - **Production**: Filters out raw stack traces and details, returning simple developer-friendly operational status or a safe fallback message for internal server errors.

---

### Controller, Service, and Repository Shells

16. **`src/controllers/*`** (Files: `auth.controller.js`, `media.controller.js`, `wallet.controller.js`, `users.controller.js`)
    - Expose request handlers wrapped in the `asyncHandler` utility.
    - Currently structured to return standard mock success responses. Future tasks will wire these handlers directly to their corresponding business services.

17. **`src/services/*`** (Files: `auth.service.js`, `media.service.js`, `wallet.service.js`, `users.service.js`)
    - Empty domain classes designed to isolate business rules from HTTP routers or database layouts.

18. **`src/repositories/*`** (Files: `auth.repository.js`, `media.repository.js`, `wallet.repository.js`, `users.repository.js`)
    - Direct data access objects configured to import the database pool. Future steps will store raw SQL queries here to isolate controllers and services from raw database operations.

---

### Utility & Validation Layers (`src/utils/` & `src/validations/`)

19. **`src/utils/AppError.js`**
    - Custom operational error class that simplifies error handling by appending status codes and identifying expected vs unexpected failures.

20. **`src/utils/asyncHandler.js`**
    - Middleware wrapper function that automatically catches asynchronous errors from controllers and transfers them down the Express middleware stack to `errorHandler.js`.

21. **`src/validations/*`** (Files: `auth.validation.js`, `media.validation.js`)
    - Holds standard validator checking chains (valid email formats, password limits, and positive price checking).

---

## rpompt 2: Database Layer Changes

Added a robust, relational, 3NF-compliant database layer using MySQL.

### Changes Made:
1. **`schema.sql`**: Created database creation scripts defining 4 central tables:
   - `users`: Stores user attributes, name, email, credentials, and wallet balance.
   - `images`: Retains media metadata, storage paths on disk, dimensions/size, ownership keys, and soft delete state.
   - `purchases`: Relates image unlocks to users, preventing double-spending via a `UNIQUE(user_id, image_id)` constraint.
   - `transactions`: Logs wallet activities (SIGNUP, PURCHASE, EARNING).
2. **`src/models/`**: Created model class entities mapping database queries:
   - `User.js`: User model mapping `id` (as BigInt string), `name`, `email`, `wallet_balance` (defaults to 100).
   - `Image.js`: Image model mapping path coordinates (`original_path`, `preview_path`), upload details, metadata (`title`, `description`, `original_filename`, `mime_type`, `file_size`), and soft-deletion (`is_deleted`).
   - `Purchase.js`: Purchase receipt schema mapping user unlocks.
   - `Transaction.js`: Transaction schema mapping coin transfers and transaction types (`'SIGNUP'`, `'PURCHASE'`, `'EARNING'`).
3. **Database Optimizations**:
   - Primary/Foreign keys use `BIGINT UNSIGNED AUTO_INCREMENT` for scalability.
   - Transaction `type` uses an ENUM mapping (`'SIGNUP'`, `'PURCHASE'`, `'EARNING'`).
   - Cascading keys (`ON DELETE CASCADE ON UPDATE CASCADE`) maintain referential sanity.
   - Set database indexes on `email`, `owner_id`, `image_id`, `user_id`, purchase lookup tuples, and transaction log lists to speed up lookups.

---

## Prompt 3: Authentication Module

### Files Created:
- None (skeletons updated)

### Files Modified:
- `src/repositories/auth.repository.js`
- `src/services/auth.service.js`
- `src/controllers/auth.controller.js`
- `src/validations/auth.validation.js`
- `src/middleware/authentication/auth.js`
- `src/routes/auth.js`

### Routes Added:
- `POST /api/v1/auth/register` (Public) - Register new user with 100 default coins and a SIGNUP transaction log.
- `POST /api/v1/auth/login` (Public) - Login user, returning JWT and credentials.
- `GET /api/v1/auth/me` (Protected) - Retrieves current profile info.

### Middleware Implemented:
- `protect`: Extracts Bearer token, validates JWT expiration and integrity, checks user existence, and attaches User instance to `req.user`.

### Validation Added:
- `registerRules`: Validates non-empty name, valid email format with normalization, and password size limit (min 8 chars).
- `loginRules`: Validates valid email format and non-empty password.

### Security Decisions:
- Password hashing using `bcrypt` (12 rounds).
- Safe data serialization filtering out sensitive user properties (e.g. password_hash) when exporting model info.
- Bearer token authorization wrapping.
- SQL parameterized query usage via `mysql2` to block injection attacks.
- Atomic SQL database transactions during sign-up to make sure users and initial wallet records are logged simultaneously or not at all.

---

## Prompt X: Authentication Module

### Files Created:
- None (skeletons updated)

### Files Modified:
- `src/repositories/auth.repository.js`
- `src/services/auth.service.js`
- `src/controllers/auth.controller.js`
- `src/validations/auth.validation.js`
- `src/middleware/authentication/auth.js`
- `src/routes/auth.js`

### Database Changes:
- None (uses existing `users` and `transactions` tables).

### New Routes:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### New Middleware:
- JWT Bearer verification guard (`protect`) in `src/middleware/authentication/auth.js`.

### New Validations:
- `registerRules` and `loginRules` in `src/validations/auth.validation.js`.

### New Services:
- `AuthService` logic routines (`register`, `login`, `generateToken`) in `src/services/auth.service.js`.

### New Repositories:
- `AuthRepository` querying routines (`findByEmail`, `findById`, and transaction-based `createUser`) in `src/repositories/auth.repository.js`.

### New Utilities:
- None.

### Security Decisions:
- Excludes credential logs or token secrets.
- Generates generic error prompts on authentication checks to avoid enumeration attacks.
- Enforces strict input trimming and email normalization.

### Testing Instructions:
- See the Postman collections detailed in the assistant's response.

---

## Prompt 4: Media Management

### Files Modified:
- `src/repositories/media.repository.js`
- `src/services/media.service.js`
- `src/controllers/media.controller.js`
- `src/validations/media.validation.js`
- `src/routes/media.js`

### Routes Added:
- `POST /api/v1/media/upload` (Protected) - Uploads file, processes a blurred preview thumbnail via Sharp, and stores image metadata in MySQL.
- `GET /api/v1/media` (Protected) - Retrieves paginated feed items ordered newest first, with individual `locked` flags.
- `GET /api/v1/media/:id` (Protected) - Retrieves details for a specific media item, with user-scoped `locked` flags.

### Repository Methods:
- `createMedia()`: Inserts metadata records into MySQL `images` table.
- `findMediaById()`: Locates an active image by ID and joins owner name.
- `getFeed()`: Returns paginated image feed records ordered newest first.
- `findMediaByOwner()`: Selects active images belonging to a user ID.

### Service Methods:
- `uploadMedia()`: Processes raw uploads using Sharp (blur, resize, compression) and calls repository saving.
- `getMediaFeed()`: Orchestrates paginated listing and dynamically resolves locked states based on user contexts.
- `getMediaDetails()`: Resolves a media item and computes locked states.

### Controllers:
- `uploadMedia()`: Captures Multer file streams, invokes service layers, and translates storage paths to public HTTP preview URLs.
- `getMediaFeed()`: Parses query limits and maps result files to public URLs.
- `getMediaDetails()`: Extracts params and formats details with HTTP urls.

### Validation:
- Checked for file parameter presence in controller layer.
- `uploadMediaRules` validation checks that `title` is non-empty and less than 255 chars, and `unlock_price` is a non-negative integer.

### Multer Integration:
- Uses configured storage and filter properties. Restricts uploads to JPEG, PNG, WEBP, and GIF formats, and enforces a size limit of 10MB. Saves originals inside private storage.

### Sharp Integration & Preview Generation:
- Generates 600x600 inside-fit blurred thumbnails (blurSigma 15) compressed to quality 60%, saved in the public static directory. Original images remain private and untouched.

### Feed Implementation:
- Implements standard limit/offset queries in SQL, orders files newest first, and returns clean metadata.

### Security Decisions:
- Routes `GET /api/v1/media` and `GET /api/v1/media/:id` are protected using JWT validation, ensuring the system can correctly determine ownership-based locked states.
- Prevents leakage of private filesystem directory coordinates or original file paths, exposing only public `preview_url` parameters.
- Rejects non-image and large file formats.

### Testing Instructions:
- See the Postman collections detailed in the assistant's response.

---

## Prompt X: Media Management

### Files Created:
- None (skeletons updated)

### Files Modified:
- `src/repositories/media.repository.js`
- `src/services/media.service.js`
- `src/controllers/media.controller.js`
- `src/validations/media.validation.js`
- `src/routes/media.js`

### Database Changes:
- None (writes to existing `images` table).

### New Routes:
- `POST /api/v1/media/upload` (Protected)
- `GET /api/v1/media` (Protected)
- `GET /api/v1/media/:id` (Protected)

### New Middleware:
- None.

### New Validations:
- `uploadMediaRules` in `src/validations/media.validation.js`.

### New Services:
- `MediaService` upload, feed, and details routines in `src/services/media.service.js`.

### New Repositories:
- `MediaRepository` database utilities (`createMedia`, `findMediaById`, `getFeed`, `findMediaByOwner`) in `src/repositories/media.repository.js`.

### New Utilities:
- None.

### Security Decisions:
- Protected all media endpoints behind JWT validation.
- Prevents file path disclosures.
- Validates file formats and bounds file sizes.

### Testing Instructions:
- Call the Postman HTTP collections provided.

---

## Prompt 5: Purchase & Wallet Module

### Files Modified:
- `src/repositories/media.repository.js`
- `src/repositories/wallet.repository.js`
- `src/services/media.service.js`
- `src/services/wallet.service.js`
- `src/controllers/media.controller.js`
- `src/controllers/wallet.controller.js`
- `src/routes/media.js`
- `src/routes/wallet.js`

### Routes Added:
- `POST /api/v1/media/:id/unlock` (Protected) - Performs coin deductions, credits, and logs transactions atomically.
- `GET /api/v1/media/purchased` (Protected) - Returns a list of all images unlocked by the current user.
- `GET /api/v1/media/:id/original` (Protected) - Streams the high-res original image directly from the secure disk storage if authorized.
- `GET /api/v1/wallet` (Protected) - Fetches the current user's coin balance.
- `GET /api/v1/wallet/transactions` (Protected) - Fetches user transaction history logs (newest first).

### Repository Methods:
- `findPurchase()`, `createPurchase()`: Fetch and insert purchase receipt links.
- `deductWallet()`, `creditWallet()`: Update user coins.
- `createTransaction()`: Create transaction audit rows.
- `getPurchasedMedia()`: Select purchased metadata sets.
- `getWallet()`: Select wallet balance.
- `getTransactions()`: Select transaction history rows.

### Service Methods:
- `unlockMedia()`: Verifies ownership, checks existing unlocks, runs balance check, and commits atomic SQL transaction.
- `getMediaFeed()`, `getMediaDetails()`: Integrated unlock status check logic to set locked flags correctly.
- `getPurchasedMedia()`: Resolves user unlock listings.
- `getWalletBalance()`, `getTransactionHistory()`: Resolves wallet and transaction lookups.

### Controllers:
- `unlockMedia()`: Processes purchase request.
- `getOriginalMedia()`: Validates requester ownership/purchase status and streams the file using `res.sendFile`.
- `getPurchasedMedia()`: Retrieves purchased lists mapping previews to public HTTP URLs.
- `getWalletBalance()`, `getTransactionHistory()`: Fetch and return wallet balance and transactions.

### SQL Transaction Flow:
1. Starts a database transaction.
2. Deducts price from buyer wallet. Check `affectedRows === 1`.
3. Credits price to seller wallet. Check `affectedRows === 1`.
4. Inserts purchase receipt mapping. Check `affectedRows === 1`.
5. Logs buyer debit transaction (type: `'PURCHASE'`). Check `affectedRows === 1`.
6. Logs seller credit transaction (type: `'EARNING'`). Check `affectedRows === 1`.
7. Commits transaction if all operations return expected row counts. Otherwise rolls back.

### Security Decisions:
- Implements owner bypass logic, ensuring owners can access their own files without charging, recording transactions, or logging purchases.
- All image queries check `is_deleted = 0` to automatically hide deleted ones (returning 404).
- The original filesystem path is never exposed to the client.
- Atomic SQL transactions verify every row count to avoid partial state changes.

### Testing Instructions:
- See the Postman collections detailed in the assistant's response.

---

## Prompt X: Purchase & Wallet Module

### Files Created:
- None (skeletons updated)

### Files Modified:
- `src/repositories/media.repository.js`
- `src/repositories/wallet.repository.js`
- `src/services/media.service.js`
- `src/services/wallet.service.js`
- `src/controllers/media.controller.js`
- `src/controllers/wallet.controller.js`
- `src/routes/media.js`
- `src/routes/wallet.js`

### Database Changes:
- None (writes to existing tables).

### New Routes:
- `POST /api/v1/media/:id/unlock` (Protected)
- `GET /api/v1/media/purchased` (Protected)
- `GET /api/v1/media/:id/original` (Protected)
- `GET /api/v1/wallet` (Protected)
- `GET /api/v1/wallet/transactions` (Protected)

### New Middleware:
- None.

### New Validations:
- Bounded params validations in repository and controllers.

### New Services:
- `WalletService` methods (`getWalletBalance`, `getTransactionHistory`) and `MediaService` methods (`unlockMedia`, `getPurchasedMedia`).

### New Repositories:
- `WalletRepository` and extended `MediaRepository` database methods.

### New Utilities:
- None.

### Security Decisions:
- Owner bypass validation checks.
- strict `is_deleted = 0` constraints.
- Transaction rollback checks.

### Testing Instructions:
- Run the Postman HTTP collections provided.

---

## Prompt 6A: Mobile Frontend & Authentication

### Files Modified:
- `frontend/package.json`

### Files Created:
- `frontend/src/constants/colors.js`
- `frontend/src/constants/spacing.js`
- `frontend/src/constants/typography.js`
- `frontend/src/constants/api.js`
- `frontend/src/components/ScreenWrapper.js`
- `frontend/src/components/Button.js`
- `frontend/src/components/Input.js`
- `frontend/src/components/Loader.js`
- `frontend/src/components/ErrorMessage.js`
- `frontend/src/services/api.js`
- `frontend/src/services/authService.js`
- `frontend/src/context/AuthContext.js`
- `frontend/app/_layout.js`
- `frontend/app/(auth)/_layout.js`
- `frontend/app/(app)/_layout.js`
- `frontend/app/index.js` (Splash)
- `frontend/app/(auth)/login.js`
- `frontend/app/(auth)/register.js`
- `frontend/app/(app)/index.js` (Home Dashboard Placeholder)

### Routes Added:
- Splash entrypoint (`/`)
- `/(auth)/login`
- `/(auth)/register`
- `/(app)` (Home Dashboard)

### Middleware Implemented:
- Client-side navigation guards resolved inside `app/_layout.js` segment effect, routing unauthenticated visitors to `/(auth)/login` and validated users to `/(app)`.
- Axios request interceptor injecting JWT.
- Axios response interceptor capturing 401 statuses to clear AsyncStorage and redirect to Login.

### Validation Added:
- Login: Email validation format and password non-empty check.
- Register: Name non-empty, email format, password min 8 characters, and confirmPassword match verification.
- Managed via React Hook Form and Zod schemas.

### Security Decisions:
- AsyncStorage keys strictly separated: `media_lock_token` and `media_lock_user`.
- API base URL located in a separate constants file (`src/constants/api.js`).
- Button submit disabled locks during loading status to prevent duplicate requests.
- Sensitive values like passwords hashed/encrypted.

### Testing Instructions:
- See the testing guidelines in the final response.

---

## Prompt X: Mobile Frontend & Authentication

### Files Created:
- `frontend/src/constants/colors.js`
- `frontend/src/constants/spacing.js`
- `frontend/src/constants/typography.js`
- `frontend/src/constants/api.js`
- `frontend/src/components/ScreenWrapper.js`
- `frontend/src/components/Button.js`
- `frontend/src/components/Input.js`
- `frontend/src/components/Loader.js`
- `frontend/src/components/ErrorMessage.js`
- `frontend/src/services/api.js`
- `frontend/src/services/authService.js`
- `frontend/src/context/AuthContext.js`
- `frontend/app/_layout.js`
- `frontend/app/(auth)/_layout.js`
- `frontend/app/(app)/_layout.js`
- `frontend/app/index.js`
- `frontend/app/(auth)/login.js`
- `frontend/app/(auth)/register.js`
- `frontend/app/(app)/index.js`

### Files Modified:
- `frontend/package.json`

### Database Changes:
- None.

### New Routes:
- `/` (Splash)
- `/(auth)/login`
- `/(auth)/register`
- `/(app)`

### New Middleware:
- Axios request/response interceptors.
- Expo Router navigation gate.

### New Validations:
- Zod schemas.

### New Services:
- `authService` in `src/services/authService.js`
- Axios instance in `src/services/api.js`

### New Repositories:
- None.

### New Utilities:
- None.

### Security Decisions:
- Form double-submission locks.
- Secure storage keys.
- Redirection on 401 errors.

### Testing Instructions:
- Run using `npx expo start`.

---

## Prompt 6C: Bottom Tab Navigation & Wallet Polish

### Files Created:
- `frontend/src/services/walletService.js`
- `frontend/src/components/OriginalViewerModal.js`
- `frontend/app/(app)/(tabs)/_layout.js`
- `frontend/app/(app)/(tabs)/wallet.js`
- `frontend/app/(app)/(tabs)/purchased.js`
- `frontend/app/(app)/(tabs)/profile.js`

### Files Modified:
- `frontend/app/(app)/_layout.js` (Stack routing configurations)
- `frontend/app/(app)/[id].js` (Modal details and coin sync triggers)
- `frontend/src/components/MediaCard.js` (Performance optimizations React.memo)
- `STRUCTURE.md` (Self documentation logs)

### Files Moved:
- `frontend/app/(app)/index.js` to `frontend/app/(app)/(tabs)/index.js` (adjusted imports)
- `frontend/app/(app)/upload.js` to `frontend/app/(app)/(tabs)/upload.js` (adjusted imports)

### Routes Added:
- `/(app)/(tabs)` (tab router index)
- `/(app)/(tabs)/wallet`
- `/(app)/(tabs)/purchased`
- `/(app)/(tabs)/profile`

### Navigation:
- Implemented Bottom Tab Navigation with active/inactive opacity focus states and custom Platform safe height bounds.
- Details screen is pushed on top of tabs to keep a single full-screen stack routing format.
- Purchased media links navigate to details screen before opening original zoom viewers to enforce flow consistency.

### Services:
- `walletService` wrapping `GET /wallet` and `GET /wallet/transactions`.

### Animations:
- Spring-scaling transitions on double-taps.
- Active/Inactive fade transitions on Bottom Tab switches.

### Performance Optimizations:
- FlatList rendering controls (`initialNumToRender={6}`).
- Wrapped `MediaCard` inside `React.memo` to skip redundant draws.
- Image cache controls using appended timestamp markers to avoid loading unauthorized offline assets.

---

## Prompt X: Bottom Tab Navigation & Wallet Polish

### Files Created:
- `frontend/src/services/walletService.js`
- `frontend/src/components/OriginalViewerModal.js`
- `frontend/app/(app)/(tabs)/_layout.js`
- `frontend/app/(app)/(tabs)/wallet.js`
- `frontend/app/(app)/(tabs)/purchased.js`
- `frontend/app/(app)/(tabs)/profile.js`

### Files Modified:
- `frontend/app/(app)/_layout.js`
- `frontend/app/(app)/[id].js`
- `frontend/src/components/MediaCard.js`

### Database Changes:
- None.

### New Routes:
- `/(app)/(tabs)`
- `/(app)/(tabs)/wallet`
- `/(app)/(tabs)/purchased`
- `/(app)/(tabs)/profile`

### New Middleware:
- None.

### New Validations:
- None.

### New Services:
- `walletService` in `src/services/walletService.js`

### New Repositories:
- None.

### New Utilities:
- None.

### Security Decisions:
- Double tap modal views.
- Immersive status bars.
- Logout confirmation alerts.
- Appended timestamps to disable unauthenticated image caches.

### Testing Instructions:
- Launch server and run `npx expo start` inside frontend.






