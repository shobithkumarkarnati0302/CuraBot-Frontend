import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, FileText, Menu, X, Calendar, UserPlus, Stethoscope, Phone, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const navItems = [
    { 
      to: "/", 
      label: "Home",
      icon: <Heart className="h-4 w-4" />,
      description: "Return to homepage"
    },
    { 
      to: "/appointments", 
      label: "Appointments",
      icon: <Calendar className="h-4 w-4" />,
      description: "Schedule your visit"
    },
    { 
      to: "/doctors", 
      label: "Doctors",
      icon: <UserPlus className="h-4 w-4" />,
      description: "Meet our specialists"
    },
    { 
      to: "/services", 
      label: "Services",
      icon: <Stethoscope className="h-4 w-4" />,
      description: "Explore our services"
    },
    { 
      to: "/lab-records", 
      label: "Lab Records",
      icon: <FileText className="h-4 w-4" />,
      description: "Access your results"
    },
    { 
      to: "/contact", 
      label: "Contact",
      icon: <Phone className="h-4 w-4" />,
      description: "Get in touch"
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 group relative"
              onMouseEnter={() => setIsHovered('logo')}
              onMouseLeave={() => setIsHovered(null)}
            >
              <div className="relative">
                <Heart className="h-8 w-8 text-emerald-600 transform transition-all duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
              </div>
              <div className="relative">
                <span className="text-xl font-bold text-emerald-600 transition-colors duration-300">
                  CuraBot
                </span>
                {isHovered === 'logo' && (
                  <div className="absolute top-full left-0 mt-1 bg-emerald-600 text-white text-xs py-1 px-2 rounded opacity-0 transform -translate-y-1 animate-fadeIn">
                    Your Healthcare Partner
                  </div>
                )}
              </div>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 relative"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 transform rotate-0 hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Menu className="h-6 w-6 transform hover:scale-110 transition-transform duration-300" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="relative px-4 py-2 rounded-md text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 group"
                onMouseEnter={() => setIsHovered(item.to)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <div className="flex items-center space-x-2">
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <span className="relative">
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </span>
                </div>
                {isHovered === item.to && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-3 py-1 bg-emerald-600 text-white text-xs rounded-md whitespace-nowrap opacity-0 animate-fadeIn z-50">
                    {item.description}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-emerald-600" />
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop authentication */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user?.role === 'patient' && (
                    <Link 
                      to="/patient-profile" 
                      className="p-1 rounded-full text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300"
                      title="Profile"
                    >
                      <User className="h-4 w-4" />
                    </Link>
                  )}
                  <Link 
                    to={user?.role === 'patient' ? "/patient-profile" : "/profile"} 
                    className="text-gray-900 hover:text-emerald-600 transition-colors duration-200"
                  >
                    {user?.name}
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-900 hover:text-emerald-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-900 hover:text-emerald-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div
        className={`md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg transform transition-all duration-300 ease-in-out z-50 ${
          isMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 group"
            >
              <div className="transform group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-gray-400 group-hover:text-emerald-500 transition-colors duration-300">
                  {item.description}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 ml-auto transform group-hover:rotate-180 transition-transform duration-300" />
            </Link>
          ))}
          
          {/* Mobile authentication */}
          {isAuthenticated ? (
            <div className="border-t border-gray-200 pt-2 mt-2">
              {user?.role === 'patient' && (
                <Link
                  to="/patient-profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 group"
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">Profile</span>
                </Link>
              )}
              <Link
                to={user?.role === 'patient' ? "/patient-profile" : "/profile"}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300"
              >
                <span className="font-medium">{user?.name}</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 text-left"
              >
                <span className="font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-2 mt-2">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300"
              >
                <span className="font-medium">Login</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-300"
              >
                <span className="font-medium">Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
