// Environment Configuration
// Automatically detects and configures URLs based on environment

interface EnvironmentConfig {
  API_BASE_URL: string;
  FRONTEND_URL: string;
  ENVIRONMENT: 'development' | 'production' | 'preview';
  IS_DEVELOPMENT: boolean;
  IS_PRODUCTION: boolean;
}

// Detect environment automatically
const detectEnvironment = (): 'development' | 'production' | 'preview' => {
  // Check if we're in Vercel production
  if (typeof window !== 'undefined' && window.location.hostname === 'curabot-project.vercel.app') {
    return 'production';
  }
  
  // Check if we're in Vercel preview
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'preview';
  }
  
  // Check Vite mode
  if (import.meta.env.MODE === 'production') {
    return 'production';
  }
  
  // Check environment variable
  if (import.meta.env.VITE_ENVIRONMENT === 'production') {
    return 'production';
  }
  
  // Default to development
  return 'development';
};

// Get API URL based on environment
const getApiUrl = (environment: string): string => {
  // First check if explicitly set in environment variables
  if (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim() !== '') {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Auto-detect based on environment
  switch (environment) {
    case 'production':
      return 'https://curabot-backend.onrender.com/api';
    case 'preview':
      return 'https://curabot-backend.onrender.com/api'; // Use production backend for preview
    case 'development':
    default:
      return 'http://localhost:5000/api';
  }
};

// Get frontend URL based on environment
const getFrontendUrl = (environment: string): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  switch (environment) {
    case 'production':
      return 'https://curabot-project.vercel.app';
    case 'preview':
      return 'https://curabot-project.vercel.app'; // Will be overridden by actual preview URL
    case 'development':
    default:
      return 'http://localhost:5173';
  }
};

// Create environment configuration
const ENVIRONMENT = detectEnvironment();
const API_BASE_URL = getApiUrl(ENVIRONMENT);
const FRONTEND_URL = getFrontendUrl(ENVIRONMENT);

export const config: EnvironmentConfig = {
  API_BASE_URL,
  FRONTEND_URL,
  ENVIRONMENT,
  IS_DEVELOPMENT: ENVIRONMENT === 'development',
  IS_PRODUCTION: ENVIRONMENT === 'production'
};

// Debug logging (only in development)
if (config.IS_DEVELOPMENT) {
  console.log('🔧 Environment Configuration:', {
    ENVIRONMENT: config.ENVIRONMENT,
    API_BASE_URL: config.API_BASE_URL,
    FRONTEND_URL: config.FRONTEND_URL,
    IS_DEVELOPMENT: config.IS_DEVELOPMENT,
    IS_PRODUCTION: config.IS_PRODUCTION,
    VITE_MODE: import.meta.env.MODE,
    HOSTNAME: typeof window !== 'undefined' ? window.location.hostname : 'server'
  });
}

export default config;
