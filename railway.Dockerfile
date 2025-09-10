# Railway Optimized Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for build)
RUN npm install

# Copy source code  
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies for smaller image
RUN npm prune --production

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start command
CMD ["npm", "run", "start"]