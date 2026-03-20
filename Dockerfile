# Build client
FROM node:20-alpine AS builder
WORKDIR /app
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm ci
COPY client/ .
RUN npm run build

# Server
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/client/dist ./public
COPY server/package*.json ./
RUN npm ci --production
COPY server/ .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
