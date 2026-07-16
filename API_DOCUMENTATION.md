# Media Lock API Documentation

All API requests must go to the prefix base path `/api/v1`. 

---

## 🔒 Authentication Layer

Endpoints under `/api/v1/auth/` do not require authentication headers. All other endpoints require a signed JWT token passed in the request headers:

```text
Authorization: Bearer <JWT_TOKEN>
```

### 1. Register User
Creates a new account and credits it with the default signup balance (e.g., 100 coins).
*   **Method**: `POST`
*   **Path**: `/api/v1/auth/register`
*   **Request Body** (`application/json`):
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "securepassword123"
    }
    ```
*   **Success Response** (`201 Created`):
    ```json
    {
      "status": "success",
      "message": "User registered successfully",
      "token": "eyJhbGciOi...",
      "data": {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com",
        "wallet_balance": 100
      }
    }
    ```

### 2. Login User
Logs in an existing user and returns a JWT token.
*   **Method**: `POST`
*   **Path**: `/api/v1/auth/login`
*   **Request Body** (`application/json`):
    ```json
    {
      "email": "john@example.com",
      "password": "securepassword123"
    }
    ```
*   **Success Response** (`200 OK`):
    ```json
    {
      "status": "success",
      "token": "eyJhbGciOi...",
      "data": {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com",
        "wallet_balance": 100
      }
    }
    ```

---

## 📸 Media Operations

All media endpoints (except public previews served statically) require authentication headers.

### 1. Get Media Feed
Retrieves a paginated list of media items. Shows whether items are locked or unlocked for the requesting user context.
*   **Method**: `GET`
*   **Path**: `/api/v1/media`
*   **Query Parameters**:
    *   `page` (optional, default `1`)
    *   `limit` (optional, default `10`)
*   **Success Response** (`200 OK`):
    ```json
    {
      "status": "success",
      "results": 1,
      "data": [
        {
          "id": "1",
          "owner_name": "Alice Smith",
          "title": "Beautiful Sunset",
          "description": "Premium sunset landscape",
          "preview_url": "http://192.168.1.5:5000/uploads/previews/preview-178422.jpeg",
          "unlock_price": 50,
          "created_at": "2026-07-16T12:00:00.000Z",
          "locked": true
        }
      ]
    }
    ```

### 2. Upload Premium Media
Uploads a raw image file, generates a blurred preview using `sharp`, and saves metadata.
*   **Method**: `POST`
*   **Path**: `/api/v1/media/upload`
*   **Request Body** (`multipart/form-data`):
    *   `image` (File binary - JPEG, PNG, WEBP, or GIF)
    *   `title` (String, 1-100 characters)
    *   `description` (String, 1-1000 characters)
    *   `unlock_price` (Integer, positive coin amount)
*   **Success Response** (`201 Created`):
    ```json
    {
      "status": "success",
      "message": "Media uploaded successfully",
      "data": {
        "id": "2",
        "title": "Forest Trail",
        "description": "Beautiful trail in the woods",
        "preview_url": "http://192.168.1.5:5000/uploads/previews/preview-178423.jpeg",
        "unlock_price": 75,
        "created_at": "2026-07-16T12:05:00.000Z"
      }
    }
    ```

### 3. Get Media Details
Fetches detailed metadata for a single media item.
*   **Method**: `GET`
*   **Path**: `/api/v1/media/:id`
*   **Success Response** (`200 OK`):
    ```json
    {
      "status": "success",
      "data": {
        "id": "1",
        "owner_id": "3",
        "owner_name": "Alice Smith",
        "title": "Beautiful Sunset",
        "description": "Premium sunset landscape",
        "preview_url": "http://192.168.1.5:5000/uploads/previews/preview-178422.jpeg",
        "unlock_price": 50,
        "created_at": "2026-07-16T12:00:00.000Z",
        "locked": true
      }
    }
    ```

### 4. Unlock Media (Purchase)
Deducts coins from the buyer, credits them to the owner, inserts a purchase relationship, and logs auditing transactions atomically.
*   **Method**: `POST`
*   **Path**: `/api/v1/media/:id/unlock`
*   **Success Response** (`200 OK`):
    ```json
    {
      "status": "success",
      "message": "Image unlocked successfully."
    }
    ```
*   **Error Responses**:
    *   `403 Forbidden` - Insufficient wallet balance.
    *   `404 Not Found` - Media item not found.

### 5. Stream Original Media
Streams the high-resolution original image file directly. Enforces checking that the requester has unlocked the image or is the original owner.
*   **Method**: `GET`
*   **Path**: `/api/v1/media/:id/original`
*   **Headers Required**: `Authorization: Bearer <JWT>`
*   **Success Response** (`200 OK`):
    *   Streams raw binary data of the original image (with corresponding MIME `Content-Type`).
*   **Error Response** (`403 Forbidden`):
    ```json
    {
      "status": "fail",
      "message": "Forbidden access."
    }
    ```

### 6. Get Purchased Media
Retrieves all images unlocked by the authenticated user.
*   **Method**: `GET`
*   **Path**: `/api/v1/media/purchased`
*   **Success Response** (`200 OK`):
    ```json
    {
      "status": "success",
      "results": 1,
      "data": [
        {
          "id": "1",
          "owner_name": "Alice Smith",
          "title": "Beautiful Sunset",
          "description": "Premium sunset landscape",
          "preview_url": "http://192.168.1.5:5000/uploads/previews/preview-178422.jpeg",
          "unlock_price": 50,
          "purchased_at": "2026-07-16T13:00:00.000Z"
        }
      ]
    }
    ```

### 7. Delete Media
Soft-deletes a media item. Rejects requests where the user is not the owner.
*   **Method**: `DELETE`
*   **Path**: `/api/v1/media/:id`
*   **Success Response** (`200 OK`):
    ```json
    {
      "status": "success",
      "message": "Media deleted successfully"
    }
    ```

---

## 💼 Wallet Operations

### 1. Get Wallet Balance
Fetches the active coin balance for the user.
*   **Method**: `GET`
*   **Path**: `/api/v1/wallet`
*   **Success Response** (`200 OK`):
    ```json
    {
      "status": "success",
      "wallet_balance": 100
    }
    ```

### 2. Get Transaction Ledger
Fetches history of all audit transactions logged for the user (credits & debits).
*   **Method**: `GET`
*   **Path**: `/api/v1/wallet/transactions`
*   **Success Response** (`200 OK`):
    ```json
    {
      "status": "success",
      "results": 2,
      "data": [
        {
          "amount": -50,
          "type": "PURCHASE",
          "description": "Purchased image: Beautiful Sunset",
          "created_at": "2026-07-16T13:00:00.000Z"
        },
        {
          "amount": 100,
          "type": "SIGNUP",
          "description": "Initial registration coin credit",
          "created_at": "2026-07-16T12:00:00.000Z"
        }
      ]
    }
    ```
