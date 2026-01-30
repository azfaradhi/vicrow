# Vicrow Framework

<div align="center">

```
 __      ___                        
 \ \    / (_)                       
  \ \  / / _  ___ _ __ _____      __
   \ \/ / | |/ __| '__/ _ \ \ /\ / /
    \  /  | | (__| | | (_) \ V  V / 
     \/   |_|\___|_|  \___/ \_/\_/  
```

**A Modern Full-Stack Framework**

*Vite + React Frontend | Crow C++ Backend | Prisma + PostgreSQL Database*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![C++17](https://img.shields.io/badge/C++-17-blue.svg)](https://isocpp.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748.svg)](https://www.prisma.io/)

**Created by [@azfaradhi](https://github.com/azfaradhi)**

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [API Reference](#-api-reference)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🎯 Overview

**Vicrow** is a full-stack framework that combines modern technologies for web development:

| Component | Technology | Port | Purpose |
|-----------|------------|------|---------|
| **Frontend** | Vite + React + TailwindCSS | 3000 | Modern, reactive UI |
| **Backend** | Crow C++ | 8080 | High-performance REST API |
| **Database Layer** | Prisma (Node.js) | 3001 | Type-safe database access |
| **Database** | PostgreSQL | 5432 | Primary data storage |
| **DB Admin** | Adminer | 8081 | Web-based database management |

### Why Vicrow?

- ⚡ **Blazing Fast**: Vite HMR + C++ performance from Crow
- 🔄 **Auto-Reload**: Backend automatically rebuilds on file changes
- 🔒 **Type-Safe**: TypeScript on frontend + Prisma type generation
- 🎨 **Beautiful UI**: TailwindCSS with custom design system
- 🐘 **PostgreSQL**: Production-ready database
- 🔗 **Seamless Integration**: Frontend ↔ Backend ↔ Database
- 📦 **Production Ready**: Optimized builds for deployment

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│              Vite + React + TailwindCSS                      │
│                   localhost:3000                             │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP (Proxy /api)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Crow C++ Backend                        │
│                 REST API + CORS Middleware                   │
│                   localhost:8080                             │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP (Internal)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Prisma Service                            │
│              Database Access Layer (Node.js)                 │
│                   localhost:3001                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL                               │
│              Primary Database Server                         │
│                   localhost:5432                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action** → React Component
2. **API Call** → Axios → Vite Proxy
3. **Request** → Crow C++ Backend
4. **Database Query** → Prisma Service → PostgreSQL
5. **Response** → JSON → Frontend → UI Update

---

## 📋 Prerequisites

Make sure you have the following installed:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | ≥ 18.x | `node --version` |
| npm | ≥ 9.x | `npm --version` |
| CMake | ≥ 3.14 | `cmake --version` |
| G++ | ≥ 9 (C++17) | `g++ --version` |
| Docker | ≥ 20.x | `docker --version` |
| curl | Any | `curl --version` |
| inotify-tools | Any | `inotifywait --help` |

### Installing Prerequisites

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y nodejs npm cmake g++ curl libboost-all-dev inotify-tools docker.io docker-compose-plugin
sudo usermod -aG docker $USER  # Add user to docker group
# Logout and login again for docker group to take effect
```

**Arch Linux:**
```bash
sudo pacman -S nodejs npm cmake gcc boost curl inotify-tools docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

**macOS (Homebrew):**
```bash
brew install node cmake boost fswatch
# Install Docker Desktop from https://docker.com
```

---

## 🚀 Installation

### Quick Setup (Recommended)

```bash
# Clone repository
git clone https://github.com/azfaradhi/vicrow.git
cd vicrow

# Start PostgreSQL with Docker
docker compose up -d postgres

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Setup

```bash
# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Install dependencies
npm install                          # Root dependencies
cd frontend && npm install && cd ..  # Frontend
cd prisma && npm install && cd ..    # Prisma

# 3. Setup database
cd prisma
npx prisma generate
npx prisma db push
npm run seed
cd ..

# 4. Build backend
cd backend
mkdir -p build && cd build
cmake ..
make -j$(nproc)
cd ../..
```

---

## 🎮 Quick Start

### Start Development Server

```bash
# Start all services at once (recommended)
npm run dev
```

Or start separately in different terminals:

```bash
# Terminal 1: Prisma Service
npm run dev:prisma

# Terminal 2: Crow Backend  
npm run dev:backend

# Terminal 3: Vite Frontend
npm run dev:frontend
```

### Access Application

| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:3000 |
| 🔌 Backend API | http://localhost:8080/api |
| 📊 Prisma Service | http://localhost:3001 |
| 🗄️ PostgreSQL | localhost:5432 |
| 🔧 Adminer (DB UI) | http://localhost:8081 |
| 📋 Prisma Studio | `npm run prisma:studio` |

---

## 📁 Project Structure

```
vicrow/
├── frontend/                 # Vite + React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   └── Layout.tsx    # Main layout with navigation
│   │   ├── pages/            # Page components
│   │   │   ├── Home.tsx      # Dashboard/landing page
│   │   │   ├── Users.tsx     # User management CRUD
│   │   │   └── About.tsx     # About page
│   │   ├── services/
│   │   │   └── api.ts        # Axios API client
│   │   ├── App.tsx           # Root component with routing
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # TailwindCSS styles
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.js    # Tailwind configuration
│   └── package.json
│
├── backend/                  # Crow C++ Backend
│   ├── include/
│   │   ├── models/
│   │   │   └── user.hpp      # User model & DTOs
│   │   ├── services/
│   │   │   └── prisma_client.hpp  # Prisma client interface
│   │   └── middleware/
│   │       └── cors.hpp      # CORS middleware
│   ├── src/
│   │   ├── main.cpp          # Application entry point
│   │   └── services/
│   │       └── prisma_client.cpp  # Prisma client implementation
│   └── CMakeLists.txt        # CMake build configuration
│
├── prisma/                   # Prisma Database Layer
│   ├── schema.prisma         # Database schema
│   ├── server.ts             # Express server for DB access
│   ├── seed.ts               # Database seed data
│   └── .env                  # Database configuration
│
├── scripts/                  # Utility scripts
│   ├── setup.sh              # Initial setup script
│   ├── dev.sh                # Development runner
│   └── build.sh              # Production build
│
├── docker-compose.yml        # PostgreSQL & Adminer
├── package.json              # Root package.json
└── README.md                 # This file
```

---

## 💻 Development

### NPM Scripts

```bash
# Development
npm run dev              # Start all services
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend with auto-reload
npm run dev:prisma       # Prisma service only

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed database

# Build
npm run build            # Production build
```

### Backend Auto-Reload

Backend uses file watchers to detect changes:
- **Linux**: `inotifywait` 
- **macOS**: `fswatch`

When you save a `.cpp` or `.hpp` file, the backend will:
1. Stop the running server
2. Rebuild the project
3. Restart the server

### Database Schema

Edit `prisma/schema.prisma` to modify the schema:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

After editing:
```bash
cd prisma
npx prisma db push      # Push changes to database
npx prisma generate     # Regenerate client
```

---

## 📡 API Reference

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Vicrow Backend is running",
  "timestamp": "1706640000",
  "database": "connected"
}
```

### Users CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

**Create User:**
```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "createdAt": "2026-01-30T00:00:00.000Z",
  "updatedAt": "2026-01-30T00:00:00.000Z"
}
```

---

## 🔧 Configuration

### Frontend (vite.config.ts)

```typescript
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

### Database (prisma/.env)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vicrow?schema=public"
```

### PostgreSQL Connection

| Property | Value |
|----------|-------|
| Host | localhost |
| Port | 5432 |
| Database | vicrow |
| Username | postgres |
| Password | postgres |

---

## 🔍 Troubleshooting

### Backend won't compile

```bash
# Clean and rebuild
cd backend
rm -rf build
mkdir build && cd build
cmake .. && make -j$(nproc)
```

### Database disconnected

```bash
# Check if PostgreSQL is running
docker compose ps

# Start PostgreSQL
docker compose up -d postgres

# Check Prisma service
curl http://localhost:3001/health

# Restart Prisma
npm run dev:prisma
```

### Port already in use

```bash
# Find process using the port
lsof -i :3000  # or :8080, :3001

# Kill process
kill -9 <PID>
```

### Reset Database

```bash
docker compose down -v
docker compose up -d postgres
cd prisma
npx prisma db push
npm run seed
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request


<div align="center">


**Created by [@azfaradhi](https://github.com/azfaradhi)**

</div>
