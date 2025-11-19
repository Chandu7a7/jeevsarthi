import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { MapPin, Users, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import {
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

const DistrictAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalFarms: 0,
      totalAnimals: 0,
      activeConsultations: 0,
      highRiskFarms: 0,
    },
    charts: {
      amrRisk: [],
    },
    tables: {
      recentTreatments: [],
      violations: [],
      pendingWithdrawals: 0,
    },
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await adminAPI.getDistrictAdminDashboard();
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">District Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user?.district}, {user?.state} - JEEVSARTHI Admin Portal
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Farms</p>
              <p className="text-3xl font-bold text-primary-green mt-2">
                {dashboardData.kpis.totalFarms}
              </p>
            </div>
            <MapPin className="w-12 h-12 text-primary-green" />
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Animals</p>
              <p className="text-3xl font-bold text-tech-blue mt-2">
                {dashboardData.kpis.totalAnimals.toLocaleString()}
              </p>
            </div>
            <Users className="w-12 h-12 text-tech-blue" />
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Consultations</p>
              <p className="text-3xl font-bold text-accent-yellow mt-2">
                {dashboardData.kpis.activeConsultations}
              </p>
            </div>
            <Activity className="w-12 h-12 text-accent-yellow" />
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">High-risk Farms</p>
              <p className="text-3xl font-bold text-danger-red mt-2">
                {dashboardData.kpis.highRiskFarms}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-danger-red" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">AMR Risk Score Graph (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.charts.amrRisk}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgRisk"
                stroke="#D32F2F"
                strokeWidth={2}
                name="Avg Risk Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-md">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span className="text-gray-700 dark:text-gray-300">Pending Withdrawals</span>
                <Badge className="bg-yellow-500 text-white">
                  {dashboardData.tables.pendingWithdrawals || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Active Treatments</span>
                <Badge className="bg-green-500 text-white">
                  {dashboardData.tables.recentTreatments.filter((t) => t.status === 'active').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Total Violations</span>
                <Badge className="bg-red-500 text-white">
                  {dashboardData.tables.violations.length}
                </Badge>
              </div>
            </div>
          </div>
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
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger-red" />
            Violations List
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Animal ID</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.tables.violations.slice(0, 5).map((violation) => (
                  <TableRow key={violation._id}>
                    <TableCell className="font-medium">{violation.type || 'N/A'}</TableCell>
                    <TableCell>{violation.data?.animalId || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          violation.severity === 'critical'
                            ? 'bg-red-500 text-white'
                            : 'bg-yellow-500 text-white'
                        }
                      >
                        {violation.severity || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(violation.createdAt).toLocaleDateString()}
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

export default DistrictAdminDashboard;

