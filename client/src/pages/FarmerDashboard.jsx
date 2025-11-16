import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { farmerAPI, treatmentAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  FiPlus, FiMaximize2, FiUsers, FiFileText, FiMessageCircle,
  FiTrendingUp, FiActivity, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAnimals: 0,
    activeTreatments: 0,
    unreadAlerts: 0,
    complianceRate: 100,
  });
  const [dailyUsage, setDailyUsage] = useState({});
  const [drugDistribution, setDrugDistribution] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await farmerAPI.getDashboard();
      const { stats, dailyUsage, drugDistribution } = response.data.data;
      
      setStats(stats);
      setDailyUsage(dailyUsage);
      setDrugDistribution(drugDistribution);

      // Load alerts
      const alertsResponse = await farmerAPI.getAlerts({ readStatus: false });
      setAlerts(alertsResponse.data.data.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Convert daily usage to chart data
  const chartData = Object.entries(dailyUsage).map(([date, value]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    usage: value,
  }));

  // Convert drug distribution to chart data
  const pieData = Object.entries(drugDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const COLORS = ['#2E7D32', '#1976D2', '#FFF59D', '#FF9800', '#9C27B0'];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'safe':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <FiAlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'violation':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FiAlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user?.name || 'Farmer'} 👋
        </h1>
        <p className="text-gray-600 mt-2">Monitor your livestock health and AMU compliance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FiUsers className="w-8 h-8 text-primary-green" />}
          title="Total Animals"
          value={stats.totalAnimals}
        />
        <StatCard
          icon={<FiTrendingUp className="w-8 h-8 text-primary-blue" />}
          title="MRL Usage %"
          value={`${stats.complianceRate}%`}
        />
        <StatCard
          icon={<FiActivity className="w-8 h-8 text-orange-500" />}
          title="Active Treatments"
          value={stats.activeTreatments}
        />
        <StatCard
          icon={<FiAlertCircle className="w-8 h-8 text-red-500" />}
          title="Smart Alerts"
          value={stats.unreadAlerts}
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionButton
          icon={<FiPlus />}
          label="Add Treatment"
          onClick={() => navigate('/dashboard/treatment/add')}
          color="primary-green"
        />
        <ActionButton
          icon={<FiMaximize2 />}
          label="Scan QR → Add Animal"
          onClick={() => navigate('/dashboard/farmer/scan-qr')}
          color="primary-green"
        />
        <ActionButton
          icon={<FiUsers />}
          label="Add Animal"
          onClick={() => navigate('/dashboard/farmer/animals/add')}
          color="primary-green"
        />
        <ActionButton
          icon={<FiMessageCircle />}
          label="Request Consultation"
          onClick={() => navigate('/dashboard/consultation/request')}
          color="primary-green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - AMU Usage */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">AMU Usage (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="usage" fill="#2E7D32" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Drug Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Drug Type Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Smart Alerts Panel */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Smart Alerts</h2>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiCheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>All animals safe for sale</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-4 rounded-lg flex items-start space-x-3 ${
                  alert.type === 'safe' ? 'alert-safe' :
                  alert.type === 'warning' ? 'alert-warning' :
                  'alert-violation'
                }`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <h3 className="font-semibold">{alert.title}</h3>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, onAddAnimal, onAddTreatment }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        {icon}
      </div>
      {onAddAnimal && (
        <button
          onClick={onAddAnimal}
          className="mt-4 w-full bg-primary-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Animal</span>
        </button>
      )}
      {onAddTreatment && (
        <button
          onClick={onAddTreatment}
          className="mt-4 w-full bg-primary-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Treatment</span>
        </button>
      )}
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, color = 'primary-green' }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-${color} text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default FarmerDashboard;

