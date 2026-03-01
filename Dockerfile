# Stage 1: Build Environment

FROM node:20-alpine AS builder
WORKDIR /app

# Creating a dummy package to utilize layer caching as mentioned in the report
RUN echo '{}' > package.json
RUN npm install
COPY . .

# Stage 2: Production Environment

FROM node:20-alpine
WORKDIR /app

# Copy files from the builder stage 
COPY --from=builder /app ./

# Install a lightweight static server to run the HTML/JS files
RUN npm install -g http-server

# Change ownership to the non-root user for security
RUN chown -R node:node /app

# Switch to the limited non-root user
USER node

# Expose the correct port
EXPOSE 8080

# Run the application
CMD ["http-server", ".", "-p", "8080"]