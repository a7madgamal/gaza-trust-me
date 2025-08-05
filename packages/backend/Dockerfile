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

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

# Copy built application
COPY --from=builder --chown=backend:nodejs /app/packages/backend/dist ./dist/
COPY --from=deps --chown=backend:nodejs /app/packages/backend/node_modules ./node_modules/
COPY --from=builder --chown=backend:nodejs /app/packages/backend/package.json ./

USER backend

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/index.js"]