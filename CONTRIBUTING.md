# 🤝 Contributing to SafePath Hyderabad

Thank you for your interest in contributing to SafePath Hyderabad! Follow these guidelines to set up your environment, follow our coding patterns, and submit high-quality improvements.

---

## 🛠️ Local Development Setup

### Backend (FastAPI)
1. Ensure you have **Python 3.10+** installed.
2. It is highly recommended to use a virtual environment:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Environmental configurations are managed via a `.env` file in the `backend/` directory:
   ```env
   ORS_API_KEY=your_openrouteservice_key_here
   ```

### Frontend (React + Vite)
1. Ensure you have **Node.js v18+** and **npm** installed.
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Start the Vite server:
   ```bash
   npm run dev
   ```

---

## 📐 Coding Standards

### Backend Style Guidelines (Python)
* **Type Annotations**: Always annotate function arguments and return types (e.g. `def geocode(q: str) -> List[Dict]:`).
* **Vector Geoprocessing**: Use `GeoPandas` and `Shapely` for spatial operations. Keep all spatial datasets projected in **EPSG:32644** (UTM zone 44N) to allow metric calculation for buffers and illumination sweeps.
* **API Contracts**: All JSON payload structures must be strictly modeled using `Pydantic` schemas.

### Frontend Style Guidelines (React + Tailwind CSS)
* **Glassmorphism Theme**: SafePath Hyderabad uses a deep midnight blue glassmorphism aesthetic. Use `backdrop-blur-md`, `bg-slate-900/60`, and subtle borders (`border-slate-800`) to maintain design continuity.
* **Component Modularity**: Keep Leaflet React components focused. Handle heavy geospatial logic, marker rendering, and polyline decoders cleanly using local React hooks.
* **Responsive Styling**: Ensure grid containers use screen-fitting boundaries (`h-screen overflow-hidden`) with local side-scrollbars (`overflow-y-auto`) to guarantee zero map container shifts across desktop viewports.

---

## 🔄 Pull Request Guidelines

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/amazing-safety-improvement
   ```
2. **Verify Code Health**:
   * Ensure the FastAPI server boots successfully with zero linting warnings.
   * Ensure Vite builds cleanly: `npm run build`.
3. **Commit Messages**: Use clean, descriptive commits:
   * `feat: added live safe-zone alerts`
   * `fix: corrected Leaflet bounds spill on mobile layout`
