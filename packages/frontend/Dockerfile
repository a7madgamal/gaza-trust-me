# Frontend Dockerfile for Gazaconfirm Platform
# Note: This should be built from the project root with: docker build -f packages/frontend/Dockerfile .

FROM node:20-alpine AS base

# Build backend types first
FROM base AS backend-builder
WORKDIR /app/packages/backend

# Install Supabase CLI for type generation
RUN apk add --no-cache curl && \
    curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz && \
    mv supabase /usr/local/bin/supabase && \
    chmod +x /usr/local/bin/supabase

# Copy backend source and install dependencies
COPY packages/backend/package.json ./
RUN npm install --ignore-scripts

COPY packages/backend ./
# Build backend with type generation
ARG SUPABASE_ACCESS_TOKEN
ENV SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN
RUN npm run build

# Build frontend
FROM base AS builder
WORKDIR /app

# Copy root package.json for workspace setup
COPY package.json ./

# Copy frontend source
COPY packages/frontend ./packages/frontend/

# Copy built backend for type imports
COPY --from=backend-builder /app/packages/backend ./packages/backend/

# Install workspace dependencies from root
RUN npm install --workspaces --ignore-scripts

# Build frontend
WORKDIR /app/packages/frontend

# Set build-time environment variables for Vite
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production image with nginx
FROM nginx:alpine AS runner

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 frontend

# Copy built application
COPY --from=builder --chown=frontend:nodejs /app/packages/frontend/dist /usr/share/nginx/html

# Create nginx config for SPA routing
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '    location /health {' >> /etc/nginx/conf.d/default.conf && \
    echo '        access_log off;' >> /etc/nginx/conf.d/default.conf && \
    echo '        return 200 "healthy\n";' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Content-Type text/plain;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]