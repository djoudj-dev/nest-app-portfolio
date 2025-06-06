# ----------- STAGE 1: BUILD -----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy dependency definitions
COPY package.json pnpm-lock.yaml ./

# Install full dependencies (dev + prod)
RUN pnpm install

# Copy full project
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build NestJS project
RUN pnpm build

# ----------- STAGE 2: PRODUCTION -----------
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Define environment
ENV NODE_ENV=production

# Create uploads directory
RUN mkdir -p uploads

# Copy dependency definitions and install only production deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Copy build output from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma client (runtime files)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy other runtime dependencies (cleaned, focused)
COPY --from=builder /app/node_modules/@nestjs ./node_modules/@nestjs
COPY --from=builder /app/node_modules/class-transformer ./node_modules/class-transformer
COPY --from=builder /app/node_modules/class-validator ./node_modules/class-validator
COPY --from=builder /app/node_modules/rxjs ./node_modules/rxjs
COPY --from=builder /app/node_modules/reflect-metadata ./node_modules/reflect-metadata
COPY --from=builder /app/node_modules/nodemailer ./node_modules/nodemailer
COPY --from=builder /app/node_modules/bcrypt ./node_modules/bcrypt

# Copy Prisma schema files & mail templates
COPY prisma ./prisma
COPY src/mail/templates ./src/mail/templates

# Add unprivileged user
RUN addgroup -S appuser && adduser -S appuser -G appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 3000

CMD ["node", "dist/src/main"]
