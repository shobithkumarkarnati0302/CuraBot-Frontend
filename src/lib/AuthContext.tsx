// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
// }

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   login: (email: string, password: string) => Promise<void>;
//   register: (name: string, email: string, password: string, role: string) => Promise<void>;
//   logout: () => void;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

//   useEffect(() => {
//     if (token) {
//       fetchUser();
//     }
//   }, [token]);

//   const fetchUser = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/auth/me', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setUser(response.data);
//     } catch (error) {
//       console.error('Error fetching user:', error);
//       logout();
//     }
//   };

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/login', {
//         email,
//         password
//       });
//       const { token: newToken, user: userData } = response.data;
//       localStorage.setItem('token', newToken);
//       setToken(newToken);
//       setUser(userData);
//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   };

//   const register = async (name: string, email: string, password: string, role: string) => {
//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/register', {
//         name,
//         email,
//         password,
//         role
//       });
//       const { token: newToken, user: userData } = response.data;
//       localStorage.setItem('token', newToken);
//       setToken(newToken);
//       setUser(userData);
//     } catch (error) {
//       console.error('Registration error:', error);
//       throw error;
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{
//       user,
//       token,
//       login,
//       register,
//       logout,
//       isAuthenticated: !!token
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }; 


import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Define the types for our data and context
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  validateSession: () => Promise<boolean>;
}

// 2. Create the context with a default value of 'undefined'
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Try to restore user from localStorage on initialization
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  // Helper function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return true;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      if (!payload.exp) return false; // No expiry means it doesn't expire
      
      const expiry = new Date(payload.exp * 1000);
      const now = new Date();
      return now > expiry;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true; // If we can't decode it, consider it expired
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        // Check if token is expired before making request
        if (isTokenExpired(token)) {
          console.log('Token is expired, logging out');
          logout();
          return;
        }
        
        try {
          // Set the auth header for all subsequent requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'https://curabot-backend.onrender.com/api'}/auth/me`);
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error: any) {
          console.error('Session token is invalid, logging out.', error);
          if (error.response?.status === 401) {
            console.log('401 error - token is invalid or expired');
          }
          logout(); // Automatically log out if the token is bad
        }
      } else if (token) {
        // Check token expiry even if we have user data
        if (isTokenExpired(token)) {
          console.log('Token is expired, logging out');
          logout();
          return;
        }
        // Set auth header if we have token and user from localStorage
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    };
    
    fetchUser();
  }, [token, user]);

  // 4. Add types to all function parameters
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'https://curabot-backend.onrender.com/api'}/auth/login`, { email, password });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw the error so the Login page can catch it
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'https://curabot-backend.onrender.com/api'}/auth/register`, { name, email, password, role });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const validateSession = async (): Promise<boolean> => {
    if (!token) return false;
    
    if (isTokenExpired(token)) {
      logout();
      return false;
    }
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'https://curabot-backend.onrender.com/api'}/auth/me`);
      return response.status === 200;
    } catch (error) {
      console.error('Session validation failed:', error);
      logout();
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Remove the auth header from axios
    delete axios.defaults.headers.common['Authorization'];
    // Redirect to home page
    window.location.href = '/';
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    validateSession,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Create the useAuth hook with proper error handling
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

