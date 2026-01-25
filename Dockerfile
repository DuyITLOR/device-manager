FROM node:18-alpine

WORKDIR /app

# Cài pnpm
RUN npm install -g pnpm

# Copy file workspace + lock
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy toàn bộ source
COPY . .

# Cài dependency cho toàn workspace
RUN pnpm install --frozen-lockfile

# Build server + web
RUN pnpm --filter server build
RUN pnpm --filter web build

# Expose FE + BE
EXPOSE 4000 5050

# Chạy cả 2 (dùng concurrently hoặc pm2)
CMD ["pnpm", "start:prod"]

