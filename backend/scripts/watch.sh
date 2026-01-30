#!/bin/bash

# Vicrow Backend Watch Script
# Auto-rebuilds and restarts the backend when source files change

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$BACKEND_DIR/build"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# PID of running backend
BACKEND_PID=""

cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping backend...${NC}"
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

build_backend() {
    echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} ${YELLOW}Building backend...${NC}"
    cd "$BUILD_DIR"
    if make -j$(nproc) 2>&1; then
        echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} ${GREEN}✓ Build successful${NC}"
        return 0
    else
        echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} ${RED}✗ Build failed${NC}"
        return 1
    fi
}

start_backend() {
    if [ -f "$BUILD_DIR/vicrow_backend" ]; then
        echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} ${GREEN}Starting backend...${NC}"
        cd "$BUILD_DIR"
        ./vicrow_backend &
        BACKEND_PID=$!
        echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} ${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    fi
}

stop_backend() {
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} ${YELLOW}Stopping backend (PID: $BACKEND_PID)...${NC}"
        kill "$BACKEND_PID" 2>/dev/null
        wait "$BACKEND_PID" 2>/dev/null || true
        BACKEND_PID=""
    fi
}

restart_backend() {
    stop_backend
    if build_backend; then
        start_backend
    fi
}

# Check for required tools
check_watch_tool() {
    if command -v inotifywait &> /dev/null; then
        echo "inotifywait"
    elif command -v fswatch &> /dev/null; then
        echo "fswatch"
    elif command -v entr &> /dev/null; then
        echo "entr"
    else
        echo "none"
    fi
}

WATCH_TOOL=$(check_watch_tool)

echo "╔═══════════════════════════════════════════════════════╗"
echo "║         Vicrow Backend Watch Mode                     ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Ensure build directory exists and has been configured
if [ ! -f "$BUILD_DIR/Makefile" ]; then
    echo -e "${YELLOW}Configuring CMake...${NC}"
    mkdir -p "$BUILD_DIR"
    cd "$BUILD_DIR"
    cmake ..
fi

# Initial build and start
restart_backend

echo ""
echo -e "${GREEN}Watching for changes in:${NC}"
echo -e "  - $BACKEND_DIR/src/"
echo -e "  - $BACKEND_DIR/include/"
echo ""

if [ "$WATCH_TOOL" = "inotifywait" ]; then
    echo -e "${CYAN}Using inotifywait for file watching${NC}"
    echo ""
    
    while true; do
        inotifywait -r -e modify,create,delete \
            "$BACKEND_DIR/src" \
            "$BACKEND_DIR/include" \
            --exclude '\.swp$|~$|\.o$' \
            2>/dev/null
        
        echo ""
        echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} ${YELLOW}Change detected, rebuilding...${NC}"
        sleep 0.5  # Debounce
        restart_backend
    done

elif [ "$WATCH_TOOL" = "fswatch" ]; then
    echo -e "${CYAN}Using fswatch for file watching${NC}"
    echo ""
    
    fswatch -o "$BACKEND_DIR/src" "$BACKEND_DIR/include" \
        --exclude '\.swp$' --exclude '~$' --exclude '\.o$' | while read -r; do
        echo ""
        echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} ${YELLOW}Change detected, rebuilding...${NC}"
        restart_backend
    done

elif [ "$WATCH_TOOL" = "entr" ]; then
    echo -e "${CYAN}Using entr for file watching${NC}"
    echo ""
    
    while true; do
        find "$BACKEND_DIR/src" "$BACKEND_DIR/include" \
            -name "*.cpp" -o -name "*.hpp" -o -name "*.h" | \
            entr -d -p sh -c "echo '' && echo -e '${CYAN}[$(date +%H:%M:%S)]${NC} ${YELLOW}Change detected, rebuilding...${NC}'" 2>/dev/null
        
        restart_backend
    done

else
    echo -e "${YELLOW}No file watcher found. Using polling mode (less efficient).${NC}"
    echo -e "${YELLOW}For better performance, install one of: inotify-tools, fswatch, or entr${NC}"
    echo ""
    echo -e "  Ubuntu/Debian: sudo apt install inotify-tools"
    echo -e "  macOS:         brew install fswatch"
    echo -e "  Arch:          sudo pacman -S inotify-tools"
    echo ""
    
    # Fallback: polling mode
    LAST_HASH=""
    while true; do
        CURRENT_HASH=$(find "$BACKEND_DIR/src" "$BACKEND_DIR/include" \
            -name "*.cpp" -o -name "*.hpp" -o -name "*.h" 2>/dev/null | \
            xargs stat -c '%Y' 2>/dev/null | md5sum)
        
        if [ "$CURRENT_HASH" != "$LAST_HASH" ] && [ -n "$LAST_HASH" ]; then
            echo ""
            echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} ${YELLOW}Change detected, rebuilding...${NC}"
            restart_backend
        fi
        
        LAST_HASH="$CURRENT_HASH"
        sleep 2
    done
fi
