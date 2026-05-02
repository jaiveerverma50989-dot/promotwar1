FROM node:18-alpine

WORKDIR /app

# Copy package info and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose Cloud Run default port
EXPOSE 8080

# Run the Node server
CMD ["node", "server.js"]
