# ==============================================================================
# Multi-Stage Dockerfile for NimsWallah (Pure Vite + React SPA)
# Ultra-Fast, Production Nginx Web Server on Port 7865
# ==============================================================================

# Stage 1: Build Static Bundle
FROM node:22-alpine AS builder

WORKDIR /app
ENV NODE_ENV=development

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./

RUN npm install --include=dev

COPY . .

RUN npm run build

FROM nginx:alpine AS runner

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Port 7865
EXPOSE 7865

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
