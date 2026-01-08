#!/bin/bash

# Sign Language Translator - Complete System Startup Script
# This script starts all three services in the correct order

set -e

echo "╔═══════════════════════════════════════════╗"
echo "║  🤟 Sign Language Translator Startup     ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}Starting services...${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}Warning: Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Check if required commands exist
command -v pnpm >/dev/null 2>&1 || { echo "Error: pnpm is not installed. Install with: npm install -g pnpm"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Error: python3 is not installed"; exit 1; }

# 1. Start ML Server
echo -e "${GREEN}[1/3] Starting ML Server (Python)...${NC}"
cd "$SCRIPT_DIR/ML"

if [ -f "model.pt" ]; then
    # Check if running with uv or regular python
    if command -v uv >/dev/null 2>&1; then
        echo "Using uv to run ML server..."
        uv run python app.py &
    else
        echo "Using python to run ML server..."
        python3 app.py &
    fi
    ML_PID=$!
    echo "ML Server started (PID: $ML_PID)"
else
    echo -e "${YELLOW}Warning: model.pt not found. ML server may not work correctly.${NC}"
    echo "Run 'python train.py' in the ML/ directory first."
fi

# Wait for ML server to initialize
echo "Waiting for ML server to initialize..."
sleep 3

# 2. Start Backend
echo ""
echo -e "${GREEN}[2/3] Starting Backend (Node.js)...${NC}"
cd "$SCRIPT_DIR/backend"

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    pnpm install
fi

pnpm dev &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Wait for backend to initialize
echo "Waiting for backend to initialize..."
sleep 2

# 3. Start Frontend
echo ""
echo -e "${GREEN}[3/3] Starting Frontend (React)...${NC}"
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    pnpm install
fi

pnpm dev &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

# Wait for frontend to initialize
sleep 3

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║  ✅ All Services Started Successfully!    ║"
echo "╚═══════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Services running:${NC}"
echo "  🤖 ML Server:   http://localhost:8000"
echo "  🔌 Backend:     http://localhost:3000"
echo "  🌐 Frontend:    http://localhost:5173"
echo ""
echo -e "${BLUE}Open your browser to:${NC} ${GREEN}http://localhost:5173${NC}"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Trap Ctrl+C and kill all processes
trap "echo ''; echo 'Shutting down...'; kill $ML_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Wait for all processes
wait
