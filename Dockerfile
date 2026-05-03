FROM node:18-alpine

WORKDIR /app

# Install production dependencies only (faster and reproducible)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the application
COPY . .

# Expose Cloud Run default port
EXPOSE 8080

# Run the Node server in production mode
ENV NODE_ENV=production
CMD ["node", "server.js"]
