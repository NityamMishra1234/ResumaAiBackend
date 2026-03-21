# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install deps
RUN npm install

COPY . .

#  LIMIT MEMORY (IMPORTANT FIX)
RUN node --max-old-space-size=1024 node_modules/.bin/nest build


# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install only production deps
RUN npm install --omit=dev

# Copy built files
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]