# 🤝 Contributing to SafePath Hyderabad

Thank you for your interest in contributing! This guide covers environment setup, coding standards, and the CI/CD pipeline so your contributions integrate smoothly.

---

## 🛠️ Local Development Setup

### 🐳 Option A: Docker (Recommended)

The fastest way to get a fully working environment:

```bash
./run.sh --docker
```

This builds and starts both the backend (port `8000`) and frontend (port `5173`) containers with live hot-reloading enabled.

---

### 💻 Option B: Manual Setup

#### Backend (FastAPI + Python 3.11)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `backend/.env` file with your API keys:

```env
ORS_API_KEY=your_openrouteservice_key_here
GEMINI_API_KEY=your_gemini_api_key_here   # Optional — falls back to local engine if missing
```

Start the server:
```bash
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend (React + Vite + Node 20)

```bash
cd frontend
npm install
npm run dev
```

---

## 🏗️ Project Architecture

```
Backend (FastAPI)  ←──────────────────────────────────────────────────────►  Frontend (React)
┌──────────────────────────────────┐           ┌──────────────────────────────────────┐
│ GET  /api/geocode?q=<text>       │           │ SearchBar.jsx — address autocomplete │
│ POST /api/routes                 │           │ MapView.jsx   — Leaflet map & layers  │
│ POST /api/chat                   │           │ SafetyChatbot.jsx — floating AI chat  │
│ GET  /api/health                 │           │ SafetyScore.jsx   — score gauge      │
│                                  │           │ RouteCard.jsx     — route cards       │
│ GIS Layers (GeoJSON):            │           │                                      │
│  - streetlights.geojson          │           │ api.js — axios client with Render    │
│  - police.geojson                │           │          URL auto-expansion           │
│  - hospitals.geojson             │           └──────────────────────────────────────┘
│  - pharmacies.geojson            │
│  - metro.geojson                 │
└──────────────────────────────────┘
```

---

## 📐 Coding Standards

### Backend (Python)
* **Type annotations** — Always annotate function arguments and return types.
  ```python
  async def geocode_search(q: str) -> List[Dict]:
  ```
* **Pydantic schemas** — All API request bodies must be modelled using Pydantic `BaseModel`.
* **Spatial projections** — Use `GeoPandas` with **EPSG:32644** (UTM 44N) for all metric buffer and distance calculations. Convert back to **EPSG:4326** (WGS84) before returning coordinates to the frontend.
* **Geocoding cache** — The backend uses `geocode_cache.json` and `route_cache.json` for disk-based caching. These are excluded from git via `.gitignore` — never commit them.
* **Gemini fallback** — The `/api/chat` endpoint uses Gemini if `GEMINI_API_KEY` is present. Always preserve the local semantic fallback block so the app works without a key.

### Frontend (React)
* **Glassmorphism theme** — Maintain the deep midnight dark aesthetic using `bg-slate-900/60`, `backdrop-blur-md`, and subtle borders (`border-slate-800`).
* **Component modularity** — Keep each component focused to a single responsibility. Avoid writing routing logic inside UI components.
* **API calls** — All backend requests must go through `src/services/api.js`. Never call `axios` directly inside components.
* **activeRoute propagation** — Always pass `activeRoute` as a prop to `SafetyChatbot` from `Home.jsx` so the chatbot can access current route metrics.
* **Array safety** — Always guard route arrays with `Array.isArray()` checks before mapping.

---

## 🔄 Pull Request Guidelines

1. **Branch naming:**
   ```bash
   git checkout -b feat/my-new-feature
   git checkout -b fix/chatbot-reply-bug
   ```

2. **Before submitting:**
   - Backend starts without errors: `uvicorn main:app --reload`
   - Frontend builds cleanly: `npm run build`
   - Docker stack boots cleanly: `docker compose up --build`

3. **Commit message format:**
   ```
   feat: add voice input to AI chatbot
   fix: correct streetlight count mapping in api.js
   chore: update .gitignore for cache files
   docs: update user manual with chatbot section
   ```

---

## 🔁 CI/CD Pipeline (GitLab)

The repository includes a `.gitlab-ci.yml` with two automated stages that run on every push to `main`:

| Stage | Job | What it does |
|---|---|---|
| `test` | `test-backend` | Compiles all Python files with `py_compile` |
| `test` | `test-frontend` | Runs `npm install && npm run build` |
| `build` | `build-backend-docker` | Validates the backend `Dockerfile` using Docker-in-Docker |
| `build` | `build-frontend-docker` | Validates the frontend `Dockerfile` using Docker-in-Docker |

---

## 📦 Adding New Dependencies

**Backend:**
```bash
pip install new-package
pip freeze | grep new-package >> requirements.txt
```

**Frontend:**
```bash
npm install new-package
# package.json is updated automatically
```

Rebuild Docker containers after adding dependencies:
```bash
docker compose up --build
```
