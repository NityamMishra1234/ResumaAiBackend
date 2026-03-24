# ---------- BASE ----------
FROM node:20-slim AS base
WORKDIR /app

# Prevent puppeteer download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

# ---------- BUILD ----------
FROM base AS builder

COPY package*.json ./

# Install ALL deps (for build)
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build


# ---------- PRODUCTION ----------
FROM base

# Install only minimal chromium (lighter)
RUN apt-get update && apt-get install -y \
  chromium \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./

# Install ONLY production deps (smaller)
RUN npm install --omit=dev --legacy-peer-deps

# Copy built app only (no source, no dev files)
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]