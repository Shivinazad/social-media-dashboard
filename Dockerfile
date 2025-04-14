FROM node:18-alpine

# Add build dependencies for bcrypt


WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production 


COPY . .



# Set production environment
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]