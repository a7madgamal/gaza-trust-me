# Backend Dockerfile for Gazaconfirm Platform
# Note: This should be built from the project root with: docker build -f packages/backend/Dockerfile .

FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy only backend package files
COPY packages/backend/package.json ./packages/backend/

# Install only backend dependencies
WORKDIR /app/packages/backend
RUN npm install --only=production --ignore-scripts && npm cache clean --force

# Build backend
FROM base AS builder
WORKDIR /app

# Copy backend source
COPY packages/backend ./packages/backend/

# Install all dependencies (including dev for build, skip scripts)
WORKDIR /app/packages/backend
RUN npm install --ignore-scripts

# Build backend (skip types:generate for Docker build)
RUN npm run clean && npx tsc

# Production image
FROM base AS runner
WORKDIR /app

# Install Supabase CLI for migrations
RUN apk add --no-cache curl && \
    curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz && \
    mv supabase /usr/local/bin/supabase && \
    chmod +x /usr/local/bin/supabase

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

# Copy built application and dependencies
COPY --from=builder --chown=backend:nodejs /app/packages/backend/dist ./dist/
COPY --from=deps --chown=backend:nodejs /app/packages/backend/node_modules ./node_modules/
COPY --from=builder --chown=backend:nodejs /app/packages/backend/package.json ./

# Copy migration-related files
COPY --from=builder --chown=backend:nodejs /app/packages/backend/scripts ./scripts/
COPY --from=builder --chown=backend:nodejs /app/packages/backend/supabase ./supabase/

# Install tsx for migration script
RUN npm install tsx --no-save

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && \
    chown backend:nodejs /app/logs

# Create startup script that runs migration then starts server
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "🔄 Attempting database migrations..."' >> /app/start.sh && \
    echo 'if npm run db:migrate; then' >> /app/start.sh && \
    echo '  echo "✅ Database migrations completed successfully"' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  echo "❌ WARNING: Database migration failed!"' >> /app/start.sh && \
    echo '  echo "🔧 This is likely due to network connectivity issues (IPv6 on Windows Docker)"' >> /app/start.sh && \
    echo '  echo "💡 Consider running migrations manually from host: npm run db:migrate"' >> /app/start.sh && \
    echo '  echo "🚀 Continuing to start server anyway..."' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'echo "Starting server..."' >> /app/start.sh && \
    echo 'exec node dist/index.js' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown backend:nodejs /app/start.sh

USER backend

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV DOCKER=true

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["/app/start.sh"]