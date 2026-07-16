# MediaVault Database Schema

## Overview

The MediaVault database is designed using a normalized relational database model. It securely manages user authentication, premium media uploads, wallet transactions, image purchases, and protected media access.

The database consists of four core entities:

- Users
- Images
- Purchases
- Transactions

---

# Entity Relationship Diagram

```
                           +----------------------+
                           |        USERS         |
                           +----------------------+
                           | PK  id              |
                           | name               |
                           | email (Unique)     |
                           | password_hash      |
                           | wallet_balance     |
                           | created_at         |
                           | updated_at         |
                           +----------------------+
                                   |
                          uploads (1:N)
                                   |
                                   ▼
                           +----------------------+
                           |       IMAGES         |
                           +----------------------+
                           | PK  id              |
                           | FK  owner_id        |
                           | title              |
                           | description        |
                           | original_filename  |
                           | mime_type          |
                           | file_size          |
                           | original_path      |
                           | preview_path       |
                           | unlock_price       |
                           | is_deleted         |
                           | created_at         |
                           | updated_at         |
                           +----------------------+
                                   ▲
                                   |
                        purchased (N:N)
                                   |
                                   ▼
                           +----------------------+
                           |     PURCHASES        |
                           +----------------------+
                           | PK id               |
                           | FK user_id          |
                           | FK image_id         |
                           | created_at          |
                           | updated_at          |
                           +----------------------+
                             ▲
                             |
                   user has many purchases
                             |
                             |
+----------------------+      |
|    TRANSACTIONS      |      |
+----------------------+      |
| PK id               |      |
| FK user_id          |------+
| amount              |
| type                |
| description         |
| created_at          |
+----------------------+

```

---

# Relationship Summary

| Parent Table | Child Table | Relationship |
|--------------|------------|--------------|
| Users | Images | One user can upload many images |
| Users | Purchases | One user can purchase many images |
| Images | Purchases | One image can be purchased by many users |
| Users | Transactions | One user can have many wallet transactions |

---

# Table Details

## 1. Users

Stores all registered users and wallet information.

| Column | Type | Description |
|---------|------|-------------|
| id | BIGINT UNSIGNED | Primary Key |
| name | VARCHAR(255) | User name |
| email | VARCHAR(255) | Unique email |
| password_hash | VARCHAR(255) | bcrypt password hash |
| wallet_balance | INT | Current wallet balance |
| created_at | TIMESTAMP | Registration time |
| updated_at | TIMESTAMP | Last updated |

---

## 2. Images

Stores uploaded premium images.

| Column | Type | Description |
|---------|------|-------------|
| id | BIGINT UNSIGNED | Primary Key |
| owner_id | BIGINT UNSIGNED | References Users.id |
| title | VARCHAR(255) | Image title |
| description | TEXT | Image description |
| original_filename | VARCHAR(255) | Uploaded filename |
| mime_type | VARCHAR(100) | MIME type |
| file_size | BIGINT | File size |
| original_path | VARCHAR(500) | Original image location |
| preview_path | VARCHAR(500) | Blurred preview location |
| unlock_price | INT | Unlock price |
| is_deleted | BOOLEAN | Soft delete flag |
| created_at | TIMESTAMP | Upload timestamp |
| updated_at | TIMESTAMP | Last updated |

---

## 3. Purchases

Stores all purchased media.

| Column | Type | Description |
|---------|------|-------------|
| id | BIGINT UNSIGNED | Primary Key |
| user_id | BIGINT UNSIGNED | Buyer |
| image_id | BIGINT UNSIGNED | Purchased image |
| created_at | TIMESTAMP | Purchase time |
| updated_at | TIMESTAMP | Updated timestamp |

### Constraints

- UNIQUE(user_id, image_id)
- Prevents duplicate purchases.

---

## 4. Transactions

Stores every wallet transaction.

| Column | Type | Description |
|---------|------|-------------|
| id | BIGINT UNSIGNED | Primary Key |
| user_id | BIGINT UNSIGNED | References Users.id |
| amount | INT | Credit/Debit amount |
| type | ENUM | SIGNUP, PURCHASE, EARNING |
| description | VARCHAR(255) | Transaction description |
| created_at | TIMESTAMP | Transaction time |

---

# Database Indexes

| Index | Purpose |
|--------|---------|
| idx_users_email | Fast login lookup |
| idx_images_owner_id | Fast owner image lookup |
| idx_purchases_lookup | Fast unlock validation |
| idx_transactions_user_id | Fast transaction history |

---

# Security Considerations

The database has been designed with security in mind.

- Passwords are stored using **bcrypt hashing**.
- Email addresses are enforced as **unique**.
- Duplicate purchases are prevented using a **UNIQUE(user_id, image_id)** constraint.
- Original media files are **not stored in publicly accessible directories**.
- Only blurred preview images are publicly accessible.
- Original media is served only after **JWT authentication** and **purchase/ownership verification**.
- Wallet deductions and purchase creation are performed together to maintain data consistency.

---

# Normalization

The schema follows a normalized relational design.

- User information is stored only once.
- Media metadata is separated from purchase history.
- Purchase history is maintained independently.
- Transaction records form an immutable audit trail.
- Relationships are maintained using foreign keys.

---

# Summary

The MediaVault database consists of four relational entities working together to provide secure authentication, premium media management, wallet operations, purchase tracking, and controlled access to original media. The schema is optimized through indexing, referential integrity, and normalized table design to ensure scalability, consistency, and security.