# Stage 1: Build the Next.js app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Set build-time arguments, if any
# ENV NEXT_PUBLIC_API_BASE_URL=http://backend:3001/api

# Build the Next.js app for production
RUN npm run build


# Stage 2: Production image
# Use the official Node.js image.
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Copy the standalone output from the builder stage.
COPY --from=builder /app/.next/standalone ./

# Copy the public and static folders.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# Run the Next.js app.
CMD ["node", "server.js"]
