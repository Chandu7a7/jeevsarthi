import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Building2, TrendingUp, Users, AlertTriangle, MapPin, FileText, Award } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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

const COLORS = ['#2E7D32', '#1976D2', '#FFC107', '#D32F2F', '#9C27B0'];

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalStates: 0,
      totalFarms: 0,
      totalVets: 0,
      amuTrendLast30Days: 0,
    },
    charts: {
      amuUsageTrend: [],
      mrlViolations: [],
      drugCategories: [],
    },
    tables: {
      statePerformance: [],
      latestReports: [],
      highRiskStates: [],
    },
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await adminAPI.getSuperAdminDashboard();
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

  const getComplianceStatus = (score) => {
    if (score >= 80) return { label: 'Good', color: 'bg-green-500' };
    if (score >= 60) return { label: 'Warning', color: 'bg-yellow-500' };
    return { label: 'Critical', color: 'bg-red-500' };
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">National Overview - JEEVSARTHI Admin Portal</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total States Onboarded</p>
              <p className="text-3xl font-bold text-primary-green mt-2">
                {dashboardData.kpis.totalStates}
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
              <p className="text-gray-600 text-sm font-medium">Total Veterinarians</p>
              <p className="text-3xl font-bold text-accent-yellow mt-2">
                {dashboardData.kpis.totalVets.toLocaleString()}
              </p>
            </div>
            <Users className="w-12 h-12 text-accent-yellow" />
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">AMU Usage (30 Days)</p>
              <p className="text-3xl font-bold text-danger-red mt-2">
                {dashboardData.kpis.amuTrendLast30Days}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-danger-red" />
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AMU Usage Trend */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">AMU Usage Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.charts.amuUsageTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2E7D32"
                strokeWidth={2}
                name="AMU Usage"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* MRL Violations Pie Chart */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">MRL Violations Distribution</h3>
          {dashboardData.charts.mrlViolations && dashboardData.charts.mrlViolations.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.charts.mrlViolations.filter(item => item.count > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, percent, count }) => 
                    count > 0 ? `${_id}: ${count} (${(percent * 100).toFixed(0)}%)` : ''
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {dashboardData.charts.mrlViolations
                    .filter(item => item.count > 0)
                    .map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry._id === 'Fail (Violation)' ? '#D32F2F' : '#4CAF50'} 
                      />
                    ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} tests`,
                    props.payload._id
                  ]}
                />
                <Legend 
                  formatter={(value, entry) => {
                    const data = dashboardData.charts.mrlViolations.find(item => item._id === value);
                    return `${value} (${data?.count || 0})`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p>No MRL test data available</p>
                <p className="text-sm mt-2">Lab test results will appear here once tests are conducted</p>
              </div>
            </div>
          )}
        </Card>

        {/* Drug Categories Usage */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Drug Categories Usage</h3>
          {dashboardData.charts.drugCategories && dashboardData.charts.drugCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.charts.drugCategories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="_id" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                />
                <YAxis tick={{ fill: 'currentColor' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1976D2" name="Usage Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              No drug usage data available
            </div>
          )}
        </Card>

        {/* AMU Usage Heatmap by State */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">AMU Usage Heatmap (India)</h3>
          {dashboardData.charts.amuUsageByState && dashboardData.charts.amuUsageByState.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.charts.amuUsageByState}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="state" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fill: 'currentColor', fontSize: 10 }}
                />
                <YAxis tick={{ fill: 'currentColor' }} />
                <Tooltip 
                  formatter={(value) => [`${value} treatments`, 'AMU Usage']}
                  labelFormatter={(label) => `State: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  fill="#2E7D32" 
                  name="AMU Usage (Last 30 Days)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No AMU usage data available</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Shows AMU usage intensity across Indian states
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State-wise Performance Ranking */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">State-wise Performance Ranking</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Total Farms</TableHead>
                  <TableHead>Avg Compliance</TableHead>
                  <TableHead>Violations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.tables.statePerformance.map((state, index) => {
                  const status = getComplianceStatus(state.avgCompliance);
                  return (
                    <TableRow key={state._id}>
                      <TableCell>
                        <Award className={`w-5 h-5 ${index < 3 ? 'text-yellow-500' : 'text-gray-400'}`} />
                      </TableCell>
                      <TableCell className="font-medium">{state._id || 'N/A'}</TableCell>
                      <TableCell>{state.totalFarms || 0}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-red-600 font-semibold">
                          {state.violations || 0}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* High-risk States */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger-red" />
            High-risk States
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead>Violations</TableHead>
                  <TableHead>Warnings</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.tables.highRiskStates.map((state) => (
                  <TableRow key={state._id}>
                    <TableCell className="font-medium">{state._id || 'N/A'}</TableCell>
                    <TableCell>
                      <span className="text-red-600 font-semibold">{state.violations || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-yellow-600 font-semibold">{state.warnings || 0}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-danger-red text-white">Critical</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Latest State Reports */}
      <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-green" />
          Latest State Reports
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farm Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>State</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Compliance Score</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.tables.latestReports.slice(0, 5).map((report) => {
                const status = getComplianceStatus(report.amuComplianceScore);
                return (
                  <TableRow key={report._id}>
                    <TableCell className="font-medium">
                      {report.farmRegistrationId || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {report.farmerId?.name || report.fullName || 'N/A'}
                    </TableCell>
                    <TableCell>{report.state || 'N/A'}</TableCell>
                    <TableCell>{report.district || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        {report.amuComplianceScore?.toFixed(1) || 'N/A'}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(report.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;

