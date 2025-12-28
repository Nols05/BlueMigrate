FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file to the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port for FastAPI 
EXPOSE 8001

# Run FastAPI with Uvicorn
CMD ["uvicorn", "app:app",  "--port", "8001", "--host", "0.0.0.0"]
