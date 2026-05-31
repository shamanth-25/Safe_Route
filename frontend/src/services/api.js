import axios from 'axios';

let API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Render Blueprints inject raw hostnames without a protocol. 
// We normalize it to an absolute URL.
if (API_BASE && !API_BASE.startsWith('http://') && !API_BASE.startsWith('https://')) {
  API_BASE = `https://${API_BASE}`;
}

export const geocodeSearch = async (text) => {
  if (!text || !text.trim()) return [];
  const response = await axios.get(`${API_BASE}/api/geocode`, {
    params: { q: text }
  });
  return response.data;
};

export const fetchRoutes = async (source, destination) => {
  const response = await axios.post(`${API_BASE}/api/routes`, {
    source_lat: source.lat,
    source_lon: source.lon,
    dest_lat: destination.lat,
    dest_lon: destination.lon
  });
  return response.data;
};

