import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://curabot-backend-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 