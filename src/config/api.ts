import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://curabot-backend.onrender.com/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 