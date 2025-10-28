# 📦 Device Manager System

Hệ thống quản lý thiết bị bao gồm:

- ✅ **Frontend**: Next.js + TypeScript (thư mục `/web`)
- ✅ **Backend**: NestJS + TypeScript (thư mục `/server`)

---

## ✅ 1. Yêu cầu trước khi chạy

| Công cụ         | Phiên bản khuyến nghị |
| --------------- | --------------------- |
| Node.js         | >= 18.x               |
| pnpm (hoặc npm) | pnpm khuyến khích     |
| Git             | Dùng để clone source  |

**Kiểm tra nhanh:**

```bash
node -v
pnpm -v      # hoặc npm -v
```

---

## ✅ 2. Clone project

```bash
git clone https://github.com/<username>/device-manager.git
cd device-manager
pnpm install
```

---

## ✅ 3. Chạy Frontend (Next.js)

```bash
pnpm dev:web
```

Truy cập: **http://localhost:3000**

---

## ✅ 4. Chạy Backend (NestJS)

```bash
pnpm dev:server
```

Truy cập API: **http://localhost:3000**

---

## ✅ 5. Chạy cả 2

```bash
pnpm dev:all
```

---

## ✅ 6. Cấu trúc thư mục

```
device-manager/
├── web/                # Frontend - Next.js
│   ├── app/
│   ├── .next/          # Build output (ignore Git)
│   ├── package.json
│   └── tsconfig.json
│
├── server/             # Backend - NestJS
│   ├── src/
│   ├── dist/           # Build output (ignore Git)
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

---

## ✅ 7. Không commit các file/thư mục sau:

```
node_modules/
web/.next/
server/dist/
.env
.env.local
*.log
```

---

## ✅ 8. Roadmap

| Tính năng                                   | Trạng thái |
| ------------------------------------------- | ---------- |
| ✅ Setup Frontend & Backend                 | Done       |
| ⬜ Kết nối Database (MongoDB or PostgreSQL) |
| ⬜ API: Users / Products / Borrow           |
| ⬜ Auth (JWT)                               |
| ⬜ UI Dashboard quản lý thiết bị            |
| ⬜ Activity Log (lịch sử mượn / trả)        |

---

## ✅ 9. Cách chạy nhanh cho người khác clone

```bash
pnpm install
pnpm dev:all
```

---
