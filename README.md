# 📦 Parcel Delivery API 

  

A role-based Parcel Delivery API system built with **Node.js**, **Express.js**, **TypeScript**, and **MongoDB** using **Mongoose**.  This project provides a robust foundation for managing parcel, user roles and real-time status tracking.

---
### Live Link: https://parcel-delivery-api-backend.onrender.com/

---

## **🎯 Project Overview**
Parcel Delivery API works like a courier service. Users can register, send parcels and track their delivery status. The system is secure, organized in modules and users role-based access control.

### 🚀 Features

  

 - JWT-based Authentication & Authorization
 - Role-based access control (Admin, Sender, Receiver)
 - Parcel tracking (status logs)
 - Cancel parcels before dispatched
 - Confirm delivery by receiver
 - Modular folder structure
 - Request validation & error handling
 - MongoDB with Mongoose

  ### 🧩 Tech Stack

- Node.js

- Express.js

- TypeScript

- MongoDB + Mongoose

- Zod (Validation)

- JWT

- bcrypt

- dotenv
- Passport

  
  

### 🔐 Authentication & Authorization

 
- JWT-based authentication system.
    
- Three user roles: admin, sender, and receiver.
    
- Role-based access control for all sensitive routes.
    

### 👥 Roles & Permissions

  


| Role     | Permissions                                                                 |
|----------|------------------------------------------------------------------------------|
| Admin    | Manage users and parcels, update parcel statuses                             |
| Sender   | Create parcels, view own parcels, cancel if not dispatched                   |
| Receiver | View parcels addressed to them, confirm delivery                             |


  
### 👤 User Management
---
 1. Sender and Receiver registration, login and logout.

 1. Admin can view, update any user information.

 1. User can update their own password

 1. Admin can change any user’s password securely

  

### 📦 Parcel Management
---

 - Senders can create parcels.

 - Parcels include delivery info with fee, weight, address etc.
 - Parcels track current status with a log (PENDING → APPROVED →
   DISPATCHED → IN_TRANSIT → DELIVERED → CONFIRMED)

 - Receiver confirm parcel.
 - Receiver view incoming parcel and delivery history.
 - Only sender or admin can delete a parcel.

  

### 📝 Status Logs

 - Every parcel has a status Logs array embedded.

 - Each status update stores timestamp and updated-by info.

 - Admins can change status step-by-step.

  

### 🔎 Parcel Tracking

- Public tracking endpoint using trackingId

- No authentication required for tracking

  

### 📜 Delivery History

 - Sender and Receiver can view their parcel history.
 -  Filtered by current status (DELIVERED, CONFIRMED, etc.)

  
  
### 🛡️ Error Handling

The API uses a centralized error handling mechanism to ensure consistent and predictable error responses.

- **`AppError` Class**: A custom error class is used to create operational errors with a specific status code and message.

- **`catchAsync` Utility**: Route handlers are wrapped in a `catchAsync` function that catches any unhandled promise rejections and passes them to the global error handler.

- **Global Error Handler**: A global middleware catches all errors. It formats them into a standardized JSON response, hiding stack traces in production for security.
  

---

  
### **🛠️ Environment Setup**

To get the project running locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Rika4698/Parcel-Delivery-API-Backend.git
    cd Parcel-Delivery-API-Backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the necessary variables. Follow the `.env.example` file as a template.

4.  **Start the server:**
    ```bash
    npm run dev
    ```
    The API will be available at `http://localhost:5000`.



---

    
### 📁 Project Structure

<br/>

```
              
 src/
  ├─ app/
  │  ├─ middlewares/  # Express middlewares (auth, validation, error handling)
  │  │ 
  │  ├─ modules/ 
  │  │  ├─ auth/      # Authentication logic (register, login, tokens)
  │  │  ├─ contact/   # Public user message view and response
  │  │  ├─ parcel/    # Parcel management (create, track, update)
  │  │  │ 
  │  │  ├─ stats/     # Dashboard analytics(parcel stats, user stats)
  │  │  │  
  │  │  └─ user/      # User management (roles, status)
  │  │     
  │  ├─ routes/       # API route definitions
  │  │  
  │  └── utils/       # Utility functions (catchAsync, AppError)
  ├── config/         # Environment variables and configuration
  ├─ app.ts           # Express application setup
  └─ server.ts        # Main server entry point


```

---

### **🚀 API Endpoints Reference**

Below is a comprehensive list of all available API endpoints.

#### **Authentication (`http://localhost:5000/api/v1/auth`)**

| Endpoint          | Method | Access    | Description                                   |
| ----------------- | ------ | --------- | --------------------------------------------- |
| `/login`          | `POST` | Public    | Log in to receive access/refresh tokens.      |
| `/refresh-token`  | `POST` | Public    | Generate new access token using refresh token.|
| `/logout`         | `POST` | All roles | Log out and clear authentication cookies.     |
| `/change-password`| `POST` | All roles | Set new password (after registration).        |
| `/set-password`   | `POST` | All roles | Log out and clear authentication cookies.     |
| `/forgot-password`| `POST` | All roles | Initiate password reset with email reset link.|
| `/reset-password` | `POST` | All roles | Reset password with token/code.               |
| `/get-me`         | `POST` | All roles | Get current authenticated user's details.     |
| `/google`         | `POST` | Public    | Redirect to Google OAuth login page.          |
| `/google/callback`| `POST` | Public    | Process Google OAuth login callback.          |

#### **User Management (`http://localhost:5000/api/v1/user`)**

| Endpoint              | Method  | Access        | Description                                       |
| --------------------- | ------- | ------------- | ------------------------------------------------- |
| `/register`           | `POST`  | Public        | Create a new user.                                |
| `/all-users`          | `GET`   | Admin only    | Get list of all users with pagination .           |
| `/:id`                | `PATCH` | Admin only    | Admin update any user information and role.       |
| `/update-profile/:id` | `PATCH` | All roles     | Update profile for any user.                      |



#### **Parcel Management (`http://localhost:5000/api/v1/parcels`)**

| Endpoint                      | Method  | Access                | Description                                      |
| ----------------------------- | ------- | -------------------   | ------------------------------------------------ |
| `/create`                     | `POST`  | Sender only           | Create a new parcel delivery request.            |
| `/all`                        | `GET`   | Sender,Receiver,Admin | Get all parcels addressed to the user.           |
| `/single-parcel/:id`          | `GET`   | Sender,Receiver,Admin | Get single parcel details by ID.                 |
| `/incoming-parcel`            | `GET`   | Receiver only         | View incoming parcel details.                    |
| `/delivery-history`           | `GET`   | Sender,Receiver only  | Get parcel delivery history.                     |
| `/confirm/:id`                | `PATCH` | Receiver only         | Confirm parcel delivery with ID URL by receiver. |
| `/cancel/:id`                 | `PATCH` | Sender only           | Cancel a parcel if its status is `PENDING`.      |
| `/update-parcel/:id`          | `PATCH` | Sender only           | Update parcel details.                           |
| `/parcel-status/:id`          | `PATCH` | Admin only            | Update parcel delivery status by admin.          |
| `/track-parcel/:trackingId`   | `GET`   | Public (no auth)      | Track parcel status by tracking ID.              |
| `/delete/:id`                 | `PATCH` | Admin,Sender          | Delete the parcel from parcel list.              |


---

### **🧪 API Testing**

You can use **Postman** or any other API client to test the endpoints. Remember to:

1.  Register and log in to get a access token.
2.  Include the `Authorization: Bearer <your_token>` headers for all protected routes.
3.  For endpoints that require a different role , make sure to log in with the appropriate user to get the correct token.

---
<br/>

## Sample API Usage

<br/>

### 1. Register a New User

**Request:** `POST /api/v1/user/register`

```json
{
    "name":"Samira",
    "email":"Samira12@gmail.com",
    "password":"*Samira12"
   
}
```
<br/>

### 2. Login

**Request:** `POST /api/v1/auth/login`

```json
{
  "email":"Samira12@gmail.com",
  "password":"*Samira12"
}
```

**Response:**

```json
{
    "statusCode": 200,
    "success": true,
    "message": "User Login Successfully",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.....",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
        "_id": "68b883e5767c18db962b3f7a",
        "name": "Samira",
        "email": "Samira12@gmail.com",
        "role": "SENDER",
        "isDeleted": false,
        "isActive": "ACTIVE",
        "isVerified": false,
        "auths": [
            {
                "provider": "Email",
                "providerId": "Samira12@gmail.com"
            }
        ],
        "Parcels": [],
        "createdAt": "2025-09-03T18:07:33.202Z",
        "updatedAt": "2025-09-03T18:07:33.202Z"
    }
}
```
<br/>

### 3. Create a Parcel

**Request:** `POST /api/v1/parcels/create` (with `Authorization: Bearer <accessToken>`)

```json
{
  "receiverEmail": "karim12@gmail.com",
  "parcelDetails": {
    "address": "Mirpur-1, Dhaka",
    "phone": "01734567224",
    "weight": 3
    
  },
  "fee": 400
}
```

**Response:**

```json
{
    "statusCode": 201,
    "success": true,
    "message": "Parcel created successfully!",
    "data": {
        "trackingId": "TRK-20250903-854713",
        "senderId": "68b883e5767c18db962b3f7a",
        "receiverEmail": "karim12@gmail.com",
        "parcelDetails": {
            "address": "Mirpur-1, Dhaka",
            "phone": "01734567224",
            "weight": 3
        },
        "fee": 1200,
        "currentStatus": "PENDING",
        "statusHistory": [
            {
                "status": "PENDING",
                "updatedAt": "2025-09-03T18:13:02.791Z",
                "updatedBy": "68b883e5767c18db962b3f7a"
            }
        ],
        "isDeleted": false,
        "_id": "68b8852ec84012b9b956d9b5",
        "createdAt": "2025-09-03T18:13:02.795Z",
        "updatedAt": "2025-09-03T18:13:02.795Z",
        "__v": 0
    }
}
```
<br/>

### 4. View Parcel delivery Status History

When you fetch a parcel, the `statusHistory` array contain all the details of each status change along with the timestamp of the update.

**Response from `GET /api/v1/parcels/delivery-history`:**

```json
{
    "statusCode": 200,
    "success": true,
    "message": "Delivery history received successfully!",
    "data": [
        {
            "parcelDetails": {
                "address": "Mirpur-1, Dhaka",
                "phone": "01734567224",
                "weight": 3
            },
            "_id": "68b8852ec84012b9b956d9b5",
            "trackingId": "TRK-20250903-854713",
            "senderId": "68b883e5767c18db962b3f7a",
            "receiverEmail": "karim12@gmail.com",
            "fee": 1200,
            "currentStatus": "APPROVED",
            "statusHistory": [
                {
                    "status": "PENDING",
                    "updatedAt": "2025-09-03T18:13:02.791Z",
                    "updatedBy": "68b883e5767c18db962b3f7a"
                },
                {
                    "status": "APPROVED",
                    "updatedAt": "2025-09-03T18:45:25.014Z",
                    "updatedBy": "68b4760060021bb1e788b5a2"
                }
            ],
            "isDeleted": false,
            "createdAt": "2025-09-03T18:13:02.795Z",
            "updatedAt": "2025-09-03T18:45:25.023Z",
            "__v": 1
        }
    ]
}
```

---
## 🔗 Related Links

- **Backend Live Link:** https://parcel-delivery-api-backend.onrender.com/
- **Frontend Live Demo:** https://delivo-beryl.vercel.app/
- **Backend GitHub Repository:** https://github.com/Rika4698/Parcel-Delivery-API-Backend
- **Frontend GitHub Repository:** https://github.com/Rika4698/Parcel-Delivery-API-Frontend


---
<br/>



## 👤 Author & Contact

**Name: Sharmin Akter Reka**
<br/>
<br/>
**Role: Frontend Developer**
<br/>
**Portfolio: https://sharmin-rika-portfolio.vercel.app/**

---

*Thanks for exploring the Parcel Delivery API!*