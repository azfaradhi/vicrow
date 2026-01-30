#!/bin/bash

# Vicrow Development Runner
# Starts all services in the correct order

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# PID tracking
PIDS=()

cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
        fi
    done
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "╔═══════════════════════════════════════════════════════╗"
echo "║           Starting Vicrow Development                 ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Start Prisma Service
echo -e "${YELLOW}Starting Prisma Service (port 3001)...${NC}"
cd "$PROJECT_ROOT/prisma"
npm run serve &
PIDS+=($!)
sleep 2
echo -e "${GREEN}✓ Prisma Service started${NC}"

# Start Crow Backend
echo -e "${YELLOW}Starting Crow Backend (port 8080)...${NC}"
cd "$PROJECT_ROOT/backend/build"
if [ -f "./vicrow_backend" ]; then
    ./vicrow_backend &
    PIDS+=($!)
    sleep 1
    echo -e "${GREEN}✓ Crow Backend started${NC}"
else
    echo -e "${RED}Backend not built. Run: npm run build:backend${NC}"
fi

# Start Vite Frontend
echo -e "${YELLOW}Starting Vite Frontend (port 3000)...${NC}"
cd "$PROJECT_ROOT/frontend"
npm run dev &
PIDS+=($!)
echo -e "${GREEN}✓ Vite Frontend started${NC}"

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║             All Services Running! 🚀                  ║"
echo "╠═══════════════════════════════════════════════════════╣"
echo "║  Frontend: http://localhost:3000                      ║"
echo "║  Backend:  http://localhost:8080                      ║"
echo "║  Prisma:   http://localhost:3001                      ║"
echo "╠═══════════════════════════════════════════════════════╣"
echo "║  Press Ctrl+C to stop all services                    ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Wait for all processes
wait
