# 🛡️ SafePath Hyderabad

### *Find the most illuminated and emergency-accessible route, not just the shortest.*

SafePath Hyderabad is a state-of-the-art, nighttime-optimized routing navigation dashboard. While traditional GPS systems only calculate routes based on distance or traffic, SafePath evaluates thousands of local spatial data points (streetlights, police stations, hospitals, 24/7 pharmacies, and metro stations) to guide users along the safest and most illuminated pathways.

Designed with a stunning dark-mode dashboard, high-fidelity Leaflet routing maps, and advanced alphanumeric recursive geocoding, SafePath Hyderabad delivers a premium, Rapido-style navigation experience tailored for nighttime security.

---

## 🚀 Core Features

* **💡 Nighttime Safety Index**: Evaluates paths based on illumination density (50%), police proximity (20%), emergency medical access (15%), pharmacy availability (10%), and transit connectivity (5%).
* **🎯 Recursive Segment-Peeling Geocoder**: Intelligently handles custom detailed building addresses (like `"Flat 403, Sri Sai Nilayam"`). It recursively peels away prefixes and coordinates matching local neighborhoods on the fly!
* **🎲 Deterministic Spatial Building Offsets**: Automatically assigns unique, stable coordinates to different building names in the same neighborhood, ensuring every private residence gets its own distinct starting coordinate and route options.
* **📍 Rapido/Uber-Style Manual Pin Adjuster**: Let's you click the map target to drag-and-refine coordinates directly on the visual Leaflet pane.
* **🛰️ One-Touch GPS Geolocation**: Direct single-click button to fetch the browser's high-accuracy GPS coordinates and map your safest route instantly.
* **🚒 Dynamic Infrastructure Visualizer**: Checkboxes to overlay active streetlights, police shields, and pharmacies directly onto the route buffers.

---

## 📂 Repository Structure

```text
saferoute/
├── backend/            # FastAPI Python Server
│   ├── data/           # GeoJSON safety layers (Streetlights, Police, Hospitals)
│   ├── main.py         # Routing core & recursive geocoding engines
│   └── requirements.txt
├── frontend/           # Vite + React Web Application
│   ├── src/            # Premium dashboard components and styles
│   └── package.json
├── USER_MANUAL.md      # Full step-by-step user manual
├── CONTRIBUTING.md     # Codebase contribution and styling guidelines
└── AGENTS.md           # Engineering deep-dive into the agentic geocoding engines
```

---

## ⚡ Quick Start

### 1️⃣ Run the Backend (FastAPI)
```bash
cd backend
# Install dependencies
pip install -r requirements.txt
# Start the Uvicorn server
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend runs on:* `http://localhost:8000`

### 2️⃣ Run the Frontend (React + Vite)
```bash
cd frontend
# Install node packages
npm install
# Start the Vite development server
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 📖 Documentation Directory

To get the most out of SafePath Hyderabad, explore our detailed documentation:
* **[User Manual](USER_MANUAL.md)**: Master the route planner, emergency assets locator, and custom weighting sliders.
* **[Agentic Engineering (AGENTS.md)](AGENTS.md)**: Technical breakdown of the segment-peeling geocoder and spatial hashing algorithms.
* **[Contribution Guide](CONTRIBUTING.md)**: Learn about codebase style guidelines, API contracts, and local development.
