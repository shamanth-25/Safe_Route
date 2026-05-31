import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
