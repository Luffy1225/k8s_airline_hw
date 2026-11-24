FROM python:3.11-slim

# Avoid writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend, compiled frontend, and presentation
COPY backend ./backend
COPY frontend ./frontend
COPY presentation ./presentation

# Expose web service port
EXPOSE 5000

# Set entry working directory to backend
WORKDIR /app/backend

# Run Flask application
CMD ["python", "app.py"]
