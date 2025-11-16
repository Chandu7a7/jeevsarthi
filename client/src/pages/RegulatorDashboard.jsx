import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { regulatorAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Building2, TrendingDown, AlertTriangle, Award, Download, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import { StatCard } from '../components/StatCard';
import { AlertCard } from '../components/AlertCard';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';

const RegulatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFarms: 1245,
    amuTrend: -12,
    activeViolations: 23,
    complianceScore: 88,
  });
  const [highRiskFarms, setHighRiskFarms] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const amuTrendData = [
    { month: 'Aug', usage: 120 },
    { month: 'Sep', usage: 135 },
    { month: 'Oct', usage: 125 },
    { month: 'Nov', usage: 110 },
    { month: 'Dec', usage: 95 },
    { month: 'Jan', usage: 85 },
  ];

  const mrlViolationData = [
    { month: 'Aug', violations: 25 },
    { month: 'Sep', violations: 28 },
    { month: 'Oct', violations: 22 },
    { month: 'Nov', violations: 18 },
    { month: 'Dec', violations: 15 },
    { month: 'Jan', violations: 12 },
  ];

  const defaultHighRiskFarms = [
    { id: 'F-001', name: 'Ramesh Kumar Farm', location: 'Maharashtra', violations: 5, lastInspection: '2025-01-10', riskLevel: 'High' },
    { id: 'F-002', name: 'Suresh Patel Farm', location: 'Gujarat', violations: 4, lastInspection: '2025-01-08', riskLevel: 'High' },
    { id: 'F-003', name: 'Rajesh Singh Farm', location: 'Punjab', violations: 3, lastInspection: '2025-01-05', riskLevel: 'Medium' },
  ];

  const labPerformance = [
    { lab: 'Central Lab - Mumbai', tests: 245, accuracy: '98%', avgTime: '2.1 days', rating: 'Excellent' },
    { lab: 'Regional Lab - Pune', tests: 189, accuracy: '96%', avgTime: '2.5 days', rating: 'Good' },
    { lab: 'District Lab - Nashik', tests: 156, accuracy: '94%', avgTime: '3.2 days', rating: 'Good' },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await regulatorAPI.getDashboard();
      if (response.data.success) {
        const { stats: apiStats, highRiskFarms: apiFarms } = response.data.data;
        setStats(prev => ({ ...prev, ...apiStats }));
        setHighRiskFarms(apiFarms || defaultHighRiskFarms);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Use default data on error
      setHighRiskFarms(defaultHighRiskFarms);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (page) => {
    navigate(`/dashboard/${page}`);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const userName = user?.name || 'Admin Regulator';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {userName} 🏛️
          </h2>
          <p className="text-gray-600">Monitor and regulate livestock health compliance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Building2}
            title="Total Farms"
            value="1,245"
            trend="+18 this month"
            trendUp={true}
            color="primary"
          />
          <StatCard
            icon={TrendingDown}
            title="AMU Trend Index"
            value="-12%"
            trend="Decreasing"
            trendUp={true}
            color="safe"
          />
          <StatCard
            icon={AlertTriangle}
            title="Active Violations"
            value="23"
            trend="-5 from last month"
            trendUp={true}
            color="alert"
          />
          <StatCard
            icon={Award}
            title="Compliance Score"
            value="88%"
            trend="+3%"
            trendUp={true}
            color="accent"
          />
        </div>

        {/* Heatmap */}
        <Card className="p-6 mb-8 rounded-[16px]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-gray-900">Regional Risk Heatmap</h4>
            <Button variant="outline" size="sm" className="rounded-[8px]">
              <MapPin className="w-4 h-4 mr-2" />
              View Full Map
            </Button>
          </div>
          <div className="bg-gradient-to-br from-green-100 via-yellow-100 to-red-100 rounded-[16px] p-8 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Interactive India Map</p>
              <div className="flex gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-700">Low Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-gray-700">Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-700">High Risk</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Analytics Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* AMU Trend Chart */}
          <Card className="p-6 rounded-[16px]">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">AMU Trend (Last 6 Months)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={amuTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#2E7D32"
                  strokeWidth={3}
                  dot={{ fill: '#2E7D32', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* MRL Violations Chart */}
          <Card className="p-6 rounded-[16px]">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">MRL Violations (Last 6 Months)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mrlViolationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="violations"
                  stroke="#F44336"
                  fill="#FFEBEE"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* High Risk Farms Table */}
        <Card className="p-6 mb-8 rounded-[16px]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-gray-900">High-Risk Farms</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-[8px]">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farm ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Violations</TableHead>
                  <TableHead>Last Inspection</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highRiskFarms.map((farm) => (
                  <TableRow key={farm.id}>
                    <TableCell>{farm.id}</TableCell>
                    <TableCell>{farm.name}</TableCell>
                    <TableCell>{farm.location}</TableCell>
                    <TableCell>{farm.violations}</TableCell>
                    <TableCell>{farm.lastInspection}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          farm.riskLevel === 'High'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {farm.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="rounded-[8px]">
                        Investigate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Lab Performance Metrics */}
        <Card className="p-6 mb-8 rounded-[16px]">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Laboratory Performance Metrics</h4>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Laboratory</TableHead>
                  <TableHead>Tests Conducted</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Avg. Processing Time</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labPerformance.map((lab, index) => (
                  <TableRow key={index}>
                    <TableCell>{lab.lab}</TableCell>
                    <TableCell>{lab.tests}</TableCell>
                    <TableCell>{lab.accuracy}</TableCell>
                    <TableCell>{lab.avgTime}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          lab.rating === 'Excellent'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {lab.rating}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Alerts Panel */}
        <Card className="p-6 rounded-[16px]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-gray-900">Recent Alerts</h4>
            <Button
              variant="link"
              className="text-[#1976D2]"
              onClick={() => handleNavigate('alerts')}
            >
              View All
            </Button>
          </div>
          <div className="space-y-4">
            <AlertCard
              type="violation"
              title="MRL Violation Detected"
              message="Farm F-001: Multiple violations detected in recent tests"
              time="1 hour ago"
            />
            <AlertCard
              type="warning"
              title="Overdose Alert"
              message="Farm F-005: Antibiotic usage exceeds recommended limits"
              time="3 hours ago"
            />
            <AlertCard
              type="violation"
              title="Blockchain Mismatch"
              message="Lab L-003: Data discrepancy detected in blockchain verification"
              time="5 hours ago"
            />
          </div>
        </Card>
      </main>
    </div>
  );
};

export default RegulatorDashboard;
