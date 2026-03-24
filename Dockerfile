# ---------- BASE ----------
FROM node:20-slim AS base
WORKDIR /app

# Only puppeteer config here
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# ---------- BUILD ----------
FROM base AS builder

#  allow dev deps here
ENV NODE_ENV=development

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build


# ---------- PRODUCTION ----------
FROM base

#  production mode ONLY here
ENV NODE_ENV=production

# Install minimal chromium
RUN apt-get update && apt-get install -y \
  chromium \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./

# Only production deps
RUN npm install --omit=dev --legacy-peer-deps

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]