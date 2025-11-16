import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiUser, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    const labels = {
      farmer: '👨‍🌾 Farmer',
      vet: '👨‍⚕️ Veterinarian',
      lab: '🧪 Lab Officer',
      regulator: '🏛️ Regulator',
    };
    return labels[role] || role;
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-green">
                JeevSarthi
              </span>
            </Link>
            {user && (
              <span className="ml-4 text-sm text-gray-600">
                {getRoleLabel(user.role)}
              </span>
            )}
          </div>

          {/* Right Side - Icons */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* Alerts Icon */}
              <Link
                to="/dashboard/alerts"
                className="relative p-2 text-gray-600 hover:text-primary-green transition-colors"
              >
                <FiBell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-green transition-colors"
                >
                  <FiUser className="w-6 h-6" />
                  {user?.name && (
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                      {user.name}
                    </span>
                  )}
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    {user.role === 'farmer' && (
                      <>
                        <Link
                          to="/dashboard/farmer/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/dashboard/farmer/animals/add"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Add Animal
                        </Link>
                        <Link
                          to="/dashboard/farmer/animals"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Animals
                        </Link>
                        <Link
                          to="/dashboard/treatment/add"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Add Treatment
                        </Link>
                        <Link
                          to="/dashboard/alerts"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Alerts
                        </Link>
                        <Link
                          to="/dashboard/consultation/request"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Consultation
                        </Link>
                        <Link
                          to="/dashboard/mrl-usage"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          MRL Usage Overview
                        </Link>
                      </>
                    )}
                    {user.role === 'vet' && (
                      <>
                        <Link
                          to="/dashboard/vet"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/vet/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/dashboard/treatment/add"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Add Treatment
                        </Link>
                        <Link
                          to="/dashboard/consultation/vet"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Consultation Requests
                        </Link>
                        <Link
                          to="/dashboard/alerts"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Alerts
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

