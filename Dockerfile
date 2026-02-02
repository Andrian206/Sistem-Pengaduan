# Base image
FROM node:20-alpine

# Working directory di dalam container
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua file project
COPY . .

# Build Next.js app
RUN npm run build

# Expose port Next.js
EXPOSE 3000

# Run app
CMD ["npm", "start"]
