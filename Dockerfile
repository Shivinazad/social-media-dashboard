FROM node:18-alpine

WORKDIR /app

# First install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Set production environment
ENV NODE_ENV=production

# Only expose one port since we're using combined server
EXPOSE 3000

CMD ["npm", "start"]