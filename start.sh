#!/bin/sh
set -e

echo "=== Starting SaastaScholar Full-Stack Container (Frontend + Backend + In-Container Redis) ==="

# 1. Start In-Container Redis High-Speed Cache & Session Store
REDIS_PORT=${REDIS_PORT:-6379}
echo "-> Launching In-Container Redis Server On 127.0.0.1:${REDIS_PORT}..."
mkdir -p /var/log/redis /var/lib/redis
redis-server --daemonize yes --port "${REDIS_PORT}" --bind 127.0.0.1 --save "" --appendonly no --maxmemory 256mb --maxmemory-policy allkeys-lru

echo "-> Verifying In-Container Redis Server..."
for i in $(seq 1 15); do
  if redis-cli -p "${REDIS_PORT}" ping 2>/dev/null | grep -q "PONG"; then
    echo "-> In-Container Redis Is Live (PONG received on port ${REDIS_PORT})!"
    break
  fi
  sleep 0.5
done

# 2. Navigate To Backend
cd /app/Backend

# Ensure Persistent Media and DRM Storage Directories Exist
mkdir -p /app/Backend/media/avatars /app/Backend/media/academic_materials /app/Backend/drm_vault /app/staticfiles

if [ -n "$DATABASE_URL" ] || [ -n "$POSTGRES_HOST" ]; then
  python - <<END
import time, socket, os
from urllib.parse import urlparse

db_url = os.environ.get("DATABASE_URL", "")
if db_url:
    parsed = urlparse(db_url)
    host = parsed.hostname or "localhost"
    port = parsed.port or 5432
else:
    host = os.environ.get("POSTGRES_HOST", "db")
    port = int(os.environ.get("POSTGRES_PORT", "5432"))

print(f"-> Waiting For PostgreSQL At {host}:{port}...")
for i in range(40):
    try:
        with socket.create_connection((host, port), timeout=2):
            print(f"-> PostgreSQL Is Reachable On {host}:{port}!")
            break
    except OSError:
        time.sleep(1)
else:
    print("-> PostgreSQL Wait Timeout, Proceeding With Migrations Anyway...")
END
fi

echo "-> Applying Database Migrations..."
python Manage.py migrate --noinput

# Seed Database With Environment-Based Master Admin & Subscription Plans
echo "-> Checking And Seeding Database Records..."
python SeedDatabase.py || true

echo "-> Starting Django API Server Via Gunicorn On 127.0.0.1:8000 (Multi-Threaded)..."
gunicorn Core.wsgi:application --bind 127.0.0.1:8000 --workers 3 --threads 4 --timeout 300 &

# Ensure Gunicorn Is Ready Before Launching Nginx
echo "-> Verifying Django API Server Status..."
python - <<END
import time, socket
for i in range(30):
    try:
        with socket.create_connection(("127.0.0.1", 8000), timeout=2):
            print("-> Django API Server Is Ready On 127.0.0.1:8000")
            break
    except OSError:
        time.sleep(0.5)
else:
    print("-> Django API Server Startup Timeout, Proceeding...")
END

# Start Nginx In Foreground On 7865
echo "-> Starting Nginx On Port 7865..."
exec nginx -g "daemon off;"
