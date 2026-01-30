#!/bin/bash

# Vicrow Build Script
# Builds all components for production

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "╔═══════════════════════════════════════════════════════╗"
echo "║           Building Vicrow for Production              ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Build Frontend
echo -e "${YELLOW}Building Frontend...${NC}"
cd "$PROJECT_ROOT/frontend"
npm run build
echo -e "${GREEN}✓ Frontend built to frontend/dist/${NC}"
echo ""

# Build Backend
echo -e "${YELLOW}Building Backend...${NC}"
cd "$PROJECT_ROOT/backend"
mkdir -p build
cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
make -j$(nproc)
echo -e "${GREEN}✓ Backend built to backend/build/vicrow_backend${NC}"
echo ""

echo "╔═══════════════════════════════════════════════════════╗"
echo "║             Build Complete! 🎉                        ║"
echo "╠═══════════════════════════════════════════════════════╣"
echo "║  Frontend: frontend/dist/                             ║"
echo "║  Backend:  backend/build/vicrow_backend               ║"
echo "╚═══════════════════════════════════════════════════════╝"
