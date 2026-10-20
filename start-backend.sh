#!/bin/sh
set -e

echo "=== Starting Saasta Scholar Backend API Server ==="

cd /app/Backend

# Ensure Persistent Media and DRM Storage Directories Exist
mkdir -p /app/Backend/media/avatars /app/Backend/media/academic_materials /app/Backend/drm_vault /app/staticfiles

if [ -n "$POSTGRES_HOST" ]; then
  echo "-> Waiting For PostgreSQL At $POSTGRES_HOST:${POSTGRES_PORT:-5432}..."
  python - <<END
import time, socket, os
host = os.environ.get("POSTGRES_HOST", "db")
port = int(os.environ.get("POSTGRES_PORT", "5432"))
for i in range(30):
    try:
        with socket.create_connection((host, port), timeout=2):
            print("-> PostgreSQL Is Reachable On Port", port)
            break
    except OSError:
        time.sleep(1)
else:
    print("-> PostgreSQL Wait Timeout, Proceeding...")
END
fi

echo "-> Applying Database Migrations..."
python Manage.py migrate --noinput

echo "-> Checking And Seeding Database Records..."
python SeedDatabase.py || true

echo "-> Starting Django Gunicorn API Server On 0.0.0.0:8000..."
exec gunicorn Core.wsgi:application --bind 0.0.0.0:8000 --workers 3 --threads 4 --timeout 300
