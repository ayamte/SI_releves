FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application
COPY . .

# Build (if needed)
# RUN npm run build

EXPOSE 8080

CMD ["node", "server.js"]
