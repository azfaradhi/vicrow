#!/bin/bash

# Vicrow Development Setup Script
# This script sets up the entire development environment

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║           Vicrow Framework Setup Script               ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} $1 found"
        return 0
    else
        echo -e "  ${RED}✗${NC} $1 not found"
        return 1
    fi
}

MISSING_DEPS=0

check_command "node" || MISSING_DEPS=1
check_command "npm" || MISSING_DEPS=1
check_command "cmake" || MISSING_DEPS=1
check_command "g++" || MISSING_DEPS=1
check_command "curl" || MISSING_DEPS=1
check_command "docker" || echo -e "  ${YELLOW}⚠${NC} docker not found (optional, for PostgreSQL)"

if [ $MISSING_DEPS -eq 1 ]; then
    echo ""
    echo -e "${RED}Missing dependencies. Please install them and try again.${NC}"
    echo ""
    echo "On Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install -y nodejs npm cmake g++ curl libboost-all-dev inotify-tools"
    echo ""
    echo "On macOS (with Homebrew):"
    echo "  brew install node cmake boost fswatch"
    exit 1
fi

echo ""
echo -e "${GREEN}All prerequisites met!${NC}"
echo ""

# Check for file watcher
echo -e "${YELLOW}Checking for file watcher (for backend auto-reload)...${NC}"
if command -v inotifywait &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} inotifywait found"
elif command -v fswatch &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} fswatch found"
elif command -v entr &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} entr found"
else
    echo -e "  ${YELLOW}⚠${NC} No file watcher found. Backend will use polling mode."
    echo -e "      For better performance, install: inotify-tools (Linux) or fswatch (macOS)"
fi
echo ""

# Start PostgreSQL with Docker
echo -e "${YELLOW}Setting up PostgreSQL database...${NC}"
if command -v docker &> /dev/null; then
    if docker compose version &> /dev/null; then
        docker compose up -d postgres
        echo -e "  ${GREEN}✓${NC} PostgreSQL container started"
        echo -e "  Waiting for PostgreSQL to be ready..."
        sleep 5
    else
        echo -e "  ${YELLOW}⚠${NC} docker compose not available"
        echo -e "      Please ensure PostgreSQL is running on localhost:5432"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Docker not found"
    echo -e "      Please ensure PostgreSQL is running on localhost:5432"
    echo -e "      Connection: postgresql://postgres:postgres@localhost:5432/vicrow"
fi
echo ""

# Setup Frontend
echo -e "${YELLOW}Setting up Frontend (Vite + React + TailwindCSS)...${NC}"
cd frontend
npm install
cd ..
echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# Setup Prisma
echo -e "${YELLOW}Setting up Prisma Database Layer...${NC}"
cd prisma
npm install
npx prisma generate
npx prisma db push
npm run seed
cd ..
echo -e "${GREEN}✓ Prisma setup complete${NC}"
echo ""

# Setup Backend
echo -e "${YELLOW}Setting up Backend (Crow C++)...${NC}"
cd backend
mkdir -p build
cd build
cmake ..
make -j$(nproc)
cd ../..
echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Install root dependencies
echo -e "${YELLOW}Installing root dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Root dependencies installed${NC}"
echo ""

echo "╔═══════════════════════════════════════════════════════╗"
echo "║             Setup Complete! 🎉                        ║"
echo "╠═══════════════════════════════════════════════════════╣"
echo "║  To start development:                                ║"
echo "║                                                       ║"
echo "║  Option 1 - All at once:                              ║"
echo "║    npm run dev                                        ║"
echo "║                                                       ║"
echo "║  Option 2 - Separately:                               ║"
echo "║    Terminal 1: npm run dev:prisma                     ║"
echo "║    Terminal 2: npm run dev:backend                    ║"
echo "║    Terminal 3: npm run dev:frontend                   ║"
echo "║                                                       ║"
echo "║  URLs:                                                ║"
echo "║    Frontend:  http://localhost:3000                   ║"
echo "║    Backend:   http://localhost:8080                   ║"
echo "║    Prisma:    http://localhost:3001                   ║"
echo "║    Database:  postgresql://localhost:5432/vicrow      ║"
echo "║    Adminer:   http://localhost:8081 (DB Web UI)       ║"
echo "║                                                       ║"
echo "║  Backend auto-reload is enabled!                      ║"
echo "║  Edit C++ files and they will rebuild automatically.  ║"
echo "╚═══════════════════════════════════════════════════════╝"
