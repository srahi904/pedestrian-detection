FROM python:3.10-slim

WORKDIR /code

# Install system dependencies required by OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend source code
COPY . .

# Expose the API port
EXPOSE 8000

# Start the FastApi application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
