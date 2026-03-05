# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable

# Copy workspace manifests (separate layer → better cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/

# Install all dependencies for web package
RUN pnpm install --filter web --frozen-lockfile

# Copy source code
COPY web/ ./web/

# NEXT_PUBLIC_* variables are embedded into the bundle at build time.
# Pass the real server URL here (must be accessible from the user's browser).
# Example: docker build --build-arg NEXT_PUBLIC_API_URL=http://192.168.0.174:5050
ARG NEXT_PUBLIC_API_URL=http://localhost:5050
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js (uses --webpack to stay compatible with next-pwa config)
RUN pnpm --filter web build


# ─── Stage 2: Runner ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/

# Install production dependencies only (next is in dependencies, not devDependencies)
RUN pnpm install --filter web --prod --frozen-lockfile

# Copy build output and static assets
COPY --from=builder /app/web/.next ./web/.next
COPY --from=builder /app/web/public ./web/public

# Copy Next.js config (needed by next start)
COPY web/next.config.js ./web/next.config.js

WORKDIR /app/web

EXPOSE 4000

CMD ["pnpm", "start:prod"]
