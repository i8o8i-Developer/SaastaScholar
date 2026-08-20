# Deploying NimsWallah On Coolify 🚀

This repository is pre-configured for **instant, zero-config deployment on Coolify**.

---

## 1. Quick Deploy via Coolify Web Dashboard

1. **Open your Coolify Dashboard** (e.g. `https://coolify.yourdomain.com`).
2. Go to **Projects** → Select or create your Project & Environment.
3. Click **+ New Resource** → Select **Public / Private Git Repository**.
4. Paste your Git repository URL (e.g. `https://github.com/your-username/nimswallah.git`).
5. Choose **Build Pack**:
   - **Option A (Recommended)**: **Dockerfile** (Coolify will automatically detect the root `Dockerfile`).
   - **Option B**: **Docker Compose** (Coolify will detect `docker-compose.yml`).
6. Configure Port:
   - **Port**: `7865`
7. Click **Deploy**.

---

## 2. Environment Variables (Optional)

| Variable | Default Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `7865` | Application HTTP Port |
| `HOST` | `0.0.0.0` | Listen host |
| `NITRO_PORT` | `7865` | Nitro server port |
| `NITRO_HOST` | `0.0.0.0` | Nitro host binding |

---

## 3. Local Docker Testing

To test the container locally before deploying to Coolify:

```bash
# Build & start container
docker compose up --build -d

# Check running status
docker ps

# Access in browser
http://localhost:7865
```
