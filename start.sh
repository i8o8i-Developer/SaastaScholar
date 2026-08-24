#!/bin/sh
set -e

echo "=== Starting NimsWallah Full-Stack Docker Container ==="

# Navigate To Backend
cd /app/Backend

# Ensure Persistent Media and DRM Storage Directories Exist
mkdir -p /app/Backend/media/avatars /app/Backend/media/academic_materials /app/Backend/drm_vault /app/staticfiles

if [ -n "$POSTGRES_HOST" ]; then
  echo "-> Waiting For PostgreSQL At $POSTGRES_HOST:${POSTGRES_PORT:-4611}..."
  python - <<END
import time, socket, os
host = os.environ.get("POSTGRES_HOST", "postgres_db")
port = int(os.environ.get("POSTGRES_PORT", "4611"))
for i in range(30):
    try:
        with socket.create_connection((host, port), timeout=2):
            print("-> PostgreSQL Is Reachable On Port", port)
            break
    except OSError:
        time.sleep(1)
else:
    print("-> PostgreSQL Wait Timeout, Proceeding Anyway...")
END
fi

echo "-> Applying Database Migrations..."
python Manage.py migrate --noinput

# Seed Database With Environment-Based Master Admin & Subscription Plans
echo "-> Checking And Seeding Database Records..."
python SeedDatabase.py || true

# Start Django Gunicorn On 127.0.0.1:8000 In Background
echo "-> Starting Django API Server Via Gunicorn on 127.0.0.1:8000..."
gunicorn Core.wsgi:application --bind 127.0.0.1:8000 --workers 3 --timeout 120 &

# Start Nginx In Foreground On 7865
echo "-> Starting Nginx On Port 7865..."
exec nginx -g "daemon off;"
