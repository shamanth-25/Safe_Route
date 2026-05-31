# 📖 SafePath Hyderabad — User Manual

Welcome to the **SafePath Hyderabad User Manual**. This guide walks you through every feature of the dashboard — from planning your safest nighttime route to interacting with the AI Safety Assistant chatbot.

---

## 🗺️ Dashboard Overview

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  🛡️ SafePath HYDERABAD     ⚙️ Engine: OpenRouteService   💡 14,284 lights  🚨 112│
├──────────────────────┬──────────────────────────────┬───────────────────────────┤
│                      │                              │  NIGHT SAFETY SCORE       │
│  PLAN SAFE ROUTE     │                              │  ── Gauge (0–100 Rank) ── │
│                      │                              │                           │
│  ⚡ Quick Presets     │       [LEAFLET MAP]          │  SAFETY RATIONALE         │
│  Source  [GPS] [Pin] │                              │  - Streetlight density    │
│  Destination   [Pin] │  • Green route = Safest      │  - Police shield buffer   │
│                      │  • Red route = Alternative   │  - Hospital proximity     │
│  [Calculate Routes]  │  • Markers: lights/police/   │  - Pharmacy access        │
│                      │    hospitals/pharmacies      │                           │
│  ROUTE DASHBOARD     │                              │  GIS SCORE BREAKDOWN      │
│  - Option A/B/C      │  [MAP INDEX LEGEND]          │  - Progress bar chart     │
│  - Safety scores     │                              │                           │
│  - Distance/Time     │                              │  EMERGENCY ASSETS         │
│  - Infrastructure    │                              │  - Nearest police/hosp.   │
│    counts            │                              │  - Pharmacy locator       │
└──────────────────────┴──────────────────────────────┴───────────────────────────┘
                                                        💬 [AI Chatbot Bubble]
```

---

## 🚦 How to Plan a Route

### Step 1 — Choose Your Locations

SafePath offers three ways to set your **Source** and **Destination**:

#### 🔍 Type a Custom Address
Type any address directly in the search box — SafePath handles complex building addresses automatically:
- `"Sri Sai Nilayam, Madhapur"` → Resolved to the building's unique coordinates
- `"Flat 403, Devi Apartments, Kondapur"` → Peeled, hashed, and uniquely pinned

#### ⚡ One-Click Quick Presets
Click a preset button to instantly populate both fields:
| Preset | Route |
|---|---|
| 🏢 IT Corridor | Madhapur → Gachibowli |
| 🏛️ Heritage Trail | Charminar → Golconda Fort |
| 🚇 Transit Hub | Begumpet → Secunderabad |
| 🌿 City Core | Nampally → Jubilee Hills |

#### 🛰️ GPS Auto-Fill
Click the **Navigation Icon (📡)** next to the Source field. The browser will request location access, grab your GPS coordinates, and auto-fill your current address.

#### 🎯 Map Pin Drop
Click the **Crosshair Icon (🎯)** next to any field, then **click anywhere on the map** to drop a pin at that exact location.

---

### Step 2 — Calculate Routes

Click the **"✨ Calculate Safest Routes"** button. SafePath will:
1. Geocode both addresses using its recursive peeling engine
2. Query OpenRouteService for 3 route alternatives
3. Score each route across 5 safety dimensions
4. Display ranked results in the **Route Dashboard**

---

### Step 3 — Compare Routes

Each route card in the Route Dashboard shows:

| Metric | What it means |
|---|---|
| **Safety Score** | Overall night safety rank (0–100) |
| **Distance** | Total route length in km |
| **Time** | Estimated travel duration |
| 💡 **Lights** | Active streetlights within 100m of the route |
| 🛡️ **Police** | Police stations within 200m buffer |
| 🏥 **Medical** | Hospitals within 300m buffer |
| 💊 **Rx** | 24/7 pharmacies within 200m buffer |
| 🚇 **Metro** | Metro stations within 300m buffer |

Click any route card to **highlight it on the map** and update the Safety Score panel on the right.

---

## 🤖 AI Safety Assistant Chatbot

The floating **purple chatbot bubble** in the bottom-right corner is your SafePath AI Safety Assistant.

### Opening the Chatbot
Click the **💬 bubble** to open the chat panel. The assistant immediately loads the safety parameters of your **currently selected route** and greets you with:
- The route name and safety rank
- A bullet-point safety rationale breakdown
- How many streetlights and police stations are on your path

### Asking Questions
You can type any safety-related question or click the **suggestion chip buttons** below each message:

| Example Question | What you get |
|---|---|
| *"Are there police stations nearby?"* | Exact count of police shields on your active route |
| *"How is the streetlight density?"* | Number of active streetlights along the route's km span |
| *"Locate nearest hospital"* | Name and distance of the closest medical facility |
| *"What is the emergency number?"* | Nearest emergency hub + 112 protocol |

### Switching Routes
When you click a **different route card** or choose a **new preset**, the chatbot **automatically updates** its initial greeting to reflect the new route's metrics — no need to restart the chat.

### AI Model
- **With `GEMINI_API_KEY`** → Powered by Google Gemini 1.5 Flash for full generative, conversational AI responses
- **Without a key** → Uses a built-in local safety expert engine (instant, offline, free)

---

## 🎛️ Safety Score Panel

The right-side panel shows the **Night Safety Score** for the selected route:

### Score Gauge
A circular gauge displays the overall safety rank (0–100). Color coding:
- 🟢 **70–100** — Excellent safety
- 🟡 **50–69** — Moderate safety
- 🔴 **0–49** — Caution advised

### Safety Rationale
Bullet points explaining exactly why the route scored as it did:
- *"Highly illuminated route with 12.3 streetlights per km"*
- *"Passed within 200m of 2 police stations for continuous security"*
- *"Excellent emergency medical support nearby"*

### GIS Score Breakdown
Horizontal progress bars showing contribution of each safety dimension:
- 💡 Streetlight Density (50%)
- 🛡️ Police Shield (20%)
- 🏥 Hospital Access (15%)
- 💊 Pharmacy Access (10%)
- 🚇 Metro Proximity (5%)

---

## 🗺️ Map Controls

### Map Index Legend
Click **"MAP INDEX"** on the map to toggle a legend showing what each marker type represents:
- 📍 Starting Point / Destination
- ⭐ Streetlight
- 🛡️ Police Station
- 🏥 Hospital
- 💊 Pharmacy
- 🚇 Metro Station

### Route Colors
- **Green** = Safest recommended route
- **Red/Dark** = Alternative routes

---

## 🚨 Emergency Features

### Quick Emergency: 112
The red **"Quick Emergency: 112"** button in the top header immediately dials India's national emergency number.

### Emergency Asset Panel
In the right sidebar, the **Emergency Assets** section shows:
- Nearest police station (name + distance)
- Nearest hospital (name + distance)
- Nearest 24/7 pharmacy (name + distance)

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| Map not loading | Check your internet connection (OpenStreetMap tiles require internet) |
| "No routes found" | Try simplifying the address — use neighbourhood names rather than full building details |
| Chatbot shows generic answers | Make sure you have clicked a route card first to select an active route |
| Backend connection error | Ensure `./run.sh --docker` is running and both containers are healthy |
| GPS not working | Allow location access in your browser settings |
