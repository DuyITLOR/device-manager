# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Build tools required for native modules (bcrypt)
RUN apk add --no-cache python3 make g++
RUN corepack enable

# Copy workspace manifests (separate layer → better cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/

# Install all dependencies for server package
RUN pnpm install --filter server --frozen-lockfile

# Copy server source code
COPY server/ ./server/

# Generate Prisma client for linux-musl (Alpine)
# DATABASE_URL is required by prisma.config.ts at load time but not used during generate
RUN DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy" \
    DIRECT_URL="postgresql://dummy:dummy@dummy:5432/dummy" \
    pnpm --filter server exec prisma generate

# Compile NestJS → dist/
RUN pnpm --filter server build


# ─── Stage 2: Runner ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml ./
COPY server/package.json ./server/

# Copy pre-built node_modules from builder
# (native binaries already compiled for Alpine, Prisma client already generated)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules

# Copy compiled application
COPY --from=builder /app/server/dist ./server/dist

WORKDIR /app/server

EXPOSE 5050

CMD ["node", "dist/main.js"]
