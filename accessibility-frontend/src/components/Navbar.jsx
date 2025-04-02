// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaWheelchair } from 'react-icons/fa'; // Install: npm install react-icons

const Navbar = () => {
  const { isAuthenticated, user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home after logout
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center text-xl font-semibold text-brand-blue hover:text-blue-700 transition duration-200">
           <FaWheelchair className="mr-2 h-6 w-6" />
           <span>AccessiWheels</span>
        </Link>
        <div className="space-x-4 flex items-center">
          <Link to="/places" className="text-gray-600 hover:text-brand-blue px-3 py-2 rounded-md text-sm font-medium">Explore Places</Link>
          {isAuthenticated && profile?.user_type === 'seeker' && (
             <Link to="/recommendations" className="text-gray-600 hover:text-brand-blue px-3 py-2 rounded-md text-sm font-medium">My Recommendations</Link>
          )}

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="text-gray-600 hover:text-brand-blue px-3 py-2 rounded-md text-sm font-medium">
                 {user?.username}'s Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-brand-blue px-3 py-2 rounded-md text-sm font-medium">Login</Link>
              <Link
                to="/register"
                className="bg-brand-blue hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;