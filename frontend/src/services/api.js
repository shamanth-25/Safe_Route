import axios from 'axios';

let API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Render Blueprints inject raw hostnames (e.g. safepath-backend-6urw). 
// If it's a raw hostname without a dot, we expand it to its public URL.
if (API_BASE && !API_BASE.startsWith('http://') && !API_BASE.startsWith('https://')) {
  if (!API_BASE.includes('.')) {
    API_BASE = `https://${API_BASE}.onrender.com`;
  } else {
    API_BASE = `https://${API_BASE}`;
  }
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

export const sendChatMessage = async (message, source = null, destination = null) => {
  const response = await axios.post(`${API_BASE}/api/chat`, {
    message,
    source_lat: source ? source.lat : null,
    source_lon: source ? source.lon : null,
    dest_lat: destination ? destination.lat : null,
    dest_lon: destination ? destination.lon : null
  });
  return response.data;
};


