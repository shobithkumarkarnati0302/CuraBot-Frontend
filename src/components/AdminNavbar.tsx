import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  UserCheck, 
  Calendar, 
  BarChart3, 
  FileText, 
  MessageSquare,
  Settings, 
  LogOut, 
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const notifications = [
    { id: 1, message: "New doctor registration pending approval", time: "5 min ago", type: "warning" },
    { id: 2, message: "System backup completed successfully", time: "1 hour ago", type: "success" },
    { id: 3, message: "Patient complaint requires attention", time: "2 hours ago", type: "urgent" }
  ];

  return (
    <nav className="bg-purple-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/admin-dashboard" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-300" />
              <div>
                <span className="text-xl font-bold">CuraBot</span>
                <span className="block text-xs text-purple-300">Admin Portal</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/admin-dashboard"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-800 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/admin-doctors"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-800 transition-colors"
              >
                <UserCheck className="h-4 w-4" />
                <span>Doctors</span>
              </Link>
              
              <Link
                to="/admin-patients"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-800 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Patients</span>
              </Link>
              
              <Link
                to="/admin-appointments"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-800 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Appointments</span>
              </Link>
              
              <Link
                to="/admin-records"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-800 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Records</span>
              </Link>
              
              <Link
                to="/admin-feedback"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-800 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Feedback</span>
              </Link>
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-purple-800 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b">
                    System Notifications
                  </div>
                  {notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-start space-x-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'urgent' ? 'bg-red-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2 border-t">
                    <button className="text-sm text-purple-600 hover:text-purple-800">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-purple-300">System Administrator</p>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to="/admin-settings"
                  className="p-2 rounded-full hover:bg-purple-800 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-purple-800 transition-colors"
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
              className="p-2 rounded-md hover:bg-purple-800 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-purple-800">
              <Link
                to="/admin-dashboard"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:bg-purple-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/admin-doctors"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:bg-purple-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserCheck className="h-5 w-5" />
                <span>Doctors</span>
              </Link>
              
              <Link
                to="/admin-patients"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:bg-purple-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span>Patients</span>
              </Link>
              
              <Link
                to="/admin-appointments"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:bg-purple-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="h-5 w-5" />
                <span>Appointments</span>
              </Link>
              
              <Link
                to="/admin-records"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:bg-purple-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="h-5 w-5" />
                <span>Records</span>
              </Link>
              
              <Link
                to="/admin-feedback"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:bg-purple-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Feedback</span>
              </Link>

              <div className="border-t border-purple-800 pt-4 pb-3">
                <div className="flex items-center px-3">
                  <div>
                    <div className="text-base font-medium">{user?.name}</div>
                    <div className="text-sm text-purple-300">System Administrator</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    to="/admin-settings"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:bg-purple-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-purple-800 transition-colors"
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
