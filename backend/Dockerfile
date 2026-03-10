# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy backend code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Change ownership
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Expose backend API
EXPOSE 5000

# Start server
CMD ["npm", "start"]