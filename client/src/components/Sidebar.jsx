import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiUser,
  FiUsers,
  FiFileText,
  FiBarChart2,
  FiSettings,
  FiMessageCircle,
  FiPlusCircle,
  FiClock,
} from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = {
    farmer: [
      { path: '/dashboard/farmer', label: 'Dashboard', icon: FiHome },
      { path: '/dashboard/farmer/profile', label: 'My Profile', icon: FiUser },
      { path: '/dashboard/farmer/animals', label: 'Animals', icon: FiUsers },
      { path: '/dashboard/treatment/add', label: 'Add Treatment', icon: FiPlusCircle },
      { path: '/dashboard/treatment/history', label: 'Treatment History', icon: FiClock },
      { path: '/dashboard/alerts', label: 'Alerts', icon: FiFileText },
      { path: '/dashboard/consultation/request', label: 'Request Consultation', icon: FiMessageCircle },
      { path: '/dashboard/consultation/farmer', label: 'My Consultations', icon: FiMessageCircle },
    ],
    vet: [
      { path: '/dashboard/vet', label: 'Dashboard', icon: FiHome },
      { path: '/dashboard/vet/profile', label: 'My Profile', icon: FiUser },
      { path: '/dashboard/vet/prescription', label: 'Prescription', icon: FiFileText },
      { path: '/dashboard/treatment/add', label: 'Add Treatment', icon: FiPlusCircle },
      { path: '/dashboard/treatment/history', label: 'Treatment History', icon: FiClock },
      { path: '/dashboard/consultation/vet', label: 'Consultation Requests', icon: FiMessageCircle },
    ],
    lab: [
      { path: '/dashboard/lab', label: 'Dashboard', icon: FiHome },
      { path: '/dashboard/lab/tests', label: 'Tests', icon: FiFileText },
    ],
    regulator: [
      { path: '/dashboard/regulator', label: 'Dashboard', icon: FiHome },
      { path: '/dashboard/regulator/regions', label: 'Regions', icon: FiBarChart2 },
    ],
  };

  const items = menuItems[user?.role] || [];

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-green text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

