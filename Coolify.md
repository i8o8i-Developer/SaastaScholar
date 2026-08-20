# 🚀 Coolify Deployment Guide (NimsWallah Pure Vite + React SPA)

This project is configured as a **Pure Vite + React SPA** served by **Nginx on Alpine Linux** on **Port 7865**.

---

## 1. Quick Deploy on Coolify

1. Open your **Coolify Dashboard**.
2. Navigate to **Projects** > **New Resource** > **Public / Private Git Repository**.
3. Enter repository URL:
   ```
   https://github.com/i8o8i-Developer/NIMS-Wallah.git
   ```
4. Select branch: `main`.
5. Build Pack:
   - **Option A (Recommended)**: **Dockerfile** (Coolify will detect the multi-stage Dockerfile).
   - **Option B**: **Docker Compose** (Coolify will detect `docker-compose.yml`).
6. Port Configuration:
   - **Port**: `7865`
7. Custom Domain:
   - `https://nimswallah.durgaaisolutions.in`
8. Click **Deploy**.

---

## 2. Architecture & Performance Highlights

- **Static Build**: Pure Vite compilation into optimized static HTML, CSS, and JS.
- **Web Server**: High-performance `nginx:alpine` container (< 10MB RAM).
- **Gzip & Caching**: Pre-configured asset caching (`1y`) and gzip compression.
- **SPA Fallback**: Direct routing fallback via `try_files $uri $uri/ /index.html;`.
- **Zero SSR Dependencies**: No runtime Node crashes, no hydration mismatches.

---

## 3. Local Testing with Docker

```bash
# Build & start container locally
docker compose up --build -d

# Verify container is healthy
docker ps

# Access in browser
http://localhost:7865
```
