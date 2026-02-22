# Pedestrian Detection System 🚶‍♂️🛑

A Full-Stack Pedestrian Detection and Tracking application featuring a real-time React dashboard and a powerful FastAPI backend powered by YOLOv8 and DeepSORT tracking algorithms.

## 🌟 Features

- **Real-time Video Processing**: Stream and process video feeds or uploaded files.
- **High-Accuracy Detection**: Utilizes **YOLOv8** (You Only Look Once) state-of-the-art models for rapid and accurate pedestrian detection.
- **Persistent Tracking**: Implements **DeepSORT** to track individuals across frames over time.
- **Interactive Dashboard**: Modern, responsive **React (Vite) + Tailwind CSS** frontend to visualize detections, tracks, and system statistics.
- **REST API + WebSockets**: Fast and asynchronous backend powered by **FastAPI**.

## 🛠️ Tech Stack

### Frontend
- **React 19** with **Vite**
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- Axios & WebSockets for communication

### Backend
- **Python 3.10+**
- **FastAPI** & Uvicorn
- **Ultralytics YOLOv8** (Computer Vision)
- **OpenCV** & PyTorch
- **DeepSORT Realtime** (Object Tracking)

## 🚀 Getting Started

You can run this project locally without Docker.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended for Vite)
- [Python 3.10+](https://www.python.org/downloads/)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/srahi904/pedestrian-detection.git
cd pedestrian-detection
```

### 2. Setup the Backend (Python)

Open a new terminal and navigate to the `backend` folder:

```bash
cd backend

# Create a virtual environment (Optional but Recommended)
python -m venv .venv
# Activate it (Windows)
.venv\Scripts\activate
# Activate it (Mac/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastApi server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*Note: The YOLOv8 model weights (`.pt` files) are automatically downloaded by the `ultralytics` package the first time you run the application. They are explicitly excluded from this repository due to their large size.*

The backend API will be running at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Setup the Frontend (React)

Open another terminal and navigate to the `frontend` folder:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend dashboard will be running at [http://localhost:5173](http://localhost:5173).

## ☁️ Deployment

Looking to deploy this application to the cloud? We highly recommend [Render.com](https://render.com) for a robust and free/low-cost deployment directly from your GitHub repository using Web Services.

Check out the detailed [DEPLOYMENT.md](./DEPLOYMENT.md) guide for instructions on deploying to various cloud providers.

---
*Developed for College Project purposes.*
