# 📖 SafePath Hyderabad - User Manual

Welcome to the **SafePath Hyderabad User Manual**. This guide will walk you through planning your safest nighttime commute, customizing safety parameters, and navigating the interactive dark-mode dashboard.

---

## 🗺️ Interface Walkthrough

```text
+--------------------------------------------------------------------------------+
|  [🛡️ SafePath Header]                 Active Lights: 14,284     [112 Emergency] |
+--------------------------------------------------------------------------------+
|  PLAN SAFE ROUTE     |                                      |  NIGHT SAFETY    |
|                      |             [LEAFLET MAP]            |  SCORE GAUGE     |
|  Source (GPS / Pin)  |                                      |                  |
|  Destination (Pin)   |  - Plotted Safest Routes (Option A)  |  - Rationale     |
|                      |  - Infrastructure Markers overlay   |  - Custom Weights|
|  [CALCULATE ROUTE]   |  - Interactive Map Index legends     |  - Infrastructure|
|                      |                                      |    Toggles       |
|  ROUTE DASHBOARD     |                                      |                  |
|  - Distance / Time   |                                      |  EMERGENCY PANELS|
|  - Safety Scores     |                                      |  - Asset Locator |
+--------------------------------------------------------------------------------+
```

---

## 🚦 How to Plan a Route

### 1️⃣ Enter Your Locations (Uber/Rapido Experience)
SafePath Hyderabad offers three advanced ways to set your **Source** and **Destination**:

* **🔍 Type Custom Buildings (Automatic Geocoding)**:
  * Simply type a building name in an area (e.g. `"Sri Sai Nilayam, Madhapur"` or `"Devi Apartments, Madhapur"`).
  * SafePath automatically extracts the parent neighborhood, fetches its base coordinates, and calculates a **highly specific, unique starting pin** for that building!
* **🛰️ One-Touch GPS Location**:
  * Click the sleek **Navigation Cursor Icon (📍)** next to the Source field.
  * The system will request browser GPS access, grab your high-accuracy coordinates, reverse-geocode your address, and instantly load your safest route!
* **🎯 Interactive Map-Pinning**:
  * Click the **Map Target Crosshair Icon (🎯)** next to the Source or Destination fields.
  * Now, simply **click anywhere directly on the dark map** to pin your coordinates exactly where you want!

---

## 🎛️ Safety Score Toggles & Sliders

### 1. The Dynamic Weight Dial
You can customize exactly what "safety" means to you during your nighttime travel. Scroll to the **GIS Score Breakdown** panel on the right:
* **Streetlight Density (50% default)**: Maximize path illumination.
* **Police Shield Proximity (20% default)**: Route closer to police stations and security checkpoints.
* **Hospital Accessibility (15% default)**: Keep major healthcare centers nearby in case of medical emergencies.
* **24/7 Pharmacy Proximity (10% default)**: Ensure access to overnight medical supplies.
* **Metro Proximity (5% default)**: Stay aligned with public transit arteries.

### 2. Infrastructure Layer Overlays
On the top right of the Leaflet Map, check the toggles to visually overlay active safety structures onto your map:
* **Streetlights**: Shows glowing gold light markers.
* **Police Stations**: Shows glowing blue shields.
* **Pharmacies**: Shows green medical crosses.

---

## 🚨 Emergency Integration

* **Quick Emergency Button**: Located in the main top header, clicking **Quick Emergency: 112** will immediately dial the unified emergency services number.
* **Emergency Asset Locator**: 
  * In the right sidebar, click the **Locate** button next to any nearby hospital or pharmacy.
  * The map will instantly pan and focus on that asset, drawing a **pulsing purple target marker** around it so you can identify it in seconds.
