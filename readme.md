# Indobat Web Application

This project consists of a Backend (Go/Gin) and a Frontend (Next.js), orchestrated using Docker. It is designed to be easily run on any machine and accessed from other devices on the same network.

## Prerequisites

- **Docker** and **Docker Compose** installed on your system.
  - [Get Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Quick Start (Run with Docker)

1.  **Open a terminal** in the project root directory (where `docker-compose.yml` is located).

2.  **Build and Run** the application:
    ```bash
    docker-compose up --build
    ```
    *Add `-d` to run in detached mode (background):*
    ```bash
    docker-compose up --build -d
    ```

3.  **Wait** for the containers to start. The frontend, backend, and database will initialize.

## Accessing the Application

### From the Host Computer (The one running Docker)
Open your browser and visit:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health) (Health Check)

### From Another Computer/Mobile Device (Same Network)
To access the app from another device (e.g., a phone or another laptop):

1.  **Find your IP Address**:
    - **Mac**: System Settings > Wi-Fi > Details > TCP/IP > IP Address (e.g., `192.168.1.15`)
    - **Windows**: Open Command Prompt, type `ipconfig`, look for IPv4 Address.
    - **Linux**: Run `hostname -I`.

2.  **Open Browser on the other device**:
    - Visit `http://<YOUR_IP_ADDRESS>:3000`
    - Example: `http://192.168.1.15:3000`

## Architecture & Configuration

- **Frontend (Next.js)**: Runs on port `3000`. It is configured to proxy API requests (starting with `/api`) to the backend container. This ensures that the app works seamlessly whether accessed via `localhost` or an IP address.
- **Backend (Go/Gin)**: Runs on port `8080`. Configured to allow cross-origin requests (`CORS`) to support access from devices on the network.
- **Database (PostgreSQL)**: Runs on port `5432`. Data is persisted in a Docker volume `postgres_data`.

## Stopping the App

To stop the containers:
```bash
docker-compose down
```

To stop and **remove the database volume** (reset data):
```bash
docker-compose down -v
```

## Troubleshooting

- **Connection Refused**: Ensure the containers are running (`docker-compose ps`).
- **Changes not reflecting**: If you changed code, try rebuilding without cache:
  ```bash
  docker-compose build --no-cache
  docker-compose up -d
  ```

# API Documentation

Base URL: `http://localhost:8080/api/v1`

## General Information
- **Content-Type**: `application/json`
- **CORS**: Allowed for all origins (`*`)

---

## 1. Health Check
Check if the API server is running up and healthy.

- **Endpoint**: `GET /health`
- **Response**:
    ```json
    {
      "status": "ok"
    }
    ```

---

## 2. Products

### Get All Products
Retrieve a list of products with pagination, search, and sorting.

- **Endpoint**: `GET /products`
- **Query Parameters**:
    - `page` (int, default: 1): Page number.
    - `limit` (int, default: 10): Items per page.
    - `search` (string, optional): Search term for product name.
    - `sortBy` (string, optional): Field to sort by (e.g., `name`, `price`, `stock`, `id`).
    - `order` (string, optional): Sort order (`asc` or `desc`).
- **Example**: `GET /products?search=para&sortBy=price&order=desc`

- **Response**:
    ```json
    {
      "data": [
        {
          "id": 1,
          "name": "Paracetamol",
          "stock": 100,
          "price": 5000,
          "created_at": "2024-01-01T10:00:00Z",
          "updated_at": "2024-01-01T10:00:00Z"
        }
      ],
      "total": 50,
      "page": 1,
      "limit": 10
    }
    ```

### Create Product
Add a new product to the inventory.

- **Endpoint**: `POST /products`
- **Body**:
    ```json
    {
      "name": "Amoxicillin",
      "stock": 50,
      "price": 12000
    }
    ```
    - `name` (required): Product name.
    - `stock` (required, min: 0): Initial stock quantity.
    - `price` (required, gt: 0): Price per unit.
- **Response**: `201 Created`
    ```json
    {
      "id": 2,
      "name": "Amoxicillin",
      "stock": 50,
      "price": 12000,
      "created_at": "...",
      "updated_at": "..."
    }
    ```

### Update Product
Modify an existing product.

- **Endpoint**: `PUT /products/:id`
- **Body**: Same as Create Product (all fields required to be sent).
    ```json
    {
      "name": "Amoxicillin Updated",
      "stock": 60,
      "price": 12500
    }
    ```
- **Response**: `200 OK` (Returns updated product object)

### Delete Product
Remove a product from the system.

- **Endpoint**: `DELETE /products/:id`
- **Response**: `200 OK`
    ```json
    {
      "message": "Product deleted"
    }
    ```

---

## 3. Orders (Transactions)

### Create Order
Record a new transaction (sale).

- **Endpoint**: `POST /order`
- **Body**:
    ```json
    {
      "product_id": 1,
      "quantity": 2,
      "discount_percent": 10
    }
    ```
    - `product_id` (required): ID of the product being sold.
    - `quantity` (required, min: 1): Amount to sell.
    - `discount_percent` (optional, 0-100): Discount applied.
- **Response**: `200 OK`
    ```json
    {
      "transaction_id": 101,
      "product_name": "Paracetamol",
      "quantity": 2,
      "total_price": 9000,
      "remaining_stock": 98
    }
    ```

### Get Order History
Retrieve a list of past transactions.

- **Endpoint**: `GET /orders`
- **Query Parameters**:
    - `page`, `limit`: Pagination.
    - `sortBy`, `order`: Sorting.
    - `groupBy` (string, optional): Group results by field (implementation specific).
    **Example**: `GET /orders?page=1&limit=10&sortBy=created_at&order=desc`
- **Response**:
    ```json
    {
      "data": [
        {
          "id": 101,
          "product_id": 1,
          "product": { ... },
          "quantity": 2,
          "discount_percent": 10,
          "unit_price": 5000,
          "total_price": 9000,
          "created_at": "..."
        }
      ],
      "total": 25,
      "page": 1,
      "limit": 10
    }
    ```
