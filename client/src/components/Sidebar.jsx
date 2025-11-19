import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
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
  FiUserPlus,
  FiActivity,
  FiMapPin,
  FiPackage,
  FiAlertTriangle,
  FiLink2,
  FiLogOut,
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

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
    super_admin: [
      { path: '/dashboard/admin/super-admin/dashboard', label: 'Dashboard', icon: FiHome },
      { path: '/dashboard/admin/super-admin/create-state-admin', label: 'Create State Admin', icon: FiUserPlus },
      { path: '/dashboard/admin/super-admin/manage-state-admins', label: 'Manage State Admins', icon: FiUsers },
      { path: '/dashboard/admin/super-admin/national-analytics', label: 'National Analytics', icon: FiBarChart2 },
      { path: '/dashboard/admin/farms', label: 'Farm Registry', icon: FiMapPin },
      { path: '/dashboard/admin/veterinarians', label: 'Veterinarians', icon: FiUsers },
      { path: '/dashboard/admin/labs', label: 'Labs Directory', icon: FiPackage },
      { path: '/dashboard/admin/alerts', label: 'AI Alerts', icon: FiAlertTriangle },
      { path: '/dashboard/admin/blockchain-logs', label: 'Blockchain Logs', icon: FiLink2 },
      { path: '/dashboard/admin/settings', label: 'Settings', icon: FiSettings },
      { path: null, label: 'Logout', icon: FiLogOut, action: 'logout' },
    ],
    state_admin: [
      { path: '/dashboard/admin/state-admin/dashboard', label: 'Dashboard', icon: FiHome },
      { path: '/dashboard/admin/state-admin/create-district-admin', label: 'Create District Admin', icon: FiUserPlus },
      { path: '/dashboard/admin/state-admin/manage-district-admins', label: 'Manage District Admins', icon: FiUsers },
      { path: '/dashboard/admin/state-admin/analytics', label: 'State Analytics', icon: FiBarChart2 },
      { path: '/dashboard/admin/farms', label: 'Farms in State', icon: FiMapPin },
      { path: '/dashboard/admin/veterinarians', label: 'Veterinarians', icon: FiUsers },
      { path: '/dashboard/admin/labs', label: 'Labs', icon: FiPackage },
      { path: '/dashboard/admin/alerts', label: 'Alerts', icon: FiAlertTriangle },
      { path: '/dashboard/admin/settings', label: 'Settings', icon: FiSettings },
      { path: null, label: 'Logout', icon: FiLogOut, action: 'logout' },
    ],
    district_admin: [
      { path: '/dashboard/admin/district-admin/dashboard', label: 'Dashboard', icon: FiHome },
      { path: '/dashboard/admin/district-admin/analytics', label: 'District Analytics', icon: FiBarChart2 },
      { path: '/dashboard/admin/farms', label: 'Farms', icon: FiMapPin },
      { path: '/dashboard/admin/veterinarians', label: 'Veterinarians', icon: FiUsers },
      { path: '/dashboard/admin/labs', label: 'Labs', icon: FiPackage },
      { path: '/dashboard/admin/district-admin/treatment-logs', label: 'Treatment Logs', icon: FiFileText },
      { path: '/dashboard/admin/alerts', label: 'Alerts', icon: FiAlertTriangle },
      { path: '/dashboard/admin/settings', label: 'Settings', icon: FiSettings },
      { path: null, label: 'Logout', icon: FiLogOut, action: 'logout' },
    ],
  };

  const items = menuItems[user?.role] || [];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.path && location.pathname === item.path;
            const isLogout = item.action === 'logout';
            
            if (isLogout) {
              return (
                <li key={`logout-${index}`}>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            }
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-green text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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

