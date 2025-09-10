# Use Node.js 20 LTS
FROM node:20-alpine

# Cache bust to force Railway rebuild
ARG CACHE_BUST=2025-09-10-v2
RUN echo "Cache bust: $CACHE_BUST"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Set VITE_ROOT to fix entry point resolution
ENV VITE_ROOT=client

# Build application (NO npm run build!)
RUN npx vite build --mode production
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Remove dev dependencies 
RUN npm ci --omit=dev && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Set permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 8080
ENV PORT=8080

# Start command
CMD ["node", "dist/index.js"]