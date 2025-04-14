FROM node:18-alpine

# Add build dependencies for bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production && \
    # Remove build dependencies to keep image size small
    apk del python3 make g++

# Copy only necessary files
COPY js/ ./js/
COPY html/ ./html/
COPY css/ ./css/
COPY models/ ./models/

# Set production environment
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]