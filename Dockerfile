FROM node:20-alpine

# 1. Thư mục làm việc
WORKDIR /app

# 2. Cài pnpm
RUN npm install -g pnpm

# 3. Copy các file workspace & lock
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# 4. Copy toàn bộ source
COPY server ./server
COPY web ./web

# 5. Cài dependency cho toàn monorepo
RUN pnpm install --frozen-lockfile

# 6.generate Prisma Client
RUN pnpm --filter server exec prisma generate

# 7. Build backend + frontend
RUN pnpm --filter server build
RUN pnpm --filter web build

# 8. Expose port
EXPOSE 4000 5050

# 9. Chạy PROD (FE + BE)
CMD ["pnpm", "start:prod"]
