# ==============================================================================
# Multi-Stage Dockerfile for NimsWallah (Pure Vite + React SPA)
# Ultra-Fast, Zero-SSR Overhead, Production Nginx on Port 7865
# ==============================================================================

# Stage 1: Build Static Bundle
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat

# Copy package manifests
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Copy source files
COPY . .

# Build production static bundle (outputs to /app/dist)
RUN npm run build

# Stage 2: Production Nginx Web Server
FROM nginx:alpine AS runner

# Remove default Nginx welcome site
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Port 7865
EXPOSE 7865

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
