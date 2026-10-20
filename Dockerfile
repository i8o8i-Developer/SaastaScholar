# ==============================================================================
# Multi-Stage Dockerfile for NimsWallah Full-Stack
# React Frontend (Vite) + Django Python Backend (Gunicorn + PostgreSQL) + Nginx
# Listens on Port 7865 (Compatible with Coolify Traefik Network)
# ==============================================================================

# Stage 1: Build Static React Frontend Bundle
FROM node:22-alpine AS frontend-builder

ARG VITE_SITE_URL=https://saastascholar.durgaaisolutions.in
ARG VITE_SITE_NAME=SaastaScholar
ARG VITE_SITE_DOMAIN=saastascholar.durgaaisolutions.in
ARG VITE_PORT=7865
ARG PORT=7865
ARG HOST=0.0.0.0
ARG COOLIFY_FQDN=saastascholar.durgaaisolutions.in

ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_SITE_NAME=$VITE_SITE_NAME
ENV VITE_SITE_DOMAIN=$VITE_SITE_DOMAIN
ENV VITE_PORT=$VITE_PORT
ENV PORT=$PORT
ENV HOST=$HOST
ENV NODE_ENV=development
ENV TZ=Asia/Kolkata

WORKDIR /app

RUN apk add --no-cache libc6-compat tzdata
COPY package.json package-lock.json* ./
RUN npm install --include=dev

COPY . .
RUN npm run build

# Stage 2: Full-Stack Production Runner (Nginx + Python Django API)
FROM python:3.10-slim AS runner

ARG PORT=7865
ARG COOLIFY_FQDN=nimswallah.durgaaisolutions.in

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=7865
ENV TZ=Asia/Kolkata
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    tzdata \
    nginx \
    wget \
    libpq5 \
    redis-server \
    redis-tools \
    libreoffice-core \
    libreoffice-writer \
    libreoffice-impress \
    libreoffice-calc \
    fonts-liberation \
    fonts-dejavu \
    fonts-crosextra-carlito \
    fonts-crosextra-caladea \
    fontconfig \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

# Rebuild font cache
RUN fc-cache -f -v

WORKDIR /app

# Copy Backend & Requirements
COPY Backend/Requirements.txt /app/Backend/Requirements.txt
RUN pip install --no-cache-dir -r /app/Backend/Requirements.txt \
    && opentelemetry-bootstrap --action=install || true

COPY Backend /app/Backend
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Remove default Nginx welcome site & configs
RUN rm -rf /usr/share/nginx/html/* /var/www/html/* /etc/nginx/sites-enabled/default

# Copy built frontend static files from frontend-builder
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Port 7865
EXPOSE 7865

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:7865/healthz || exit 1

# Start Full-Stack Services
CMD ["/app/start.sh"]
