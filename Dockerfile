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

# 6. Generate Prisma Client (với DATABASE_URL mock cho build time)
RUN cd server && DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# 7. Build backend + frontend
RUN pnpm --filter server build
RUN ls -la server/dist || echo "Server dist folder not found"
RUN pnpm --filter web build

# 8. Expose port
EXPOSE 4000 5050

# 9. Chạy PROD (FE + BE)
CMD sh -c "pnpm --filter server start:prod & pnpm --filter web start:prod"