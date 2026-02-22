# Pedestrian Detection - Deployment Guide

This guide provides step-by-step instructions to deploy the Pedestrian Detection application. The application is containerized using Docker, making it easy to run on your local machine or deploy it to a cloud provider.

## Prerequisites

Before deploying, ensure you have the following installed on your machine or cloud server:

1. **Docker**: [Download and install Docker](https://docs.docker.com/get-docker/)
2. **Docker Compose**: Included with Docker Desktop. (For Linux, [install separately](https://docs.docker.com/compose/install/))

## Local Deployment using Docker Compose

To run the complete application (Frontend + Backend) simultaneously on your machine, follow these steps:

1. Open your terminal and navigate to the root directory of the project (where the `docker-compose.yml` file is located).

   ```bash
   cd path/to/padestrian
   ```

2. Run the following command to build the Docker images and start the containers. The `-d` flag runs them in detached mode (in the background).

   ```bash
   docker-compose up -d --build
   ```

3. **Backend Access**: Wait a minute for the models to load. Once the backend starts, the FastApi application will be accessible at:
   - Base URL: `http://localhost:8000`
   - Interactive API Docs (Swagger UI): `http://localhost:8000/docs`

4. **Frontend Access**: The React application will be accessible at:
   - App URL: `http://localhost:80` (or simply `http://localhost`)

### Stopping the Application

To stop the running application and remove the containers, run:

```bash
docker-compose down
```

---

## Cloud Deployment Options

You can deploy the project to multiple platforms using the Docker setup.

### Option 1: Render (Easiest for Web Services)

Render natively supports Docker-based deployments. You can deploy the frontend and backend as two separate Web Services.

**Deploying the Backend on Render:**
1. Connect your GitHub repository to Render.
2. Create a new **Web Service**.
3. Select your repository.
4. Set the **Root Directory** to `backend`.
5. Render will automatically detect the `Dockerfile` in the `backend` directory.
6. Select an instance type (A machine with more RAM is recommended for YOLO model inference, at least 2GB RAM).
7. Deploy!

**Deploying the Frontend on Render (or Vercel):**
- **Render**: Similar to the backend, set the **Root Directory** to `frontend`, and it will use the frontend `Dockerfile`.
- **Vercel**: You can also easily deploy the React Vite frontend directly to Vercel without Docker. Just connect your GitHub to Vercel and create a project pointing to the `frontend` folder.

### Option 2: VPS (DigitalOcean, AWS EC2, Linode)

If you have a Linux Virtual Private Server (VPS), you can deploy the complete stack using `docker-compose`:

1. SSH into your VPS.
2. Install Docker and Docker Compose.
3. Clone your GitHub repository to the server.
   ```bash
   git clone <your-repo-url>
   cd padestrian
   ```
4. Run `docker-compose up -d --build` just like you would locally.
5. Provide access to port 80 (Frontend) and 8000 (Backend) on your server's firewall. 

---

## Environment Variables

Currently, the default configurations are hardcoded for local development. Make sure your frontend code is configured to fetch data from the backend's correct URL when moving to production. 

- **Backend**: Update the `CORS` origins in `backend/app/main.py` if deploying the frontend on a different domain.
- **Frontend**: Update the backend API URL in the frontend Axios calls / WebSocket connection.
