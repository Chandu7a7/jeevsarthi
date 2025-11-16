import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Don't show Sidebar for regulator dashboard (it has its own layout)
  const isRegulatorDashboard = location.pathname === '/dashboard/regulator';

  if (isRegulatorDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

