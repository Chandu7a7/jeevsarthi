import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Building2, Users, AlertTriangle, Activity, MapPin, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

const StateAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalDistricts: 0,
      totalFarms: 0,
      pendingViolations: 0,
      activeTreatments: 0,
      vetCount: 0,
      labCount: 0,
    },
    charts: {
      districtAMU: [],
      mrlTrend: [],
    },
    tables: {
      recentTreatments: [],
      districtLeaderboard: [],
    },
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await adminAPI.getStateAdminDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-light dark:bg-gray-900">
        <div className="text-lg text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-bg-light dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">State Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user?.state} State Overview - JEEVSARTHI Admin Portal
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Districts</p>
              <p className="text-3xl font-bold text-primary-green mt-2">
                {dashboardData.kpis.totalDistricts}
              </p>
            </div>
            <Building2 className="w-12 h-12 text-primary-green" />
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Farms</p>
              <p className="text-3xl font-bold text-tech-blue mt-2">
                {dashboardData.kpis.totalFarms.toLocaleString()}
              </p>
            </div>
            <MapPin className="w-12 h-12 text-tech-blue" />
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Violations</p>
              <p className="text-3xl font-bold text-danger-red mt-2">
                {dashboardData.kpis.pendingViolations}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-danger-red" />
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Treatments</p>
              <p className="text-3xl font-bold text-accent-yellow mt-2">
                {dashboardData.kpis.activeTreatments}
              </p>
            </div>
            <Activity className="w-12 h-12 text-accent-yellow" />
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Veterinarians</p>
              <p className="text-3xl font-bold text-primary-green mt-2">
                {dashboardData.kpis.vetCount}
              </p>
            </div>
            <Users className="w-12 h-12 text-primary-green" />
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Labs</p>
              <p className="text-3xl font-bold text-tech-blue mt-2">
                {dashboardData.kpis.labCount}
              </p>
            </div>
            <Building2 className="w-12 h-12 text-tech-blue" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">District-wise AMU Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.charts.districtAMU}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="farmCount" fill="#1976D2" name="Farm Count" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4">7-Day MRL Alerts Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.charts.mrlTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#D32F2F"
                strokeWidth={2}
                name="MRL Alerts"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4">Recent Treatments</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal ID</TableHead>
                  <TableHead>Vet</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.tables.recentTreatments.slice(0, 5).map((treatment) => (
                  <TableRow key={treatment._id}>
                    <TableCell className="font-medium">
                      {treatment.animalId?.pashuAadhaarId || 'N/A'}
                    </TableCell>
                    <TableCell>{treatment.vetId?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(treatment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          treatment.status === 'active'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-400 text-white'
                        }
                      >
                        {treatment.status || 'N/A'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4">District Leaderboard</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>District</TableHead>
                  <TableHead>Farms</TableHead>
                  <TableHead>Avg Compliance</TableHead>
                  <TableHead>Violations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.tables.districtLeaderboard.map((district) => (
                  <TableRow key={district._id}>
                    <TableCell className="font-medium">{district._id || 'N/A'}</TableCell>
                    <TableCell>{district.farmCount || 0}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          district.avgCompliance >= 80
                            ? 'bg-green-500 text-white'
                            : district.avgCompliance >= 60
                            ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                        }
                      >
                        {district.avgCompliance?.toFixed(1) || '0'}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-red-600 font-semibold">
                        {district.violations || 0}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StateAdminDashboard;

