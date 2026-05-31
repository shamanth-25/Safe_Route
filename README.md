# 🛡️ SafePath Hyderabad

### *Find the most illuminated and emergency-accessible route, not just the shortest.*

SafePath Hyderabad is a state-of-the-art, nighttime-optimized routing navigation dashboard. While traditional GPS systems calculate routes based on distance or traffic, SafePath evaluates thousands of local spatial data points — streetlights, police stations, hospitals, 24/7 pharmacies, and metro stations — to guide users along the **safest and most illuminated pathways** across Hyderabad.

Powered by a **FastAPI spatial backend**, a **Vite + React frontend**, and a **Google Gemini 1.5 Flash AI Safety Assistant**, SafePath Hyderabad delivers a premium navigation experience tailored for nighttime security.

---

## 🚀 Core Features

* **💡 Nighttime Safety Index** — Evaluates paths based on illumination density (50%), police proximity (20%), emergency medical access (15%), pharmacy availability (10%), and transit connectivity (5%).
* **🤖 Gemini AI Safety Chatbot** — A floating, glassmorphic AI assistant powered by **Google Gemini 1.5 Flash**. Dynamically reads your currently selected route's real metrics (streetlight counts, police stations, safety rationale) and answers questions with route-specific intelligence. Falls back to a high-performance local expert engine with zero configuration.
* **🎯 Recursive Segment-Peeling Geocoder** — Intelligently handles custom building addresses like `"Flat 403, Sri Sai Nilayam"`. Recursively peels address prefixes and coordinates matching local neighborhoods on the fly.
* **🎲 Deterministic Spatial Building Offsets** — Assigns unique, stable coordinates to different building names in the same neighborhood using a 32-bit deterministic hash, ensuring every private residence gets its own distinct starting coordinate and route options.
* **📍 Interactive Map Pin Adjuster** — Click the crosshair target icon to drag-and-refine coordinates directly on the visual Leaflet pane.
* **🛰️ One-Touch GPS Geolocation** — Single-click button to fetch your browser's high-accuracy GPS coordinates and map your safest route instantly.
* **🚒 Dynamic Infrastructure Visualizer** — Toggle overlays for active streetlights, police shields, and pharmacies directly onto route buffers.
* **⚡ Quick Presets** — One-click preset buttons for popular routes: IT Corridor, Heritage Trail, Transit Hub, and City Core.
* **🚨 Quick Emergency 112** — Instant emergency dial button in the main header.

---

## 📂 Repository Structure

```text
saferoute/
├── backend/                  # FastAPI Python Spatial Server
│   ├── data/                 # GeoJSON safety layers (Streetlights, Police, Hospitals, etc.)
│   ├── main.py               # Routing core, recursive geocoder & Gemini AI chat endpoint
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Backend container definition
├── frontend/                 # Vite + React Web Application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── SafetyChatbot.jsx   # Floating Gemini AI chatbot
│   │   │   ├── MapView.jsx         # Interactive Leaflet map
│   │   │   ├── RouteCard.jsx       # Route option cards
│   │   │   └── SafetyScore.jsx     # Night safety score gauge
│   │   ├── pages/
│   │   │   └── Home.jsx      # Main dashboard page
│   │   └── services/
│   │       └── api.js        # Backend API client with Render URL handling
│   ├── package.json
│   └── Dockerfile            # Frontend container definition
├── .gitlab-ci.yml            # GitLab CI/CD automated pipeline
├── docker-compose.yml        # Full-stack orchestration config
├── render.yaml               # Render cloud deployment blueprint
├── run.sh                    # One-command local launcher script
├── USER_MANUAL.md            # Full step-by-step user manual
├── CONTRIBUTING.md           # Contribution and development guidelines
└── AGENTS.md                 # Engineering deep-dive into geocoding & spatial hashing
```

---

## ⚡ Quick Start

### 🐳 Recommended: Run via Docker (One Command)

SafePath Hyderabad is fully containerized. Launch the entire stack in seconds:

```bash
# Option A: Automated shell wrapper (recommended)
./run.sh --docker

# Option B: Docker Compose directly
docker compose up --build
```

| Service | URL |
|---|---|
| 🖥️ Frontend Dashboard | http://localhost:5173 |
| ⚙️ Backend API Docs | http://localhost:8000/docs |

> [!TIP]
> Press `Ctrl+C` to automatically stop and clean up all Docker containers.

---

### 💻 Alternative: Run Locally (Without Docker)

```bash
# Run both services concurrently
./run.sh
```

Or manually in two terminals:

#### 1️⃣ Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2️⃣ Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```



## ☁️ Cloud Deployment

https://safepath-frontend-1szu.onrender.com
## 🔄 CI/CD Pipeline

A full **GitLab CI/CD pipeline** (`.gitlab-ci.yml`) is included with two automated stages:

| Stage | What it does |
|---|---|
| `test` | Compiles Python backend files + builds React frontend |
| `build` | Validates Docker builds for both backend and frontend |

---

## 📖 Documentation

| Document | Description |
|---|---|
| [User Manual](USER_MANUAL.md) | Step-by-step guide to using every dashboard feature |
| [AGENTS.md](AGENTS.md) | Engineering deep-dive into the geocoding & spatial hashing algorithms |
| [Contributing Guide](CONTRIBUTING.md) | Development setup, coding standards, and PR guidelines |
