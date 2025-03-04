# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY .env.example ./.env

# Install wget for healthcheck
RUN apk add --no-cache wget

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/health || exit 1

# Expose port
EXPOSE ${PORT:-3000}

# Start application
CMD ["node", "dist/index.js"] 