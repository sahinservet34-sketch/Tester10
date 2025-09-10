# Railway Optimized Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for build)
RUN npm ci

# Copy source code  
COPY . .

# Build the application using explicit commands
RUN npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Remove dev dependencies for smaller image
RUN npm ci --only=production && npm cache clean --force

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start command
CMD ["npm", "run", "start"]