#!/bin/bash

# ==========================================
# 🛡️ SafePath Hyderabad - Automated Runner
# ==========================================
# This script starts both the FastAPI backend and Vite React frontend concurrently.
# Simply hit Ctrl+C to terminate both servers cleanly.

# Colors for terminal outputs
GREEN='\033[0;32m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}🛡️  Initializing SafePath Hyderabad Navigation Dashboard...${NC}"

# Handle graceful shutdown of both background servers on Ctrl+C
cleanup() {
    echo -e "\n${PURPLE}🛑 Shutting down backend and frontend services...${NC}"
    kill "$BACKEND_PID" 2>/dev/null
    kill "$FRONTEND_PID" 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Boot up the Backend FastAPI Service
echo -e "${CYAN}🚀 [1/2] Launching Backend FastAPI (Port 8000)...${NC}"
cd "$(dirname "$0")/backend" || exit

# Activate virtual environment if present
if [ -d "venv" ]; then
    source venv/bin/activate
fi

python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# 2. Boot up the Frontend Vite React Service
echo -e "${CYAN}⚡ [2/2] Launching Frontend React App (Port 5173)...${NC}"
cd "../frontend" || exit

npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}✨ Both services are running! Opening dashboard at: http://localhost:5173${NC}"
echo -e "${PURPLE}👉 Press Ctrl+C in this terminal window to stop both services cleanly.${NC}"

# Keep script alive and waiting for servers
wait
