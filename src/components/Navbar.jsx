// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Heart, FileText, Menu, X, Calendar, UserPlus, Stethoscope, Phone, ChevronDown } from 'lucide-react';

// export function Navbar() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isHovered, setIsHovered] = useState(null);

//   const navItems = [
//     { 
//       to: "/", 
//       label: "Home",
//       icon: <Heart className="h-4 w-4" />,
//       description: "Return to homepage"
//     },
//     { 
//       to: "/appointments", 
//       label: "Appointments",
//       icon: <Calendar className="h-4 w-4" />,
//       description: "Schedule your visit"
//     },
//     { 
//       to: "/doctors", 
//       label: "Doctors",
//       icon: <UserPlus className="h-4 w-4" />,
//       description: "Meet our specialists"
//     },
//     { 
//       to: "/services", 
//       label: "Services",
//       icon: <Stethoscope className="h-4 w-4" />,
//       description: "Explore our services"
//     },
//     { 
//       to: "/lab-records", 
//       label: "Lab Records",
//       icon: <FileText className="h-4 w-4" />,
//       description: "Access your results"
//     },
//     { 
//       to: "/contact", 
//       label: "Contact",
//       icon: <Phone className="h-4 w-4" />,
//       description: "Get in touch"
//     }
//   ];

//   return (
//     <nav className="bg-white shadow-lg relative z-50">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center">
//             <Link 
//               to="/" 
//               className="flex items-center space-x-2 group relative"
//               onMouseEnter={() => setIsHovered('logo')}
//               onMouseLeave={() => setIsHovered(null)}
//             >
//               <div className="relative">
//                 <Heart className="h-8 w-8 text-emerald-600 transform transition-all duration-300 group-hover:scale-110" />
//                 <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
//               </div>
//               <div className="relative">
//                 <span className="text-xl font-bold text-emerald-600 transition-colors duration-300">
//                   CuraBot
//                 </span>
//                 {isHovered === 'logo' && (
//                   <div className="absolute top-full left-0 mt-1 bg-emerald-600 text-white text-xs py-1 px-2 rounded opacity-0 transform -translate-y-1 animate-fadeIn">
//                     Your Healthcare Partner
//                   </div>
//                 )}
//               </div>
//             </Link>
//           </div>
          
//           {/* Mobile menu button */}
//           <div className="md:hidden flex items-center">
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="p-2 rounded-md text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 relative"
//             >
//               {isMenuOpen ? (
//                 <X className="h-6 w-6 transform rotate-0 hover:rotate-90 transition-transform duration-300" />
//               ) : (
//                 <Menu className="h-6 w-6 transform hover:scale-110 transition-transform duration-300" />
//               )}
//             </button>
//           </div>

//           {/* Desktop navigation */}
//           <div className="hidden md:flex items-center space-x-1">
//             {navItems.map((item) => (
//               <Link
//                 key={item.to}
//                 to={item.to}
//                 className="relative px-4 py-2 rounded-md text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 group"
//                 onMouseEnter={() => setIsHovered(item.to)}
//                 onMouseLeave={() => setIsHovered(null)}
//               >
//                 <div className="flex items-center space-x-2">
//                   <div className="transform group-hover:scale-110 transition-transform duration-300">
//                     {item.icon}
//                   </div>
//                   <span className="relative">
//                     {item.label}
//                     <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
//                   </span>
//                 </div>
//                 {isHovered === item.to && (
//                   <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-3 py-1 bg-emerald-600 text-white text-xs rounded-md whitespace-nowrap opacity-0 animate-fadeIn z-50">
//                     {item.description}
//                     <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-emerald-600" />
//                   </div>
//                 )}
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Mobile navigation */}
//       <div
//         className={`md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg transform transition-all duration-300 ease-in-out ${
//           isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
//         }`}
//       >
//         <div className="px-4 py-2 space-y-1">
//           {navItems.map((item) => (
//             <Link
//               key={item.to}
//               to={item.to}
//               onClick={() => setIsMenuOpen(false)}
//               className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 group"
//             >
//               <div className="transform group-hover:scale-110 transition-transform duration-300">
//                 {item.icon}
//               </div>
//               <div className="flex flex-col">
//                 <span className="font-medium">{item.label}</span>
//                 <span className="text-xs text-gray-400 group-hover:text-emerald-500 transition-colors duration-300">
//                   {item.description}
//                 </span>
//               </div>
//               <ChevronDown className="h-4 w-4 ml-auto transform group-hover:rotate-180 transition-transform duration-300" />
//             </Link>
//           ))}
//         </div>
//       </div>
//     </nav>
//   );
// }

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, FileText, Menu, X, Calendar, UserPlus, Stethoscope, Phone, LogIn, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../lib/AuthContext'; // Make sure this path is correct

// This line has been corrected to be valid JavaScript
export const Navbar = () => {
  // Use the hook to get the authentication state and functions
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Home", icon: <Heart className="h-5 w-5" /> },
    { to: "/appointments", label: "Appointments", icon: <Calendar className="h-5 w-5" /> },
    { to: "/doctors", label: "Doctors", icon: <UserPlus className="h-5 w-5" /> },
    { to: "/services", label: "Services", icon: <Stethoscope className="h-5 w-5" /> },
    { to: "/reports", label: "Reports", icon: <FileText className="h-5 w-5" /> },
    { to: "/contact", label: "Contact", icon: <Phone className="h-5 w-5" /> }
  ];

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false); // Close mobile menu on logout
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-emerald-600" />
                <span className="text-xl font-bold text-gray-800">CuraBot</span>
            </Link>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Authentication Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              // If the user IS logged in, show this:
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="font-medium text-gray-700 hover:text-emerald-600">
                  {user?.name}
                </Link>
                <button onClick={handleLogout} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium">
                  Logout
                </button>
              </div>
            ) : (
              // If the user IS NOT logged in, show this:
              <div className="flex items-center space-x-2">
                <Link to="/login" className="font-medium text-gray-700 hover:text-emerald-600 px-4 py-2 rounded-md hover:bg-gray-100">
                  Login
                </Link>
                <Link to="/register" className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 hover:bg-emerald-50">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <hr className="my-2 border-gray-200" />
          
          {/* Mobile Authentication Section */}
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
                <UserCircle className="h-5 w-5" />
                <span>{user?.name}</span>
              </Link>
              <button onClick={handleLogout} className="w-full text-left flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700">
                <UserPlus className="h-5 w-5" />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
