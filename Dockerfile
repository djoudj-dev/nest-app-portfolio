# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm prisma generate
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Copie du build et des assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/mail/templates ./src/mail/templates

# Copie TOTALE des node_modules post install (inclut .prisma)
COPY --from=builder /app/node_modules ./node_modules

# Sécurité
RUN addgroup -S appuser && adduser -S appuser -G appuser && \
  chown -R appuser:appuser /app
USER appuser

EXPOSE 3000

CMD ["node", "dist/src/main"]
