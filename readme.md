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
