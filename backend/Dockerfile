# ═══════════════════════════════════════════════════════════════════
# SMART FARM BACKEND — Production Dockerfile
# ═══════════════════════════════════════════════════════════════════
#
# Multi-stage build: 1-bosqichda hammasi (dev dependencies bilan)
# qurib olinadi, 2-bosqichda esa FAQAT kerakli narsalar yakuniy
# image'ga ko'chiriladi. Bu — yakuniy image hajmini sezilarli
# kichraytiradi (odatda 1GB+ o'rniga ~200-300MB) va xavfsizlikni
# oshiradi (build vositalari production'da bo'lmaydi).

# ── 1-BOSQICH: BUILD ─────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Avval FAQAT package.json fayllarini nusxalaymiz — Docker layer
# keshlash uchun (agar kod o'zgarsa-yu, dependencies o'zgarmasa,
# "npm install" qayta ishga tushmaydi, qurish tezlashadi)
COPY package*.json ./
RUN npm ci

# Endi qolgan kodni nusxalaymiz va build qilamiz
COPY . .
RUN npm run build

# ── 2-BOSQICH: PRODUCTION ────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Xavfsizlik: root emas, alohida foydalanuvchi bilan ishga tushirish
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Faqat build natijasini (dist/) 1-bosqichdan ko'chiramiz —
# TypeScript manba kodi, testlar, dev-dependencies YO'Q
COPY --from=builder /app/dist ./dist

USER nestjs

EXPOSE 3000

# Konteyner ichidan health-check — Docker'ning o'ziga "server tirikmi"
# deb tekshirish imkonini beradi (agar health endpoint 200 qaytarmasa,
# Docker konteynerni "unhealthy" deb belgilaydi)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/main"]