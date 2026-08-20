# ==============================================================================
# Multi-Stage Dockerfile for NimsWallah (TanStack Start + Nitro SSR)
# Optimized for Coolify, VPS, and Docker Deployments
# ==============================================================================

# Stage 1: Build & Dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Install build prerequisites
RUN apk add --no-cache libc6-compat

# Explicitly ensure development environment during build so all devDependencies are installed
ENV NODE_ENV=development

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install all dependencies including devDependencies (compiler, typescript, vite plugins)
RUN npm ci --include=dev || npm install --include=dev

# Copy all source files
COPY . .

# Build production application (Client, SSR, and Nitro server bundle)
RUN npm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=7865
ENV HOST=0.0.0.0
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=7865

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nimswallah

# Copy built artifacts from builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/Public ./Public

# Set correct ownership
RUN chown -R nimswallah:nodejs /app

USER nimswallah

# Expose server port (Port: 7865)
EXPOSE 7865

# Start production server
CMD ["node", ".output/server/index.mjs"]
