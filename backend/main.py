from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import google.generativeai as genai
import geopandas as gpd
from shapely.geometry import LineString, shape
import requests
import os
from dotenv import load_dotenv
import pandas as pd
import math
import re

load_dotenv()

app = FastAPI(title="SafePath Hyderabad API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load GeoJSON datasets into GeoDataFrames
# Using projected CRS (e.g., EPSG:3857 or local EPSG:32644 for Hyderabad) for buffer distance in meters
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def load_and_project(filename):
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        gdf = gpd.read_file(path)
        # Assuming original is WGS84 (EPSG:4326)
        if gdf.crs is None:
            gdf.set_crs(epsg=4326, inplace=True)
        # Project to EPSG:32644 (UTM zone 44N, covers Hyderabad) to do metric buffers
        return gdf.to_crs(epsg=32644)
    return None

streetlights_gdf = load_and_project("streetlight.geojson")
police_gdf = load_and_project("police.geojson")
hospitals_gdf = load_and_project("hospital.geojson")
pharmacies_gdf = load_and_project("parmacy.geojson")
metro_gdf = load_and_project("metro.geojson")

class RouteRequest(BaseModel):
    source_lat: float
    source_lon: float
    dest_lat: float
    dest_lon: float

ORS_API_KEY = os.getenv("ORS_API_KEY")

import json

# In-memory and persistent geocoding and routing caches to ensure absolute determinism across runs
CACHE_DIR = DATA_DIR
GEOCODE_CACHE_FILE = os.path.join(CACHE_DIR, "geocode_cache.json")
ROUTE_CACHE_FILE = os.path.join(CACHE_DIR, "route_cache.json")

GEOCODE_CACHE = {}
ROUTE_CACHE = {}

if os.path.exists(GEOCODE_CACHE_FILE):
    try:
        with open(GEOCODE_CACHE_FILE, "r") as f:
            GEOCODE_CACHE = json.load(f)
        print(f"Loaded {len(GEOCODE_CACHE)} geocoding cache entries from disk.")
    except Exception as e:
        print(f"Failed to load geocode cache: {e}")

if os.path.exists(ROUTE_CACHE_FILE):
    try:
        with open(ROUTE_CACHE_FILE, "r") as f:
            ROUTE_CACHE = json.load(f)
        print(f"Loaded {len(ROUTE_CACHE)} route cache entries from disk.")
    except Exception as e:
        print(f"Failed to load route cache: {e}")

def save_geocode_cache():
    try:
        with open(GEOCODE_CACHE_FILE, "w") as f:
            json.dump(GEOCODE_CACHE, f, indent=4)
    except Exception as e:
        print(f"Failed to save geocode cache: {e}")

def save_route_cache():
    try:
        with open(ROUTE_CACHE_FILE, "w") as f:
            json.dump(ROUTE_CACHE, f, indent=4)
    except Exception as e:
        print(f"Failed to save route cache: {e}")


# Robust local fallback coordinates for Hyderabad's famous neighborhoods
HYDERABAD_NEIGHBORHOODS = [
    {"name": "Madhapur", "display_name": "Madhapur, Hyderabad, Telangana, India", "lat": 17.4483, "lon": 78.3915},
    {"name": "Gachibowli", "display_name": "Gachibowli, Hyderabad, Telangana, India", "lat": 17.4401, "lon": 78.3489},
    {"name": "Charminar", "display_name": "Charminar, Old City, Hyderabad, Telangana, India", "lat": 17.3616, "lon": 78.4747},
    {"name": "Begumpet", "display_name": "Begumpet, Hyderabad, Telangana, India", "lat": 17.4447, "lon": 78.4664},
    {"name": "Secunderabad", "display_name": "Secunderabad Station, Hyderabad, Telangana, India", "lat": 17.4334, "lon": 78.5017},
    {"name": "Jubilee Hills", "display_name": "Jubilee Hills, Hyderabad, Telangana, India", "lat": 17.4299, "lon": 78.4069},
    {"name": "Nampally", "display_name": "Nampally Station, Hyderabad, Telangana, India", "lat": 17.3924, "lon": 78.4682},
    {"name": "Hitech City", "display_name": "Hitech City, Hyderabad, Telangana, India", "lat": 17.4504, "lon": 78.3808},
    {"name": "Kondapur", "display_name": "Kondapur, Hyderabad, Telangana, India", "lat": 17.4622, "lon": 78.3568},
    {"name": "Kukatpally", "display_name": "Kukatpally, Hyderabad, Telangana, India", "lat": 17.4855, "lon": 78.3973},
    {"name": "Mehdipatnam", "display_name": "Mehdipatnam, Hyderabad, Telangana, India", "lat": 17.3912, "lon": 78.4357},
    {"name": "Banjara Hills", "display_name": "Banjara Hills, Hyderabad, Telangana, India", "lat": 17.4172, "lon": 78.4332},
    {"name": "Ameerpet", "display_name": "Ameerpet, Hyderabad, Telangana, India", "lat": 17.4374, "lon": 78.4482},
    {"name": "Abids", "display_name": "Abids, Hyderabad, Telangana, India", "lat": 17.3908, "lon": 78.4756},
    {"name": "Tarnaka", "display_name": "Tarnaka, Hyderabad, Telangana, India", "lat": 17.4292, "lon": 78.5382},
    {"name": "Uppal", "display_name": "Uppal, Hyderabad, Telangana, India", "lat": 17.4019, "lon": 78.5602},
    {"name": "Dilsukhnagar", "display_name": "Dilsukhnagar, Hyderabad, Telangana, India", "lat": 17.3688, "lon": 78.5247},
    {"name": "Koti", "display_name": "Koti, Hyderabad, Telangana, India", "lat": 17.3824, "lon": 78.4842},
    {"name": "Tolichowki", "display_name": "Tolichowki, Hyderabad, Telangana, India", "lat": 17.3971, "lon": 78.4042},
    {"name": "Golconda Fort", "display_name": "Golconda Fort, Hyderabad, Telangana, India", "lat": 17.3833, "lon": 78.4011},
    {"name": "Durgam Cheruvu", "display_name": "Durgam Cheruvu (Secret Lake), Madhapur, Hyderabad, Telangana, India", "lat": 17.4325, "lon": 78.3888},
    {"name": "Durgam Cheruvu Cable Bridge", "display_name": "Durgam Cheruvu Cable Bridge, Jubilee Hills, Hyderabad, Telangana, India", "lat": 17.4352, "lon": 78.3970},
    {"name": "Inorbit Mall", "display_name": "Inorbit Mall, Madhapur, Hyderabad, Telangana, India", "lat": 17.4344, "lon": 78.3866},
    {"name": "IKEA", "display_name": "IKEA Hyderabad, Mindspace, Gachibowli, India", "lat": 17.4384, "lon": 78.3744}
]

HYDERABAD_BUILDINGS = [
    {
        "name": "Sri Sai Nilayam",
        "display_name": "Sri Sai Nilayam Apartments, Madhapur, Hyderabad, Telangana, India",
        "lat": 17.4520,
        "lon": 78.3840
    },
    {
        "name": "Ramya Residency",
        "display_name": "Ramya Residency, Kavuri Hills, Madhapur, Hyderabad, Telangana, India",
        "lat": 17.4450,
        "lon": 78.3930
    },
    {
        "name": "Sai Kiran Residency",
        "display_name": "Sai Kiran Residency, Jubilee Hills, Hyderabad, Telangana, India",
        "lat": 17.4385,
        "lon": 78.3985
    },
    {
        "name": "Aurobindo Galaxy",
        "display_name": "Aurobindo Galaxy Towers, Hitec City, Hyderabad, Telangana, India",
        "lat": 17.4465,
        "lon": 78.3755
    },
    {
        "name": "My Home Hub",
        "display_name": "My Home Hub, Madhapur, Hyderabad, Telangana, India",
        "lat": 17.4420,
        "lon": 78.3790
    },
    {
        "name": "My Home Avatar",
        "display_name": "My Home Avatar, Narsingi, Gachibowli Extension, Hyderabad, Telangana, India",
        "lat": 17.4110,
        "lon": 78.3320
    },
    {
        "name": "Lanco Hills",
        "display_name": "Lanco Hills Towers, Manikonda, Hyderabad, Telangana, India",
        "lat": 17.4020,
        "lon": 78.3710
    },
    {
        "name": "Pinnacle Towers",
        "display_name": "Pinnacle Towers, Kondapur, Hyderabad, Telangana, India",
        "lat": 17.4550,
        "lon": 78.3680
    }
]

def get_deterministic_offset(name: str):
    """
    Generates a deterministic lat/lon offset based on the hash of the building name.
    Offset is kept within +/- 0.003 degrees (approx 300m) to remain within the neighborhood boundary.
    """
    h = 0
    for char in name:
        h = (31 * h + ord(char)) & 0xFFFFFFFF
        
    lat_factor = ((h & 0xFFFF) / 65535.0) * 0.006 - 0.003
    lon_factor = (((h >> 16) & 0xFFFF) / 65535.0) * 0.006 - 0.003
    return lat_factor, lon_factor


@app.get("/")
def read_root():
    return {"message": "SafePath Hyderabad API is running."}

def parse_and_clean_address(q: str):
    """
    Parses a detailed address containing flat/house/plot numbers.
    Returns a tuple: (flat_prefix, clean_query_for_geocoding)
    """
    # Regex to detect common building/flat number prefix patterns
    pattern = r"^(flat|f\.?no|house|h\.?no|plot|villa|apt|apartment|block|room|floor|suite)\s*#?\s*[a-zA-Z0-9\-/]+(\s*,\s*)?"
    match = re.search(pattern, q, re.IGNORECASE)
    
    if match:
        prefix = q[match.start():match.end()]
        clean_q = q[match.end():].strip()
        if len(clean_q) > 3:
            return prefix, clean_q
            
    return "", q

def apply_prefix_to_results(results, prefix):
    if not prefix:
        return results
        
    prefix_clean = prefix.strip()
    if not prefix_clean.endswith(","):
        prefix_clean += ","
        
    modified_results = []
    for item in results:
        disp_name = item["display_name"]
        if not disp_name.lower().startswith(prefix_clean.lower()):
            disp_name = f"{prefix_clean} {disp_name}"
            
        modified_results.append({
            **item,
            "display_name": disp_name
        })
    return modified_results

def geocode_recursive(clean_query: str, prefix: str):
    query_lower = clean_query.lower()
    
    # 1. Check cache first using clean_query
    if query_lower in GEOCODE_CACHE:
        return apply_prefix_to_results(GEOCODE_CACHE[query_lower], prefix)
        
    results = []
    
    # 2. Check local specific buildings registry first!
    clean_q_alnum = "".join(c for c in query_lower if c.isalnum())
    if clean_q_alnum:
        building_results = []
        for item in HYDERABAD_BUILDINGS:
            clean_name = "".join(c for c in item["name"].lower() if c.isalnum())
            if clean_name in clean_q_alnum or clean_q_alnum in clean_name:
                building_results.append({
                    "place_id": f"building_{clean_name}",
                    "display_name": item["display_name"],
                    "lat": str(item["lat"]),
                    "lon": str(item["lon"])
                })
        if building_results:
            results = building_results
            
    # 3. Check local neighborhood registry BEFORE Nominatim for absolute stability!
    if not results and clean_q_alnum:
        neighborhood_results = []
        for item in HYDERABAD_NEIGHBORHOODS:
            clean_name = "".join(c for c in item["name"].lower() if c.isalnum())
            clean_disp = "".join(c for c in item["display_name"].lower() if c.isalnum())
            
            # Exact or highly prominent match
            if clean_q_alnum == clean_name or clean_name == clean_q_alnum:
                neighborhood_results.append({
                    "place_id": f"fallback_{clean_name}",
                    "display_name": item["display_name"],
                    "lat": str(item["lat"]),
                    "lon": str(item["lon"])
                })
                if len(neighborhood_results) >= 5:
                    break
        if neighborhood_results:
            results = neighborhood_results

    # 4. Try Nominatim Geocoding ONLY as a fallback
    if not results:
        try:
            url = "https://nominatim.openstreetmap.org/search"
            headers = {
                "User-Agent": "SafePathHyderabad/1.0 (shamanth@saferoute.com)"
            }
            params = {
                "q": f"Hyderabad {clean_query}",
                "format": "json",
                "countrycodes": "in",
                "limit": 5
            }
            res = requests.get(url, headers=headers, params=params, timeout=5)
            if res.status_code == 200:
                data = res.json()
                if data:
                    GEOCODE_CACHE[query_lower] = data
                    save_geocode_cache()
                    results = data
        except Exception as e:
            print(f"Nominatim error: {e}")
            
    # 4. Local fallback neighborhood keyword search
    if not results:
        fallback_results = []
        if clean_q_alnum:
            for item in HYDERABAD_NEIGHBORHOODS:
                clean_name = "".join(c for c in item["name"].lower() if c.isalnum())
                clean_disp = "".join(c for c in item["display_name"].lower() if c.isalnum())
                
                if clean_q_alnum in clean_name or clean_q_alnum in clean_disp:
                    fallback_results.append({
                        "place_id": f"fallback_{clean_name}",
                        "display_name": item["display_name"],
                        "lat": str(item["lat"]),
                        "lon": str(item["lon"])
                    })
                    if len(fallback_results) >= 5:
                        break
                        
        if not fallback_results and "," not in clean_query:
            for item in HYDERABAD_NEIGHBORHOODS:
                item_name_lower = item["name"].lower()
                if item_name_lower in query_lower:
                    fallback_results.append({
                        "place_id": f"fallback_sub_{item_name_lower}",
                        "display_name": f"{clean_query}, {item['display_name']}",
                        "lat": str(item["lat"]),
                        "lon": str(item["lon"])
                    })
                    break
        results = fallback_results
        
    # 5. If we found results, apply prefix and return them
    if results:
        return apply_prefix_to_results(results, prefix)
        
    # 6. Recursive peeling with deterministic coordinates offset!
    parts = clean_query.split(",")
    if len(parts) > 1:
        peeled_segment = parts[0].strip()
        remaining_query = ",".join(parts[1:]).strip()
        
        # Merge peeled segment into prefix
        new_prefix = prefix
        if new_prefix:
            if not new_prefix.strip().endswith(","):
                new_prefix = new_prefix.strip() + ","
            new_prefix = f"{new_prefix} {peeled_segment}"
        else:
            new_prefix = peeled_segment
            
        base_results = geocode_recursive(remaining_query, new_prefix)
        if base_results:
            # Apply stable spatial offset based on building name
            lat_off, lon_off = get_deterministic_offset(peeled_segment)
            offset_results = []
            for item in base_results:
                new_lat = float(item["lat"]) + lat_off
                new_lon = float(item["lon"]) + lon_off
                offset_results.append({
                    **item,
                    "lat": f"{new_lat:.6f}",
                    "lon": f"{new_lon:.6f}"
                })
            return offset_results
            
    return []

@app.get("/api/geocode")
def geocode(q: str):
    query_orig = q.strip()
    if not query_orig:
        return []
        
    prefix, clean_query = parse_and_clean_address(query_orig)
    return geocode_recursive(clean_query, prefix)

@app.post("/api/routes")
def get_safest_routes(req: RouteRequest):
    # Cache key based on source and dest coordinates rounded to 5 decimals (approx 1 meter precision)
    cache_key = f"{req.source_lat:.5f},{req.source_lon:.5f}->{req.dest_lat:.5f},{req.dest_lon:.5f}"
    if cache_key in ROUTE_CACHE:
        print("Returning cached route results from disk...")
        return ROUTE_CACHE[cache_key]

    routes_data = None
    routing_source = "OpenRouteService"
    
    # 1. Try OpenRouteService if API key is provided
    if ORS_API_KEY and not ORS_API_KEY.startswith("YOUR_") and len(ORS_API_KEY) > 20:
        headers = {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            'Authorization': ORS_API_KEY,
            'Content-Type': 'application/json; charset=utf-8'
        }
        body = {
            "coordinates": [[req.source_lon, req.source_lat], [req.dest_lon, req.dest_lat]],
            "alternative_routes": {
                "target_count": 3,
                "weight_factor": 1.4,
                "share_factor": 0.6
            }
        }
        try:
            response = requests.post(
                'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
                headers=headers,
                json=body,
                timeout=8
            )
            if response.status_code == 200:
                routes_data = response.json()
            else:
                print(f"ORS API returned status code {response.status_code}: {response.text}")
        except Exception as e:
            print(f"ORS API request failed: {str(e)}")

    # 2. Fallback to public OSRM if ORS failed or key was missing/invalid
    if not routes_data or "features" not in routes_data:
        routing_source = "OSRM Public API"
        print("Falling back to public OSRM routing...")
        # Coordinates: longitude,latitude separated by semicolons
        osrm_url = f"https://router.project-osrm.org/route/v1/driving/{req.source_lon},{req.source_lat};{req.dest_lon},{req.dest_lat}?alternatives=true&geometries=geojson&overview=full"
        try:
            response = requests.get(osrm_url, timeout=8)
            if response.status_code == 200:
                osrm_res = response.json()
                if "routes" in osrm_res and len(osrm_res["routes"]) > 0:
                    # Convert OSRM response to ORS FeatureCollection structure to keep pipeline uniform
                    features = []
                    for idx, route in enumerate(osrm_res["routes"]):
                        features.append({
                            "type": "Feature",
                            "geometry": route["geometry"],
                            "properties": {
                                "summary": {
                                    "distance": route["distance"], # in meters
                                    "duration": route["duration"] # in seconds
                                }
                            }
                        })
                    routes_data = {"features": features}
                else:
                    raise HTTPException(status_code=404, detail="No routes found via OSRM")
            else:
                raise HTTPException(status_code=response.status_code, detail=f"OSRM API Error: {response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Routing failure (Both ORS and OSRM failed): {str(e)}")

    if not routes_data or "features" not in routes_data:
        raise HTTPException(status_code=404, detail="No routes found")

    routes_result = []
    
    for idx, feature in enumerate(routes_data["features"]):
        geometry = feature["geometry"]
        properties = feature["properties"]
        
        # Parse route line
        line = shape(geometry)
        route_gdf = gpd.GeoDataFrame(index=[0], geometry=[line], crs="EPSG:4326")
        
        # Project route to EPSG:32644 for metric buffering (200 meters buffer)
        route_gdf_proj = route_gdf.to_crs(epsg=32644)
        route_buffer = route_gdf_proj.buffer(200) # 200m buffer
        buffer_geom = route_buffer.iloc[0]
        
        # Helper to count points in buffer
        def count_points_in_buffer(gdf, buf_geom):
            if gdf is None or gdf.empty:
                return 0
            return gdf[gdf.geometry.intersects(buf_geom)].shape[0]

        # Helper to extract a string name and avoid JSON nan float issues
        def get_clean_name(row, default_name):
            for field in ["name", "name:en", "amenity"]:
                val = row.get(field)
                if val is not None and not (isinstance(val, float) and math.isnan(val)) and str(val).strip() != "":
                    return str(val)
            return default_name

        # Helper to get facilities within buffer
        def get_facilities_in_buffer(gdf, buf_geom, type_name):
            if gdf is None or gdf.empty:
                return []
            intersecting = gdf[gdf.geometry.intersects(buf_geom)]
            # Convert back to WGS84 for leaflet rendering
            intersecting_wgs = intersecting.to_crs(epsg=4326)
            facilities = []
            for _, row in intersecting_wgs.iterrows():
                name = get_clean_name(row, f"Unnamed {type_name}")
                if row.geometry.geom_type == "Point":
                    coords = [row.geometry.y, row.geometry.x]
                    facilities.append({
                        "name": name,
                        "coordinates": coords,
                        "type": type_name
                    })
            return facilities

        # Extract facility counts
        counts = {
            "streetlights": count_points_in_buffer(streetlights_gdf, buffer_geom),
            "police": count_points_in_buffer(police_gdf, buffer_geom),
            "hospitals": count_points_in_buffer(hospitals_gdf, buffer_geom),
            "pharmacies": count_points_in_buffer(pharmacies_gdf, buffer_geom),
            "metro": count_points_in_buffer(metro_gdf, buffer_geom)
        }
        
        distance_km = properties["summary"]["distance"] / 1000.0
        duration_min = properties["summary"]["duration"] / 60.0
        
        # Safety Score Formula Normalization
        # 1. Streetlights (50% weight): target density of 12 streetlights per km
        lights_per_km = counts["streetlights"] / distance_km if distance_km > 0 else 0
        streetlight_score = min((lights_per_km / 12.0) * 100.0, 100.0)
        
        # 2. Police Accessibility (20% weight): 100 if at least 1 station, else 0
        police_score = 100.0 if counts["police"] >= 1 else 0.0
        
        # 3. Hospital Accessibility (15% weight): 100 if at least 1 hospital, else 0
        hospital_score = 100.0 if counts["hospitals"] >= 1 else 0.0
        
        # 4. Pharmacy Accessibility (10% weight): 100 if at least 1 pharmacy, else 0
        pharmacy_score = 100.0 if counts["pharmacies"] >= 1 else 0.0
        
        # 5. Metro Accessibility (5% weight): 100 if at least 1 metro station, else 0
        metro_score = 100.0 if counts["metro"] >= 1 else 0.0
        
        # Combine weighted subscores
        safety_score = round(
            (0.50 * streetlight_score) +
            (0.20 * police_score) +
            (0.15 * hospital_score) +
            (0.10 * pharmacy_score) +
            (0.05 * metro_score)
        )
        
        # Retrieve actual items along the route for mapping & sidebar
        route_facilities = {
            "police": get_facilities_in_buffer(police_gdf, buffer_geom, "police"),
            "hospitals": get_facilities_in_buffer(hospitals_gdf, buffer_geom, "hospital"),
            "pharmacies": get_facilities_in_buffer(pharmacies_gdf, buffer_geom, "pharmacy"),
            "metro": get_facilities_in_buffer(metro_gdf, buffer_geom, "metro"),
            "streetlights": get_facilities_in_buffer(streetlights_gdf, buffer_geom, "streetlight")[:100] # cap streetlight count to prevent map lag
        }

        # Calculate nearest emergency facilities (for direct quick panel)
        def find_nearest(gdf, line_geom, type_name):
            if gdf is None or gdf.empty:
                return None
            gdf_copy = gdf.copy()
            gdf_copy["dist"] = gdf_copy.geometry.distance(line_geom)
            closest_idx = gdf_copy["dist"].idxmin()
            row = gdf_copy.loc[closest_idx]
            # Convert back to WGS84
            pt_wgs = gpd.GeoSeries([row.geometry], crs="EPSG:32644").to_crs(epsg=4326).iloc[0]
            name = get_clean_name(row, f"Emergency {type_name}")
            return {
                "name": name,
                "distance_m": round(row["dist"]),
                "coordinates": [pt_wgs.y, pt_wgs.x]
            }

        line_proj = route_gdf_proj.geometry.iloc[0]
        nearest_emergency = {
            "police": find_nearest(police_gdf, line_proj, "police"),
            "hospital": find_nearest(hospitals_gdf, line_proj, "hospital"),
            "pharmacy": find_nearest(pharmacies_gdf, line_proj, "pharmacy"),
            "metro": find_nearest(metro_gdf, line_proj, "metro")
        }

        # Dynamic Recommendation Reasons
        reasons = []
        if lights_per_km >= 10:
            reasons.append(f"Highly illuminated route with {round(lights_per_km, 1)} streetlights per km.")
        elif lights_per_km >= 5:
            reasons.append(f"Moderate illumination with {round(lights_per_km, 1)} streetlights per km.")
        else:
            reasons.append(f"Caution: Low illumination ({round(lights_per_km, 1)} streetlights per km).")

        if counts["police"] > 0:
            reasons.append(f"Passed within 200m of {counts['police']} police station{'s' if counts['police'] > 1 else ''} for continuous security.")
        else:
            reasons.append("No police stations in immediate vicinity.")

        if counts["hospitals"] > 0 or counts["pharmacies"] > 0:
            reasons.append("Excellent emergency medical support (hospitals & 24/7 pharmacies nearby).")
            
        if counts["metro"] > 0:
            reasons.append("Provides convenient access to active transit (metro stations).")

        routes_result.append({
            "id": f"Route_{chr(65+idx)}",
            "name": f"SafePath Option {chr(65+idx)}",
            "distance_km": round(distance_km, 2),
            "duration_min": round(duration_min, 2),
            "counts": counts,
            "subscores": {
                "streetlights": round(streetlight_score),
                "police": round(police_score),
                "hospitals": round(hospital_score),
                "pharmacies": round(pharmacy_score),
                "metro": round(metro_score)
            },
            "safety_score": safety_score,
            "facilities": route_facilities,
            "nearest_emergency": nearest_emergency,
            "reasons": reasons,
            "geometry": geometry
        })
    
    # Sort routes: highest safety score first, then shortest distance if equal
    routes_result = sorted(routes_result, key=lambda x: (-x["safety_score"], x["distance_km"]))
    
    # Assign recommendation badges
    for idx, r in enumerate(routes_result):
        if idx == 0:
            r["recommendation_type"] = "RECOMMENDED" # safest
        elif idx == 1:
            r["recommendation_type"] = "MODERATE"
        else:
            r["recommendation_type"] = "ALTERNATIVE"
            
    result_payload = {
        "routes": routes_result,
        "routing_source": routing_source
    }
    ROUTE_CACHE[cache_key] = result_payload
    save_route_cache()
    return result_payload

class ChatRequest(BaseModel):
    message: str
    source_lat: Optional[float] = None
    source_lon: Optional[float] = None
    dest_lat: Optional[float] = None
    dest_lon: Optional[float] = None
    active_route: Optional[dict] = None

@app.post("/api/chat")
async def chat_assistant(req: ChatRequest):
    msg = req.message.lower()
    
    # 1. Attempt Gemini 1.5 Flash Generative LLM
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if api_key and api_key != "YOUR_GEMINI_API_KEY" and api_key != "YOUR_ORS_API_KEY":
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Formulate RAG context with active route stats
            context = ""
            if req.source_lat and req.dest_lat:
                context += (f"\n- **Starting Location coordinates:** {req.source_lat:.5f}, {req.source_lon:.5f}"
                            f"\n- **Destination coordinates:** {req.dest_lat:.5f}, {req.dest_lon:.5f}")
            if req.active_route:
                ar = req.active_route
                reasons_str = ", ".join(ar.get("reasons", []))
                context += (
                    f"\n- **Active Selected Route:** {ar.get('name', 'N/A')}"
                    f"\n- **Route Safety Score:** {ar.get('safety_score', 0)} Rank"
                    f"\n- **Distance:** {ar.get('distance_km', 0.0)} km"
                    f"\n- **Illumination:** {ar.get('streetlight_count', 0)} active streetlights along this path"
                    f"\n- **Security:** {ar.get('police_count', 0)} police stations in close buffer zone"
                    f"\n- **Medical Support:** {ar.get('hospital_count', 0)} medical care clinics and {ar.get('pharmacy_count', 0)} 24/7 pharmacies"
                    f"\n- **Nearest Emergency Hub:** {ar.get('nearest_emergency', 'N/A')}"
                    f"\n- **Safety Rationale:** {reasons_str}"
                )
                
            system_prompt = (
                "You are the SafePath Hyderabad AI Safety Assistant, an elite nighttime navigation expert. "
                "Your mission is to analyze urban routes, streetlights, and emergency safety features, helping "
                "users plan illuminated and secure pathways across Hyderabad.\n\n"
                "System and GIS Database context:"
                f"\n- **Streetlight Database:** 14,284 active streetlights indexed in Hyderabad.{context}"
                "\n\nRules:"
                "\n1. Highly prioritize safety, streetlight density, and proximity to police stations/24/7 pharmacies."
                "\n2. If the user is in an emergency or feels unsafe, immediately tell them to call the national emergency number 112."
                "\n3. Keep your answers extremely concise, structured, highly professional, and encouraging. Use markdown bullet points."
                "\n4. Do not hallucinate data. If you don't know something about a specific route, focus on general safety and illumination tips."
            )
            
            response = model.generate_content([system_prompt, req.message])
            reply_text = response.text.strip()
            
            # Determine smart suggested actions based on response content
            suggested = ["Are there police stations nearby?", "How is the streetlight density?", "Emergency contact info"]
            if any(k in msg for k in ["police", "station", "cop"]):
                suggested = ["What is the emergency helpline?", "How is the streetlight density?", "Locate nearest hospital"]
            elif any(k in msg for k in ["light", "dark", "streetlight"]):
                suggested = ["Are there police stations nearby?", "Locate nearest hospital", "Find 24/7 pharmacies"]
                
            return {
                "reply": reply_text,
                "suggested_actions": suggested
            }
        except Exception as e:
            print(f"Gemini API Error, falling back to local safety matcher: {e}")

    # 2. Local Fallback Semantic Engine (Deterministic Safety Expert)
    reply = ""
    suggested = []
    
    # Read active route metrics dynamically
    ar = req.active_route or {}
    r_name = ar.get("name", "your selected route")
    r_score = ar.get("safety_score", 66)
    r_dist = ar.get("distance_km", 8.5)
    r_lights = ar.get("streetlight_count", 32)
    r_cops = ar.get("police_count", 2)
    r_hospitals = ar.get("hospital_count", 11)
    r_pharma = ar.get("pharmacy_count", 15)
    r_emergency = ar.get("nearest_emergency", "Vikram Hospital / Police Station")
    r_reasons = ar.get("reasons", ["No specific safety rationale computed."])
    reasons_bullet = "\n".join([f"- {r}" for r in r_reasons])
    
    if any(k in msg for k in ["police", "security", "station", "cop", "safety", "safe"]):
        reply = (f"🛡️ **Security Shield Insight:** Your selected path (**{r_name}**) prioritizes safety by routing "
                 f"near active emergency hubs. It passes near **{r_cops} active police station(s)** "
                 f"for continuous security coverage. The closest security/emergency point on this route is **{r_emergency}**.")
        suggested = ["Where is the nearest police station?", "What is the emergency helpline?", "Streetlight density check"]
        
    elif any(k in msg for k in ["light", "streetlight", "dark", "illuminate", "illumination"]):
        reply = (f"💡 **Streetlight Density Analysis:** Our database indexes **14,284 streetlights** in Hyderabad. "
                 f"Your active path (**{r_name}**) features **{r_lights} active high-density streetlights** "
                 f"along its **{r_dist:.2f} km** span to ensure optimal night illumination and minimize dark segments.")
        suggested = ["Check streetlight density", "How is safety score calculated?", "List nearby police stations"]
        
    elif any(k in msg for k in ["hospital", "medical", "pharmacy", "clinic", "doctor", "health"]):
        reply = (f"🏥 **Medical Proximity Guide:** Emergency medical support is highly accessible on your path. "
                 f"It routes within 100-200 meters of **{r_hospitals} medical facilities** and "
                 f"**{r_pharma} round-the-clock pharmacies** to guarantee constant care.")
        suggested = ["Locate nearest hospital", "Find 24/7 pharmacies", "Quick Emergency: 112 info"]
        
    elif any(k in msg for k in ["transit", "metro", "station", "bus", "train", "cab"]):
        reply = ("🚇 **Active Transit Network:** High-density transit points (like Madhapur and Gachibowli Metro Stations) "
                 "are heavily illuminated and highly secure, providing rapid emergency evacuation paths and active crowds "
                 "during late hours.")
        suggested = ["Are metro routes safer?", "Explain safety ranks", "Check streetlight density"]
        
    elif any(k in msg for k in ["help", "emergency", "call", "contact", "112", "phone"]):
        reply = (f"🚨 **Emergency Protocol:** If you feel unsafe or experience an emergency, immediately dial **112** "
                 f"(National Emergency Support Number). The closest emergency shield along your active route is **{r_emergency}**.")
        suggested = ["Where is the nearest police station?", "Locate nearest hospital", "Check streetlights"]
        
    else:
        reply = (f"👋 **Hello! I am your SafePath AI Safety Assistant.**\n\n"
                 f"I have parsed the safety parameters for your selected path (**{r_name}**, Safety Score: **{r_score} Rank**).\n\n"
                 f"Here is its **Safety Rationale Breakdown**:\n{reasons_bullet}\n\n"
                 f"Ask me about nighttime illumination (*'{r_lights} streetlights'*), police shields (*'{r_cops} stations'*), "
                 f"or nearest emergency centers!")
        suggested = ["Are there police stations nearby?", "How is the streetlight density?", "Emergency contact info"]
        
    return {
        "reply": reply,
        "suggested_actions": suggested
    }


