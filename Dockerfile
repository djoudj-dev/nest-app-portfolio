# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev)
RUN pnpm install

# Copy rest of the project
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the app
RUN pnpm build

# Stage 2: Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Set env
ENV NODE_ENV=production

# Create uploads directory
RUN mkdir -p uploads

# Copy only what's needed
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/@nestjs ./node_modules/@nestjs
COPY --from=builder /app/node_modules/@types ./node_modules/@types
COPY --from=builder /app/node_modules/class-transformer ./node_modules/class-transformer
COPY --from=builder /app/node_modules/class-validator ./node_modules/class-validator
COPY --from=builder /app/node_modules/rxjs ./node_modules/rxjs
COPY --from=builder /app/node_modules/reflect-metadata ./node_modules/reflect-metadata
COPY --from=builder /app/node_modules/nodemailer ./node_modules/nodemailer
COPY --from=builder /app/node_modules/bcrypt ./node_modules/bcrypt
COPY prisma ./prisma
COPY src/mail/templates/ ./src/mail/templates/

# Create user
RUN addgroup -S appuser && adduser -S appuser -G appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 3000

CMD ["node", "dist/main"]
