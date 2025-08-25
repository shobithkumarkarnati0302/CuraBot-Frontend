import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Users, 
  FileText, 
  LogOut, 
  Bell,
  Menu,
  X,
  Stethoscope,
  User
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export function DoctorNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const notifications = [
    { id: 1, message: "New appointment scheduled for 2:00 PM", time: "5 min ago" },
    { id: 2, message: "Lab results ready for John Smith", time: "1 hour ago" },
    { id: 3, message: "Patient Sarah Johnson checked in", time: "2 hours ago" }
  ];

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/doctor-dashboard" className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-blue-300" />
              <div>
                <span className="text-xl font-bold">CuraBot</span>
                <span className="block text-xs text-blue-300">Doctor Portal</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/doctor-dashboard"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
              >
                <Activity className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/doctor-appointments"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Appointments</span>
              </Link>
              
              <Link
                to="/doctor-patients"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Patients</span>
              </Link>
              
              <Link
                to="/doctor-reports"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Reports</span>
              </Link>
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-blue-800 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b">
                    Notifications
                  </div>
                  {notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-50">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                  <div className="px-4 py-2 border-t">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile and Logout */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-blue-300">Medical Doctor</p>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to="/doctor-profile"
                  className="p-2 rounded-full hover:bg-blue-800 transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-blue-800 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-blue-800 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-blue-800">
              <Link
                to="/doctor-dashboard"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Activity className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/doctor-appointments"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="h-5 w-5" />
                <span>Appointments</span>
              </Link>
              
              <Link
                to="/doctor-patients"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span>Patients</span>
              </Link>
              
              <Link
                to="/doctor-reports"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="h-5 w-5" />
                <span>Reports</span>
              </Link>

              <div className="border-t border-blue-800 pt-4 pb-3">
                <div className="flex items-center px-3">
                  <div>
                    <div className="text-base font-medium">{user?.name}</div>
                    <div className="text-sm text-blue-300">Medical Doctor</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    to="/doctor-profile"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
