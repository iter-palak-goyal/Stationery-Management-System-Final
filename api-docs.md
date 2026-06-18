# API Contract & Endpoint Documentation

This document describes the API endpoints, request/response models, authentication headers, and role constraints for all microservices in the **Stationery Management System**.

All client requests must go through the **API Gateway** running at:
`http://localhost:8090`

---

## Table of Contents
1. [Authentication Service (`/api/auth`)](#1-authentication-service-apiauth)
2. [Inventory Service (`/api/inventory`)](#2-inventory-service-apiinventory)
3. [Request Service (`/api/requests`)](#3-request-service-apirequests)

---

## 1. Authentication Service (`/api/auth`)
Handles user registration, login, token validation, and internal information routing.

### 1.1 Register User
Registers a new user (either `STUDENT` or `ADMIN`).
* **Method:** `POST`
* **URL:** `/api/auth/register`
* **Authentication:** None (Public)
* **Request Body (`RegisterRequest`):**
  ```json
  {
    "username": "john_doe",
    "email": "john.doe@college.edu",
    "password": "SecurePassword123",
    "role": "STUDENT" 
  }
  ```
  *(Role can be either `STUDENT` or `ADMIN`)*
* **Success Response (HTTP 201 Created):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ...",
    "username": "john_doe",
    "role": "STUDENT",
    "email": "john.doe@college.edu"
  }
  ```

### 1.2 Login
Authenticates credentials and returns a JWT token.
* **Method:** `POST`
* **URL:** `/api/auth/login`
* **Authentication:** None (Public)
* **Request Body (`LoginRequest`):**
  ```json
  {
    "username": "john_doe",
    "password": "SecurePassword123"
  }
  ```
* **Success Response (HTTP 200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ...",
    "username": "john_doe",
    "role": "STUDENT",
    "email": "john.doe@college.edu"
  }
  ```

### 1.3 Validate Token
Checks if a given JWT token is active and valid.
* **Method:** `GET`
* **URL:** `/api/auth/validate`
* **Authentication:** Public (Extracts Bearer token)
* **Request Header:**
  `Authorization: Bearer <token_string>`
* **Success Response (HTTP 200 OK):**
  ```text
  Token is valid
  ```
* **Error Response (HTTP 401 Unauthorized):**
  ```text
  Token is invalid or expired
  ```

### 1.4 Get User Email (Internal Use Only)
Retrieves a user's email address by username. Used by Feign clients downstream.
* **Method:** `GET`
* **URL:** `/api/auth/users/{username}/email`
* **Authentication:** Internal
* **Success Response (HTTP 200 OK):**
  ```text
  john.doe@college.edu
  ```

---

## 2. Inventory Service (`/api/inventory`)
Manages stationery item details, available quantities, and stock alerts.

### 2.1 Create Stationery Item
Creates a new stationery item in the database.
* **Method:** `POST`
* **URL:** `/api/inventory`
* **Authentication:** JWT Bearer (Propagated by Gateway)
* **Required Role:** `ADMIN`
* **Headers:**
  - `X-User-Role: ADMIN`
  - `X-User-Name: admin_user`
* **Request Body (`StationeryItemRequest`):**
  ```json
  {
    "name": "Blue Ballpoint Pen",
    "category": "Writing Materials",
    "unit": "BOX",
    "availableQuantity": 150,
    "minimumQuantity": 15,
    "description": "Standard pack of 10 blue pens."
  }
  ```
* **Success Response (HTTP 201 Created):**
  ```json
  {
    "id": 1,
    "name": "Blue Ballpoint Pen",
    "category": "Writing Materials",
    "unit": "BOX",
    "availableQuantity": 150,
    "minimumQuantity": 15,
    "description": "Standard pack of 10 blue pens.",
    "createdAt": "2026-06-18T13:00:00",
    "updatedAt": "2026-06-18T13:00:00"
  }
  ```

### 2.2 Get All Items (Paginated)
Retrieves all stationery items with paging support.
* **Method:** `GET`
* **URL:** `/api/inventory?page=0&size=20&sortBy=name`
* **Authentication:** JWT Bearer (Any registered user)
* **Success Response (HTTP 200 OK):**
  ```json
  {
    "content": [
      {
        "id": 1,
        "name": "Blue Ballpoint Pen",
        "category": "Writing Materials",
        "unit": "BOX",
        "availableQuantity": 150,
        "minimumQuantity": 15,
        "description": "Standard pack of 10 blue pens."
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20
    },
    "totalPages": 1,
    "totalElements": 1
  }
  ```

### 2.3 Get Item by ID
Fetches a single stationery item's full details.
* **Method:** `GET`
* **URL:** `/api/inventory/{id}`
* **Authentication:** JWT Bearer (Any registered user)
* **Success Response (HTTP 200 OK):**
  ```json
  {
    "id": 1,
    "name": "Blue Ballpoint Pen",
    "category": "Writing Materials",
    "unit": "BOX",
    "availableQuantity": 150,
    "minimumQuantity": 15,
    "description": "Standard pack of 10 blue pens.",
    "createdAt": "2026-06-18T13:00:00",
    "updatedAt": "2026-06-18T13:00:00"
  }
  ```

### 2.4 Update Item
Updates an existing stationery item.
* **Method:** `PUT`
* **URL:** `/api/inventory/{id}`
* **Authentication:** JWT Bearer (Propagated by Gateway)
* **Required Role:** `ADMIN`
* **Request Body:** *(Same as `StationeryItemRequest`)*
* **Success Response (HTTP 200 OK):**
  ```json
  {
    "id": 1,
    "name": "Blue Ballpoint Pen",
    "category": "Writing Materials",
    "unit": "BOX",
    "availableQuantity": 180,
    "minimumQuantity": 15,
    "description": "Updated pack size."
  }
  ```

### 2.5 Delete Item
Deletes an item from the database.
* **Method:** `DELETE`
* **URL:** `/api/inventory/{id}`
* **Authentication:** JWT Bearer (Propagated by Gateway)
* **Required Role:** `ADMIN`
* **Success Response:** `204 No Content`

### 2.6 Get Low Stock Items
Lists all items whose available quantity is at or below the minimum stock quantity.
* **Method:** `GET`
* **URL:** `/api/inventory/low-stock`
* **Authentication:** JWT Bearer (Propagated by Gateway)
* **Required Role:** `ADMIN`
* **Success Response (HTTP 200 OK):**
  ```json
  [
    {
      "id": 2,
      "name": "A4 Copier Paper",
      "category": "Paper Products",
      "unit": "REAM",
      "availableQuantity": 5,
      "minimumQuantity": 10,
      "description": "Standard 80gsm white printing paper."
    }
  ]
  ```

### 2.7 Search Items
Searches items by case-insensitive name match.
* **Method:** `GET`
* **URL:** `/api/inventory/search?keyword=pen`
* **Authentication:** JWT Bearer (Any registered user)
* **Success Response (HTTP 200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Blue Ballpoint Pen",
      "category": "Writing Materials"
    }
  ]
  ```

### 2.8 Deduct Quantity (Internal Use Only)
Reduces inventory stock. Called internally by the Request Service upon request fulfillment.
* **Method:** `PUT`
* **URL:** `/api/inventory/{id}/deduct?quantity={quantity}`
* **Authentication:** Internal
* **Success Response (HTTP 200 OK):** `true`

---

## 3. Request Service (`/api/requests`)
Handles stationery requests, student queues, and admin approvals.

### 3.1 Create Stationery Request
Students submit a request for one or more stationery items.
* **Method:** `POST`
* **URL:** `/api/requests`
* **Authentication:** JWT Bearer (Propagated by Gateway)
* **Required Role:** `STUDENT`
* **Headers:**
  - `X-User-Name: student_user`
  - `X-User-Role: STUDENT`
* **Request Body (`CreateRequestDto`):**
  ```json
  {
    "items": [
      {
        "itemId": 1,
        "quantity": 2
      },
      {
        "itemId": 3,
        "quantity": 1
      }
    ]
  }
  ```
* **Success Response (HTTP 201 Created):**
  ```json
  {
    "id": 10,
    "requestId": "5e13bc9a-b44c-47bd-bde8-d144d9370cb8",
    "studentUsername": "student_user",
    "status": "PENDING",
    "rejectionReason": null,
    "adminUsername": null,
    "createdAt": "2026-06-18T13:45:00",
    "updatedAt": "2026-06-18T13:45:00",
    "items": [
      {
        "id": 12,
        "itemId": 1,
        "quantity": 2,
        "itemName": "Blue Ballpoint Pen"
      },
      {
        "id": 13,
        "itemId": 3,
        "quantity": 1,
        "itemName": "Sticky Notes"
      }
    ]
  }
  ```

### 3.2 Get My Requests
Retrieves requests made by the currently authenticated student. Can optionally filter by status.
* **Method:** `GET`
* **URL:** `/api/requests/my?status=PENDING`
* **Authentication:** JWT Bearer (Propagated by Gateway)
* **Required Role:** `STUDENT`
* **Success Response (HTTP 200 OK):**
  ```json
  [
    {
      "id": 10,
      "requestId": "5e13bc9a-b44c-47bd-bde8-d144d9370cb8",
      "studentUsername": "student_user",
      "status": "PENDING",
      "items": [...]
    }
  ]
  ```

### 3.3 Get All Requests (Admin Console)
Retrieves all requests in the system. Can filter by status (e.g., `PENDING`, `APPROVED`, `REJECTED`, `FULFILLED`).
* **Method:** `GET`
* **URL:** `/api/requests?status=PENDING`
* **Authentication:** JWT Bearer (Propagated by Gateway)
* **Required Role:** `ADMIN`
* **Success Response (HTTP 200 OK):**
  ```json
  [
    {
      "id": 10,
      "requestId": "5e13bc9a-b44c-47bd-bde8-d144d9370cb8",
      "studentUsername": "student_user",
      "status": "PENDING",
      "items": [...]
    }
  ]
  ```

### 3.4 Get Request by ID
Fetches details of a specific request using its numerical database ID.
* **Method:** `GET`
* **URL:** `/api/requests/{id}`
* **Authentication:** JWT Bearer
* **Success Response (HTTP 200 OK):**
  ```json
  {
    "id": 10,
    "requestId": "5e13bc9a-b44c-47bd-bde8-d144d9370cb8",
    "studentUsername": "student_user",
    "status": "APPROVED"
  }
  ```

### 3.5 Track Request by Request ID (UUID)
Tracks a request via its public UUID string. Accessible without database ID indexing.
* **Method:** `GET`
* **URL:** `/api/requests/track/{requestId}`
* **Authentication:** JWT Bearer (Any registered user)
* **Success Response (HTTP 200 OK):**
  ```json
  {
    "id": 10,
    "requestId": "5e13bc9a-b44c-47bd-bde8-d144d9370cb8",
    "studentUsername": "student_user",
    "status": "PENDING"
  }
  ```

### 3.6 Approve Request
Approves a pending stationery request.
* **Method:** `PUT`
* **URL:** `/api/requests/{id}/approve`
* **Authentication:** JWT Bearer (Propagated by Gateway)
* **Required Role:** `ADMIN`
* **Success Response (HTTP 200 OK):**
  ```json
  {
    "id": 10,
    "requestId": "5e13bc9a-b44c-47bd-bde8-d144d9370cb8",
    "studentUsername": "student_user",
    "status": "APPROVED",
    "adminUsername": "admin_user"
  }
  ```

### 3.7 Reject Request
Rejects a request with a reasoning text.
* **Method:** `PUT`
* **URL:** `/api/requests/{id}/reject`
* **Authentication:** JWT Bearer (Propagated by Gateway)
* **Required Role:** `ADMIN`
* **Request Body (`ApproveRejectDto`):**
  ```json
  {
    "rejectionReason": "Item out of stock and discontinued by vendor."
  }
  ```
* **Success Response (HTTP 200 OK):**
  ```json
  {
    "id": 10,
    "requestId": "5e13bc9a-b44c-47bd-bde8-d144d9370cb8",
    "studentUsername": "student_user",
    "status": "REJECTED",
    "rejectionReason": "Item out of stock and discontinued by vendor.",
    "adminUsername": "admin_user"
  }
  ```

### 3.8 Fulfill Request
Marks an approved request as dispatched/fulfilled, updating inventory stock levels.
* **Method:** `PUT`
* **URL:** `/api/requests/{id}/fulfill`
* **Authentication:** JWT Bearer (Propagated by Gateway)
* **Required Role:** `ADMIN`
* **Success Response (HTTP 200 OK):**
  ```json
  {
    "id": 10,
    "requestId": "5e13bc9a-b44c-47bd-bde8-d144d9370cb8",
    "studentUsername": "student_user",
    "status": "FULFILLED",
    "adminUsername": "admin_user"
  }
  ```
