# Parcel Delivery API

A secure and role-based RESTful API for a parcel delivery system, built with Express.js and TypeScript. This system supports three types of users: **Sender**, **Receiver**, and **Admin**, offering functionalities like user authentication, parcel creation and tracking, and admin-level management.

---

## 🔧 Setup & Environment Instructions

### Prerequisites

- Node.js (>=18)
- npm or yarn
- MongoDB (Local or Cloud)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RaxonRafi/parcel-backend.git
   cd parcel-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Setup environment variables:**

   Create a `.env` file at the root and configure the following:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ```

4. **Run the server:**
   ```bash
   npm run dev
   ```

---

## 📦 Project Overview

The API is structured into modular routes, controllers, middlewares, and validations. Key features include:

- JWT-based authentication with role-based access control.
- Secure route protection using middleware.
- Data validation using Zod schemas.
- CRUD operations for parcels.
- User management and role handling (Sender, Receiver, Admin).

---

## 📘 API Endpoints Summary

### 🔐 Auth Routes

| Method | Endpoint             | Access      | Description                      |
|--------|----------------------|-------------|----------------------------------|
| POST   | `/api/auth/login`    | Public      | Login with credentials           |
| POST   | `/api/auth/refresh-token` | Public | Get a new access token using refresh token |
| POST   | `/api/auth/logout`   | Authenticated | Logout and clear refresh token |
| POST   | `/api/auth/change-password` | Authenticated (All Roles) | Change current password |

---

### 👤 User Routes

| Method | Endpoint                 | Access         | Description                     |
|--------|--------------------------|----------------|---------------------------------|
| POST   | `/api/users/register`    | Public         | Create a new user (Sender)      |
| PATCH  | `/api/users/update-profile` | Authenticated (All Roles) | Update own profile          |
| GET    | `/api/users/me`          | Authenticated (All Roles) | Get own user details       |
| GET    | `/api/users/all-users`   | Admin          | Get all users                    |
| GET    | `/api/users/:id`         | Admin          | Get single user by ID           |
| PATCH  | `/api/users/:userId/block` | Admin        | Block a user                     |
| PATCH  | `/api/users/:userId/unblock` | Admin      | Unblock a user                   |

---

### 📦 Parcel Routes

| Method | Endpoint                            | Access        | Description                                   |
|--------|-------------------------------------|---------------|-----------------------------------------------|
| POST   | `/api/parcels/`                     | Sender, Admin | Create a new parcel                           |
| PATCH  | `/api/parcels/:trackingId/status`   | Admin         | Update parcel status                          |
| PATCH  | `/api/parcels/:trackingId/cancel`   | Sender        | Cancel a parcel                               |
| PATCH  | `/api/parcels/:trackingId/confirm`  | Receiver      | Confirm parcel delivery                       |
| PATCH  | `/api/parcels/:trackingId/block`    | Admin         | Block a parcel                                |
| GET    | `/api/parcels/my-parcels`           | Sender        | View own parcels and status logs              |
| GET    | `/api/parcels/incoming-parcels`     | Receiver      | View incoming parcels                          |
| GET    | `/api/parcels/delivery-history`     | Receiver      | View delivery history                          |
| GET    | `/api/parcels/`                     | Admin         | Get all parcels                                |
| GET    | `/api/parcels/:trackingId`          | Public        | Get single parcel by tracking ID              |

---

## 📄 API Documentation

You can explore the full API with request/response examples via Postman:

👉 [View Postman Docs](https://documenter.getpostman.com/view/21233308/2sB3BALrvB)
---


## 🧩 Tech Stack

- **Backend Framework**: Express.js (with TypeScript)
- **Database**: MongoDB
- **Authentication**: JWT (Access + Refresh Tokens)
- **Validation**: Zod
- **Authorization**: Role-based (Sender, Receiver, Admin)

---

## 📁 Folder Structure

```
src/
├── modules/
│   ├── auth/
│   ├── user/
│   └── parcel/
├── middlewares/
├── utils/
└── app.ts
```

---

## ✅ License

This project is open-sourced under the [MIT License](LICENSE).

---

## 🚀 Author

**Muhammad Rafi**

For business inquiries: [dev.muhammad.rafi@gmail.com]
