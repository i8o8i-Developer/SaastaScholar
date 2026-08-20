# ==============================================================================
# Multi-Stage Dockerfile for NimsWallah (Pure Vite + React SPA)
# Ultra-Fast, Production Nginx Web Server on Port 7865
# Compatible with Coolify Docker & Docker Compose Buildpacks
# ==============================================================================

# Stage 1: Build Static Bundle
FROM node:22-alpine AS builder

# Accept Coolify & Vite build arguments
ARG VITE_SITE_URL=https://nimswallah.durgaaisolutions.in
ARG VITE_SITE_NAME=NimsWallah
ARG VITE_SITE_DOMAIN=nimswallah.durgaaisolutions.in
ARG VITE_PORT=7865
ARG PORT=7865
ARG HOST=0.0.0.0
ARG COOLIFY_FQDN=nimswallah.durgaaisolutions.in

ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_SITE_NAME=$VITE_SITE_NAME
ENV VITE_SITE_DOMAIN=$VITE_SITE_DOMAIN
ENV VITE_PORT=$VITE_PORT
ENV PORT=$PORT
ENV HOST=$HOST
ENV NODE_ENV=development

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat

# Copy package manifests
COPY package.json package-lock.json* ./

# Install all dependencies required for building
RUN npm install --include=dev

# Copy source code
COPY . .

# Build production static bundle (outputs to /app/dist)
RUN npm run build

# Stage 2: Production Nginx Web Server
FROM nginx:alpine AS runner

ARG PORT=7865
ARG COOLIFY_FQDN=nimswallah.durgaaisolutions.in

# Remove default Nginx welcome site
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Port 7865 and Port 80 for Coolify Traefik
EXPOSE 7865 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:7865/healthz || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
