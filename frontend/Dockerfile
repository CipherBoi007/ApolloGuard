# Frontend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose Vite port
EXPOSE 5173

# Run Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]